
import React from "react";
import Component from "ui-lib/component";
import { Section } from "ui-components/type_admin";
import Dropdown from "react-toolbox/lib/dropdown";
import { StringUtil } from "misc";

class MonitorPage extends Component {
    constructor(props) {
        super(props);
    }

    selectView(currentView, value) {
        const pathname = this.props.pathname;
        if (value !== currentView) {
            const nextPathname = pathname.replace(`/${currentView}`, `/${value}`);
            this.context.router.push({ pathname: nextPathname });
        }
    }

    render() {
        console.log("Create-RENDER", this.props);

        const pathname = this.getPathname();
        const view = pathname.split("/").slice(-1)[0];

        const breadcrumbs = this.props.breadcrumbs.concat({
            label: StringUtil.toUpperCaseLetter(view),
            pathname: pathname
        });

        const controls = [
            <Dropdown
                theme={this.props.theme}
                key="serviceMonitorTopRightMenu"
                className={this.props.theme.topRightDropdown}
                auto
                onChange={(value) => {
                    if (value !== view) {
                        const nextPathname = pathname.replace(`/${view}`, `/${value}`);
                        this.context.router.push({ pathname: nextPathname });
                    }
                }}
                value={view}
                label={"Select view"}
                source={[
                    { value: "graph", label: "Node graph" },
                    { value: "table", label: "Table" }
                ]}
            />
        ];

        const props = {
            theme: this.props.theme,
            view: view
        };

        return (
            <Section
                breadcrumbs={breadcrumbs}
                controls={controls}
            >
                <this.props.ServiceMonitorComponent {...props} />
            </Section>
        );
    }
}

MonitorPage.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string /* .isRequired */,
    type: React.PropTypes.string /* .isRequired */,
    breadcrumbs: React.PropTypes.array /* .isRequired */,
    ServiceMonitorComponent: React.PropTypes.func /* .isRequired */
};

MonitorPage.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default MonitorPage;
