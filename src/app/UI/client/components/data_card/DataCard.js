
/* global window */

import React from "react";
import PropTypes from "prop-types";
import { ExpandableCard } from "ui-components/expandable_card";

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
    theme: PropTypes.object,
    children: PropTypes.node,
    expanded: PropTypes.object,
    expandable: PropTypes.bool,
    inline: PropTypes.bool,
    column: PropTypes.bool,
    path: PropTypes.string,
    openInNew: PropTypes.bool
};

DataCard.contextTypes = {
    router: PropTypes.object.isRequired
};

export default DataCard;
