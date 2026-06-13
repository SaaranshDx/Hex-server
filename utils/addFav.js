// utils/addFav.js

const path = require("path");
const fs = require("fs/promises");
const { getUserFromToken } = require("./getUserFromToken");

async function addFav(Token, capeId) {
    try {
        let userData = await getUserFromToken(Token);

        if (!userData) {
            return { success: false, message: "Invalid token or user not found." };
        }

        if (userData.favorites && userData.favorites.includes(capeId)) {
            return { success: false, message: "Cape is already in favorites." };
        }


        if (!userData.favorites) {
            userData.favorites = [];
        }

        userData.favorites.push(capeId);

        const userFilePath = path.join("./user_meta", `${userData.ign}.json`);
        
        try {
            const fileData = JSON.parse(await fs.readFile(userFilePath, "utf-8"));
            fileData.favorites = userData.favorites;
            await fs.writeFile(userFilePath, JSON.stringify(fileData, null, 2));
        } catch (fileError) {
            console.error(`Failed to save favorites for ${userData.ign}:`, fileError);
            return { success: false, message: "Failed to save favorites to database." };
        }

        return { success: true, message: "Cape added to favorites.", data: userData };
    } catch (e) {
        console.error(e);
        return { success: false, message: "An error occurred while adding to favorites." };
    }
}

module.exports = { addFav };
