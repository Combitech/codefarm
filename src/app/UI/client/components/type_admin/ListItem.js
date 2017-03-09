
import React from "react";
import Tags from "ui-components/tags";
import LightComponent from "ui-lib/light_component";
import { ListItem } from "react-toolbox/lib/list";

class ListComponentItem extends LightComponent {
    render() {
        const item = this.props.item;

        return (
            <ListItem
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick(item);
                    }
                }}
                selectable={!!this.props.onClick}
                caption={item._id}
                legend={`Created at ${item.created} - Modified at ${item.saved}`}
                rightActions={[ (<Tags key="tags" list={item.tags} />) ]}
            />
        );
    }
}

ListComponentItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.any,
    onClick: React.PropTypes.func
};

export default ListComponentItem;
