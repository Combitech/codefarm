
import React from "react";
import ProgressBar from "react-toolbox/lib/progress_bar";

class LoadIndicator extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.theme.loading}>
                <ProgressBar
                    type="circular"
                    mode="indeterminate"
                    multicolor
                />
            </div>
        );
    }
}

LoadIndicator.propTypes = {
    theme: React.PropTypes.object
};

export default LoadIndicator;
