
import React from "react";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { createClaim, removeClaim } from "ui-lib/claim";
import { Loading } from "ui-components/layout";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import ClaimList from "ui-observables/claim_list";
import ActiveUser from "ui-observables/active_user";
import { ChipList } from "ui-components/data_chip";

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
        const list = claims.map((item) => ({
            id: item._id,
            ref: item.creatorRef,
            props: {
                onDelete: () => this.onUnclaim(item)
            }
        }));

        return (
            <div>
                <If condition={!myClaim}>
                    <a
                        className={this.props.theme.button}
                        onClick={() => this.onClaim()}
                    >
                        Claim
                    </a>

                </If>
                <If condition={claims.length === 0}>
                    <div className={this.props.theme.noClaim}>
                        No claims found
                    </div>
                </If>
                <ChipList list={Immutable.fromJS(list)} />
            </div>
        );
    }
}

Claim.propTypes = {
    theme: React.PropTypes.object,
    targetRef: React.PropTypes.object.isRequired
};

export default Claim;
