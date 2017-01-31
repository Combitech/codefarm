import React from "react";
import Component from "ui-lib/component";

class DynamicImage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let image;

        if (this.props.base64) {
            const mimeType = this.props.mimeType;
            const imgSrcStr = `data:${mimeType};base64,${this.props.base64}`;
            image = (
                <img
                    className={`${this.props.theme.dynamicImage} ${this.props.className}`}
                    src={imgSrcStr}
                />
            );
        }

        return image;
    }
}

DynamicImage.defaultProps = {
    base64: false,
    className: ""
};

DynamicImage.propTypes = {
    theme: React.PropTypes.object,
    base64: React.PropTypes.string,
    mimeType: React.PropTypes.string.isRequired,
    className: React.PropTypes.string
};

export default DynamicImage;
