const { getData, actions } = require('./kernel');

require('dotenv').config()

// project DB
var bracketDB = process.env.BRACKETDB

module.exports = async ({ _window, lookupActions, stack, props, address, id, e, __, req, res, data }) => {

    if (!_window) return console.log("Passport is a serverside action!")

    if (data.facebook) data.provider = "facebook"
    else if (data.gmail) data.provider = "gmail"

    if (data.auth) data.action = "auth"
    else if (data.login) data.action = "login"

    if (data.provider === "facebook" && data.action === "auth") {

        const params = [
            `client_id=429088239479513`,
            `scope=email`,
            `display=popup`
        ];

        var href = `https://www.facebook.com/v4.0/dialog/oauth?${params.join("&")}`
        
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.writeHead(302, { Location: href });
        res.end();

    } else if (data.provider === "facebook" && data.action === "login") {
        
        var global = _window.global
        var { data: project } = await getData({ _window, req, search: { db: bracketDB, collection: "project", doc: global.manifest.session.projectName } })

        if (data.provider === "facebook" && !project.facebook) return
        else if (data.provider === "gmail" && !project.gmail) return

        const params = [
            `client_id=${project.facebook.appID}`,
            `client_secret=${project.facebook.appSecret}`,
            `code=${data.code || ""}`,
            `redirect_uri=${data.redirectUri || ""}`
        ];

        try {

            // Exchange authorization code for access token
            const facebookLoginURL = `https://graph.facebook.com/v13.0/oauth/access_token?${params.join("&")}`;
            var { data: { access_token } } = await getData({ _window, req, res, search: { url: facebookLoginURL } })

            // Use access_token to fetch user profile
            var { data: profile } = await getData({ _window, req, res, search: { url: `https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}` } })

            // Code to handle user authentication and retrieval using the profile data
            console.log(profile);

        } catch (error) {
            console.error('Error:', error);
        }
    }

    // await params
    actions["wait()"]({ _window, lookupActions, stack, props, id, e, address, req, res, _: data, __ })
}