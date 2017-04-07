
/* global window */

import React from "react";
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
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    onDelete: React.PropTypes.func,
    path: React.PropTypes.string,
    openInNew: React.PropTypes.bool
};

DataChip.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default DataChip;
