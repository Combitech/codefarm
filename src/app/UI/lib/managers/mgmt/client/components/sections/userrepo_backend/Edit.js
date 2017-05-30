
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import Autocomplete from "react-toolbox/lib/autocomplete";
import TypeList from "ui-observables/type_list";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";

const BACKEND_TYPE = {
    DUMMY: "dummy",
    ACTIVEDIRECTORY: "Active Directory"
};

class Edit extends LightComponent {
    constructor(props) {
        super(props);

        this.availablePolicyList = new TypeList({
            type: "userrepo.policy"
        });

        this.itemProperties = {
            "_id": {
                editable: false,
                required: () => true,
                defaultValue: ""
            },
            "tags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "backendType": {
                editable: false,
                required: () => true,
                defaultValue: BACKEND_TYPE.DUMMY
            },
            "url": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.ACTIVEDIRECTORY,
                defaultValue: "ldap://dc.ad.codefarm.lan"
            },
            "baseDN": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.ACTIVEDIRECTORY,
                defaultValue: "dc=ad,dc=codefarm,dc=lan"
            },
            "userPolicy": {
                editable: false,
                required: () => this.state.backendType.value === BACKEND_TYPE.ACTIVEDIRECTORY,
                defaultValue: ""
            }
        };

        this.state = Object.assign({
            availablePolicies: this.availablePolicyList.value.getValue()
        }, tautils.createStateProperties(this, this.itemProperties, this.props.item));
    }

    componentDidMount() {
        this.log("componentDidMount", this.props, this.state);
        this.addDisposable(this.availablePolicyList.start());
        this.addDisposable(this.availablePolicyList.value.subscribe((availablePolicies) => this.setState({ availablePolicies })));
    }

    getBackendTypes() {
        return [
            { value: BACKEND_TYPE.DUMMY, label: "Dummy" },
            { value: BACKEND_TYPE.ACTIVEDIRECTORY, label: "activeDirectory" }
        ];
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        await this.props.onSave("userrepo.backend", data, {
            create: !this.props.item
        });
    }

    render() {
        console.log("EditLocal-RENDER", this.props, this.state);

        const backendTypes = this.getBackendTypes();

        const availablePolicies = [];
        for (const policy of this.state.availablePolicies.toJS()) {
            let policyItemText = `${policy._id}`;
            if (policy.description) {
                policyItemText = `${policyItemText} - ${policy.description}`;
            }
            availablePolicies.push({ value: policy._id, label: policyItemText });
        }

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this.state, this.itemProperties)}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} user repository backend`}
                    secondaryText="A user repository backend contains information about..."
                    onConfirm={() => this.onConfirm()}
                    onCancel={() => this.props.onCancel()}
                >
                    <Input
                        type="text"
                        label="Name"
                        name="_id"
                        floating={true}
                        required={this.itemProperties._id.required()}
                        disabled={this.props.item && !this.itemProperties._id.editable}
                        value={this.state._id.value}
                        onChange={this.state._id.set}
                    />
                    <Dropdown
                        label="Backend type"
                        required={this.itemProperties.backendType.required()}
                        disabled={this.props.item && !this.itemProperties.backendType.editable}
                        onChange={this.state.backendType.set}
                        source={backendTypes}
                        value={this.state.backendType.value}
                    />
                    <Choose>
                        <When condition={this.state.backendType.value === BACKEND_TYPE.ACTIVEDIRECTORY}>
                            <Input
                                type="url"
                                label="URL to use when connecting to AD"
                                name="url"
                                floating={true}
                                required={this.itemProperties.url.required()}
                                disabled={this.props.item && !this.itemProperties.url.editable}
                                value={this.state.url.value}
                                onChange={this.state.url.set}
                            />
                            <Input
                                type="text"
                                label="baseDN for the AD/Ldap"
                                name="baseDN"
                                floating={true}
                                required={this.itemProperties.baseDN.required()}
                                disabled={this.props.item && !this.itemProperties.baseDN.editable}
                                value={this.state.baseDN.value}
                                onChange={this.state.baseDN.set}
                            />
                            <Dropdown
                                label="The default user policy to use for new users"
                                required={this.itemProperties.userPolicy.required()}
                                disabled={this.props.item && !this.itemProperties.userPolicy.editable}
                                source={availablePolicies}
                                value={this.state.userPolicy.value}
                                onChange={this.state.userPolicy.set}
                            />
                        </When>
                    </Choose>
                    <Autocomplete
                        selectedPosition="below"
                        allowCreate={true}
                        label="Tags"
                        disabled={this.props.item && !this.itemProperties.tags.editable}
                        onChange={this.state.tags.set}
                        source={this.state.tags.value}
                        value={this.state.tags.value}
                        />
                </TAForm>
            </TASection>
        );
    }
}

Edit.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default Edit;
