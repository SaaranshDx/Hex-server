const path = require("path");
const fs = require("fs/promises");

async function setcape(userid, newCapeId) {
    try {
        if (newCapeId !== "null") {
            const capeIdStr = String(newCapeId);
            const capeFileName = capeIdStr.endsWith('.png') ? capeIdStr : `${capeIdStr}.png`;
            try {
                await fs.access(path.join("./assets/capes", capeFileName));
            } catch {
                return `Cape "${newCapeId}" does not exist.`;
            }
        }

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
                    data.capeid = newCapeId;
                    await fs.writeFile(fullPath, JSON.stringify(data, null, 2));
                    const ign = file.replace(".json", "");
                    return `Successfully updated ${ign}'s cape to ${newCapeId}.`;
                }
            } catch (fileError) {
                console.error(`Failed to process file ${file}:`, fileError);
            }
        }

        return "You do not have a registered account.";
    } catch (e) {
        console.error(e);
        return "An error occurred while updating the cape.";
    }
}

module.exports = { setcape };