
import React from "react";
import PropTypes from "prop-types";

class Breadcrumbs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const Item = (props) => {
            if (props.last) {
                return (
                    <span
                        className={this.props.theme.breadcrumb}
                    >
                        {props.label}
                    </span>
                );
            }

            return (
                <a
                    href="#"
                    className={this.props.theme.breadcrumb}
                    onClick={(event) => {
                        event.preventDefault();
                        this.context.router.push({ pathname: props.pathname });
                    }}
                >
                    {props.label}
                </a>
            );
        };

        return (
            <div>
                {this.props.items.map((item, index) => (
                    <Item
                        key={item.pathname}
                        label={item.label}
                        pathname={item.pathname}
                        last={this.props.items.length - 1 === index}
                    />
                ))}
            </div>
        );
    }
}

Breadcrumbs.propTypes = {
    theme: PropTypes.object,
    items: PropTypes.array.isRequired
};

Breadcrumbs.contextTypes = {
    router: PropTypes.object.isRequired
};

export default Breadcrumbs;
