
/* global window */

import React from "react";
import { IconButton } from "react-toolbox/lib/button";
import tooltip from "react-toolbox/lib/tooltip";

class CardLinkIcon extends React.PureComponent {
    render() {
        if (this.context.router.isActive(this.props.path)) {
            return null;
        }

        const Button = tooltip(IconButton);

        return (
            <Button
                className={this.props.theme.linkIcon}
                icon="open_in_browser"
                tooltip={`Open ${this.props.name}`}
                tooltipDelay={10}
                tooltipPosition="top"
                onClick={() => {
                    if (this.props.openInNew) {
                        window.open(this.props.path);
                    } else {
                        this.context.router.push({
                            pathname: this.props.path
                        });
                    }
                }}
            />
        );
    }
}

CardLinkIcon.propTypes = {
    theme: React.PropTypes.object,
    path: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    openInNew: React.PropTypes.bool
};

CardLinkIcon.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default CardLinkIcon;
