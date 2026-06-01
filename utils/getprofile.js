// utils/getprofile.js

const fs = require("fs").promises;
const path = require("path");

async function getprofile(username) {
    const publicUrl = process.env.PUBLIC_URL
        ? `${process.env.PUBLIC_URL}:${process.env.PORT}`
        : "http://localhost:8000";

    const profilePath = path.join(
        __dirname,
        "..",
        "user_meta",
        `${username}.json`
    );

    try {
        const raw = await fs.readFile(profilePath, "utf8");
        const data = JSON.parse(raw);

        const capeid = data.capeid || "null";

        return JSON.stringify({
            cape: `${publicUrl}/assets/capes/${capeid}.png`
        });

    } catch (error) {
        if (error.code === "ENOENT") {
            return JSON.stringify({
                cape: `${publicUrl}/assets/capes/null.png`
            });
        }

        console.error(`Error fetching profile for ${username}:`, error);

        return JSON.stringify({
            cape: `${publicUrl}/assets/capes/null.png`
        });
    }
}

module.exports = { getprofile };