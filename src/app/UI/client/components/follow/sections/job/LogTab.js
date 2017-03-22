
import React from "react";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { CardList, LogCard } from "ui-components/data_card";

import Logs from "../../observables/log_list";

class LogTab extends LightComponent {
    constructor(props) {
        super(props);

        this.logs = new Logs({
            ids: props.logRefs.map((ref) => ref.id)
        });

        this.state = {
            logs: this.logs.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.logs.start());

        this.addDisposable(this.logs.value.subscribe((logs) => this.setState({ logs })));
    }

    componentWillReceiveProps(nextProps) {
        this.logs.setOpts({
            ids: nextProps.logRefs.map((ref) => ref.id)
        });
    }

    render() {
        const list = this.state.logs.map((log) => Immutable.fromJS({
            id: log.get("_id"),
            time: moment(log.get("saved")).unix(),
            item: log.toJS(),
            Card: LogCard,
            props: {}
        }));

        return (
            <CardList list={list} />
        );
    }
}

LogTab.propTypes = {
    theme: React.PropTypes.object,
    logRefs: React.PropTypes.array.isRequired
};

export default LogTab;
