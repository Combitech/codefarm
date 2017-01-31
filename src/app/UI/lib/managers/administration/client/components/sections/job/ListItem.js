
import React from "react";
import Component from "ui-lib/component";
import { ListItem } from "react-toolbox/lib/list";
import { ListItemIcon } from "ui-components/type_admin";
import theme from "../../theme.scss";
import { StringUtil } from "misc";

const jobStatusIcon = {
    "queued": "schedule",
    "allocated": "update",
    "ongoing": "loop",
    "success": "done",
    "aborted": "priority_high",
    "fail": "report_problem",
    "skip": "fast_forward"
};

class JobListItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        const item = this.props.item;
        const jobStatusIconPropName = `jobStatusIcon${StringUtil.toUpperCaseLetter(item.status)}`;
        const iconClassName = `${theme.jobStatusIcon} ${theme[jobStatusIconPropName]}`;
        const leftIcon = <ListItemIcon
            icon={jobStatusIcon[item.status]}
            className={iconClassName}
        />;

        let rightIcon;
        if (this.props.rightIcon) {
            rightIcon = <ListItemIcon
                icon={this.props.rightIcon}
            />;
        }
        const caption = this.props.caption || `${item.name} - ${item.status}`;
        const legend = this.props.legend || `Created at ${item.created} - Modified at ${item.saved}`;

        return (
            <ListItem
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick(item);
                    }
                }}
                caption={caption}
                legend={legend}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                selectable={!!this.props.onClick}
                rightActions={this.props.rightActions || []}
            />
        );
    }
}

JobListItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.object,
    onClick: React.PropTypes.func,
    caption: React.PropTypes.string,
    legend: React.PropTypes.string,
    rightActions: React.PropTypes.array,
    rightIcon: React.PropTypes.string
};

export default JobListItem;
