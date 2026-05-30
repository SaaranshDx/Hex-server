const path = require("path");
const fs = require("fs/promises");

async function unregisterUser(userid) {
    try {
        const userMetaPath = "./user_meta";
        const files = (await fs.readdir(userMetaPath)).filter(f => f.endsWith(".json"));

        if (files.length === 0) {
            return "No registered users found.";
        }

        for (const file of files) {
            const fullPath = path.join(userMetaPath, file);

            try {
                const data = JSON.parse(await fs.readFile(fullPath, "utf-8"));

                if (data.userid === userid) {
                    await fs.unlink(fullPath);
                    const ign = file.replace(".json", "");
                    return `Successfully unregistered <@${userid}>'s account ${ign}.`;
                }
            } catch (fileError) {
                console.error(`Failed to process file ${file}:`, fileError);
            }
        }

        return "You do not have a registered account.";
    } catch (e) {
        console.error(e);
        return "An error occurred while unregistering your account.";
    }
}

module.exports = { unregisterUser };