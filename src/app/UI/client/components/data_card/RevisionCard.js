
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";
import FontIcon from "react-toolbox/lib/font_icon";
import { UserAvatar } from "ui-components/user_avatar";
import { DateTime } from "ui-components/datetime";
import { Tags } from "ui-components/tags";
import DataCard from "./DataCard";
import { AppPager } from "ui-components/app_pager";
import stateVar from "ui-lib/state_var";
import CodeRepoAndBackend from "ui-observables/code_repo_and_backend";
import { StringUtil } from "misc";
import { UserName } from "ui-components/user_name";
import { CodeRepoBackendIcon } from "ui-components/app_icons";
import { TypeChip } from "ui-components/data_chip";
import * as pathBuilder from "ui-lib/path_builder";

const FILE_STATUS_ICON = {
    added: "add",
    modified: "create",
    deleted: "remove",
    renamed: "forward",
    copied: "content_copy",
    rewrite: "create", // rewrite is a bigger change than modified
    "undefined": "help_outline"
};

class RevisionCard extends LightComponent {
    constructor(props) {
        super(props);

        this.repoAndBackend = new CodeRepoAndBackend({
            repoId: props.item && props.item.repository
        });

        this.state = {
            expanded: stateVar(this, "expanded", props.expanded),
            pageIndex: stateVar(this, "pageIndex", false),
            repoBackend: this.repoAndBackend.backend.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.repoAndBackend.start());
        this.addDisposable(this.repoAndBackend.backend.subscribe((repoBackend) => this.setState({ repoBackend })));
    }

    componentWillReceiveProps(nextProps) {
        this.repoAndBackend.setOpts({
            repoId: nextProps.item && nextProps.item.repository
        });
    }

    _getCurrentPatch() {
        const patchIndex = this.state.pageIndex.value !== false ? this.state.pageIndex.value : this.props.patchIndex;
        if (patchIndex < 0) {
            return this.props.item.patches[this.props.item.patches.length + patchIndex];
        }

        return this.props.item.patches[patchIndex];
    }

    _getSourceLinkLabels(backendType) {
        const labels = {
            review: "Revision review",
            commit: "Revision"
        };
        switch (backendType) {
        case "gerrit":
            labels.review = "Gerrit change";
            labels.commit = "Gerrit commit";
            break;
        case "github":
            labels.review = "Github pull request";
            labels.commit = "Github commit";
            break;
        }

        return labels;
    }

    render() {
        const patch = this._getCurrentPatch();
        const backendType = this.state.repoBackend.has("backendType") ? this.state.repoBackend.get("backendType") : "";
        const sourceLinkLabels = this._getSourceLinkLabels(backendType);
        const repoBackendIcon = (
            <CodeRepoBackendIcon
                backendType={backendType}
                theme={this.props.theme}
            />
        );

        let titlePrefix = "Submitted by";
        if (this.props.patchIndex < 0) {
            titlePrefix = "Revision by";
        } else if (this.props.patchIndex === this.props.item.patches.length - 1 && this.props.item.status === "merged") {
            titlePrefix = "Merged by";
        }

        const myItemPath = pathBuilder.fromType("coderepo.revision", this.props.item);

        let patchPager;
        if (this.props.patchIndex < 0 && this.props.item.patches.length > 1) {
            patchPager = (
                <AppPager
                    theme={this.props.theme}
                    pageIndex={this.state.pageIndex}
                    numPages={this.props.item.patches.length}
                    initialPageIndex={this.props.item.patches.length + this.props.patchIndex}
                />
            );
        }

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={myItemPath}
            >
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            userId={patch.userRef.id}
                        />
                    )}
                    title={(
                        <UserName
                            userId={patch.userRef.id}
                            notFoundText={patch.name}
                            prefixText={titlePrefix}
                        />
                    )}
                    subtitle={(
                        <DateTime
                            value={patch.submitted}
                            niceDate={true}
                        />
                    )}
                />
                <CardText>
                    <span className={this.props.theme.commentLineWrap}>
                        {patch.comment}
                    </span>
                </CardText>
                <If condition={this.state.expanded.value}>
                    <table className={`${this.props.theme.table} ${this.props.theme.tableFixed}`}>
                        <tbody>
                            <tr>
                                <td>Status</td>
                                <td>
                                    {StringUtil.toUpperCaseLetter(this.props.item.status)}
                                </td>
                            </tr>
                            <tr>
                                <td>Repository</td>
                                <td>
                                    <TypeChip
                                        itemRef={{
                                            _ref: true,
                                            type: "coderepo.repository",
                                            id: this.props.item.repository
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Links</td>
                                <td>
                                    <If condition={ patch.change.reviewUrl }>
                                        <Button
                                            theme={this.props.theme}
                                            className={this.props.theme.linkButton}
                                            raised={true}
                                            label={sourceLinkLabels.review}
                                            icon={repoBackendIcon}
                                            href={patch.change.reviewUrl}
                                            target="_blank"
                                        />
                                    </If>
                                    <If condition={ patch.change.commitUrl }>
                                        <Button
                                            theme={this.props.theme}
                                            className={this.props.theme.linkButton}
                                            raised={true}
                                            label={sourceLinkLabels.commit}
                                            icon={repoBackendIcon}
                                            href={patch.change.commitUrl}
                                            target="_blank"
                                        />
                                    </If>
                                </td>
                            </tr>
                            <Choose>
                                <When condition={this.props.patchIndex >= 0}>
                                    <tr>
                                        <td>Patch</td>
                                        <td>
                                            {this.props.patchIndex + 1}
                                            <span> of </span>
                                            {this.props.item.patches.length}
                                        </td>
                                    </tr>
                                </When>
                                <Otherwise>
                                    <tr>
                                        <td>Patch</td>
                                        <td>
                                            {(this.state.pageIndex.value !== false
                                                ? this.state.pageIndex.value
                                                : (this.props.item.patches.length + this.props.patchIndex)
                                             ) + 1}
                                            <span> of </span>
                                            {this.props.item.patches.length}
                                        </td>
                                    </tr>
                                </Otherwise>
                            </Choose>
                            <tr>
                                <td>Refname</td>
                                <td className={this.props.theme.monospace}>
                                    {patch.change.refname}
                                </td>
                            </tr>
                            <tr>
                                <td>SHA1</td>
                                <td className={this.props.theme.monospace}>
                                    {patch.change.newrev}
                                </td>
                            </tr>
                            <tr>
                                <td>Previous SHA1</td>
                                <td className={this.props.theme.monospace}>
                                    {patch.change.oldrev}
                                </td>
                            </tr>
                            <tr>
                                <td>Files</td>
                                <td className={this.props.theme.monospace}>
                                    <If condition={ patch.change.files }>
                                        {patch.change.files.map((item) => (
                                            <div
                                                key={item.name}
                                                className={this.props.theme.fileListItem}
                                            >
                                                <FontIcon
                                                    value={FILE_STATUS_ICON[item.status]}
                                                    className={this.props.theme.fileListItemIcon}
                                                />
                                                <a
                                                    className={`${this.props.theme.link} ${this.props.theme.fileListItemLink}`}
                                                    href={item.url}
                                                    target="_blank"
                                                >
                                                    {item.name}
                                                </a>
                                            </div>
                                        ))}
                                    </If>
                                </td>
                            </tr>
                            <tr>
                                <td>Tags</td>
                                <td>
                                    <Tags list={this.props.item.tags} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <If condition={patchPager}>
                        <CardText>
                            {patchPager}
                        </CardText>
                    </If>
                </If>
            </DataCard>
        );
    }
}

RevisionCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false,
    patchIndex: -1
};

RevisionCard.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    patchIndex: PropTypes.number,
    expanded: PropTypes.bool,
    expandable: PropTypes.bool,
    clickable: PropTypes.bool
};

RevisionCard.contextTypes = {
    router: PropTypes.object.isRequired
};

export default RevisionCard;
