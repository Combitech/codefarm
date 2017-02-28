
import React from "react";
import { Button } from "react-toolbox/lib/button";

class ListPager extends React.PureComponent {
    render() {
        const pagingInfo = this.props.pagingInfo.toJS();

        return (
            <div>
                <Button
                    icon="first_page"
                    disabled={pagingInfo.isFirstPage}
                    onClick={() => this.props.pagedList.setFirstPage()}
                />
                <Button
                    icon="navigate_before"
                    disabled={!pagingInfo.hasPrevPage}
                    onClick={() => this.props.pagedList.setPrevPage()}
                />
                <Button
                    icon="navigate_next"
                    disabled={!pagingInfo.hasNextPage}
                    onClick={() => this.props.pagedList.setNextPage()}
                />
                <Button
                    icon="last_page"
                    disabled={pagingInfo.isLastPage}
                    onClick={() => this.props.pagedList.setLastPage()}
                />
            </div>
        );
    }
}

ListPager.propTypes = {
    theme: React.PropTypes.object,
    pagedList: React.PropTypes.object.isRequired,
    pagingInfo: React.PropTypes.object.isRequired
};

export default ListPager;
