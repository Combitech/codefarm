import React from "react";
import PropTypes from "prop-types";
import Table from "react-toolbox/lib/table";
import Switch from "react-toolbox/lib/switch";
import LightComponent from "ui-lib/light_component";
import EvMonitor from "../../../lib/event_monitor";
import { objectFilter } from "ui-lib/filter";

class EventData extends LightComponent {
    constructor() {
        super();
        this.state = {
            expanded: false
        };
    }

    handleExpandedToggle() {
        this.setState({
            expanded: !this.state.expanded
        });
    }

    render() {
        const event = this.props.event;

        return (
            <div className={this.props.theme.dataCell}>
                <Switch
                    label="Show event content"
                    checked={this.state.expanded}
                    onChange={this.handleExpandedToggle.bind(this)}
                />
                {this.state.expanded &&
                    <pre className={this.props.theme.rawData}>
                        {JSON.stringify(event, null, 2)}
                    </pre>
                }
            </div>
        );
    }
}

EventData.propTypes = {
    event: PropTypes.object.isRequired,
    theme: PropTypes.object
};

class EventTable extends LightComponent {
    render() {
        const events = this.props.events.reverse(); // Newest first...
        const EventModel = {
            time: { type: Date },
            event: { type: String },
            type: { type: String },
            data: { type: Object }
        };

        const itemFilter = (item) => {
            const filter = this.props.filter.length > 0 ? this.props.filter : false;

            return objectFilter(filter, item, [ "time", "event", "type" ]);
        };

        const tableData = events.filter(itemFilter).map((e) => ({
            time: e.time,
            event: e.event,
            type: e.type,
            data: <EventData event={e} theme={this.props.theme} />
        }));

        return (
            <Table
                model={EventModel}
                source={tableData}
                selectable={false}
            />
        );
    }
}

EventTable.propTypes = {
    events: PropTypes.array.isRequired,
    filter: PropTypes.string.isRequired,
    theme: PropTypes.object
};


class EventMonitor extends LightComponent {
    constructor(props) {
        super(props);
        this.state = {
            events: []
        };
    }

    eventListener(newEvents) {
        this.setState((prevState, props) => {
            // Add events to end
            const events = prevState.events.concat(newEvents);

            // Limit number of events stored
            if (events.length > props.eventHistoryLength) {
                events.splice(0, events.length - props.eventHistoryLength);
            }

            return { events };
        });
    }

    subscribeEvents() {
        this.eventSubscription = EvMonitor.instance.addEventListener(
            this.eventListener.bind(this)
        );
    }

    unsubscribeEvents() {
        if (this.eventSubscription) {
            this.eventSubscription.dispose();
            this.eventSubscription = null;
        }
    }

    componentDidMount() {
        this.subscribeEvents();
    }

    componentWillUnmount() {
        this.unsubscribeEvents();
        super.componentWillUnmount();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.running !== nextProps.running) {
            if (nextProps.running) {
                this.subscribeEvents();
            } else {
                this.unsubscribeEvents();
            }
        }
    }

    reset() {
        this.setState({ events: [] });
    }

    render() {
        return (
            <div className={this.props.theme.eventMonitor}>
                <p>{this.state.events.length} events</p>
                <EventTable
                    events={this.state.events}
                    filter={this.props.filter}
                    theme={this.props.theme}
                />
            </div>
        );
    }
}

EventMonitor.propTypes = {
    filter: PropTypes.string.isRequired,
    running: PropTypes.bool.isRequired,
    eventHistoryLength: PropTypes.number.isRequired,
    theme: PropTypes.object
};

export default EventMonitor;
