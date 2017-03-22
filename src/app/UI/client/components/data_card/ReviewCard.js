
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import UserAvatar from "ui-components/user_avatar";
import DateTime from "ui-components/datetime";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import { StringUtil } from "misc";
import UserName from "ui-components/user_name";

class ReviewCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const review = this.props.item;

        let titlePrefix = "Reviewed by";
        if (review.state === "approved") {
            titlePrefix = "Approved by";
        } else if (review.state === "rejected") {
            titlePrefix = "Rejected by";
        }

        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            userId={review.userRef.id}
                        />
                    )}
                    title={(
                        <UserName
                            userId={review.userRef.id}
                            notFoundText={review.alias}
                            prefixText={titlePrefix}
                        />
                    )}
                    subtitle={(
                        <DateTime
                            value={review.updated}
                            niceDate={true}
                        />
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>State</td>
                                <td>
                                    {StringUtil.toUpperCaseLetter(review.state)}
                                </td>
                            </tr>
                            <tr>
                                <td>Created</td>
                                <td>
                                    <DateTime
                                        value={review.created}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Updated at</td>
                                <td>
                                    <DateTime
                                        value={review.updated}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </If>
            </ExpandableCard>
        );
    }
}

ReviewCard.defaultProps = {
    expanded: false,
    expandable: true
};

ReviewCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default ReviewCard;
