
import React from "react";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section, Loading } from "ui-components/layout";
import { CardList, LogRepositoryCard, LogCard } from "ui-components/data_card";
import LogListObservable from "ui-observables/paged_artifact_list";
import { ListPager } from "ui-components/type_admin";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class LogRepositoryView extends LightComponent {
    constructor(props) {
        super(props);

        this.logs = new LogListObservable({
            limit: 10
        });

        this.state = {
            logs: this.logs.value.getValue(),
            logsState: this.logs.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.logs.start());

        this.addDisposable(this.logs.value.subscribe((logs) => this.setState({ logs })));
        this.addDisposable(this.logs.value.subscribe((logsState) => this.setState({ logsState })));
    }

    render() {
        this.log("render", this.props, this.state);

        const logs = this.state.logs.map((item) => Immutable.fromJS({
            id: item.get("_id"),
            time: moment(item.get("created")).unix(),
            item: item.toJS(),
            Card: LogCard,
            props: {
                clickable: true
            }
        }));

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Section>
                        <Header label="Properties" />
                        <LogRepositoryCard
                            item={this.props.item}
                            expanded={true}
                            expandable={false}
                        />
                    </Section>
                </Column>
                <Column xs={12} md={6}>
                    <Header label="Logs" />
                    <Loading show={this.state.logsState === ObservableDataStates.LOADING}/>
                    <CardList list={Immutable.fromJS(logs)} />
                    <ListPager
                        pagedList={this.logs}
                        pagingInfo={this.logs.pagingInfo.getValue()}
                    />
                </Column>
            </Row>
        );
    }
}

LogRepositoryView.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object
};

export default LogRepositoryView;
