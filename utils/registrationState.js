// utils/registrationState.js

const path = require("path");
const fs = require("fs");

async function getRegistrationState(username) {
    try {
        const regstatePath = path.resolve(__dirname, `../user_meta/${username}.json`);
        return fs.existsSync(regstatePath) ? "true" : "false";
    } catch (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        return null;
    }
} 

module.exports = { getRegistrationState };   