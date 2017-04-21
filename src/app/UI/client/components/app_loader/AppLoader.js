
import React from "react";
import PropTypes from "prop-types";
import ProgressBar from "react-toolbox/lib/progress_bar";
import LightComponent from "ui-lib/light_component";
import loader from "ui-lib/loader";

class AppLoader extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        loader.addChangeHandler((loading) => this.setState({ loading }));
    }

    render() {
        if (this.state.loading) {
            return (
                <ProgressBar
                    className={this.props.theme.appLoader}
                    type="linear"
                    mode="indeterminate"
                />
            );
        }

        return null;
    }
}

AppLoader.propTypes = {
    theme: PropTypes.object
};

export default AppLoader;
