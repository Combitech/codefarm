
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";

class Header extends React.PureComponent {
    render() {
        return (
            <tr>
                <td className={this.props.theme.header10}>Version</td>
                <td className={this.props.theme.header17}>Time</td>
                <td className={this.props.theme.header17}>State</td>
                <td className={this.props.theme.header30}>Name</td>
                <If condition={this.props.steps}>
                    <For each="step" of={this.props.steps.toJS()}>
                        <td
                            key={step.name}
                            className={this.props.theme.runColumn}
                            title={step.name}
                        >
                            {step.name.replace(/[a-z]/g, "")}
                        </td>
                    </For>
                </If>
            </tr>
        );
    }
}

Header.propTypes = {
    steps: ImmutablePropTypes.list,
    theme: React.PropTypes.object
};

export default Header;
