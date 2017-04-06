
import React from "react";
import { UserAvatar, TeamAvatar } from "ui-components/user_avatar";
import Avatar from "react-toolbox/lib/avatar";
import DataChip from "./DataChip";
import LightComponent from "ui-lib/light_component";
import TypeItem from "ui-observables/type_item";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import * as pathBuilder from "ui-lib/path_builder";

const types = {
    "userrepo.user": {
        Avatar: UserAvatar,
        avatarProps: (item) => ({
            userId: item._id
        }),
        name: (item) => item.name
    },
    "userrepo.team": {
        Avatar: TeamAvatar,
        avatarProps: (item) => ({
            teamId: item._id,
            cover: true
        }),
        name: (item) => item.name
    },
    "userrepo.policy": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "P"
        }),
        name: (item) => item._id
    },
    "coderepo.repository": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "R"
        }),
        name: (item) => item._id
    },
    "coderepo.revision": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "R"
        }),
        name: (item) => item._id
    },
    "coderepo.backend": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "B"
        }),
        name: (item) => item._id
    },
    "artifactrepo.repository": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "R"
        }),
        name: (item) => item._id
    },
    "artifactrepo.artifact": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "A"
        }),
        name: (item) => `${item.name} - ${item.version}`
    },
    "artifactrepo.backend": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "B"
        }),
        name: (item) => item._id
    },
    "exec.job": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "J"
        }),
        name: (item) => item.name
    },
    "exec.slave": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "S"
        }),
        name: (item) => item._id
    },
    "baselinegen.baseline": {
        Avatar: Avatar,
        avatarProps: () => ({
            title: "B"
        }),
        name: (item) => item.name,
        pathIdMap: {
            "_id": "name",
            "_id_baseline": "_id"
        }
    }
};

class TypeChip extends LightComponent {
    constructor(props) {
        super(props);

        this.item = new TypeItem({
            id: this.props.itemRef.id,
            type: this.props.itemRef.type,
            subscribe: false // This is for performance reasons
        });

        this.state = {
            item: this.item.value.getValue(),
            state: this.item.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.item.start());
        this.addDisposable(this.item.value.subscribe((item) => this.setState({ item })));
        this.addDisposable(this.item.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.item.setOpts({
            id: nextProps.itemRef.id,
            type: nextProps.itemRef.type
        });
    }

    render() {
        const item = this.state.item.toJS();

        if (this.state.state === ObservableDataStates.LOADING || !item._id) {
            return null;
        }

        const type = types[this.props.itemRef.type];
        if (!type) {
            throw new Error(`Type ${this.props.itemRef.type} is not recognized`);
        }

        const myItemPath = pathBuilder.fromType(this.props.itemRef.type, item, {
            idMap: type.pathIdMap || {}
        });

        return (
            <DataChip
                theme={this.props.theme}
                path={myItemPath}
                onDelete={this.props.onDelete}
            >
                <type.Avatar
                    className={this.props.theme.avatar}
                    {...type.avatarProps(item)}
                />
                <span>{type.name(item)}</span>
            </DataChip>
        );
    }
}

TypeChip.propTypes = {
    theme: React.PropTypes.object,
    itemRef: React.PropTypes.object.isRequired,
    onDelete: React.PropTypes.func
};

export default TypeChip;
