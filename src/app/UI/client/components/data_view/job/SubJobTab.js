
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { CardList, TypeCard } from "ui-components/data_card";
import SubJobs from "ui-observables/subjob_list";

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
            Card: TypeCard,
            props: {}
        }));

        return (
            <CardList list={list} />
        );
    }
}

SubJobTab.propTypes = {
    theme: PropTypes.object,
    subJobRefs: PropTypes.array.isRequired
};

export default SubJobTab;
