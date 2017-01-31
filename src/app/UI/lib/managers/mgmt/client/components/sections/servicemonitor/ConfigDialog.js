
import React from "react";
import Dialog from "react-toolbox/lib/dialog";

class JsonDisplay extends React.Component {
    render() {
        // TODO: Add vertical scroll-bar to cope with overflow...
        return (
            <pre>
                {JSON.stringify(this.props.data, null, 2)}
            </pre>
        );
    }
}

JsonDisplay.propTypes = {
    data: React.PropTypes.any.isRequired
};

class ConfigDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    close() {
        this.props.open.set(false);
    }

    render() {
        return (
            <Dialog
                title={this.props.titleText}
                actions={[ {
                    label: this.props.cancelText || "Close",
                    onClick: this.close.bind(this)
                } ]}
                modal={true}
                onEscKeyDown={this.close.bind(this)}
                onOverlayClick={this.close.bind(this)}
                active={!!this.props.open.value}
                type="fullscreen"
            >
                <JsonDisplay data={this.props.configData} />
            </Dialog>
        );
    }
}

ConfigDialog.propTypes = {
    open: React.PropTypes.object.isRequired,
    titleText: React.PropTypes.string.isRequired,
    cancelText: React.PropTypes.string,
    configData: React.PropTypes.any.isRequired
};

export default ConfigDialog;
