import React from "react";
import PropTypes from "prop-types";

/* GitHub marker icon
 * source: https://github.com/logos
 */
import GitHubMarkerIconFile from "./GitHub-Mark-64px.png";

class GitHubMarkerIcon extends React.PureComponent {
    render() {
        const classNames = [ this.props.theme.appIcon ];
        if (this.props.className) {
            classNames.push(this.props.className);
        }

        return (
            <img
                className={classNames.join(" ")}
                src={GitHubMarkerIconFile}
            />
        );
    }
}

GitHubMarkerIcon.propTypes = {
    theme: PropTypes.object.isRequired,
    className: PropTypes.string
};

export default GitHubMarkerIcon;
