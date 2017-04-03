
import React from "react";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section, Loading } from "ui-components/layout";
import { CardList, CodeRepositoryCard, RevisionCard } from "ui-components/data_card";
import RevisionListObservable from "ui-observables/paged_revision_list";
import { ListPager } from "ui-components/type_admin";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class CodeRepositoryView extends LightComponent {
    constructor(props) {
        super(props);

        this.revisions = new RevisionListObservable({
            limit: 10
        });

        this.state = {
            revisions: this.revisions.value.getValue(),
            revisionsState: this.revisions.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.revisions.start());

        this.addDisposable(this.revisions.value.subscribe((revisions) => this.setState({ revisions })));
        this.addDisposable(this.revisions.value.subscribe((revisionsState) => this.setState({ revisionsState })));
    }

    render() {
        this.log("render", this.props, this.state);

        const revisions = this.state.revisions.map((revision) => Immutable.fromJS({
            id: revision.get("_id"),
            time: moment(revision.get("statusSetAt")).unix(),
            item: revision.toJS(),
            Card: RevisionCard,
            props: {
                clickable: true
            }
        }));

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Section>
                        <Header label="Properties" />
                        <CodeRepositoryCard
                            item={this.props.item}
                            expanded={true}
                            expandable={false}
                        />
                    </Section>
                </Column>
                <Column xs={12} md={6}>
                    <Header label="Revisions" />
                    <Loading show={this.state.revisionsState === ObservableDataStates.LOADING}/>
                    <CardList list={Immutable.fromJS(revisions)} />
                    <ListPager
                        pagedList={this.revisions}
                        pagingInfo={this.revisions.pagingInfo.getValue()}
                    />
                </Column>
            </Row>
        );
    }
}

CodeRepositoryView.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object
};

export default CodeRepositoryView;
