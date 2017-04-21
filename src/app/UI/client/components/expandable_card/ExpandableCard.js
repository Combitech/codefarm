import React from "react";
import PropTypes from "prop-types";
import { Card as RTCard } from "react-toolbox/lib/card";
import { IconButton } from "react-toolbox/lib/button";
import LightComponent from "ui-lib/light_component";
import ripple from "react-toolbox/lib/ripple";
import theme from "react-toolbox/lib/ripple/theme.scss";

const RippleCard = ripple()(RTCard);

class ExpandableCard extends LightComponent {
    onToggle(event) {
        event.stopPropagation();
        this.props.expanded.toggle();
    }

    render() {
        const expandIconName = this.props.expanded.value ? this.props.iconCollapse : this.props.iconExpand;

        const classNames = [
            this.props.theme.expandableCard,
            this.props.className
        ];

        if (this.props.onClick) {
            classNames.push(this.props.theme.expandableCardClickable);
        }

        const Card = this.props.onClick ? RippleCard : RTCard;

        return (
            <Card
                theme={theme}
                className={classNames.join(" ")}
                onClick={this.props.onClick}
            >
                {this.props.children}
                {this.props.expandable && (
                    <IconButton
                        icon={expandIconName}
                        className={this.props.theme.expandButton}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => this.onToggle(e)}
                    />
            )}
            </Card>
        );
    }
}

ExpandableCard.defaultProps = {
    iconExpand: "expand_more",
    iconCollapse: "expand_less",
    expandable: true,
    className: ""
};

ExpandableCard.propTypes = {
    theme: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.node,
    iconExpand: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),
    iconCollapse: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),
    expandable: PropTypes.bool,
    expanded: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

export default ExpandableCard;
