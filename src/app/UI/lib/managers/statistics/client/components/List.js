
import React from "react";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Container, Loading } from "ui-components/layout";
import { Section as TASection } from "ui-components/type_admin";
import { CardList, TypeCard } from "ui-components/data_card";
import ChartList from "ui-observables/chart_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class List extends LightComponent {
    constructor(props) {
        super(props);

        this.charts = new ChartList();

        this.state = {
            charts: this.charts.value.getValue(),
            state: this.charts.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.charts.start());
        this.addDisposable(this.charts.value.subscribe((charts) => this.setState({ charts })));
        this.addDisposable(this.charts.state.subscribe((state) => this.setState({ state })));
    }

    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);

        let list = [];
        if (this.state.state !== ObservableDataStates.LOADING) {
            list = this.state.charts.toJS().map((item) => ({
                id: item._id,
                time: 0,
                item: item,
                Card: TypeCard,
                props: {
                    clickable: true,
                    inline: true,
                    chartSize: "small"
                }
            }));
        }

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <Container>
                    <Loading show={this.state.state === ObservableDataStates.LOADING}/>
                    <CardList
                        theme={this.props.theme}
                        list={Immutable.fromJS(list)}
                        expandable={false}
                        expanded={true}
                    />
                </Container>
            </TASection>
        );
    }
}

List.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
