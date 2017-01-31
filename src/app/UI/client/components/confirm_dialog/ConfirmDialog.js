
import React from "react";
import Dialog from "react-toolbox/lib/dialog";

class ConfirmDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    close() {
        this.props.open.set(false);
    }

    confirm() {
        this.props.onConfirm()
        .then(() => {
            this.props.open.set(false);
        })
        .catch((error) => {
            console.error(error);
            this.props.open.set(false);
        });
    }

    render() {
        let disabled = false;

        if (typeof this.props.canConfirm !== "undefined" && !this.props.canConfirm) {
            disabled = true;
        }

        const actions = [
            {
                label: this.props.cancelText || "Cancel",
                onClick: this.close.bind(this)
            },
            {
                label: this.props.buttonText,
                primary: true,
                onClick: this.confirm.bind(this),
                disabled: disabled
            }
        ];

        return (
            <Dialog
                title={this.props.titleText}
                actions={actions}
                modal={true}
                active={!!this.props.open.value}
            >
              {this.props.children}
            </Dialog>
        );
    }
}

ConfirmDialog.propTypes = {
    children: React.PropTypes.node.isRequired,
    open: React.PropTypes.object.isRequired,
    onConfirm: React.PropTypes.func.isRequired,
    titleText: React.PropTypes.string.isRequired,
    buttonText: React.PropTypes.string.isRequired,
    cancelText: React.PropTypes.string,
    canConfirm: React.PropTypes.bool
};

export default ConfirmDialog;
