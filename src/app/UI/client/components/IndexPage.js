
import React from "react";
import AppHeader from "ui-components/app_header";
import { IconStyler, CodeFarmIcon } from "ui-components/app_icons";

const ICON_SIZE = {
    width: 312,
    height: 312
};

class IndexPage extends React.PureComponent {
    render() {
        const iconStyle = {
            verticalAlign: "bottom"
        };
        const icon = (
            <IconStyler white>
                <CodeFarmIcon
                    style={iconStyle}
                    width={ICON_SIZE.width}
                    height={ICON_SIZE.height}
                />
            </IconStyler>
        );

        return (
            <div>
                <AppHeader
                    primaryText="Welcome to the Code Farm"
                    secondaryText="Grow your software, herd your commits..."
                    icon={icon}
                />
            </div>
        );
    }
}

export default IndexPage;
