
import React from "react";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import { RevisionCard } from "ui-components/data_card";
import Revisions from "../../../observables/revision_list";

class RevisionList extends LightComponent {
    constructor(props) {
        super(props);

        this.revisions = new Revisions({
            ids: props.revisionRefs.map((ref) => ref.id)
        });

        this.state = {
            revisions: this.revisions.value.getValue(),
            state: this.revisions.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.revisions.start());

        this.addDisposable(this.revisions.value.subscribe((revisions) => this.setState({ revisions })));
        this.addDisposable(this.revisions.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.revisions.setOpts({
            ids: nextProps.revisionRefs.map((ref) => ref.id)
        });
    }

    render() {
        if (this.state.state === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator />
            );
        }

        const list = [];

        for (const revision of this.state.revisions.toJS()) {
            list.push({
                id: revision._id,
                time: 0,
                item: revision,
                Card: RevisionCard,
                props: {}
            });
        }

        list.sort((a, b) => b.time - a.time);

        return (
            <div>
                {list.map((item) => (
                    <item.Card
                        key={item.id}
                        item={item.item}
                        {...item.props}
                        expanded={false}
                    />
                ))}
            </div>
        );
    }
}

RevisionList.propTypes = {
    theme: React.PropTypes.object,
    revisionRefs: React.PropTypes.array.isRequired
};

export default RevisionList;
