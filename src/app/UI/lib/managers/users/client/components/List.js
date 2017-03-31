
import React from "react";
import Immutable from "immutable";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Section as TASection,
    ListPager as TAListPager
} from "ui-components/type_admin";
import { CardList, TypeCard } from "ui-components/data_card";

class List extends LightComponent {
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
                value={this.props.listObservable.opts.getValue().get("filter")}
                onChange={(filter) => this.props.listObservable.setOpts({ filter })}
            />
        ));

        const list = this.props.items.toJS().map((item) => ({
            id: item._id,
            time: 0,
            item: item,
            Card: TypeCard,
            props: {
                clickable: true
            }
        }));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.listContainer}>
                    <CardList list={Immutable.fromJS(list)} />
                </div>
                <TAListPager
                    pagedList={this.props.listObservable}
                    pagingInfo={this.props.listObservable.pagingInfo.getValue()}
                />
            </TASection>
        );
    }
}

List.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    items: ImmutablePropTypes.list
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
