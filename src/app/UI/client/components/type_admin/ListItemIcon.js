import React from "react";
import PropTypes from "prop-types";
import FontIcon from "react-toolbox/lib/font_icon";

class ListItemIcon extends React.Component {
    render() {
        let classNames = "";
        if (this.props.theme.listItemIconContainer) {
            classNames = `${classNames} ${this.props.theme.listItemIconContainer}`;
        }
        if (this.props.className) {
            classNames = `${classNames} ${this.props.className}`;
        }

        return (
            <div className={classNames}>
                <FontIcon value={this.props.icon} className={this.props.theme.listItemIcon} />
            </div>
        );
    }
}

ListItemIcon.propTypes = {
    theme: PropTypes.object,
    icon: PropTypes.string,
    className: PropTypes.string
};

export default ListItemIcon;
