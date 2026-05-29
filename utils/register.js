// utils/register.js

// Validate Minecraft username format
// Requirements: 3-16 characters, alphanumeric + underscore only
function isValidMinecraftUsername(username) {
    const minecraftUsernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    return minecraftUsernameRegex.test(username);
}

async function registerUser(userid, ign, accountType) {
    try {
        // Validate username format
        if (!isValidMinecraftUsername(ign)) {
            return `Registration failed: "${ign}" is not a valid Minecraft username. Username must be 3-16 characters and contain only letters, numbers, and underscores.`;
        }

        // Check if Discord account is already registered
        try {
            const { readdirSync } = await import('fs');
            const files = readdirSync('user_meta', { withFileTypes: true });
            
            for (const file of files) {
                if (file.isFile() && file.name.endsWith('.json')) {
                    const existingData = JSON.parse(await Bun.file(`user_meta/${file.name}`).text());
                    if (existingData.userid === userid) {
                        return `Registration failed: Discord account <@${userid}> is already registered as \`${file.name.replace('.json', '')}\`.`;
                    }
                }
            }
        } catch (err) {
            console.error('Error checking existing registrations:', err);
        }

        const userDataPath = `user_meta/${ign}.json`;
        
        if (await Bun.file(userDataPath).exists()) {
            return `Registration failed: user ${ign} is already registered.`;
        }

        const capeid = `null` // new users dosent have any capes LOL

        const data = JSON.stringify({ userid, capeid, permissionlevel: 0, accountType });
        const datawr = await Bun.write(userDataPath, data);

//acc type emoji :D
        return `Successfully registered :${accountType}: \`${ign}\` with user <@${userid}> . do \`/login\` to access the catalog`;
    } catch (e) {
        console.error(e);
        return 'An error occurred while registering your account. Please try again later.';
    }

}

module.exports = { registerUser, isValidMinecraftUsername };