
import React from "react";
import { Button } from "react-toolbox/lib/button";
import Input from "react-toolbox/lib/input";
import Component from "ui-lib/component";
import { Section } from "ui-components/type_admin";
import EventMonitor from "./EventMonitor";

const EVENT_HISTORY_LENGTH = 100;

class Index extends Component {
    constructor(props) {
        super(props);
        this.addStateVariable("eventMonitorRunning", true);
        this.addStateVariable("eventMonitorHistoryLength", EVENT_HISTORY_LENGTH);
        this.addStateVariable("eventMonitorFilter", "");
    }

    render() {
        console.log("indexLocal-RENDER", this.props);

        const breadcrumbs = [
            {
                label: this.props.route.label,
                pathname: this.getPathname()
            }
        ];

        const controls = [];
        const pauseResumeButtonIcon = this.state.eventMonitorRunning.value ? "pause" : "play_arrow";
        const pauseResumeButtonLabel = this.state.eventMonitorRunning.value ? "Pause" : "Resume";
        controls.push(
            <Button
                key="eventMonitorPauseResumeButton"
                className={this.props.theme.button}
                icon={pauseResumeButtonIcon}
                label={pauseResumeButtonLabel}
                onClick={this.state.eventMonitorRunning.toggle}
            />
        );
        controls.push(
            <Button
                key="eventMonitorResetButton"
                className={this.props.theme.button}
                icon="clear"
                label="Reset"
                onClick={() => {
                    if (this.eventMonitor) {
                        this.eventMonitor.reset();
                    }
                }}
            />
        );
        controls.push(
            <Input
                key="eventMonitorHistoryLengthInput"
                className={`${this.props.theme.topRightInput}`}
                type="number"
                label="History length"
                value={this.state.eventMonitorHistoryLength.value}
                onChange={this.state.eventMonitorHistoryLength.set}
            />
        );
        controls.push(
            <Input
                key="eventMonitorFilterInput"
                className={this.props.theme.topRightInput}
                type="text"
                label="Filter"
                value={this.state.eventMonitorFilter.value}
                onChange={this.state.eventMonitorFilter.set}
            />
        );

        return (
            <Section
                breadcrumbs={breadcrumbs}
                controls={controls}
            >
                <EventMonitor
                    filter={this.state.eventMonitorFilter}
                    running={this.state.eventMonitorRunning}
                    eventHistoryLength={this.state.eventMonitorHistoryLength}
                    ref={(ref) => this.eventMonitor = ref}
                    theme={this.props.theme}
                />
            </Section>
        );
    }
}

Index.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    route: React.PropTypes.object.isRequired
};

export default Index;
