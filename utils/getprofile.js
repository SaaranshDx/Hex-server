// utils/getprofile.js

async function getprofile(username) {
    try {
        const data = require(`../user_meta/${username}.json`)
        const capeid = data.capeid
        //return `{"cape": "http://localhost:8000/assets/capes/${capeid}.png"}` maybe in another world you would be my api response
        return `{"textureURL":"http://localhost:8000/assets/capes/${capeid}.png","staticURL":"http://localhost:8000/assets/capes/${capeid}.png","animatedCape":false}`

    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            return `{"textureURL":"http://localhost:8000/assets/capes/null.png","staticURL":"http://localhost:8000/assets/capes/null.png","animatedCape":false}`;
        }
        console.error(`Error fetching profile for ${username}:`, error);
        return null;
    }
}

module.exports = { getprofile };    