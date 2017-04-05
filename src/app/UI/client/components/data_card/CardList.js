
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";

class CardList extends React.PureComponent {
    render() {
        const list = this.props.list.sort((a, b) => b.get("time") - a.get("time"));

        return (
            <div>
                <Choose>
                    <When condition={this.props.showEmpty && list.size === 0}>
                        <div className={this.props.theme.emptyCardList}>
                            {this.props.emptyLabel}
                        </div>
                    </When>
                    <Otherwise>
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
                            {this.props.pager}
                        </div>
                    </Otherwise>
                </Choose>
            </div>
        );
    }
}

CardList.defaultProps = {
    expanded: false,
    expandable: true,
    inline: false,
    showEmpty: true,
    emptyLabel: "Nothing to list"
};

CardList.propTypes = {
    theme: React.PropTypes.object,
    list: ImmutablePropTypes.list.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    inline: React.PropTypes.bool,
    showEmpty: React.PropTypes.bool,
    emptyLabel: React.PropTypes.string,
    pager: React.PropTypes.element
};

export default CardList;
