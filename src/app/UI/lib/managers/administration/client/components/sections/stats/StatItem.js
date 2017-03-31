
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Autocomplete } from "react-toolbox/lib/autocomplete";
import { Row, Column, Header, Section } from "ui-components/layout";
import { StatStatCard, StatStatInfoCard } from "ui-components/data_card";
import {
    Section as TASection
} from "ui-components/type_admin";
import StatSamples from "ui-observables/stat_samples";
import StatInfo from "ui-observables/stat_info";

import moment from "moment";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import * as color from "ui-lib/colors";

const colorSeries = 500;
const colorNames = [
    "deepPurple", "pink", "indigo", "cyan", "green", "purple",
    "blue", "lightBlue", "teal", "lime", "yellow", "red",
    "amber", "orange", "deepOrange", "brown", "grey", "bluegrey"
];

const STROKE_PALETTE = colorNames.map((colorName) => color[`${colorName}${colorSeries}`]);

class StatItem extends LightComponent {
    constructor(props) {
        super(props);

        const activeFields = (props.item && props.item.fieldNames) || [];

        this.samples = new StatSamples({
            id: props.item && props.item._id,
            fields: activeFields
        });
        this.statInfo = new StatInfo({
            id: props.item && props.item._id,
            fields: activeFields
        });

        this.state = {
            samples: this.samples.value.getValue(),
            statInfo: this.statInfo.value.getValue(),
            activeFields
        };
    }

    componentDidMount() {
        this.addDisposable(this.samples.start());
        this.addDisposable(this.samples.value.subscribe((samples) => this.setState({ samples })));
        this.addDisposable(this.statInfo.start());
        this.addDisposable(this.statInfo.value.subscribe((statInfo) => this.setState({ statInfo })));
    }

    componentWillReceiveProps(nextProps) {
        this.samples.setOpts({
            id: nextProps.item && nextProps.item.id,
            fields: (nextProps.item && nextProps.item.fieldNames) || []
        });
        this.statInfo.setOpts({
            id: nextProps.item && nextProps.item.id,
            fields: (nextProps.item && nextProps.item.fieldNames) || []
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const activeFields = this.state.activeFields;
        let chart;
        if (activeFields.length > 0 && this.state.samples.size > 0) {
            const samples = this.state.samples.toJS();
            samples.forEach((sample, index) => {
                sample._seq = index;
                sample._t = moment(sample._collected).format("YYYY-MM-DD HH:mm:ss");
            });

            chart = (
                <LineChart
                    width={600}
                    height={300}
                    data={samples}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <XAxis dataKey="_t" hide={true} />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip/>
                    <Legend />
                    {activeFields.map((field, index) => (
                        <Line
                            key={field}
                            type="monotone"
                            stroke={STROKE_PALETTE[index % STROKE_PALETTE.length]}
                            dataKey={field}
                            activeDot={{ r: 8 }}
                        />
                    ))}
                </LineChart>
            );
        } else {
            chart = (
                <div className={this.props.theme.noGraph}>
                    Nothing to plot
                </div>
            );
        }


        const statInfo = this.state.statInfo
            .filter((info) => activeFields.includes(info.get("id")));

        return (
            <div>
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        <Row>
                            <Column xs={12} md={5}>
                                <Section>
                                    <Header label="Properties" />
                                    <StatStatCard
                                        item={this.props.item}
                                        expanded={true}
                                        expandable={false}
                                    />
                                </Section>
                            </Column>
                            <Column xs={12} md={7}>
                                <Section>
                                    <Header label="Data explorer" />
                                    <Autocomplete
                                        direction="down"
                                        selectedPosition="below"
                                        label="Select fields"
                                        onChange={(activeFields) => this.setState({ activeFields })}
                                        source={this.props.item.fieldNames}
                                        value={activeFields}
                                      />
                                    {chart}
                                    {statInfo.map((info) => (
                                        <StatStatInfoCard
                                            key={info.get("id")}
                                            item={info.toJS()}
                                            expandable={true}
                                            expanded={false}
                                        />
                                    ))}
                                </Section>
                            </Column>
                        </Row>
                    </div>
                </TASection>
            </div>
        );
    }
}

StatItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default StatItem;
