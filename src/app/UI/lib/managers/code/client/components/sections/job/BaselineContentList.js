
import React from "react";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import BaselineContentRevision from "./BaselineContentRevision";
import BaselineItem from "../../../observables/baseline_item";

class BaselineContentList extends LightComponent {
    constructor(props) {
        super(props);

        this.baseline = new BaselineItem({
            id: props.baselineRef.id
        });

        this.state = {
            baseline: this.baseline.value.getValue(),
            state: this.baseline.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.baseline.start());

        this.addDisposable(this.baseline.value.subscribe((baseline) => this.setState({ baseline })));
        this.addDisposable(this.baseline.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.baseline.setOpts({
            id: nextProps.baselineRef.id
        });
    }

    render() {
        if (this.state.state === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator />
            );
        }

        const baseline = this.state.baseline.toJS().data;

        if (!baseline) {
            return (
                <div>No data</div>
            );
        }

        return (
            <div>
                {baseline.content.map((content) => (
                    <div key={content.name}>
                        {content.data.map((item) => {
                            if (item.type === "coderepo.revision") {
                                return (
                                    <BaselineContentRevision
                                        key={item._id}
                                        theme={this.props.theme}
                                        revision={item}
                                    />
                                );
                            }

                            return (
                                <div key={item._id}>
                                    Type is not supported.<br />
                                    <pre>
                                        {JSON.stringify(item, null, 2)}
                                    </pre>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    }
}

BaselineContentList.propTypes = {
    theme: React.PropTypes.object,
    baselineRef: React.PropTypes.object.isRequired
};

export default BaselineContentList;
