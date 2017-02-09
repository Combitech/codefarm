
import React from "react";
import { AppMenu } from "ui-components/app_menu";
import Component from "ui-lib/component";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";

const REPO_TYPE = "coderepo.repository";

class Page extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("list", REPO_TYPE, {}, true);
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        let loadIndicator;
        if (this.state.loadingAsync.value) {
            loadIndicator = (
                <TALoadIndicator/>
            );
        }

        const pathname = this.getPathname();

        const items = this.state.list.map((item) => {
            const pn = `${pathname}/${item._id}`;
            const active = this.context.router.location.pathname.startsWith(pn);

            return {
                label: item._id,
                pathname: pn,
                active: active
            };
        });

        return (
            <div>
                {loadIndicator}
                <AppMenu
                    primaryText="Repositories"
                    icon="code"
                    items={items}
                />
                <div className={this.props.theme.content}>
                    {this.props.children && React.cloneElement(this.props.children, { theme: this.props.theme })}
                </div>
            </div>
        );
    }
}

Page.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    route: React.PropTypes.object.isRequired
};

Page.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Page;
