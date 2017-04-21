
/* global window */

import React from "react";
import PropTypes from "prop-types";
import Chip from "react-toolbox/lib/chip";

class DataChip extends React.PureComponent {
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

    onDelete(event) {
        if (this.props.onDelete) {
            event.stopPropagation();
            this.props.onDelete();
        }
    }

    render() {
        const isActive = this.props.path && this.context.router.isActive(this.props.path);
        const isClickable = !isActive && this.props.path;
        const onClick = isClickable ? (e) => this.onClick(e) : null;
        const className = `${this.props.theme.chip} ${isClickable ? this.props.theme.clickable : ""}`;

        return (
            <Chip
                className={className}
                onClick={onClick}
                deletable={!!this.props.onDelete}
                onDeleteClick={(e) => this.onDelete(e)}
            >
                {this.props.children}
            </Chip>
        );
    }
}

DataChip.defaultProps = {
    openInNew: false
};

DataChip.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    onDelete: PropTypes.func,
    path: PropTypes.string,
    openInNew: PropTypes.bool
};

DataChip.contextTypes = {
    router: PropTypes.object.isRequired
};

export default DataChip;
