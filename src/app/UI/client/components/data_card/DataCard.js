
/* global window */

import React from "react";
import ExpandableCard from "ui-components/expandable_card";
class DataCard extends React.PureComponent {
    onClick(event) {
        event.stopPropagation();

        if (this.props.openInNew) {
            window.open(this.props.path);
        } else {
            this.context.router.push({
                pathname: this.props.path
            });
        }
    }

    render() {
        const isActive = this.props.path && this.context.router.isActive(this.props.path);
        const isClickable = !isActive && this.props.path;
        const onClick = isClickable ? (e) => this.onClick(e) : null;
        const classNames = [ this.props.theme.card ];

        if (this.props.inline) {
            classNames.push(this.props.theme.cardInline);
        }

        if (this.props.column) {
            classNames.push(this.props.theme.cardColumn);
        }

        return (
            <ExpandableCard
                className={classNames.join(" ")}
                expanded={this.props.expanded}
                expandable={this.props.expandable}
                onClick={onClick}
            >
                {this.props.children}
            </ExpandableCard>
        );
    }
}

DataCard.defaultProps = {
    expandable: true,
    inline: false,
    column: false,
    openInNew: false
};

DataCard.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    expanded: React.PropTypes.object,
    expandable: React.PropTypes.bool,
    inline: React.PropTypes.bool,
    column: React.PropTypes.bool,
    path: React.PropTypes.string,
    openInNew: React.PropTypes.bool
};

DataCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default DataCard;
