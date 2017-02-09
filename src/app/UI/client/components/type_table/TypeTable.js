
import React from "react";
import { Button } from "react-toolbox/lib/button";
import Table from "react-toolbox/lib/table";
import Component from "ui-lib/component";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";

class TypeTable extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("list", (props) => props.type, (props) => props.query, true);
    }

    format(model, item) {
        const result = {};

        for (const key of Object.keys(model)) {
            if (model[key].format) {
                result[key] = model[key].format(item, item[key]);
            } else {
                result[key] = item[key];
            }
        }

        return result;
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        let loadIndicator;
        if (this.state.loadingAsync.value) {
            loadIndicator = (
                <TALoadIndicator/>
            );
        }

        let createButton;

        if (this.props.onCreate) {
            createButton = (
                <Button
                    primary={true}
                    onClick={() => this.props.onCreate(true)}
                    label="Create new"
                    style={{ float: "right" }}
                />
            );
        }

        const model = Object.assign({}, this.props.model);

        if (this.props.onEdit || this.props.onRemove) {
            model._actions = {
                type: Object,
                title: " ",
                format: (item) => {
                    let editButton;
                    let removeButton;

                    if (this.props.onEdit) {
                        editButton = (
                            <Button
                                accent={true}
                                label="Edit"
                                onClick={() => this.props.onEdit(item)}
                                style={{ float: "right " }}
                            />
                        );
                    }

                    if (this.props.onRemove) {
                        removeButton = (
                            <Button
                                accent={true}
                                label="Remove"
                                onClick={() => this.props.onRemove(item)}
                                style={{ float: "right " }}
                            />
                        );
                    }

                    return (
                        <div>
                            {removeButton}
                            {editButton}
                        </div>
                    );
                }
            };
        }


        const formatedList = this.state.list.map((item) => this.format(model, item));
        let filteredList = formatedList;

        if (this.props.itemFilter) {
            filteredList = filteredList.filter(
                (item, index) => this.props.itemFilter(item, this.state.list[index])
            );
        }

        let title;

        if (this.props.title) {
            title = (
                <h5 style={{ padding: "2rem 1.6rem 1.4rem" }}>
                    {createButton}
                    {this.props.title}
                </h5>
            );
        }

        return (
            <div>
                {loadIndicator}
                {title}
                <Table
                    selectable={false}
                    model={model}
                    source={filteredList}
                />
            </div>
        );
    }
}

TypeTable.propTypes = {
    theme: React.PropTypes.object,
    title: React.PropTypes.string,
    query: React.PropTypes.object,
    type: React.PropTypes.string.isRequired,
    model: React.PropTypes.object.isRequired,
    onCreate: React.PropTypes.func,
    onEdit: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    /** If set, function is called on each item to decide if list items shall
     * be shown or not. Item will only be shown if function returns true.
     * @param {Object} formatedItem Formated list item
     * @param {Object} item Unformated list item
     * @return {Bool} True if item shall be visible
     */
    itemFilter: React.PropTypes.func
};

export default TypeTable;
