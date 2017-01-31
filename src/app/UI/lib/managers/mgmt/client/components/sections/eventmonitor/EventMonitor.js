import React from "react";
import Table from "react-toolbox/lib/table";
import Switch from "react-toolbox/lib/switch";
import Component from "ui-lib/component";
import EvMonitor from "../../../lib/event_monitor";
import { objectFilter } from "ui-lib/filter";

class EventData extends React.Component {
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
    event: React.PropTypes.object.isRequired,
    theme: React.PropTypes.object
};

class EventTable extends React.Component {
    render() {
        const events = this.props.events.value.reverse(); // Newest first...
        const EventModel = {
            time: { type: Date },
            event: { type: String },
            type: { type: String },
            data: { type: Object }
        };

        const itemFilter = (item) => {
            const filter = this.props.filter ? this.props.filter.value : false;

            return objectFilter(filter, item, [ "time", "event", "type" ]);
        };

        const tableData = events.filter(itemFilter).map((e) => {
            return {
                time: e.time,
                event: e.event,
                type: e.type,
                data: <EventData event={e} theme={this.props.theme} />
            };
        });

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
    events: React.PropTypes.object.isRequired,
    filter: React.PropTypes.object,
    theme: React.PropTypes.object
};


class EventMonitor extends Component {
    constructor(props) {
        super(props);
        this.addStateVariable("events", []);
    }

    eventListener(newEvents) {
        // Add events to end
        const events = this.state.events.value.concat(newEvents);
        const eventHistoryLength = this.props.eventHistoryLength.value;

        // Limit number of events stored
        if (events.length > eventHistoryLength) {
            events.splice(0, events.length - eventHistoryLength);
        }

        this.state.events.set(events);
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
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.running.value !== nextProps.running.value) {
            if (nextProps.running.value) {
                this.subscribeEvents();
            } else {
                this.unsubscribeEvents();
            }
        }
    }

    reset() {
        this.state.events.set([]);
    }

    render() {
        return (
            <div className={this.props.theme.eventMonitor}>
                <p>{this.state.events.value.length} events</p>
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
    filter: React.PropTypes.object.isRequired,
    running: React.PropTypes.object.isRequired,
    eventHistoryLength: React.PropTypes.object.isRequired,
    theme: React.PropTypes.object
};

export default EventMonitor;
