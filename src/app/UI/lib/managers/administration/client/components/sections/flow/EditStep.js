
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Slider from "react-toolbox/lib/slider";
import Dropdown from "react-toolbox/lib/dropdown";
import Autocomplete from "react-toolbox/lib/autocomplete";
import Checkbox from "react-toolbox/lib/checkbox";
import { Card, CardTitle, CardText } from "react-toolbox/lib/card";
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

        const flowId = props.parentItems[props.parentItems.length - 1]._id;

        this.stepList = new TypeList({
            type: "flowctrl.step",
            query: {
                "flow.id": flowId
            }
        });
        this.baselineList = new TypeList({
            type: "baselinegen.specification"
        });
        this.flowList = new TypeList({
            type: "flowctrl.flow",
            query: {
                "_id": { $ne: flowId }
            }
        });
        this.jobSpecList = new TypeList({
            type: "exec.jobspec"
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
            "tagScript": {
                editable: true,
                required: () => false,
                defaultValue: ""
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
            "jobSpec": {
                editable: true,
                required: () => false,
                defaultValue: "",
                serialize: (id) => tautils.serializeRef(id, "exec.jobspec"),
                deserialize: (ref) => tautils.deserializeRef(ref)
            },
            "initialJobTags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "criteria": {
                editable: true,
                required: () => false,
                defaultValue: ""
            },
            "visible": {
                editable: true,
                required: () => false,
                defaultValue: true
            },
            "connectedFlow": {
                editable: true,
                required: () => false,
                defaultValue: "",
                serialize: (id) => tautils.serializeRef(id, "flowctrl.flow"),
                deserialize: (ref) => tautils.deserializeRef(ref)
            }
        };

        this.state = Object.assign({
            steps: this.stepList.value.getValue(),
            stepsState: this.stepList.state.getValue(),
            baselines: this.baselineList.value.getValue(),
            baselinesState: this.baselineList.state.getValue(),
            flows: this.flowList.value.getValue(),
            flowsState: this.flowList.state.getValue(),
            jobSpecs: this.jobSpecList.value.getValue(),
            jobSpecsState: this.jobSpecList.state.getValue()
        }, tautils.createStateProperties(this, this.itemProperties, this.props.item));
    }

    componentDidMount() {
        this.addDisposable(this.stepList.start());
        this.addDisposable(this.stepList.value.subscribe((steps) => this.setState({ steps })));
        this.addDisposable(this.stepList.state.subscribe((stepsState) => this.setState({ stepsState })));

        this.addDisposable(this.baselineList.start());
        this.addDisposable(this.baselineList.value.subscribe((baselines) => this.setState({ baselines })));
        this.addDisposable(this.baselineList.state.subscribe((baselinesState) => this.setState({ baselinesState })));

        this.addDisposable(this.flowList.start());
        this.addDisposable(this.flowList.value.subscribe((flows) => this.setState({ flows })));
        this.addDisposable(this.flowList.state.subscribe((flowsState) => this.setState({ flowsState })));

        this.addDisposable(this.jobSpecList.start());
        this.addDisposable(this.jobSpecList.value.subscribe((jobSpecs) => this.setState({ jobSpecs })));
        this.addDisposable(this.jobSpecList.state.subscribe((jobSpecsState) => this.setState({ jobSpecsState })));
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

    getFlows() {
        return this.state.flows.toJS().map((flow) => ({
            value: flow._id,
            label: flow._id
        })).concat({
            value: "",
            label: "No connected flow"
        });
    }

    getJobSpecs() {
        return this.state.jobSpecs.toJS().map((jobSpec) => ({
            value: jobSpec._id,
            label: `${jobSpec.name} (${jobSpec._id})`
        })).concat({
            value: "",
            label: "No job specification"
        });
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
            this.state.baselinesState === ObservableDataStates.LOADING ||
            this.state.flowsState === ObservableDataStates.LOADING ||
            this.state.jobSpecsState === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator />
            );
        }

        const steps = this.getSteps();
        const baselines = this.getBaselines();
        const flows = this.getFlows();
        const jobSpecs = this.getJobSpecs();

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this.state, this.itemProperties)}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} flow step`}
                    secondaryText="A flow step defines a set of actions that is performed when the associated collector specification generates a collection."
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
                        label="Collector specification"
                        required={this.itemProperties.baseline.required()}
                        disabled={this.props.item && !this.itemProperties.baseline.editable}
                        onChange={this.state.baseline.set}
                        source={baselines}
                        value={this.state.baseline.value}
                    />
                    <Dropdown
                        label="Connected Flow"
                        required={this.itemProperties.connectedFlow.required()}
                        disabled={this.props.item && !this.itemProperties.connectedFlow.editable}
                        onChange={this.state.connectedFlow.set}
                        source={flows}
                        value={this.state.connectedFlow.value}
                    />
                    <Dropdown
                        label="Job Specification"
                        required={this.itemProperties.jobSpec.required()}
                        disabled={this.props.item && !this.itemProperties.jobSpec.editable}
                        onChange={this.state.jobSpec.set}
                        source={jobSpecs}
                        value={this.state.jobSpec.value}
                    />
                    <If condition={this.state.jobSpec.value}>
                        <Card>
                            <CardTitle subtitle="Job Specification paramters" />
                            <CardText>
                                <Input
                                    type="text"
                                    label="Override Slave Criteria"
                                    hint="Tag criteria to match slave"
                                    name="criteria"
                                    floating={true}
                                    required={this.itemProperties.criteria.required()}
                                    disabled={this.props.item && !this.itemProperties.criteria.editable}
                                    value={this.state.criteria.value}
                                    onChange={this.state.criteria.set}
                                />
                                <Autocomplete
                                    selectedPosition="below"
                                    allowCreate={true}
                                    label="Additional tags to add to jobs"
                                    disabled={this.props.item && !this.itemProperties.initialJobTags.editable}
                                    onChange={this.state.initialJobTags.set}
                                    source={this.state.initialJobTags.value}
                                    value={this.state.initialJobTags.value}
                                />
                            </CardText>
                        </Card>
                    </If>
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
    menuItems: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    context: PropTypes.object.isRequired
};

export default EditStep;
