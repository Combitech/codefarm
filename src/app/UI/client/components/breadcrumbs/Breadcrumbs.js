
import React from "react";

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
    theme: React.PropTypes.object,
    items: React.PropTypes.array.isRequired
};

Breadcrumbs.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Breadcrumbs;
