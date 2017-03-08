
import api from "api.io/api.io-client";
import { setCookie } from "./cookie";
import ActiveUser from "ui-observables/active_user";
import Notification from "ui-observables/notification";

const signin = async (email, password, debug = false) => {
    const response = await api.auth.login(email, password);
    debug && console.log("Sign in response", response);
    if (response.success) {
        // Set cookie
        if (response.setCookies) {
            for (const cookie of response.setCookies) {
                setCookie(cookie.name, cookie.value, cookie.opts);
            }
        }
        ActiveUser.instance.setUser(response.user);
        Notification.instance.publish(`Welcome ${response.user.username}!`);
    } else {
        ActiveUser.instance.setUser();
        const msg = response.message ? `Sign in failed: ${response.message}` : "Sign in failed";
        Notification.instance.publish(msg, "warning");
    }

    return response;
};

const signout = async (debug = false) => {
    const response = await api.auth.logout();
    debug && console.log("Sign out response", response);
    if (response.success) {
        // Set cookie
        if (response.setCookies) {
            for (const cookie of response.setCookies) {
                setCookie(cookie.name, cookie.value, cookie.opts);
            }
        }
        ActiveUser.instance.setUser();
        Notification.instance.publish(`Goodbye ${response.user.username}!`);
    } else {
        const msg = response.message ? `Sign out failed: ${response.message}` : "Sign out failed";
        Notification.instance.publish(msg, "warning");
    }

    return response;
};

const whoami = async(debug = false) => {
    const response = await api.auth.whoami();
    debug && console.log("whoami response", response);

    return response;
};

export {
    signin,
    signout,
    whoami
};
