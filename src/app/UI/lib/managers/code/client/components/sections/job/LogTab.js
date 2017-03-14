
import React from "react";
import Immutable from "immutable";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import { CardList, LogCard } from "ui-components/data_card";
import Logs from "../../../observables/log_list";

class LogTab extends LightComponent {
    constructor(props) {
        super(props);

        this.logs = new Logs({
            ids: props.logRefs.map((ref) => ref.id)
        });

        this.state = {
            logs: this.logs.value.getValue(),
            state: this.logs.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.logs.start());

        this.addDisposable(this.logs.value.subscribe((logs) => this.setState({ logs })));
        this.addDisposable(this.logs.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.logs.setOpts({
            ids: nextProps.logRefs.map((ref) => ref.id)
        });
    }

    render() {
        const list = [];

        for (const log of this.state.logs.toJS()) {
            list.push({
                id: log._id,
                time: moment(log.saved).unix(),
                item: log,
                Card: LogCard,
                props: {}
            });
        }

        return (
            <div className={this.props.theme.section}>
                <CardList list={Immutable.fromJS(list)} />
            </div>
        );
    }
}

LogTab.propTypes = {
    theme: React.PropTypes.object,
    logRefs: React.PropTypes.array.isRequired
};

export default LogTab;
