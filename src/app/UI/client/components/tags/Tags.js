
import React from "react";

class Tags extends React.PureComponent {
    render() {
        let tagsClassName = this.props.theme.tags;
        if (this.props.className) {
            tagsClassName = this.props.className;
        }

        return (
            <div className={tagsClassName}>
                {this.props.list.map((tag) => (
                    <div
                        key={tag}
                        className={this.props.theme.tag}
                    >
                        {tag}
                    </div>
                ))}
            </div>
        );
    }
}

Tags.propTypes = {
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    list: React.PropTypes.array.isRequired
};

export default Tags;
