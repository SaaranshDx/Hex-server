// utils/getUserFromToken.js
const path = require("path");
const { validateToken } = require("./tokenGen");

/**
 * Get user ID, IGN (in-game name), cape ID, and permission level from a token
 * @param {string} token - The token to validate
 * @returns {Promise<{userId: string, ign: string, capeid: string, permissionLvl: number}|null>} - User data if token is valid and has a cape, null otherwise
 */
async function getUserFromToken(token) {
    try {
        // Validate token and get userId
        const userId = validateToken(token);

        if (!userId) {
            return null;
        }

        const userMetaPath = "./user_meta";

        // get all json files
        const files = await Array.fromAsync(
            new Bun.Glob("*.json").scan(userMetaPath)
        );

        // search every user meta file
        for (const file of files) {
            const fullPath = path.join(userMetaPath, file);

            try {
                const userFile = Bun.file(fullPath);
                const data = await userFile.json();

                // matching discord userid
                if (data.userid === userId) {
                    // Return null if no cape is set
                    if (!data.capeid) {
                        return null;
                    }

                    // Extract ign from filename (remove .json)
                    const ign = file.replace(".json", "");

                    return {
                        userId: userId,
                        ign: ign,
                        permissionLvl: data.permissionlevel,
                        capeid: data.capeid
                    }; 
                }
            } catch (fileError) {
                console.error(
                    `Failed to process file ${file}:`,
                    fileError
                );
            }
        }

        // User ID found but no registered account
        return null;
    } catch (error) {
        console.error("Error getting user from token:", error);
        return null;
    }
}

module.exports = {
    getUserFromToken
};
