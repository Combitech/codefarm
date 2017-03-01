import React from "react";
import Chip from "react-toolbox/lib/chip";
import LightComponent from "ui-lib/light_component";
import { ListItem } from "react-toolbox/lib/list";
import { ListItemIcon } from "ui-components/type_admin";
import theme from "../../theme.scss";

const style = {
    "online": {
        icon: "done",
        itemIconClass: `${theme.slaveIcon} ${theme.slaveIconOnline}`
    },
    "offline": {
        icon: "report_problem",
        itemIconClass: `${theme.slaveIcon} ${theme.slaveIconOffline}`
    }
};

class SlaveListItem extends LightComponent {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        const item = this.props.item;
        const currentStyle = item.offline ? style.offline : style.online;
        const icon = <ListItemIcon
            icon={currentStyle.icon}
            className={currentStyle.itemIconClass}
        />;

        return (
            <ListItem
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick(item);
                    }
                }}
                leftIcon={icon}
                selectable={!!this.props.onClick}
                caption={`${item._id} - ${item.uri}`}
                legend={`Created at ${item.created} - Modified at ${item.saved}`}
                rightActions={item.tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                ))}
            />
        );
    }
}

SlaveListItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.array,
    onClick: React.PropTypes.func
};

export default SlaveListItem;
