
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import {
    utils as tautils
} from "ui-components/type_admin";

class DirectBackendEdit extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
        };

        this.state = tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    _formDataUpdated() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        const isValid = tautils.isValid(this.state, this.itemProperties);
        this.props.data.set(data);
        this.props.isValid.set(isValid);
    }

    componentDidMount() {
        this._formDataUpdated();
    }

    render() {
        return null;
    }
}

DirectBackendEdit.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    data: PropTypes.object,
    isValid: PropTypes.object
};

export default DirectBackendEdit;
