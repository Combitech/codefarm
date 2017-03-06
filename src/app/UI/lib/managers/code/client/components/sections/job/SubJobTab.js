
import React from "react";
import Immutable from "immutable";
import moment from "moment";
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
            subjobs: this.subjobs.value.getValue(),
            state: this.subjobs.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.subjobs.start());

        this.addDisposable(this.subjobs.value.subscribe((subjobs) => this.setState({ subjobs })));
        this.addDisposable(this.subjobs.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.subjobs.setOpts({
            ids: nextProps.subJobRefs.map((ref) => ref.id)
        });
    }

    render() {
        const list = [];

        for (const subjob of this.state.subjobs.toJS()) {
            list.push({
                id: subjob._id,
                time: moment(subjob.finished ? subjob.finished : subjob.created).unix(),
                item: subjob,
                Card: SubJobCard,
                props: {}
            });
        }

        return (
            <div>
                <h5 className={this.props.theme.sectionHeader}>Builds and Tests</h5>
                <div className={this.props.theme.section}>
                    <CardList list={Immutable.fromJS(list)} />
                </div>
            </div>
        );
    }
}

SubJobTab.propTypes = {
    theme: React.PropTypes.object,
    subJobRefs: React.PropTypes.array.isRequired
};

export default SubJobTab;
