const fs = require("fs");
const path = require("path");

/**
 * Get cape URLs for a list of usernames
 * @param {string[]} usernames - Array of usernames to fetch capes for
 * @param {number} port - Server port for constructing URLs
 * @returns {Promise<Object>} Object with usernames as keys and cape URLs (or null) as values
 */
async function getCapeUrls(usernames, port) {
    try {
        if (!Array.isArray(usernames)) {
            throw new Error("Input must be an array of usernames");
        }

        const result = {};

        for (const username of usernames) {
            const userMetaPath = path.join(process.cwd(), "user_meta", `${username}.json`);
            
            try {
                if (fs.existsSync(userMetaPath)) {
                    const userData = JSON.parse(fs.readFileSync(userMetaPath, "utf8"));
                    const capeid = userData.capeid;
                    
                    if (capeid && capeid !== "null") {
                        result[username] = `http://localhost:${port}/assets/capes/${capeid}.png`;
                    } else {
                        result[username] = null;
                    }
                } else {
                    result[username] = null;
                }
            } catch (error) {
                console.error(`Error reading user meta for ${username}:`, error);
                result[username] = null;
            }
        }

        return result;
    } catch (error) {
        console.error("Error in getCapeUrls:", error);
        throw error;
    }
}

module.exports = { getCapeUrls };
