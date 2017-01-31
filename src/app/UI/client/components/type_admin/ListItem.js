
import React from "react";
import Chip from "react-toolbox/lib/chip";
import Component from "ui-lib/component";
import { ListItem } from "react-toolbox/lib/list";

class ListComponentItem extends Component {
    constructor(props) {
        super(props);
    }

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
                rightActions={item.tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                ))}
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
