
import React from "react";
import UserAvatar from "ui-components/user_avatar";
import UserName from "ui-components/user_name";
import DataChip from "./DataChip";
import * as pathBuilder from "ui-lib/path_builder";

class UserChip extends React.PureComponent {
    render() {
        const myItemPath = pathBuilder.fromType(this.props.itemRef.type, { _id: this.props.itemRef.id });

        return (
            <DataChip
                theme={this.props.theme}
                path={myItemPath}
                onDelete={this.props.onDelete}
            >
                <UserAvatar
                    className={this.props.theme.avatar}
                    userId={this.props.itemRef.id}
                />
                <UserName
                    userId={this.props.itemRef.id}
                    isLink={false}
                />
            </DataChip>
        );
    }
}

UserChip.propTypes = {
    theme: React.PropTypes.object,
    itemRef: React.PropTypes.object.isRequired,
    onDelete: React.PropTypes.func
};

export default UserChip;
