
import React from "react";
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
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    show: React.PropTypes.bool
};

export default Loading;
