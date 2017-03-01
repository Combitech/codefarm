
import React from "react";
import { Link } from "react-router";
import AppHeader from "ui-components/app_header";

class NotFoundPage extends React.PureComponent {
    render() {
        return (
            <div>
                <AppHeader
                    primaryText="Page not found!"
                    secondaryText="You seem to have gotten lost and found a 404 error"
                    icon="error"
                />
                <p style={{ margin: 20, textAlign: "center" }}>
                    <Link to="/">Go back to the main page</Link>
                </p>
            </div>
        );
    }
}

export default NotFoundPage;
