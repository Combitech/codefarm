
import React from "react";
import Component from "ui-lib/component";
import { ListItem } from "react-toolbox/lib/list";
import { Chip } from "react-toolbox/lib//chip";
import { Row, Col } from "react-flexbox-grid";
import moment from "moment";
import { ListItemIcon } from "ui-components/type_admin";
import theme from "./theme.scss";

const TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

class RevisionListItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        const item = this.props.item;

        // Tag format is step:STEP_NAME:[success|fail]
        const tagStatus = (tag) => tag.split(":")[2];
        const tagName = (tag) => tag.split(":")[1];
        const isTagSuccess = (tag) => tag.startsWith("step:") && tag.endsWith(":success");
        const isTagFail = (tag) => tag.startsWith("step:") && tag.endsWith(":fail");

        const statusTags = item.tags.filter((tag) => (isTagSuccess(tag) || isTagFail(tag)));
        const numFailedTags = statusTags.filter(isTagFail).length;
        let iconName = "sentiment_neutral";
        if (numFailedTags > 0) {
            iconName = numFailedTags > 1 ? "sentiment_very_dissatisfied" : "sentiment_dissatisfied";
        } else if (numFailedTags === 0 && item.status === "merged") {
            iconName = "sentiment_satisfied";
        }
        const icon = <ListItemIcon icon={iconName} />;

        const lastPatch = item.patches[item.patches.length - 1];
        const lastPatchTime = moment(lastPatch.submitted);
        const content = (
            <Row className={theme.revisionListItemContent}>
                <Col sm={12} md={6} lg={5} className={theme.revisionInfo}>
                    <Row className={theme.revisionInfoComment}>
                        {`${lastPatch.comment.split("\n")[0]}`}
                    </Row>
                    <Row className={theme.revisionInfoLegend}>
                        {`by ${lastPatch.name} at ${lastPatchTime.format(TIME_FORMAT)}`}
                    </Row>
                </Col>
                <Col sm={12} md={6} lg={7} className={theme.revisionStatusContainer}>
                    {statusTags.reverse().map((tag) => (
                        <Chip key={tag} className={`${theme.revisionStatus} ${theme[`revisionStatus-${tagStatus(tag)}`]}`}>
                            <span>{tagName(tag)}</span>
                        </Chip>
                    ))}
                </Col>
            </Row>
        );

        return (
            <ListItem
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick(item);
                    }
                }}
                leftIcon={icon}
                selectable={!!this.props.onClick}
                itemContent={content}
            />
        );
    }
}

RevisionListItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.array,
    onClick: React.PropTypes.func
};

export default RevisionListItem;
