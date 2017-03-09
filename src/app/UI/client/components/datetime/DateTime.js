
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
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    value: React.PropTypes.any,
    defaultText: React.PropTypes.string,
    showRaw: React.PropTypes.bool,
    showDate: React.PropTypes.bool,
    showTime: React.PropTypes.bool,
    niceDate: React.PropTypes.bool
};

export default DateTime;
