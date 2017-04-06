
import React from "react";
import {
    Section as TASection
} from "ui-components/type_admin";
import { FlowView } from "ui-components/data_view";

class Item extends React.PureComponent {
    render() {
        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <FlowView
                        theme={this.props.theme}
                        item={this.props.item}
                        context={this.props.context}
                        pathname={this.props.pathname}
                    />
                </div>
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    context: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired
};

export default Item;
