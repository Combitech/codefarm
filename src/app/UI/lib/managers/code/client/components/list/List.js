
import React from "react";
import LightComponent from "ui-lib/light_component";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
    LoadIndicator as TALoadIndicator,
    ListPager as TAListPager
} from "ui-components/type_admin";
import PagedRevisionListObservable from "../../observables/paged_revision_list";
import RevisionListObservable from "../../observables/revision_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import Table from "./Table";
import Row from "./Row";

class List extends LightComponent {
    constructor(props) {
        super(props);

        const ListObservable = props.limit > 0 ? PagedRevisionListObservable : RevisionListObservable;

        this.revList = new ListObservable({
            repositoryId: props.repositoryId,
            status: props.revisionStatus,
            filter: props.filter,
            limit: props.limit
        });

        this.state = {
            revList: this.revList.value.getValue(),
            revListState: this.revList.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");

        this.addDisposable(this.revList.start());
        this.addDisposable(this.revList.value.subscribe((revList) => this.setState({ revList })));
        this.addDisposable(this.revList.state.subscribe((revListState) => this.setState({ revListState })));
    }

    componentDidUpdate() {
        this.log("componentDidUpdate");

        if (this.props.limit > 0) {
            /* If relative paging is used and current page has no next or previous
             * page, then automatically navigate to last or first page.
             */
            const pagingInfo = this.revList.pagingInfo.getValue().toJS();
            if (pagingInfo.isRelative) {
                if (!pagingInfo.hasNextPage) {
                    this.log("setLastPage");
                    this.revList.setLastPage();
                } else if (!pagingInfo.hasPrevPage) {
                    this.log("setFirstPage");
                    this.revList.setFirstPage();
                }
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps");

        if (nextProps.filter) {
            this.revList.setOpts({ filter: nextProps.filter });
        }
    }

    render() {
        this.log("render", this.props, this.state);

        return (
            <div className={this.props.theme.revisionContainer}>
                <If condition={this.state.state === ObservableDataStates.LOADING}>
                    <TALoadIndicator/>
                </If>

                <Table
                    theme={this.props.theme}
                    steps={this.props.steps}
                >
                    {this.state.revList.map((item) => (
                        <Row
                            key={item.get("_id")}
                            theme={this.props.theme}
                            onClick={(revision, step) => {
                                const pathname = `${this.props.pathname}/${revision._id}`;
                                const query = {};

                                if (step) {
                                    query.step = step;
                                }

                                this.context.router.push({ pathname, query });
                            }}
                            item={item}
                            steps={this.props.steps}
                        />
                    ))}
                </Table>
                <If condition={this.props.limit > 0}>
                    <TAListPager
                        pagedList={this.revList}
                        pagingInfo={this.revList.pagingInfo.getValue()}
                    />
                </If>
            </div>
        );
    }
}

List.defaultProps = {
    limit: 10
};

List.propTypes = {
    theme: React.PropTypes.object,
    repositoryId: React.PropTypes.string.isRequired,
    revisionStatus: React.PropTypes.string.isRequired,
    filter: React.PropTypes.string,
    pathname: React.PropTypes.string.isRequired,
    limit: React.PropTypes.number,
    steps: ImmutablePropTypes.list
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
