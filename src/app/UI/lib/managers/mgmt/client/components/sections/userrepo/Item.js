
import React from "react";
import {
    Section as TASection
} from "ui-components/type_admin";

class Item extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log("ItemLocal-RENDER", this.props);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <pre>
                    {JSON.stringify(this.props.item, null, 2)}
                </pre>
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default Item;
