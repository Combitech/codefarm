
import React from "react";
import Tags from "ui-components/tags";
import LightComponent from "ui-lib/light_component";
import { ListItem } from "react-toolbox/lib/list";

class UserListItem extends LightComponent {
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
                selectable={!!this.props.onClick}
                caption={`${item.name}`}
                rightActions={[ (<Tags key="tags" list={item.tags} />) ]}
            />
        );
    }
}

UserListItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.array,
    onClick: React.PropTypes.func
};

export default UserListItem;
