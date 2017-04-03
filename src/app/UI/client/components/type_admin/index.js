
import { themr } from "react-css-themr";
import { TYPE_ADMIN } from "../identifiers";
import theme from "./theme.scss";

import ControlButton from "./ControlButton";
import View from "./View";
import Edit from "./Edit";
import Remove from "./Remove";
import List from "./List";
import ListComponent from "./ListComponent";
import PagedList from "./PagedList";
import Form from "./Form";
import LoadIndicator from "./LoadIndicator";
import Section from "./Section";
import ListItemIcon from "./ListItemIcon";
import ListPager from "./ListPager";
import ListCards from "./ListCards";
import EditTags from "./EditTags";
import utils from "./utils";

const ThemedControlButton = themr(TYPE_ADMIN, theme)(ControlButton);
const ThemedView = themr(TYPE_ADMIN, theme)(View);
const ThemedEdit = themr(TYPE_ADMIN, theme)(Edit);
const ThemedList = themr(TYPE_ADMIN, theme)(List);
const ThemedListComponent = themr(TYPE_ADMIN, theme)(ListComponent);
const ThemedPagedList = themr(TYPE_ADMIN, theme)(PagedList);
const ThemedRemove = themr(TYPE_ADMIN, theme)(Remove);
const ThemedForm = themr(TYPE_ADMIN, theme)(Form);
const ThemedLoadIndicator = themr(TYPE_ADMIN, theme)(LoadIndicator);
const ThemedSection = themr(TYPE_ADMIN, theme)(Section);
const ThemedListItemIcon = themr(TYPE_ADMIN, theme)(ListItemIcon);
const ThemedListPager = themr(TYPE_ADMIN, theme)(ListPager);
const ThemedListCards = themr(TYPE_ADMIN, theme)(ListCards);
const ThemedEditTags = themr(TYPE_ADMIN, theme)(EditTags);

export {
    utils,
    ThemedControlButton as ControlButton,
    ThemedView as View,
    ThemedEdit as Edit,
    ThemedList as List,
    ThemedListComponent as ListComponent,
    ThemedPagedList as PagedList,
    ThemedRemove as Remove,
    ThemedForm as Form,
    ThemedLoadIndicator as LoadIndicator,
    ThemedSection as Section,
    ThemedListItemIcon as ListItemIcon,
    ThemedListPager as ListPager,
    ThemedListCards as ListCards,
    ThemedEditTags as EditTags
};
