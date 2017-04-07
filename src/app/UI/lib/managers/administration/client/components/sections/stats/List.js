
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Section as TASection,
    PagedList as TAPagedList
} from "ui-components/type_admin";

class List extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            filter: ""
        };
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

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <TAPagedList
                    type={this.props.route.type}
                    filter={this.state.filter.value}
                    limit={10}
                    ListItemComponent={this.props.route.ListItemComponent}
                    onSelect={(item) => {
                        this.context.router.push({
                            pathname: `${this.props.pathname}/${item._id}`
                        });
                    }}
                />
            </TASection>
        );
    }
}

List.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    route: React.PropTypes.object.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
