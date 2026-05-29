//utils/unregister.js

// utils/unregister.js

const path = require("path");

async function unregisterUser(userid) {
    try {

        const userMetaPath = "./user_meta";

        // get all files in user_meta
        const files = await Array.fromAsync(
            new Bun.Glob("*.json").scan(userMetaPath)
        );

        // no registered users
        if (files.length === 0) {
            return "No registered users found.";
        }

        // search every meta file
        for (const file of files) {

            const fullPath = path.join(userMetaPath, file);

            try {

                const userFile = Bun.file(fullPath);

                const data = await userFile.json();

                // check if discord userid matches
                if (data.userid === userid) {

                    // delete the file
                    await Bun.file(fullPath).delete();

                    // remove .json from filename
                    const ign = file.replace(".json", "");

                    return `Successfully unregistered <@${userid}>'s account ${ign}.`;

                }

            } catch (fileError) {

                console.error(
                    `Failed to process file ${file}:`,
                    fileError
                );

            }

        }

        // no account linked
        return "You do not have a registered account.";

    } catch (e) {

        console.error(e);

        return "An error occurred while unregistering your account.";

    }
}

module.exports = {
    unregisterUser
};