
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import Header from "./Header";

class Table extends React.PureComponent {
    render() {
        return (
            <table className={this.props.theme.revisionList}>
                <Header
                    theme={this.props.theme}
                    steps={this.props.steps}
                />
                <tbody className={this.props.theme.list}>
                    {this.props.children}
                </tbody>
            </table>
        );
    }
}

Table.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    steps: ImmutablePropTypes.list
};

export default Table;
