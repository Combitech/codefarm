
import React from "react";
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
    children: React.PropTypes.any,
    useColumns: React.PropTypes.bool,
    xs: React.PropTypes.number,
    sm: React.PropTypes.number,
    md: React.PropTypes.number,
    lg: React.PropTypes.number
};

export default CardColumns;
