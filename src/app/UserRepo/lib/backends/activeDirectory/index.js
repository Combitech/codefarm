"use strict";

const AD = require("activedirectory2").promiseWrapper;

class ActiveDirectory {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    async _userExists(data) {
        if (!this.params.baseDN && !this.params.url) {
            console.log("baseDN or url not specified for ", this.name);

            return false;
        }
        const config = { url: this.params.url,
            baseDN: this.params.baseDN,
            username: data._id,
            password: data.password };
        const ad = new AD(config);

        return await new Promise((resolve) => {
            ad.userExists(data._id, (err, exists) => {
                if (err) {
                    console.log("ERROR: ", JSON.stringify(err));
                    resolve(false);

                    return false;
                }

                if (exists) {
                    console.log("User exists: ", data._id);
                    resolve(true);

                    return true;
                }

                console.log("User does not exists: ", data._id);
                resolve(false);

                return false;
            });
        });
    }

    async validateUser(event, data) {
        return await this._userExists(data);
    }

    async lookupUser(data, clearPassword = true) {
        const exists = await this._userExists(data);
        if (exists) {
            // So that we don't accidentally store password in clear text in userrepo
            if (clearPassword) {
                data.password = null;
            }
            // Try to add default user policy
            if (this.params.userPolicy) {
                data.policies = [ this.params.userPolicy ];
            }

            return data;
        }

        return false;
    }

    async createUser(/* user */) {
    }

    async updateUser(/* user */) {
    }

    async removeUser(/* user */) {
    }

    async authenticateUser(user, password) {
        if (!this.params.baseDN && !this.params.url) {
            console.log("baseDN or url not specified for ", this.name);

            return false;
        }
        const config = { url: this.params.url,
            baseDN: this.params.baseDN,
            username: user._id,
            password: password };
        const ad = new AD(config);

        return new Promise((resolve) => {
            ad.authenticate(user._id, password, (err, auth) => {
                if (err) {
                    console.log("ERROR: ", JSON.stringify(err));
                    resolve(false);

                    return false;
                }

                if (auth) {
                    console.log("Authenticated!");
                    resolve(true);

                    return true;
                }

                console.log("Authentication failed!");
                resolve(false);

                return false;
            });
        });
    }

    async setPasswordUser(/* user, newPassword, oldPassword */) {
        return false;
    }

    async lookupTeam(/* query */) {
        return false;
    }

    async createTeam(/* team */) {
    }

    async updateTeam(/* team */) {
    }

    async removeTeam(/* team */) {
    }

    async dispose() {
    }
}

module.exports = ActiveDirectory;
