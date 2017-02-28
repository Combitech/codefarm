
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator,
    ListComponent as TAListComponent,
    ListPager as TAListPager
} from "ui-components/type_admin";
import JobListItem from "./ListItem";
import Jobs from "../../../observables/jobs";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class List extends LightComponent {
    constructor(props) {
        super(props);

        this.jobList = new Jobs({
            limit: 5
        });

        this.state = {
            list: this.jobList.value.getValue(),
            state: this.jobList.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");
        this.addDisposable(this.jobList.start());
        this.addDisposable(this.jobList.value.subscribe((list) => this.setState({ list })));
        this.addDisposable(this.jobList.state.subscribe((state) => this.setState({ state })));
    }

    componentDidUpdate() {
        this.log("componentDidUpdate");
        /* If relative paging is used and current page has no next or previous
         * page, then automatically navigate to last or first page.
         */
        const pagingInfo = this.jobList.pagingInfo.getValue().toJS();
        if (pagingInfo.isRelative) {
            if (!pagingInfo.hasNextPage) {
                this.log("setLastPage");
                this.jobList.setLastPage();
            } else if (!pagingInfo.hasPrevPage) {
                this.log("setFirstPage");
                this.jobList.setFirstPage();
            }
        }
    }

    render() {
        this.log("render", this.props, this.state);

        let loadIndicator;
        if (this.state.state === ObservableDataStates.LOADING) {
            loadIndicator = (
                <TALoadIndicator/>
            );
        }

        const controls = this.props.controls.slice(0);

        controls.push((
            <Input
                key="filter"
                className={this.props.theme.filterInput}
                type="text"
                label="Filter list"
                name="filter"
                value={this.jobList.opts.getValue().get("filter")}
                onChange={(value) => this.jobList.setOpts({ filter: value })}
            />
        ));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                {loadIndicator}
                <TAListComponent>
                    {this.state.list.toJS().map((item) => (
                        <JobListItem
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
                    pagedList={this.jobList}
                    pagingInfo={this.jobList.pagingInfo.getValue()}
                />
            </TASection>
        );
    }
}

List.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
