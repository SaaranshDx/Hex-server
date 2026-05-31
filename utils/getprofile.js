// utils/getprofile.js

async function getprofile(username) {
    try {
        const data = require(`../user_meta/${username}.json`)
        const capeid = data.capeid
        const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:8000';
        return `{"cape": "${PUBLIC_URL}/assets/capes/${capeid}.png"}` 

    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:8000';
            return `{"cape": "${PUBLIC_URL}/assets/capes/null.png"}`;
        }
        console.error(`Error fetching profile for ${username}:`, error);
        return null;
    }
}

module.exports = { getprofile };    