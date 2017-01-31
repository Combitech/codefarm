
import React from "react";
import Component from "ui-lib/component";

class Job extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        return (
            <div></div>
        );
    }
}

Job.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired
};

export default Job;
