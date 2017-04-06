
import React from "react";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section, Loading } from "ui-components/layout";
import { CardList, ArtifactRepositoryCard, ArtifactCard } from "ui-components/data_card";
import ArtifactListObservable from "ui-observables/paged_artifact_list";
import { ListPager } from "ui-components/type_admin";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class ArtifactRepositoryView extends LightComponent {
    constructor(props) {
        super(props);

        this.artifacts = new ArtifactListObservable({
            limit: 10,
            query: {
                repository: props.item._id
            }
        });

        this.state = {
            artifacts: this.artifacts.value.getValue(),
            artifactsState: this.artifacts.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.artifacts.start());

        this.addDisposable(this.artifacts.value.subscribe((artifacts) => this.setState({ artifacts })));
        this.addDisposable(this.artifacts.value.subscribe((artifactsState) => this.setState({ artifactsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.artifacts.setOpts({
            query: {
                repository: nextProps.item._id
            }
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const artifacts = this.state.artifacts.map((item) => Immutable.fromJS({
            id: item.get("_id"),
            time: moment(item.get("statusSetAt")).unix(),
            item: item.toJS(),
            Card: ArtifactCard,
            props: {
                clickable: true
            }
        }));

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Section>
                        <Header label="Properties" />
                        <ArtifactRepositoryCard
                            item={this.props.item}
                            expanded={true}
                            expandable={false}
                        />
                    </Section>
                </Column>
                <Column xs={12} md={6}>
                    <Header label="Artifacts" />
                    <Loading show={this.state.artifactsState === ObservableDataStates.LOADING}/>
                    <CardList list={Immutable.fromJS(artifacts)} />
                    <ListPager
                        pagedList={this.artifacts}
                        pagingInfo={this.artifacts.pagingInfo.getValue()}
                    />
                </Column>
            </Row>
        );
    }
}

ArtifactRepositoryView.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object
};

export default ArtifactRepositoryView;
