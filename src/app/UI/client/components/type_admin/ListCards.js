
import React from "react";
import PropTypes from "prop-types";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Section from "./Section";
import ListPager from "./ListPager";
import { CardList, TypeCard } from "ui-components/data_card";

class ListCards extends LightComponent {
    constructor(props) {
        super(props);

        this.list = new this.props.Observable({
            limit: 20
        });

        this.state = {
            list: this.list.value.getValue(),
            state: this.list.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");

        this.addDisposable(this.list.start());
        this.addDisposable(this.list.value.subscribe((list) => this.setState({ list })));
        this.addDisposable(this.list.state.subscribe((state) => this.setState({ state })));
    }

    render() {
        this.log("render", this.props);

        const controls = this.props.controls.slice(0);

        controls.push((
            <Input
                key="filter"
                className={this.props.theme.filterInput}
                type="text"
                label="Filter list"
                name="filter"
                value={this.list.opts.getValue().get("filter")}
                onChange={(filter) => this.list.setOpts({ filter })}
            />
        ));

        const list = this.state.list.toJS().map((item) => ({
            id: item._id,
            time: 0,
            item: item,
            Card: TypeCard,
            props: {
                clickable: true,
                linkToAdmin: this.props.linkToAdmin
            }
        }));

        return (
            <Section
                theme={this.props.theme}
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.listContainer}>
                    <CardList
                        list={Immutable.fromJS(list)}
                        pager={
                            <ListPager
                                theme={this.props.theme}
                                pagedList={this.list}
                                pagingInfo={this.list.pagingInfo.getValue()}
                            />
                        }
                    />
                </div>
            </Section>
        );
    }
}

ListCards.propTypes = {
    theme: PropTypes.object,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    Observable: PropTypes.func.isRequired,
    linkToAdmin: PropTypes.bool
};

export default ListCards;
