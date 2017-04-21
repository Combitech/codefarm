
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Slider from "react-toolbox/lib/slider";
import Dropdown from "react-toolbox/lib/dropdown";
import Autocomplete from "react-toolbox/lib/autocomplete";
import Checkbox from "react-toolbox/lib/checkbox";
import {
    Form as TAForm,
    Section as TASection,
    LoadIndicator as TALoadIndicator,
    utils as tautils
} from "ui-components/type_admin";
import TypeList from "ui-observables/type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class EditStep extends LightComponent {
    constructor(props) {
        super(props);

        this.stepList = new TypeList({
            type: "flowctrl.step",
            query: {
                "flow.id": props.parentItems[props.parentItems.length - 1]._id
            }
        });
        this.baselineList = new TypeList({
            type: "baselinegen.specification"
        });

        this.itemProperties = {
            "name": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "concurrency": {
                editable: true,
                required: () => true,
                defaultValue: 1
            },
            "schedule": {
                editable: true,
                required: () => false,
                defaultValue: ""
            },
            "criteria": {
                editable: true,
                required: () => this.state.script.value !== "",
                defaultValue: ""
            },
            "script": {
                editable: true,
                required: () => false,
                defaultValue: ""
            },
            "tagScript": {
                editable: true,
                required: () => false,
                defaultValue: ""
            },
            "workspaceName": {
                editable: true,
                required: () => false,
                defaultValue: ""
            },
            "workspaceCleanup": {
                editable: true,
                required: () => true,
                defaultValue: "keep"
            },
            "initialJobTags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "parentSteps": {
                editable: true,
                required: () => false,
                defaultValue: this.props.context.value.parentSteps || []
            },
            "baseline": {
                editable: true,
                required: () => true,
                defaultValue: "",
                serialize: (id) => tautils.serializeRef(id, "baselinegen.specification"),
                deserialize: (ref) => tautils.deserializeRef(ref)
            },
            "visible": {
                editable: true,
                required: () => false,
                defaultValue: true
            }
        };

        this.state = Object.assign({
            steps: this.stepList.value.getValue(),
            stepsState: this.stepList.state.getValue(),
            baselines: this.baselineList.value.getValue(),
            baselinesState: this.baselineList.state.getValue()
        }, tautils.createStateProperties(this, this.itemProperties, this.props.item));
    }

    componentDidMount() {
        this.log("componentDidMount", this.props, this.state);
        this.addDisposable(this.stepList.start());
        this.addDisposable(this.stepList.value.subscribe((steps) => this.setState({ steps })));
        this.addDisposable(this.stepList.state.subscribe((stepsState) => this.setState({ stepsState })));

        this.addDisposable(this.baselineList.start());
        this.addDisposable(this.baselineList.value.subscribe((baselines) => this.setState({ baselines })));
        this.addDisposable(this.baselineList.state.subscribe((baselinesState) => this.setState({ baselinesState })));
    }

    getSteps() {
        const steps = {};

        for (const step of this.state.steps.toJS()) {
            if (!this.props.item || step._id !== this.props.item._id) {
                steps[step._id] = step.name;
            }
        }

        return steps;
    }

    getBaselines() {
        return this.state.baselines.toJS().map((baseline) => ({
            value: baseline._id,
            label: baseline._id
        }));
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        data.flow = {
            _ref: true,
            id: this.props.parentItems[this.props.parentItems.length - 1]._id,
            type: "flowctrl.flow"
        };

        await this.props.onSave("flowctrl.step", data, {
            create: !this.props.item,
            pathname: this.props.item ? this.props.pathname.split("/").slice(0, -1).join("/") : this.props.pathname
        });
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.stepsState === ObservableDataStates.LOADING ||
            this.state.baselinesState === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator />
            );
        }

        const steps = this.getSteps();
        const baselines = this.getBaselines();
        const cleanupPolicies = [
            { value: "keep", label: "Do not remove" },
            { value: "remove_on_finish", label: "Remove on finish" },
            { value: "remove_on_success", label: "Remove on success" },
            { value: "remove_when_needed", label: "Remove when needed" }
        ];

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this.state, this.itemProperties)}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} flow step`}
                    secondaryText="A flow step specifies things to listen for and then take action based on that"
                    onConfirm={() => this.onConfirm()}
                    onCancel={() => this.props.onCancel()}
                >
                    <Input
                        type="text"
                        label="Name"
                        name="name"
                        floating={true}
                        required={this.itemProperties.name.required()}
                        disabled={this.props.item && !this.itemProperties.name.editable}
                        value={this.state.name.value}
                        onChange={this.state.name.set}
                    />
                    <Autocomplete
                        selectedPosition="below"
                        label="Parent Steps"
                        disabled={this.props.item && !this.itemProperties.parentSteps.editable}
                        onChange={this.state.parentSteps.set}
                        source={steps}
                        value={this.state.parentSteps.value}
                    />
                    <Input
                        type="text"
                        label="Schedule"
                        hint="Schedule is defined as a cron string"
                        name="schedule"
                        floating={true}
                        required={this.itemProperties.schedule.required()}
                        disabled={this.props.item && !this.itemProperties.schedule.editable}
                        value={this.state.schedule.value}
                        onChange={this.state.schedule.set}
                    />
                    <div>
                        <div className={this.props.theme.subtitle}>Concurrency *</div>
                        <Slider
                            pinned={true}
                            snaps={true}
                            min={1}
                            max={25}
                            step={1}
                            editable={!(this.props.item && !this.itemProperties.concurrency.editable)}
                            value={this.state.concurrency.value}
                            onChange={this.state.concurrency.set}
                        />
                    </div>
                    <div>
                        <div className={this.props.theme.subtitle}>Options</div>
                        <Checkbox
                            theme={this.props.theme}
                            label="Show step in developer view"
                            name="visible"
                            disabled={this.props.item && !this.itemProperties.visible.editable}
                            checked={this.state.visible.value}
                            onChange={this.state.visible.set}
                        />
                    </div>
                    <Dropdown
                        label="Baseline"
                        required={this.itemProperties.baseline.required()}
                        disabled={this.props.item && !this.itemProperties.baseline.editable}
                        onChange={this.state.baseline.set}
                        source={baselines}
                        value={this.state.baseline.value}
                    />
                    <Input
                        theme={this.props.theme}
                        className={this.props.theme.monospaceInput}
                        type="text"
                        label="Slave Script"
                        name="script"
                        floating={true}
                        multiline={true}
                        required={this.itemProperties.script.required()}
                        disabled={this.props.item && !this.itemProperties.script.editable}
                        value={this.state.script.value}
                        onChange={this.state.script.set}
                    />
                    <Input
                        type="text"
                        label="Slave Criteria"
                        hint="Tag criteria to match slave"
                        name="criteria"
                        floating={true}
                        required={this.itemProperties.criteria.required()}
                        disabled={this.props.item && !this.itemProperties.criteria.editable}
                        value={this.state.criteria.value}
                        onChange={this.state.criteria.set}
                    />
                    <Input
                        theme={this.props.theme}
                        className={this.props.theme.monospaceInput}
                        type="text"
                        label="Tag Script"
                        name="script"
                        floating={true}
                        multiline={true}
                        required={this.itemProperties.tagScript.required()}
                        disabled={this.props.item && !this.itemProperties.tagScript.editable}
                        value={this.state.tagScript.value}
                        onChange={this.state.tagScript.set}
                    />
                    <Autocomplete
                        selectedPosition="below"
                        allowCreate={true}
                        label="Tags to add to jobs"
                        disabled={this.props.item && !this.itemProperties.initialJobTags.editable}
                        onChange={this.state.initialJobTags.set}
                        source={this.state.initialJobTags.value}
                        value={this.state.initialJobTags.value}
                    />
                    <Input
                        type="text"
                        label="Workspace Name"
                        name="workspaceName"
                        floating={true}
                        required={this.itemProperties.workspaceName.required()}
                        disabled={this.props.item && !this.itemProperties.workspaceName.editable}
                        value={this.state.workspaceName.value}
                        onChange={this.state.workspaceName.set}
                    />
                    <Dropdown
                        label="Workspace Cleanup Policy"
                        required={this.itemProperties.workspaceCleanup.required()}
                        disabled={this.props.item && !this.itemProperties.workspaceCleanup.editable}
                        onChange={this.state.workspaceCleanup.set}
                        source={cleanupPolicies}
                        value={this.state.workspaceCleanup.value}
                    />
                </TAForm>
            </TASection>
        );
    }
}

EditStep.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    parentItems: PropTypes.array,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    context: PropTypes.object.isRequired
};

export default EditStep;
