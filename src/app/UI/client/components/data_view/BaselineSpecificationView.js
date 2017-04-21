
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section, Loading } from "ui-components/layout";
import { CardList, BaselineSpecificationCard, BaselineCard, CollectorCard } from "ui-components/data_card";
import BaselineListObservable from "ui-observables/paged_baseline_list";
import CollectorListObservable from "ui-observables/paged_collector_list";
import { ListPager } from "ui-components/type_admin";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class BaselineSpecificationView extends LightComponent {
    constructor(props) {
        super(props);

        this.baselines = new BaselineListObservable({
            limit: 10,
            query: {
                name: props.item._id
            }
        });

        this.collectors = new CollectorListObservable({
            limit: 10,
            query: {
                baseline: props.item._id
            }
        });

        this.state = {
            baselines: this.baselines.value.getValue(),
            baselinesState: this.baselines.state.getValue(),
            collectors: this.baselines.value.getValue(),
            collectorsState: this.baselines.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.baselines.start());

        this.addDisposable(this.baselines.value.subscribe((baselines) => this.setState({ baselines })));
        this.addDisposable(this.baselines.value.subscribe((baselinesState) => this.setState({ baselinesState })));

        this.addDisposable(this.collectors.start());

        this.addDisposable(this.collectors.value.subscribe((collectors) => this.setState({ collectors })));
        this.addDisposable(this.collectors.value.subscribe((collectorsState) => this.setState({ collectorsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.baselines.setOpts({
            query: {
                repository: nextProps.item._id
            }
        });

        this.collectors.setOpts({
            query: {
                name: nextProps.item._id
            }
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const baselines = this.state.baselines.map((item) => Immutable.fromJS({
            id: item.get("_id"),
            time: moment(item.get("created")).unix(),
            item: item.toJS(),
            Card: BaselineCard,
            props: {
                clickable: true
            }
        }));

        const collectors = this.state.collectors.map((item) => Immutable.fromJS({
            id: item.get("_id"),
            time: moment(item.get("created")).unix(),
            item: item.toJS(),
            Card: CollectorCard,
            props: {
                clickable: true,
                expanded: [ "not_ready", "ready", "completed" ].includes(item.get("state"))
            }
        }));

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Section>
                        <Header label="Properties" />
                        <BaselineSpecificationCard
                            item={this.props.item}
                            expanded={true}
                            expandable={false}
                        />
                    </Section>

                    <Section>
                        <Header label="Collectors" />
                        <Loading show={this.state.collectorsState === ObservableDataStates.LOADING}/>
                        <CardList list={Immutable.fromJS(collectors)} />
                        <ListPager
                            pagedList={this.collectors}
                            pagingInfo={this.collectors.pagingInfo.getValue()}
                        />
                    </Section>
                </Column>
                <Column xs={12} md={6}>
                    <Header label="Generated" />
                    <Loading show={this.state.baselinesState === ObservableDataStates.LOADING}/>
                    <CardList list={Immutable.fromJS(baselines)} />
                    <ListPager
                        pagedList={this.baselines}
                        pagingInfo={this.baselines.pagingInfo.getValue()}
                    />
                </Column>
            </Row>
        );
    }
}

BaselineSpecificationView.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object
};

export default BaselineSpecificationView;
