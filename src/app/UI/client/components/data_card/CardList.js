
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import CardColumns from "./CardColumns";

class CardList extends React.PureComponent {
    render() {
        const list = this.props.list.sort((a, b) => b.get("time") - a.get("time"));

        const columnProps = {
            useColumns: this.props.columns > 0
        };
        if (this.props.columns > 0) {
            Object.assign(columnProps, {
                xs: 12, // Max 1 col
                sm: 12 / Math.min(1, this.props.columns), // Max 1 col
                md: 12 / Math.min(2, this.props.columns), // Max 2 cols
                lg: 12 / Math.min(4, this.props.columns)  // Max 4 cols
            });
        }

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
                            <CardColumns
                                {...columnProps}
                            >
                                {list.toJS().map((item) => (
                                    <item.Card
                                        key={item.id}
                                        item={item.item}
                                        expanded={this.props.expanded}
                                        expandable={this.props.expandable}
                                        column={this.props.columns > 0}
                                        {...item.props}
                                    />
                                ))}
                            </CardColumns>
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
    emptyLabel: "Nothing to list",
    columns: 0 // Do not render columns
};

CardList.propTypes = {
    theme: React.PropTypes.object,
    list: ImmutablePropTypes.list.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    inline: React.PropTypes.bool,
    showEmpty: React.PropTypes.bool,
    emptyLabel: React.PropTypes.string,
    pager: React.PropTypes.element,
    columns: React.PropTypes.number
};

export default CardList;
