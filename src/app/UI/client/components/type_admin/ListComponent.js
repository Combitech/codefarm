
import React from "react";
import { List, ListDivider } from "react-toolbox/lib/list";

class ListComponent extends React.PureComponent {
    render() {
        return (
            <List
                className={this.props.theme.list}
                ripple={true}
            >
                <ListDivider key="top_divider" />
                <div className={this.props.theme.divider} />
                {this.props.children}
                <ListDivider key="bottom_divider" />
            </List>
        );
    }
}

ListComponent.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    listContext: React.PropTypes.any
};

export default ListComponent;
