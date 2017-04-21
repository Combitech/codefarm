
import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-toolbox/lib/button";
import { Row, Col } from "react-flexbox-grid";
import { Card, CardTitle, CardText, CardActions } from "react-toolbox/lib/card";

class Form extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.theme.form}>
                <Row>
                    <Col xs={12} mdOffset={3} md={6}>
                        <Card className={this.props.theme.card}>
                            <CardTitle
                                title={this.props.primaryText}
                                subtitle={this.props.secondaryText}
                            />
                            <CardText>
                                {this.props.children}
                            </CardText>
                            <CardActions>
                                <div className={this.props.theme.buttons}>
                                    <Button
                                        label="Cancel"
                                        onClick={() => {
                                            this.props.onCancel();
                                        }}
                                    />
                                    <Button
                                        label={this.props.confirmText}
                                        primary={true}
                                        raised={true}
                                        disabled={!this.props.confirmAllowed}
                                        onClick={() => {
                                            this.props.onConfirm()
                                            .catch((error) => {
                                                console.error(error);
                                                // TODO: Print error to user
                                            });
                                        }}
                                    />
                                </div>
                            </CardActions>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

Form.defaultProps = {
    confirmAllowed: true,
    secondaryText: ""
};

Form.propTypes = {
    theme: PropTypes.object,
    confirmAllowed: PropTypes.bool,
    confirmText: PropTypes.string.isRequired,
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    children: PropTypes.node
};

export default Form;
