
import React from "react";
import { Card, CardTitle, CardText } from "react-toolbox/lib/card";
import UserAvatar from "../../UserAvatar";
import Avatar from "react-toolbox/lib/avatar";

class BaselineContentRevision extends React.PureComponent {
    render() {
        const patch = this.props.revision.patches[this.props.revision.patches.length - 1];

        return (
            <Card>
                <CardTitle
                    avatar={(
                        <Avatar className={this.props.theme.avatar}>
                            <UserAvatar
                                email={patch.email}
                                noAvatarIconName="person"
                            />
                        </Avatar>
                    )}
                    title={`${patch.name} <${patch.email}>`}
                    subtitle={patch.submitted}
                />
                <CardText>
                    <span className={this.props.theme.patchComment}>
                        {patch.comment}
                    </span>
                </CardText>
            </Card>
        );
    }
}

BaselineContentRevision.propTypes = {
    theme: React.PropTypes.object,
    revision: React.PropTypes.object.isRequired
};

export default BaselineContentRevision;
