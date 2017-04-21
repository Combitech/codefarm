
import React from "react";
import PropTypes from "prop-types";
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
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    context: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired
};

export default Item;
