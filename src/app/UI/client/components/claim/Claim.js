
import React from "react";
import LightComponent from "ui-lib/light_component";
import { createClaim, removeClaim } from "ui-lib/claim";
import UserName from "ui-components/user_name";
import UserAvatar from "ui-components/user_avatar";
import { Loading } from "ui-components/layout";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import ClaimList from "ui-observables/claim_list";
import ActiveUser from "ui-observables/active_user";

class Claim extends LightComponent {
    constructor(props) {
        super(props);

        this.claims = new ClaimList({
            targetRef: this.props.targetRef
        });

        this.state = {
            claims: this.claims.value.getValue(),
            state: this.claims.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.claims.start());

        this.addDisposable(this.claims.value.subscribe((claims) => this.setState({ claims })));
        this.addDisposable(this.claims.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.claims.setOpts({
            targetRef: nextProps.targetRef
        });
    }

    onClaim() {
        createClaim({
            text: ""
        }, this.props.targetRef);
    }

    onUnclaim(myClaim) {
        removeClaim(myClaim._id);
    }

    render() {
        if (this.state.state === ObservableDataStates.LOADING) {
            return (<Loading />);
        }

        const claims = this.state.claims.toJS();
        const signedInUser = ActiveUser.instance.user.getValue().toJS();
        const myClaim = claims.find((item) => item.creatorRef.id === signedInUser.id);

        return (
            <div>
                <Choose>
                    <When condition={myClaim}>
                        <a
                            className={this.props.theme.button}
                            onClick={() => this.onUnclaim(myClaim)}
                        >
                            Unclaim
                        </a>
                    </When>
                    <Otherwise>
                        <a
                            className={this.props.theme.button}
                            onClick={() => this.onClaim()}
                        >
                            Claim
                        </a>

                    </Otherwise>
                </Choose>
                <If condition={claims.length === 0}>
                    <div className={this.props.theme.noClaim}>
                        No claims found
                    </div>
                </If>
                <For each="item" of={claims}>
                    <UserAvatar
                        className={this.props.theme.avatar}
                        userId={item.creatorRef.id}
                    />
                    <UserName
                        className={this.props.theme.name}
                        userId={item.creatorRef.id}
                    />
                </For>
            </div>
        );
    }
}

Claim.propTypes = {
    theme: React.PropTypes.object,
    targetRef: React.PropTypes.object.isRequired
};

export default Claim;
