
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import UserAvatar from "ui-components/user_avatar";
import DateTime from "ui-components/datetime";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import UserItem from "ui-observables/user_item";
import { StringUtil } from "misc";

class ReviewCard extends LightComponent {
    constructor(props) {
        super(props);

        this.user = new UserItem({
            identifier: props.item.userRef ? props.item.userRef.id : props.item.alias
        });

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded),
            user: this.user.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.user.start());
        this.addDisposable(this.user.value.subscribe((user) => this.setState({ user })));
    }

    componentWillReceiveProps(nextProps) {
        this.user.setOpts({
            identifier: nextProps.item.userRef ? nextProps.item.userRef.id : nextProps.item.userEmail
        });
    }

    render() {
        const review = this.props.item;
        const name = this.state.user.get("name", "Someone");
        const emails = this.state.user.get("email");
        const email = emails ? emails.first() : false;

        const title = () => {
            if (review.state === "approved") {
                return `Approved by ${name} <${email}>`;
            } else if (review.state === "rejected") {
                return `Rejected by ${name} <${email}>`;
            }

            return `Reviewed by ${name} <${email}>`;
        };

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
                    title={title()}
                    subtitle={(
                        <DateTime
                            value={review.updated}
                            niceDate={true}
                        />
                    )}
                />
                {this.state.expanded.value && (
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
                )}
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
