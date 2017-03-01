
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Section as TASection,
    ListComponent as TAListComponent,
    ListPager as TAListPager
} from "ui-components/type_admin";

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

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <TAListComponent>
                    {this.props.items.toJS().map((item) => (
                        <this.props.ListItemComponent
                            key={item._id}
                            theme={this.props.theme}
                            onClick={() => {
                                this.context.router.push({
                                    pathname: `${this.props.pathname}/${item._id}`
                                });
                            }}
                            item={item}
                        />
                    ))}
                </TAListComponent>
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
    ListItemComponent: React.PropTypes.func.isRequired,
    items: ImmutablePropTypes.list
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
