
import React from "react";
import { Button } from "react-toolbox/lib/button";

class AppPager extends React.PureComponent {
    render() {
        let pageIndex = this.props.initialPageIndex;
        if (typeof this.props.pageIndex.value === "number") {
            pageIndex = this.props.pageIndex.value;
        }
        const numPages = this.props.numPages;
        const noPages = numPages === 0;
        const lastPageIndex = numPages - 1;
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === lastPageIndex;

        return (
            <div className={this.props.theme.appPager}>
                <Button
                    className={this.props.theme.appPagerButton}
                    icon="first_page"
                    disabled={isFirstPage || noPages}
                    onClick={() => this.props.pageIndex.set(0)}
                />
                <Button
                    className={this.props.theme.appPagerButton}
                    icon="navigate_before"
                    disabled={isFirstPage || noPages}
                    onClick={() => this.props.pageIndex.set(pageIndex - 1)}
                />
                <Button
                    className={this.props.theme.appPagerButton}
                    icon="navigate_next"
                    disabled={isLastPage || noPages}
                    onClick={() => this.props.pageIndex.set(pageIndex + 1)}
                />
                <Button
                    className={this.props.theme.appPagerButton}
                    icon="last_page"
                    disabled={isLastPage || noPages}
                    onClick={() => this.props.pageIndex.set(lastPageIndex)}
                />
            </div>
        );
    }
}

AppPager.propTypes = {
    theme: React.PropTypes.object.isRequired,
    pageIndex: React.PropTypes.object.isRequired,
    numPages: React.PropTypes.number.isRequired,
    initialPageIndex: React.PropTypes.number.isRequired
};

export default AppPager;
