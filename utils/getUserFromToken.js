const path = require("path");
const fs = require("fs/promises");
const { validateToken } = require("./tokenGen");

async function getUserFromToken(token) {
    try {
        const userId = validateToken(token);

        if (!userId) {
            return null;
        }

        const userMetaPath = "./user_meta";
        const files = (await fs.readdir(userMetaPath)).filter(f => f.endsWith(".json"));

        for (const file of files) {
            const fullPath = path.join(userMetaPath, file);

            try {
                const data = JSON.parse(await fs.readFile(fullPath, "utf-8"));

                if (data.userid === userId) {
                    if (!data.capeid) {
                        return null;
                    }

                    const ign = file.replace(".json", "");

                    return {
                        userId: userId,
                        ign: ign,
                        permissionLvl: data.permissionlevel,
                        capeid: data.capeid
                    };
                }
            } catch (fileError) {
                console.error(`Failed to process file ${file}:`, fileError);
            }
        }

        return null;
    } catch (error) {
        console.error("Error getting user from token:", error);
        return null;
    }
}

module.exports = { getUserFromToken };
