
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Row, Col } from "react-flexbox-grid";
import ArtifactList from "./ArtifactList";
import RevisionList from "./RevisionList";

class OutputTab extends LightComponent {
    render() {
        return (
            <Row>
                <Col xs={12} md={6}>
                    <h5 className={this.props.theme.sectionHeader}>Artifacts</h5>
                    <div className={this.props.theme.section}>
                        <ArtifactList
                            theme={this.props.theme}
                            artifactRefs={this.props.artifactRefs}
                        />
                    </div>
                </Col>
                <Col xs={12} md={6}>
                    <h5 className={this.props.theme.sectionHeader}>Revisions</h5>
                    <div className={this.props.theme.section}>
                        <RevisionList
                            theme={this.props.theme}
                            revisionRefs={this.props.revisionRefs}
                        />
                    </div>
                </Col>
            </Row>
        );
    }
}

OutputTab.propTypes = {
    theme: React.PropTypes.object,
    artifactRefs: React.PropTypes.array.isRequired,
    revisionRefs: React.PropTypes.array.isRequired
};

export default OutputTab;
