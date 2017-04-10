
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Flow as FlowFlow, StepGeneric, StepCreate } from "ui-components/flow";

class Flow extends LightComponent {
    onCreate() {
        this.context.router.push({ pathname: `${this.props.pathname}/create` });
    }

    onClick(id) {
        const list = this.props.selected.value.slice(0);
        const index = list.indexOf(id);

        if (index !== -1) {
            list.splice(index, 1);
        } else {
            list.push(id);
        }

        this.props.selected.set(list);
        this.props.context.set({ parentSteps: list });
    }

    onRemove(id) {
        this.context.router.push({ pathname: `${this.props.pathname}/${id}/remove` });
    }

    onEdit(id) {
        this.context.router.push({ pathname: `${this.props.pathname}/${id}/edit` });
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.props.steps.length === 0) {
            return null;
        }

        const steps = this.props.steps.map((step) => ({
            id: step._id,
            type: StepGeneric,
            name: step.name,
            disabled: (item) => {
                for (const parent of item.getAllParents()) {
                    if (parent.active()) {
                        return true;
                    }
                }

                for (const parent of item.getAllChildren()) {
                    if (parent.active()) {
                        return true;
                    }
                }

                return false;
            },
            active: () => this.props.selected.value.includes(step._id),
            secondary: !step.visible, // Use secondary look for steps not visible in developer view
            parentIds: step.parentSteps.slice(0),
            handlers: {
                onClick: () => this.onClick(step._id),
                onRemove: () => this.onRemove(step._id),
                onEdit: () => this.onEdit(step._id)
            }
        }));

        if (this.props.selected.value.length > 0) {
            steps.push({
                id: "CREATE",
                name: "Create Step",
                type: StepCreate,
                secondary: false,
                disabled: () => false,
                active: () => false,
                parentIds: this.props.selected.value.slice(0),
                handlers: {
                    onClick: () => this.onCreate()
                }
            });
        }

        return (
            <FlowFlow
                theme={this.props.theme}
                steps={steps}
            />
        );
    }
}

Flow.propTypes = {
    theme: React.PropTypes.object,
    context: React.PropTypes.object.isRequired,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    steps: React.PropTypes.array.isRequired,
    selected: React.PropTypes.object.isRequired
};

Flow.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Flow;
