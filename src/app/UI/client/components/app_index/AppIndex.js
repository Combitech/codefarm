
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Section, Header, Row, Column, Loading } from "ui-components/layout";
import { CardList, RevisionCard, ArtifactCard } from "ui-components/data_card";
import { AppHeader } from "ui-components/app_header";
import TypeList from "ui-observables/type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class AppIndex extends LightComponent {
    constructor(props) {
        super(props);

        this.revisions = new TypeList({
            type: "coderepo.revision",
            query: { status: { $ne: "abandoned" } },
            sortOn: "statusSetAt",
            limit: 5
        });

        this.artifacts = new TypeList({
            type: "artifactrepo.artifact",
            query: { state: "commited" },
            sortOn: "created",
            limit: 5
        });

        this.state = {
            revisions: this.revisions.value.getValue(),
            revisionsState: this.revisions.state.getValue(),
            artifacts: this.artifacts.value.getValue(),
            artifactsState: this.artifacts.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.revisions.start());

        this.addDisposable(this.revisions.value.subscribe((revisions) => this.setState({ revisions })));
        this.addDisposable(this.revisions.value.subscribe((revisionsState) => this.setState({ revisionsState })));

        this.addDisposable(this.artifacts.start());

        this.addDisposable(this.artifacts.value.subscribe((artifacts) => this.setState({ artifacts })));
        this.addDisposable(this.artifacts.value.subscribe((artifactsState) => this.setState({ artifactsState })));
    }

    render() {
        const loading = this.state.revisionsState === ObservableDataStates.LOADING || this.state.artifactsState === ObservableDataStates.LOADING;
        const list = [];

        for (const item of this.state.revisions.toJS()) {
            list.push({
                id: item._id,
                time: moment(item.statusSetAt).unix(),
                item: item,
                Card: RevisionCard,
                props: {
                    clickable: true
                }
            });
        }

        for (const item of this.state.artifacts.toJS()) {
            list.push({
                id: item._id,
                time: moment(item.created).unix(),
                item: item,
                Card: ArtifactCard,
                props: {
                    clickable: true
                }
            });
        }

        return (
            <div>
                <AppHeader
                    primaryText="The Code Farm"
                    secondaryText="The home of continuous integration flows"
                />
                <div className={this.props.theme.content}>
                    <Row>
                        <Column xs={12} md={6} mdOffset={3}>
                            <Section>
                                <p className={this.props.theme.text}>
                                    A stable <strong>Continuous Integration</strong> (CI) system is vital for the productivity of a software organization. <strong>Code Farm</strong> implements features derived from years of experience in large scale software producing organizations. It allows for the creation of flows of CI steps and visualizes these.
                                </p>
                                <br />
                                <p className={this.props.theme.text}>
                                    <strong>Code Farm</strong> is distributed as open source under the <a target="_blank" href="https://github.com/Combitech/codefarm/blob/master/LICENSE">MIT license</a>. The source code is hosted at <a target="_blank" href="https://github.com/Combitech/codefarm">GitHub</a>. If issues are found or you just want to write a feature request, please report it <a target="_blank" href="https://github.com/Combitech/codefarm/issues">here</a> or event better, implement it yourself and submit a pull-request.
                                </p>
                                <br />
                            </Section>
                        </Column>
                    </Row>
                    <Row>
                        <Column xs={12} md={6} mdOffset={3}>
                            <Header label="Latest events" />
                            <Loading show={loading}/>
                            <CardList list={Immutable.fromJS(list)} />
                        </Column>
                    </Row>
                </div>
            </div>
        );
    }
}

AppIndex.propTypes = {
    theme: PropTypes.object
};

export default AppIndex;
