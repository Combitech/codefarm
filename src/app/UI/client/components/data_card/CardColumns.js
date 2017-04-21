
import React from "react";
import PropTypes from "prop-types";
import { Row, Column } from "ui-components/layout";

class CardColumns extends React.PureComponent {
    render() {
        if (this.props.useColumns) {
            return (
                <Row>
                    {this.props.children.map((child, index) => (
                        <Column
                            key={index}
                            xs={this.props.xs}
                            sm={this.props.sm}
                            md={this.props.md}
                            lg={this.props.lg}
                        >
                            {child}
                        </Column>
                    ))}
                </Row>
            );
        }

        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

CardColumns.defaultProps = {
    useColumns: true
};

CardColumns.propTypes = {
    children: PropTypes.any,
    useColumns: PropTypes.bool,
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number
};

export default CardColumns;
