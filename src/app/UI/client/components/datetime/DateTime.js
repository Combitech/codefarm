
import React from "react";
import PropTypes from "prop-types";
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

            const timestamp = moment(props.value).local();
            const niceDate = () => timestamp.format("dddd, MMMM Do YYYY");
            const date = () => timestamp.format("YYYY-MM-DD");
            const time = () => timestamp.format("HH:mm:ss");

            if (props.showDate && props.showTime) {
                if (props.niceDate) {
                    return `${niceDate()} at ${time()}`;
                }

                return `${time()} ${date()}`;
            } else if (props.showDate) {
                return props.niceDate ? niceDate() : date();
            } else if (props.showTime) {
                return time();
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
    niceDate: false,
    defaultText: "No time"
};

DateTime.propTypes = {
    theme: PropTypes.object,
    className: PropTypes.string,
    value: PropTypes.any,
    defaultText: PropTypes.string,
    showRaw: PropTypes.bool,
    showDate: PropTypes.bool,
    showTime: PropTypes.bool,
    niceDate: PropTypes.bool
};

export default DateTime;
