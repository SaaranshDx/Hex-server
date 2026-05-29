// utils/setpermission.js

const fs = require('fs').promises;
const path = require('path');

async function setpermission(ign, permission) {
    try {
        const userDataPath = path.join(__dirname, '..', 'user_meta', `${ign}.json`);
        const raw = await fs.readFile(userDataPath, 'utf8');
        const userData = JSON.parse(raw);

        // set permission level
        if (permission === 'Admin') {
            userData.permissionlevel = 3;
        } else if (permission === 'Partner') {
            userData.permissionlevel = 2;
        } else if (permission === 'User') {
            userData.permissionlevel = 1;
        } else if (permission === 'Banned') {
            userData.permissionlevel = 0;
        } else {
            return 'Invalid permission level. Valid options are: Admin, Partner, User, Banned.';
        }

        await fs.writeFile(userDataPath, JSON.stringify(userData, null, 2), 'utf8');
        return `Permission level for user \`${ign}\` has been set to \`${permission}\`.`;
    } catch (error) {
        console.error('Error updating user data:', error);
        return 'An error occurred while updating user data.';
    }
}

module.exports = setpermission;