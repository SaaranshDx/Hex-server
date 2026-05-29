// utils/getprofile.js

async function getprofile(username) {
    try {
        const data = require(`../user_meta/${username}.json`)
        const capeid = data.capeid
        return `{"cape": "http://localhost:8000/assets/capes/${capeid}.png"}`

    } catch (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        return null;
    }
    }


module.exports = { getprofile };    