
import React from "react";
import Component from "ui-lib/component";

class Baseline extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        return (
            <div>
                <table className={this.props.theme.table}>
                    <tbody>
                        {this.props.item.details.content.map((ref) => (
                            <tr
                                key={ref.name}
                            >
                                <td className={this.props.theme.head}>
                                    {ref.name}
                                </td>
                                <td className={this.props.theme.head}>
                                    {ref.type}
                                </td>
                                <td className={this.props.theme.data}>
                                    <pre>
                                        {ref.id.join("\n")}
                                    </pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

Baseline.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired
};

export default Baseline;
