
import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-toolbox/lib/button";
import Input from "react-toolbox/lib/input";
import LightComponent from "ui-lib/light_component";
import { Section } from "ui-components/type_admin";
import EventMonitor from "./EventMonitor";

const EVENT_HISTORY_LENGTH = 100;

class Page extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            eventMonitorRunning: true,
            eventMonitorHistoryLength: EVENT_HISTORY_LENGTH,
            eventMonitorFilter: ""
        };
    }

    render() {
        this.log("render", this.props, this.state);

        const breadcrumbs = [
            {
                label: this.props.route.label,
                pathname: this.getPathname()
            }
        ];

        const controls = [];
        const pauseResumeButtonIcon = this.state.eventMonitorRunning ? "pause" : "play_arrow";
        const pauseResumeButtonLabel = this.state.eventMonitorRunning ? "Pause" : "Resume";
        controls.push(
            <Button
                key="eventMonitorPauseResumeButton"
                className={this.props.theme.button}
                icon={pauseResumeButtonIcon}
                label={pauseResumeButtonLabel}
                onClick={() => this.setState((prevState) => ({ eventMonitorRunning: !prevState.eventMonitorRunning }))}
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
                value={this.state.eventMonitorHistoryLength}
                onChange={(eventMonitorHistoryLength) => this.setState({ eventMonitorHistoryLength })}
            />
        );
        controls.push(
            <Input
                key="eventMonitorFilterInput"
                className={this.props.theme.topRightInput}
                type="text"
                label="Filter"
                value={this.state.eventMonitorFilter}
                onChange={(eventMonitorFilter) => this.setState({ eventMonitorFilter })}
            />
        );

        return (
            <Section
                breadcrumbs={breadcrumbs}
                controls={controls}
                menuItems={[]}
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

Page.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    route: PropTypes.object.isRequired
};

export default Page;
