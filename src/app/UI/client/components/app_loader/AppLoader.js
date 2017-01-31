
import React from "react";
import ProgressBar from "react-toolbox/lib/progress_bar";
import Component from "ui-lib/component";
import loader from "ui-lib/loader";

class AppLoader extends Component {
    constructor(props) {
        super(props);

        loader.addChangeHandler(this.state.loadingAsync.set);
    }

    render() {
        if (this.state.loadingAsync.value) {
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
    theme: React.PropTypes.object
};

export default AppLoader;
