
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { UserAvatar } from "ui-components/user_avatar";
import { DateTime } from "ui-components/datetime";
import DataCard from "./DataCard";
import { UserName } from "ui-components/user_name";
import { CardTitle } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
import { StringUtil } from "misc";

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
            <DataCard
                theme={this.props.theme}
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
                                <td>Updated&nbsp;at</td>
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
            </DataCard>
        );
    }
}

ReviewCard.defaultProps = {
    expanded: false,
    expandable: true
};

ReviewCard.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    expanded: PropTypes.bool,
    expandable: PropTypes.bool
};

export default ReviewCard;
