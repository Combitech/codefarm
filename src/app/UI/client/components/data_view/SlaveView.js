
import React from "react";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section, Loading } from "ui-components/layout";
import { CardList, SlaveCard, JobCard } from "ui-components/data_card";
import JobListObservable from "ui-observables/paged_job_list";
import { ListPager } from "ui-components/type_admin";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class SlaveView extends LightComponent {
    constructor(props) {
        super(props);

        this.jobs = new JobListObservable({
            limit: 10,
            query: {
                slaveId: props.item._id
            }
        });

        this.state = {
            jobs: this.jobs.value.getValue(),
            jobsState: this.jobs.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.jobs.start());

        this.addDisposable(this.jobs.value.subscribe((jobs) => this.setState({ jobs })));
        this.addDisposable(this.jobs.value.subscribe((jobsState) => this.setState({ jobsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.jobs.setOpts({
            query: {
                slaveId: nextProps.item._id
            }
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const jobs = this.state.jobs.map((item) => Immutable.fromJS({
            id: item.get("_id"),
            time: moment(item.get("created")).unix(),
            item: item.toJS(),
            Card: JobCard,
            props: {
                clickable: true
            }
        }));

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Section>
                        <Header label="Properties" />
                        <SlaveCard
                            item={this.props.item}
                            expanded={true}
                            expandable={false}
                        />
                    </Section>
                </Column>
                <Column xs={12} md={6}>
                    <Header label="Jobs" />
                    <Loading show={this.state.jobsState === ObservableDataStates.LOADING}/>
                    <CardList list={Immutable.fromJS(jobs)} />
                    <ListPager
                        pagedList={this.jobs}
                        pagingInfo={this.jobs.pagingInfo.getValue()}
                    />
                </Column>
            </Row>
        );
    }
}

SlaveView.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object
};

export default SlaveView;
