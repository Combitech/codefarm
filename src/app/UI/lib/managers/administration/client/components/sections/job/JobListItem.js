
import React from "react";
import LightComponent from "ui-lib/light_component";
import { ListItem } from "react-toolbox/lib/list";
import { ListItemIcon } from "ui-components/type_admin";

class JobListItem extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        const item = this.props.item;
        let icon = <div></div>;
        if (item.state === "commited") {
            icon = <ListItemIcon
                icon={"attachment"}
            />;
        }

        return (
            <ListItem
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick(item);
                    }
                }}
                leftIcon={icon}
                selectable={!!this.props.onClick}
                caption={`${item.name} - ${item.version}`}
                legend={`Created at ${item.created} - Modified at ${item.saved}`}
            />
        );
    }
}

JobListItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.array,
    onClick: React.PropTypes.func
};

export default JobListItem;
