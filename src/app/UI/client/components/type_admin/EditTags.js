
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import Autocomplete from "react-toolbox/lib/autocomplete";
import {
    Form as TAForm,
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import { Tags } from "ui-components/tags";
import api from "api.io/api.io-client";
import { isTokenValidForAccess } from "auth/lib/util";
import Notification from "ui-observables/notification";
import TypeItem from "ui-observables/type_item";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import arrayToSentence from "array-to-sentence";

const VALID_TAG_REGEX = /^[\w:\.]+$/;

class EditTags extends LightComponent {
    constructor(props) {
        super(props);

        let id = props.itemId;
        if (!id) {
            const item = this._getParentItem(props);
            id = item && item._id;
        }

        let type = props.type;
        if (!type) {
            type = props.route.type;
        }

        this.item = new TypeItem({
            type: type || false,
            id: id || false,
            subscribe: true
        });

        this.state = Object.assign({
            item: this.item.value.getValue(),
            itemState: this.item.state.getValue(),
            addTags: [],
            delTags: [],
            tags: []
        });
    }

    componentDidMount() {
        this.log("componentDidMount", this.props, this.state);
        this.addDisposable(this.item.start());
        this.addDisposable(this.item.value.subscribe((item) => {
            let tags;
            if (item.get("tags")) {
                tags = item.get("tags").toJS();
            }

            // Remove any already removed tags from delTags
            this.setState((prevState) => {
                const newState = {
                    item
                };
                if (tags) {
                    // tags is new tags with addTags appended and delTags removed
                    newState.tags = tags.concat(prevState.addTags)
                        .filter((tag) => !prevState.delTags.includes(tag));

                    newState.delTags = prevState.delTags.filter((tag) => tags.includes(tag));
                }

                return newState;
            });
        }));
        this.addDisposable(this.item.state.subscribe((itemState) => this.setState({ itemState })));
    }

    componentWillReceiveProps(nextProps) {
        let id = nextProps.itemId;
        if (!id) {
            const item = this._getParentItem(nextProps);
            id = item && item._id;
        }

        this.item.setOpts({
            type: nextProps.type || nextProps.route.type || false,
            id: id || false
        });
    }

    async _onConfirm() {
        const item = this.state.item;
        const addTags = this.state.addTags;
        const delTags = this.state.delTags;

        console.log("Will add tags", addTags, "and remove tags", delTags, "to item", item);

        const handleResponseErrors = (action, response) => {
            const success = response && response._id;
            if (!success) {
                let errorMessage = `${action} action`;
                if (response.message) {
                    errorMessage = `${errorMessage}: ${response.message}`;
                }
                throw errorMessage;
            }

            return success;
        };

        const type = item.get("type");
        const id = item.get("_id");
        try {
            if (addTags.length > 0) {
                const tagResponse = await api.rest.action(type, id, "tag", {
                    tag: addTags
                });
                console.log("_onConfirm: tag response", tagResponse);
                handleResponseErrors("tag", tagResponse);
            }

            if (delTags.length > 0) {
                const untagResponse = await api.rest.action(type, id, "untag", {
                    tag: delTags
                });
                console.log("_onConfirm: untag response", untagResponse);
                handleResponseErrors("untag", untagResponse);
            }

            Notification.instance.publish(`Tags updated for type instance ${id}`);
            this._resetForm();
        } catch (error) {
            const errorMsg = `Failed to update tags for type instance ${id}: ${error.message || error}`;
            Notification.instance.publish(errorMsg, "warning");
        }
    }

    async _onCancel() {
        this.context.router.goBack();
    }

    _confirmAllowed() {
        const hasUpdates = this.state.addTags.length > 0 || this.state.delTags.length > 0;
        const allTagsValid = this.state.addTags.every((tag) => this._isTagValid(tag)) &&
            this.state.delTags.every((tag) => this._isTagValid(tag));

        return !!this.state.item && hasUpdates && allTagsValid;
    }

    _getParentItem(props = null) {
        props = props || this.props;

        return props.parentItems[props.parentItems.length - 1];
    }

    _getTagDiff(oldTags, newTags) {
        oldTags = oldTags || [];
        newTags = newTags || [];

        const addTags = newTags.filter((tag) => !oldTags.includes(tag));
        const delTags = oldTags.filter((tag) => !newTags.includes(tag));

        return {
            addTags,
            delTags
        };
    }

    _changeTags(newTags) {
        // Remove duplicates
        newTags = newTags.filter((item, index, self) => self.indexOf(item) === index);
        const { addTags, delTags } = this._getTagDiff(this.state.tags, newTags);

        this.setState((prevState) => ({
            tags: newTags,
            addTags: prevState.addTags
                .filter((tag) => !delTags.includes(tag))
                .concat(addTags)
                // Do not add tags already existing tags in item
                .filter((tag) => !prevState.item.get("tags").includes(tag)),
            delTags: prevState.delTags
                .filter((tag) => !addTags.includes(tag))
                .concat(delTags)
                // Do not remove tags not present in item tags
                .filter((tag) => prevState.item.get("tags").includes(tag))
        }));
    }


    _resetForm() {
        const newState = {
            addTags: [],
            delTags: []
        };

        if (this.state.item.get("tags")) {
            newState.tags = this.state.item.get("tags").toJS();
        }

        this.setState(newState);
    }

    _isTagValid(tag) {
        return VALID_TAG_REGEX.test(tag);
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.itemState === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator
                    theme={this.props.theme}
                />
            );
        }

        const signedInUserPriv = this.props.activeUser.has("priv") && this.props.activeUser.get("priv").toJS();
        const item = this.state.item;
        const type = item && item.get("type");
        // Check that we have access to update policies
        let accessError;
        try {
            isTokenValidForAccess(signedInUserPriv, type, "tag");
        } catch (error) {
            accessError = error.message;
        }

        const invalidTags = this.state.tags.filter((tag) => !this._isTagValid(tag));
        let tagsErrorMessage = "";
        if (invalidTags.length === 1) {
            tagsErrorMessage = `Tag ${arrayToSentence(invalidTags)} has invalid format`;
        } else if (invalidTags.length > 1) {
            tagsErrorMessage = `Tags ${arrayToSentence(invalidTags, { separator: "; " })} has invalid format`;
        }

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                <Choose>
                    <When condition={ accessError }>
                        <div>{accessError}</div>
                    </When>
                    <When condition={ this.state.tags }>
                        <div className={this.props.theme.container}>
                            <TAForm
                                confirmAllowed={this._confirmAllowed()}
                                confirmText={"Apply changes"}
                                primaryText={"Update tags"}
                                secondaryText={`Type ${type} with id ${item.get("_id")}`}
                                onConfirm={() => this._onConfirm()}
                                onCancel={() => this._onCancel()}
                            >
                                <Autocomplete
                                    selectedPosition="below"
                                    allowCreate={true}
                                    label="Tags"
                                    onChange={(tags) => this._changeTags(tags)}
                                    source={this.state.tags.concat(this.state.delTags)}
                                    value={this.state.tags}
                                    error={tagsErrorMessage}
                                />

                                <div className={`${this.props.theme.panel} ${this.props.theme.editTags}`}>
                                    <div className={this.props.theme.subtitle}>
                                        Pending changes
                                    </div>
                                    <table className={this.props.theme.properties}>
                                        <tbody>
                                            <tr className={this.props.theme.addTags}>
                                                <td>Add</td>
                                                <td>
                                                    <Tags theme={this.props.theme} list={this.state.addTags} />
                                                </td>
                                            </tr>
                                            <tr className={this.props.theme.delTags}>
                                                <td>Remove</td>
                                                <td>
                                                    <Tags theme={this.props.theme} list={this.state.delTags} />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </TAForm>
                        </div>
                    </When>
                </Choose>
            </TASection>
        );
    }
}

EditTags.propTypes = {
    theme: React.PropTypes.object,
    parentItems: React.PropTypes.array.isRequired,
    type: React.PropTypes.string,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    itemId: React.PropTypes.string,
    activeUser: ImmutablePropTypes.map
};

EditTags.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default EditTags;
