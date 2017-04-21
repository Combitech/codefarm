
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import UserItem from "ui-observables/user_item";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import * as pathBuilder from "ui-lib/path_builder";

class UserName extends LightComponent {
    constructor(props) {
        super(props);

        this.user = new UserItem({
            identifier: props.userId
        });

        this.state = {
            user: this.user.value.getValue(),
            state: this.user.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.user.start());
        this.addDisposable(this.user.value.subscribe((user) => this.setState({ user })));
        this.addDisposable(this.user.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.user.setOpts({
            identifier: nextProps.userId
        });
    }

    onClick(event) {
        const id = this.state.user.get("_id");
        const pathname = pathBuilder.fromType("userrepo.user", { _id: id });

        event.stopPropagation();

        this.context.router.push({ pathname });
    }

    render() {
        if (this.state.state === ObservableDataStates.LOADING) {
            // TODO: Show loader
            return null;
        }

        const name = this.state.user.get("name", this.props.notFoundText);

        let userName;
        if (this.props.isLink && this.state.user.has("name")) {
            userName = (
                <a
                    className={this.props.theme.link}
                    onClick={(e) => this.onClick(e)}>
                    {name}
                </a>
            );
        } else {
            userName = (
                <span>
                    {name}
                </span>
            );
        }

        return (
            <span className={this.props.className}>
                <If condition={ this.props.prefixText }>
                    <span>
                        {`${this.props.prefixText} `}
                    </span>
                </If>
                {userName}
                <If condition={ this.props.suffixText }>
                    <span>
                        {` ${this.props.suffixText}`}
                    </span>
                </If>
            </span>
        );
    }
}

UserName.defaultProps = {
    className: "",
    userId: false,
    notFoundText: "",
    prefixText: "",
    suffixText: "",
    isLink: true
};

UserName.propTypes = {
    className: PropTypes.string,
    theme: PropTypes.object,
    userId: PropTypes.any,
    notFoundText: PropTypes.string,
    prefixText: PropTypes.string,
    suffixText: PropTypes.string,
    isLink: PropTypes.bool
};

UserName.contextTypes = {
    router: PropTypes.object.isRequired
};

export default UserName;
