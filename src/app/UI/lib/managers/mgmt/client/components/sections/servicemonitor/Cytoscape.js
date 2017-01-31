import React from "react";
import cytoscape from "cytoscape";

const cyStyle = {
    width: "100%",
    height: "600px",
    display: "block"
};

const NODE_SIZE = 60;

const LAYOUT = "circle";

class Cytoscape extends React.Component {
    constructor(props) {
        super(props);
        this.cy = null;
    }

    componentDidMount() {
        const nodeSize = this.props.nodeSize || NODE_SIZE;
        const conf = {
            container: this.cyContainer,
            layout: {
                name: "preset"
            },
            userZoomingEnabled: this.props.userZoomingEnabled || false,
            userPanningEnabled: this.props.userPanningEnabled || false,
            selectionType: "additive",
            style: cytoscape.stylesheet()
                .selector("node").css({
                    "content": "data(id)",
                    "text-valign": "center",
                    "color": "white",
                    "text-outline-width": 2,
                    "background-color": "data(color)",
                    "text-outline-color": "data(color)",
                    "width": `${nodeSize}px`,
                    "height": `${nodeSize}px`
                })
                .selector("node:selected").css({
                    "border-width": 2,
                    "border-color": "black"
                })
                .selector("edge").css({
                    "width": "data(width)",
                    "curve-style": "bezier",
                    "line-color": "data(color)",
                    "target-arrow-color": "data(color)",
                    "target-arrow-shape": "triangle",
                    "opacity": 0.8,
                    "line-style": "data(lineStyle)"
                })
        };
        this.cy = cytoscape(conf);
        this.setElements(this.props.elements);
    }

    shouldComponentUpdate() {
        return false;
    }

    setElements(elems) {
        this.cy.json({ elements: elems });
        const sortById = (a, b) => {
            if (a.id() < b.id()) {
                return -1;
            } else if (a.id() > b.id()) {
                return 1;
            }

            return 0;
        };
        this.cy.layout({
            name: LAYOUT,
            // Sort nodes to get same layout each time
            sort: sortById
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setElements(nextProps.elements);
    }

    componentWillUnmount() {
        this.cy.destroy();
    }

    getCy() {
        return this.cy;
    }

    render() {
        const style = cyStyle;
        if (this.props.width) {
            style.width = this.props.width;
        }
        if (this.props.height) {
            style.height = this.props.height;
        }

        return <div style={style} ref={(ref) => this.cyContainer = ref} />;
    }
}

Cytoscape.propTypes = {
    elements: React.PropTypes.array.isRequired,
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    nodeSize: React.PropTypes.number,
    userZoomingEnabled: React.PropTypes.bool,
    userPanningEnabled: React.PropTypes.bool,
    muiTheme: React.PropTypes.object
};

export default Cytoscape;
