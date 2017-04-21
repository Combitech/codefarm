
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { Button } from "react-toolbox/lib/button";
import { Loading } from "ui-components/layout";
import LogLinesObservable from "ui-observables/log_lines";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class LogLines extends LightComponent {
    constructor(props) {
        super(props);

        this.logLines = new LogLinesObservable({
            id: this.props.id,
            limit: props.numberOfLines
        });

        this.state = {
            lines: this.logLines.value.getValue(),
            state: this.logLines.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.logLines.start());
        this.addDisposable(this.logLines.value.subscribe((lines) => this.setState({ lines })));
        this.addDisposable(this.logLines.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.logLines.setOpts({
            id: nextProps.id
        });
    }

    onMoreLines(event) {
        event.stopPropagation();

        const limit = this.logLines.opts.getValue().get("limit");

        this.logLines.setOpts({ limit: limit + this.props.numberOfLines });
    }

    render() {
        const lines = this.state.lines.toJS();
        const loading = this.state.state === ObservableDataStates.LOADING;

        return (
            <div onClick={(e) => e.stopPropagation()}>
                <Loading show={loading} />
                <If condition={lines.length > 0 && lines[0].offset > 0}>
                    <div className={this.props.theme.centeredButtons}>
                        <Button
                            disabled={loading}
                            label="Show more"
                            onClick={(e) => this.onMoreLines(e)}
                        />
                    </div>
                </If>
                <span className={this.props.theme.log}>
                    {lines.map((i) => i.line).join("\n")}
                </span>
            </div>
        );
    }
}

LogLines.defaultProps = {
    numberOfLines: 25
};

LogLines.propTypes = {
    theme: PropTypes.object,
    id: PropTypes.string.isRequired,
    numberOfLines: PropTypes.number
};

export default LogLines;
