
import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import TypeChip from "./TypeChip";

class ChipList extends React.PureComponent {
    render() {
        return (
            <span>
                <For each="item" of={this.props.list.toJS()}>
                    <TypeChip
                        theme={this.props.theme}
                        key={item.id}
                        itemRef={item.ref}
                        {...item.props}
                    />
                </For>
            </span>
        );
    }
}

ChipList.propTypes = {
    theme: PropTypes.object,
    list: ImmutablePropTypes.list.isRequired
};

export default ChipList;
