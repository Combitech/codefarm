
import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";

class Header extends React.PureComponent {
    render() {
        return (
            <tr>
                <td className={this.props.theme.header10}>Rev</td>
                <td className={this.props.theme.header17}>Time</td>
                <td className={this.props.theme.header30}>Author</td>
                <td className={this.props.theme.header}>Comment</td>
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
    theme: PropTypes.object
};

export default Header;
