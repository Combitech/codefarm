
import React from "react";
import ReactDOM from "react-dom";
import LightComponent from "ui-lib/light_component";

class LogViewer extends LightComponent {
    componentDidMount() {
        const ref = ReactDOM.findDOMNode(this);

        ref.addEventListener("load", () => {
            ref.contentWindow.document.body.style.margin = "0px";
            ref.contentWindow.document.body.style.lineHeight = "1.1rem";
            ref.style.height = `${ref.contentWindow.document.body.scrollHeight}px`;
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        return (
            <iframe
                className={this.props.theme.iframe}
                src={`/logrepo/log/${this.props.log.id}/download`}
            />
        );
    }
}

LogViewer.propTypes = {
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    log: React.PropTypes.object.isRequired
};

export default LogViewer;
