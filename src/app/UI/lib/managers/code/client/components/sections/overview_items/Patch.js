
import React from "react";
import Component from "ui-lib/component";

class Patch extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        return (
            <div>
                <table className={this.props.theme.table}>
                    <tbody>
                        <tr>
                            <td className={this.props.theme.head}>
                                Refname
                            </td>
                            <td className={this.props.theme.data}>
                                {this.props.item.details.change.refname}
                            </td>
                        </tr>
                        <tr>
                            <td className={this.props.theme.head}>
                                SHA1
                            </td>
                            <td className={this.props.theme.data}>
                                {this.props.item.details.change.newrev}
                            </td>
                        </tr>
                        <tr>
                            <td className={this.props.theme.head}>
                                Parent SHA1
                            </td>
                            <td className={this.props.theme.data}>
                                {this.props.item.details.change.oldrev}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

Patch.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired
};

export default Patch;
