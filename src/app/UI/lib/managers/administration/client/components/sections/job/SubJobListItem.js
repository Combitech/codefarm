
import React from "react";
import LightComponent from "ui-lib/light_component";
import JobListItem from "./ListItem";

const jobKindIcon = {
    "build": "build",
    "test": "assignment"
};

class SubJobListItem extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        const item = this.props.item;

        return (
            <JobListItem
                {...this.props}
                onClick={() => {
                    this.context.router.push({
                        pathname: `${this.props.itemContext.pathname}/${item._id}`
                    });
                }}
                selectable={!!this.props.onClick}
                caption={`${item.kind} - ${item.name} - ${item.status}`}
                legend={`Created at ${item.created} - Modified at ${item.saved}`}
                rightActions={[]}
                rightIcon={jobKindIcon[item.kind]}
            />
        );
    }
}

SubJobListItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func,
    itemContext: React.PropTypes.object
};

SubJobListItem.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default SubJobListItem;
