
import React from "react";
import RevisionCard from "./RevisionCard";
import CodeRepositoryCard from "./CodeRepositoryCard";
import ArtifactCard from "./ArtifactCard";
import ArtifactRepositoryCard from "./ArtifactRepositoryCard";
import JobCard from "./JobCard";
import SubJobCard from "./SubJobCard";
import LogCard from "./LogCard";
import UserCard from "./UserCard";
import TeamCard from "./TeamCard";
import PolicyCard from "./PolicyCard";
import StatSpecCard from "./StatSpecCard";
import StatStatCard from "./StatStatCard";
import StatChartCard from "./StatChartCard";

const Cards = {
    "coderepo.revision": RevisionCard,
    "coderepo.repository": CodeRepositoryCard,
    "artifactrepo.artifact": ArtifactCard,
    "artifactrepo.repository": ArtifactRepositoryCard,
    "exec.job": JobCard,
    "exec.subjob": SubJobCard,
    "logrepo.log": LogCard,
    "userrepo.user": UserCard,
    "userrepo.team": TeamCard,
    "userrepo.policy": PolicyCard,
    "stat.spec": StatSpecCard,
    "stat.stat": StatStatCard,
    "stat.chart": StatChartCard
};

class TypeCard extends React.PureComponent {
    render() {
        const Card = Cards[this.props.item.type];

        if (!Card) {
            return (
                <div>No card for type {this.props.item.type}</div>
            );
        }

        return (
            <Card {...this.props} />
        );
    }
}

TypeCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default TypeCard;
