import React from "react";
import LightComponent from "ui-lib/light_component";
import { ListItem } from "react-toolbox/lib/list";
import { ListItemIcon } from "ui-components/type_admin";

class StatListItem extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        const item = this.props.item;

        return (
            <ListItem
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick(item);
                    }
                }}
                leftIcon={<ListItemIcon icon="show_chart" />}
                selectable={!!this.props.onClick}
                caption={item._id}
                legend={item.description || ""}
            />
        );
    }
}

StatListItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.array,
    onClick: React.PropTypes.func
};

export default StatListItem;
