
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator,
    ListComponent as TAListComponent,
    ListPager as TAListPager
} from "ui-components/type_admin";
import ArtifactListItem from "./ListItem";
import ArtifactListObservable from "../observables/artifact_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class List extends LightComponent {
    constructor(props) {
        super(props);

        this.artifactList = new ArtifactListObservable({
            repositoryId: props.item._id,
            limit: 5
        });

        this.state = {
            list: this.artifactList.value.getValue(),
            state: this.artifactList.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");
        this.addDisposable(this.artifactList.start());
        this.addDisposable(this.artifactList.value.subscribe((list) => this.setState({ list })));
        this.addDisposable(this.artifactList.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps");
        let repositoryId;
        if (nextProps.item && nextProps.item._id) {
            if (this.props.item && this.props.item._id) {
                if (nextProps.item._id !== this.props.item._id) {
                    repositoryId = nextProps.item._id;
                }
            } else {
                repositoryId = nextProps.item._id;
            }
        }

        if (repositoryId) {
            this.log("update repositoryId", repositoryId);
            this.artifactList.setOpts({ repositoryId });
        }
    }

    componentDidUpdate() {
        this.log("componentDidUpdate");
        /* If relative paging is used and current page has no next or previous
         * page, then automatically navigate to last or first page.
         */
        const pagingInfo = this.artifactList.pagingInfo.getValue().toJS();
        if (pagingInfo.isRelative) {
            if (!pagingInfo.hasNextPage) {
                this.log("setLastPage");
                this.artifactList.setLastPage();
            } else if (!pagingInfo.hasPrevPage) {
                this.log("setFirstPage");
                this.artifactList.setFirstPage();
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
                value={this.artifactList.opts.getValue().get("filter")}
                onChange={(value) => this.artifactList.setOpts({ filter: value })}
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
                        <ArtifactListItem
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
                    pagedList={this.artifactList}
                    pagingInfo={this.artifactList.pagingInfo.getValue()}
                />
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
