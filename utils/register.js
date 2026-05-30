const fs = require("fs/promises");

function isValidMinecraftUsername(username) {
    const minecraftUsernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    return minecraftUsernameRegex.test(username);
}

async function registerUser(userid, ign, accountType) {
    try {
        if (!isValidMinecraftUsername(ign)) {
            return `Registration failed: "${ign}" is not a valid Minecraft username. Username must be 3-16 characters and contain only letters, numbers, and underscores.`;
        }

        try {
            const files = await fs.readdir("user_meta");

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const existingData = JSON.parse(await fs.readFile(`user_meta/${file}`, "utf-8"));
                    if (existingData.userid === userid) {
                        return `Registration failed: Discord account <@${userid}> is already registered as \`${file.replace('.json', '')}\`.`;
                    }
                }
            }
        } catch (err) {
            console.error('Error checking existing registrations:', err);
        }

        const userDataPath = `user_meta/${ign}.json`;

        try {
            await fs.access(userDataPath);
            return `Registration failed: user ${ign} is already registered.`;
        } catch {
            // file doesn't exist, proceed
        }

        const data = JSON.stringify({ userid, capeid: "null", permissionlevel: 1, accountType });
        await fs.writeFile(userDataPath, data);

        return `Successfully registered :${accountType}: \`${ign}\` with user <@${userid}> . do \`/login\` to access the catalog`;
    } catch (e) {
        console.error(e);
        return 'An error occurred while registering your account. Please try again later.';
    }
}

module.exports = { registerUser, isValidMinecraftUsername };