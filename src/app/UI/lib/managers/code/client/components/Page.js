
import React from "react";
import { AppMenu } from "ui-components/app_menu";
import LightComponent from "ui-lib/light_component";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import CodeRepositories from "../observables/code_repositories";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class Page extends LightComponent {
    constructor(props) {
        super(props);

        this.repositoryList = new CodeRepositories();

        this.state = {
            list: this.repositoryList.value.getValue(),
            state: this.repositoryList.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.repositoryList.value.subscribe((list) => this.setState({ list })));
        this.addDisposable(this.repositoryList.state.subscribe((state) => this.setState({ state })));
    }

    render() {
        this.log("render", this.props, this.state);

        let loadIndicator;
        if (this.state.state === ObservableDataStates.LOADING) {
            loadIndicator = (
                <TALoadIndicator/>
            );
        }

        const pathname = this.getPathname();

        const items = this.state.list.toJS().map((item) => {
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
