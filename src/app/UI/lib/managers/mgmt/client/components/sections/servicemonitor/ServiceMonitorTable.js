import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-toolbox/lib/button";
import { Card, CardText } from "react-toolbox/lib/card";
import Table from "react-toolbox/lib/table";
import STATE from "../../../../lib/types/service_state";

class ServiceMonitorTable extends React.Component {
    async _restartService(service) {
        const serviceId = service.id;
        console.log(`Restart service ${serviceId}`);
        const response = await service.restart();
        console.log("Restart response", response);
    }

    render() {
        const services = this.props.services;

        const ServiceModel = {
            name: { type: String },
            state: { type: String }
        };

        for (const service of services) {
            ServiceModel[service.id] = { type: String };
        }

        // Add serviceColumns for services not created yet
        const allUses = services.map((item) => item.uses);
        for (const uses of allUses) {
            for (const use of Object.keys(uses)) {
                const useName = uses[use].name;
                if (!(useName in ServiceModel)) {
                    ServiceModel[useName] = { type: String };
                }
            }
        }

        // Add column for controls...
        ServiceModel.actions = { type: Object, title: " " };

        const offlineStates = [
            STATE.NOT_CREATED,
            STATE.OFFLINE
        ];
        const tableData = [];
        for (const service of services) {
            const row = {
                name: service.name,
                state: service.state
            };
            for (const useKey of Object.keys(service.uses)) {
                const use = service.uses[useKey];
                row[use.name] = use.state;
            }
            row.actions = <Button
                accent={true}
                label="Restart"
                onClick={this._restartService.bind(this, service)}
                style={{ float: "right " }}
                disabled={offlineStates.indexOf(service.state) !== -1}
            />;
            tableData.push(row);
        }

        return (
            <Card>
                <CardText>
                    <Table
                        model={ServiceModel}
                        source={tableData}
                        selectable={false}
                    />
                </CardText>
            </Card>
        );
    }
}

ServiceMonitorTable.propTypes = {
    services: PropTypes.array.isRequired
};

export default ServiceMonitorTable;
