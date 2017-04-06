
import React from "react";
import {
    Section as TASection
} from "ui-components/type_admin";
import { LogRepositoryView } from "ui-components/data_view";

class Item extends React.PureComponent {
    render() {
        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <LogRepositoryView
                        item={this.props.item}
                    />
                </div>
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
