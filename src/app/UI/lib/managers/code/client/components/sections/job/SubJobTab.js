
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Row, Col } from "react-flexbox-grid";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import { SubJobCard } from "ui-components/data_card";
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
        if (this.state.state === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator />
            );
        }

        const list = this.state.subjobs.toJS();
        const tests = list.filter((item) => item.kind === "test");
        const builds = list.filter((item) => item.kind === "build");

        return (
            <Row>
                <Col xs={12} md={6}>
                    <h5 className={this.props.theme.sectionHeader}>Builds</h5>
                    <div className={this.props.theme.section}>
                        {builds.map((build) => (
                            <SubJobCard
                                key={build._id}
                                item={build}
                                expanded={false}
                                expandable={true}
                            />
                        ))}
                    </div>
                </Col>
                <Col xs={12} md={6}>
                    <h5 className={this.props.theme.sectionHeader}>Tests</h5>
                    <div className={this.props.theme.section}>
                        {tests.map((test) => (
                            <SubJobCard
                                key={test._id}
                                item={test}
                                expanded={false}
                                expandable={true}
                            />
                        ))}
                    </div>
                </Col>
            </Row>
        );
    }
}

SubJobTab.propTypes = {
    theme: React.PropTypes.object,
    subJobRefs: React.PropTypes.array.isRequired
};

export default SubJobTab;
