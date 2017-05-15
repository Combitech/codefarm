import React from "react";
import PropTypes from "prop-types";

/* GitLab logo icon
 * source: https://about.gitlab.com/press/
 */
import GitLabLogoIconFile from "./GitLab-Logo-64px.png";

class GitLabLogoIcon extends React.PureComponent {
    render() {
        const classNames = [ this.props.theme.appIcon ];
        if (this.props.className) {
            classNames.push(this.props.className);
        }

        return (
            <img
                className={classNames.join(" ")}
                src={GitLabLogoIconFile}
            />
        );
    }
}

GitLabLogoIcon.propTypes = {
    theme: PropTypes.object.isRequired,
    className: PropTypes.string
};

export default GitLabLogoIcon;
