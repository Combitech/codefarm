
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import ImmutablePropTypes from "react-immutable-proptypes";
import statuslib from "ui-lib/statuslib";
import ItemListObservable from "ui-observables/recursive_item_list";

class Row extends LightComponent {
    constructor(props) {
        super(props);

        this.items = new ItemListObservable({
            id: props.item._id,
            type: props.item.type
        });

        this.state = {
            items: this.items.value.getValue(),
            itemsState: this.items.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.items.start());

        this.addDisposable(this.items.value.subscribe((items) => this.setState({ items })));
        this.addDisposable(this.items.state.subscribe((itemsState) => this.setState({ itemsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.items.setOpts({
            id: nextProps.item._id,
            type: nextProps.item.type
        });
    }

    getItemByFlow(flowId) {
        const items = this.state.items.toJS()
            .filter((item) => item.tags.includes(`step:flow:${flowId}`));

        // TODO: Should we sort items on time or something? Or use all?
        return items[0] || false;
    }

    render() {
        const steps = this.props.steps.toJS().map((step) => {
            const item = this.getItemByFlow(step.flow.id);
            const status = statuslib.fromTags(item ? item.tags : [], step.name);
            let jobId = false;

            if (item) {
                // Refs are written in order, not sure if it is reliable over time
                const jobRefs = item.refs.filter((ref) => ref.name === step.name).reverse();

                jobId = jobRefs[0] ? jobRefs[0].id : false;
            }

            const newStep = {
                id: step._id,
                name: step.name,
                status: status
            };

            if (jobId) {
                newStep.onClick = (event) => {
                    event.stopPropagation();
                    this.props.onClick(item, jobId);
                };
            }

            return newStep;
        });

        return (
            <this.props.RowComponent
                theme={this.props.theme}
                onClick={this.props.onClick}
                item={this.props.item}
                steps={steps}
            />
        );
    }
}

Row.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    steps: ImmutablePropTypes.list,
    onClick: PropTypes.func,
    RowComponent: PropTypes.func.isRequired
};

export default Row;
