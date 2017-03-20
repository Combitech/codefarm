
import React from "react";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { CardList, SubJobCard } from "ui-components/data_card";
import SubJobs from "../../../observables/subjob_list";

class SubJobTab extends LightComponent {
    constructor(props) {
        super(props);

        this.subjobs = new SubJobs({
            ids: props.subJobRefs.map((ref) => ref.id)
        });

        this.state = {
            subjobs: this.subjobs.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.subjobs.start());

        this.addDisposable(this.subjobs.value.subscribe((subjobs) => this.setState({ subjobs })));
    }

    componentWillReceiveProps(nextProps) {
        this.subjobs.setOpts({
            ids: nextProps.subJobRefs.map((ref) => ref.id)
        });
    }

    render() {
        const list = this.state.subjobs.map((subjob) => Immutable.fromJS({
            id: subjob.get("_id"),
            time: moment(subjob.get("finished") ? subjob.get("finished") : subjob.get("created")).unix(),
            item: subjob.toJS(),
            Card: SubJobCard,
            props: {}
        }));

        return (
            <CardList list={list} />
        );
    }
}

SubJobTab.propTypes = {
    theme: React.PropTypes.object,
    subJobRefs: React.PropTypes.array.isRequired
};

export default SubJobTab;
