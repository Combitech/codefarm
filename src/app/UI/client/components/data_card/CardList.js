
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";

class CardList extends React.PureComponent {
    render() {
        const list = this.props.list.sort((a, b) => b.get("time") - a.get("time"));

        return (
            <div>
                {list.toJS().map((item) => (
                    <item.Card
                        key={item.id}
                        item={item.item}
                        expanded={this.props.expanded}
                        expandable={this.props.expandable}
                        inline={this.props.inline}
                        {...item.props}
                    />
                ))}
            </div>
        );
    }
}

CardList.defaultProps = {
    expanded: false,
    expandable: true,
    inline: false
};

CardList.propTypes = {
    theme: React.PropTypes.object,
    list: ImmutablePropTypes.list.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    inline: React.PropTypes.bool
};

export default CardList;
