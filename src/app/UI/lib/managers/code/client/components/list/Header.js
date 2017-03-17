
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";

class Header extends React.PureComponent {
    render() {
        return (
            <tbody className={this.props.theme.header}>
                <tr>
                    <td className={this.props.theme.headerRev}>Rev</td>
                    <td className={this.props.theme.headerTime}>Time</td>
                    <td className={this.props.theme.headerAuthor}>Author</td>
                    <td className={this.props.theme.headerComment}>Comment</td>
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
            </tbody>
        );
    }
}

Header.propTypes = {
    steps: ImmutablePropTypes.list,
    theme: React.PropTypes.object
};

export default Header;
