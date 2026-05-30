// utils/setCape.js

const path = require("path");
import Bun from "./bun-compat.js";
async function setcape(userid, newCapeId) {
    try {

        // Check if cape exists (skip if capeid is null)
        if (newCapeId !== "null") {
            // Append .png extension if not already present
            const capeIdStr = String(newCapeId);
            const capeFileName = capeIdStr.endsWith('.png') ? capeIdStr : `${capeIdStr}.png`;
            const capeFile = Bun.file(`./assets/capes/${capeFileName}`);
            if (!(await capeFile.exists())) {
                return `Cape "${newCapeId}" does not exist.`;
            }
        }

        const userMetaPath = "./user_meta";

        // get all json files
        const files = await Array.fromAsync(
            new Bun.Glob("*.json").scan(userMetaPath)
        );

        // no registered users
        if (files.length === 0) {
            return "No registered users found.";
        }

        // search every user meta file
        for (const file of files) {

            const fullPath = path.join(userMetaPath, file);

            try {

                const userFile = Bun.file(fullPath);

                const data = await userFile.json();

                // matching discord userid
                if (data.userid === userid) {

                    // update cape id
                    data.capeid = newCapeId;

                    // write updated json
                    await Bun.write(
                        fullPath,
                        JSON.stringify(data, null, 2)
                    );

                    // remove .json from filename
                    const ign = file.replace(".json", "");

                    return `Successfully updated ${ign}'s cape to ${newCapeId}.`;

                }

            } catch (fileError) {

                console.error(
                    `Failed to process file ${file}:`,
                    fileError
                );

            }

        }

        // no linked account found
        return "You do not have a registered account.";

    } catch (e) {

        console.error(e);

        return "An error occurred while updating the cape.";

    }
}

module.exports = {
    setcape
};