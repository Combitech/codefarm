
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Row, Col } from "react-flexbox-grid";
import BaselineContentList from "./BaselineContentList";
import CommentList from "./CommentList";
import { JobCard } from "ui-components/data_card";

class JobTab extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        return (
            <Row>
                <Col xs={12} md={6}>
                    <h5 className={this.props.theme.sectionHeader}>Properties</h5>
                    <div className={this.props.theme.section}>
                        <JobCard
                            item={this.props.job}
                            expanded={true}
                            expandable={false}
                        />
                    </div>

                    <h5 className={this.props.theme.sectionHeader}>Comments</h5>
                    <div className={this.props.theme.section}>
                        <CommentList
                            theme={this.props.theme}
                            item={this.props.job}
                        />
                    </div>
                </Col>
                <Col xs={12} md={6}>
                    <h5 className={this.props.theme.sectionHeader}>In this run</h5>
                    <div className={this.props.theme.section}>
                        <BaselineContentList
                            theme={this.props.theme}
                            baselineRef={{
                                _ref: true,
                                id: this.props.job.baseline._id,
                                type: this.props.job.baseline.type
                            }}
                        />
                    </div>
                </Col>
            </Row>
        );
    }
}

JobTab.propTypes = {
    theme: React.PropTypes.object,
    job: React.PropTypes.object.isRequired
};

export default JobTab;
