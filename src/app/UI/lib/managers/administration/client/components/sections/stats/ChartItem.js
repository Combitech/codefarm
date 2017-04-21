
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import StatDataExplore from "./StatDataExplore";
import TypeItem from "ui-observables/type_item";

class ChartItem extends LightComponent {
    constructor(props) {
        super(props);

        this.statItem = new TypeItem({
            type: "stat.stat",
            id: (props.item && props.item.statRef.id) || false
        });

        this.state = {
            statItem: this.statItem.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.statItem.start());
        this.addDisposable(this.statItem.value.subscribe((statItem) => this.setState({ statItem })));
    }

    componentWillReceiveProps(nextProps) {
        this.statItem.setOpts({
            id: (nextProps.item && nextProps.item.statRef.id) || false
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        return (
            <StatDataExplore
                theme={this.props.theme}
                pathname={this.props.pathname}
                chartItem={this.props.item}
                statItem={this.state.statItem.toJS()}
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            />
        );
    }
}

ChartItem.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired
};

export default ChartItem;
