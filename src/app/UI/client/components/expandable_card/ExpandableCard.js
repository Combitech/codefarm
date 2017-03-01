import React from "react";
import { Card } from "react-toolbox/lib/card";
import { IconButton } from "react-toolbox/lib/button";
import LightComponent from "ui-lib/light_component";

class ExpandableCard extends LightComponent {
    render() {
        const expandIconName = this.props.expanded.value ? this.props.iconCollapse : this.props.iconExpand;

        return (
            <Card className={this.props.theme.expandableCard}>
                {this.props.children}
                <IconButton
                    icon={expandIconName}
                    className={this.props.theme.expandButton}
                    onClick={() => this.props.expanded.toggle()}
                />
            </Card>
        );
    }
}

ExpandableCard.defaultProps = {
    iconExpand: "expand_more",
    iconCollapse: "expand_less"
};

ExpandableCard.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    iconExpand: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.element
    ]),
    iconCollapse: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.element
    ]),
    expanded: React.PropTypes.object.isRequired
};

export default ExpandableCard;
