
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";

class LogViewer extends LightComponent {
    componentDidMount() {
        this.ref.addEventListener("load", () => {
            const body = this.ref.contentWindow.document.body;

            body.style.margin = "0px";
            body.style.lineHeight = "1.1rem";
            this.ref.style.height = `${body.scrollHeight}px`;
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        return (
            <iframe
                ref={(ref) => this.ref = ref}
                className={this.props.theme.iframe}
                src={`/logrepo/log/${this.props.log.id}/download`}
            />
        );
    }
}

LogViewer.propTypes = {
    theme: PropTypes.object,
    className: PropTypes.string,
    log: PropTypes.object.isRequired
};

export default LogViewer;
