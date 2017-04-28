
import React from "react";
import PropTypes from "prop-types";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import Slider from "react-toolbox/lib/slider";
import Input from "react-toolbox/lib/input";
import { Container, Loading } from "ui-components/layout";
import { Section as TASection } from "ui-components/type_admin";
import { CardList, TypeCard } from "ui-components/data_card";
import ChartList from "ui-observables/chart_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class List extends LightComponent {
    constructor(props) {
        super(props);

        this.charts = new ChartList({
            query: {
                pinned: true
            }
        });

        this.state = {
            charts: this.charts.value.getValue(),
            state: this.charts.state.getValue(),
            numColumns: 3,
            filter: ""
        };
    }

    componentDidMount() {
        this.addDisposable(this.charts.start());
        this.addDisposable(this.charts.value.subscribe((charts) => this.setState({ charts })));
        this.addDisposable(this.charts.state.subscribe((state) => this.setState({ state })));
    }

    componentDidUpdate() {
        this.charts.setOpts({
            filter: this.state.filter
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);

        controls.push((
            <Input
                key="filter"
                className={this.props.theme.filterInput}
                type="text"
                label="Filter list"
                name="filter"
                value={this.state.filter}
                onChange={(filter) => this.setState({ filter })}
            />
        ));

        controls.push((
            <Slider
                key="numColumnsSlider"
                theme={this.props.theme}
                className={this.props.theme.numColumnsSlider}
                onChange={(numColumns) => this.setState({ numColumns })}
                value={this.state.numColumns}
                min={1}
                max={4}
                step={1}
            />
        ));

        let list = [];
        if (this.state.state !== ObservableDataStates.LOADING) {
            list = this.state.charts.toJS().map((item) => ({
                id: item._id,
                time: 0,
                item: item,
                Card: TypeCard,
                props: {
                    clickable: true,
                    column: true,
                    path: `${this.props.pathname}/${item._id}`
                }
            }));
        }

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
                menuItems={this.props.menuItems}
            >
                <Container>
                    <Loading show={this.state.state === ObservableDataStates.LOADING}/>
                    <CardList
                        theme={this.props.theme}
                        list={Immutable.fromJS(list)}
                        expandable={false}
                        expanded={true}
                        columns={this.state.numColumns}
                    />
                </Container>
            </TASection>
        );
    }
}

List.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

List.contextTypes = {
    router: PropTypes.object.isRequired
};

export default List;
