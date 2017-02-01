import React from "react";
import Component from "ui-lib/component";
import { ListItem } from "react-toolbox/lib/list";
import { ListItemIcon } from "ui-components/type_admin";

class BaselineListItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        const item = this.props.item;

        const collectorTypes = item.collectors.map((collector) => collector.collectType);
        let iconName = "list";
        if (collectorTypes.every((item) => item === "coderepo.revision")) {
            iconName = "code";
        } else if (collectorTypes.every((item) => item === "artifacrepo.artifact")) {
            iconName = "extension";
        }

        const collectorsStr = item.collectors.map((collector) =>
            `${collector.name} - ${collector.collectType} - "${collector.criteria}"`
        ).join(", ");

        return (
            <ListItem
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick(item);
                    }
                }}
                leftIcon={<ListItemIcon icon={iconName} />}
                selectable={!!this.props.onClick}
                caption={`${item._id}`}
                legend={`Collectors: ${collectorsStr}`}
            />
        );
    }
}

BaselineListItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.array,
    onClick: React.PropTypes.func
};

export default BaselineListItem;
