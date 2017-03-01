
import React from "react";
import moment from "moment";

class DateTime extends React.PureComponent {
    render() {
        const value = (props) => {
            if (!props.value) {
                return props.defaultText;
            }

            if (props.showRaw) {
                return props.value;
            }

            const time = moment(props.value);

            if (props.showDate && props.showTime) {
                return time.local().format("YYYY-MM-DD hh:mm:ss");
            } else if (props.showDate) {
                return time.local().format("YYYY-MM-DD");
            } else if (props.showTime) {
                return time.local().format("hh:mm:ss");
            }

            return props.defaultText;
        };

        return (
            <span className={`${this.props.theme.datetime} ${this.props.className}`}>
                {value(this.props)}
            </span>
        );
    }
}

DateTime.defaultProps = {
    showRaw: false,
    showDate: true,
    showTime: true,
    defaultText: "No time"
};

DateTime.propTypes = {
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    value: React.PropTypes.any.isRequired,
    defaultText: React.PropTypes.string,
    showRaw: React.PropTypes.bool,
    showDate: React.PropTypes.bool,
    showTime: React.PropTypes.bool
};

export default DateTime;
