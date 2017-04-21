
import React from "react";
import PropTypes from "prop-types";
import ProgressBar from "react-toolbox/lib/progress_bar";

class Loading extends React.PureComponent {
    render() {
        if (!this.props.show) {
            return null;
        }

        return (
            <div className={`${this.props.theme.loading} ${this.props.className}`}>
                <ProgressBar
                    type="circular"
                    mode="indeterminate"
                    multicolor={true}
                />
            </div>
        );
    }
}

Loading.defaultProps = {
    className: "",
    show: true
};

Loading.propTypes = {
    theme: PropTypes.object,
    className: PropTypes.string,
    show: PropTypes.bool
};

export default Loading;
