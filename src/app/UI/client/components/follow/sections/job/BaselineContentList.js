
import React from "react";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { Loading } from "ui-components/layout";
import { CardList, RevisionCard, ArtifactCard } from "ui-components/data_card";
import BaselineItem from "ui-observables/baseline_item";

const cards = {
    "coderepo.revision": RevisionCard,
    "artifactrepo.artifact": ArtifactCard
};

class BaselineContentList extends LightComponent {
    constructor(props) {
        super(props);

        this.baseline = new BaselineItem({
            id: props.baselineRef.id
        });

        this.state = {
            baseline: this.baseline.value.getValue(),
            state: this.baseline.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.baseline.start());

        this.addDisposable(this.baseline.value.subscribe((baseline) => this.setState({ baseline })));
        this.addDisposable(this.baseline.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.baseline.setOpts({
            id: nextProps.baselineRef.id
        });
    }

    render() {
        if (this.state.state === ObservableDataStates.LOADING) {
            return (<Loading />);
        }

        const baselineData = this.state.baseline.toJS().data;
        const contentList = baselineData ? baselineData.content : [];
        const list = [];

        for (const content of contentList) {
            for (const item of content.data) {
                if (cards[item.type]) {
                    list.push({
                        id: item._id,
                        time: 0,
                        item: item,
                        Card: cards[item.type],
                        props: {}
                    });
                } else {
                    console.error("Baseline contained data that we have no card for", item);
                }
            }
        }

        return (
            <CardList list={Immutable.fromJS(list)} />
        );
    }
}

BaselineContentList.propTypes = {
    theme: React.PropTypes.object,
    baselineRef: React.PropTypes.object.isRequired
};

export default BaselineContentList;
