
import React from "react";
import Component from "ui-lib/component";
import { Flow } from "ui-components/flow";
import { Row, Col } from "react-flexbox-grid";
import Chip from "react-toolbox/lib/chip";
import Avatar from "react-toolbox/lib/avatar";
import Input from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import moment from "moment";
import UserAvatar from "../UserAvatar";

class Job extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        const steps = [];

        steps.push({
            id: "First",
            name: "Overview",
            meta: {
                status: "neutral"
            },
            type: Step,
            disabled: () => false,
            active: () => !this.props.step.value,
            parentIds: [],
            handlers: {
                onClick: () => this.props.step.set()
            }
        });

        return (
            <div>
                <Flow
                    theme={this.props.theme}
                    steps={steps}
                    columnSpan={8}
                />

            </div>
        );
    }
}

Job.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    job: React.PropTypes.object
};

export default Job;
