const fs = require("fs");
const path = require("path");
const https = require("https");

const CAPES_DIR = path.join(__dirname, "assets", "capes");
const RENDERS_DIR = path.join(__dirname, "assets", "renders", "capes");

if (!fs.existsSync(RENDERS_DIR)) {
    fs.mkdirSync(RENDERS_DIR, { recursive: true });
}

// Download helper
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(outputPath);

        https.get(url, (response) => {

            if (response.statusCode !== 200) {
                reject(
                    new Error(
                        `Failed to download ${url} (${response.statusCode})`
                    )
                );

                return;
            }

            response.pipe(file);

            file.on("finish", () => {
                file.close();
                resolve();
            });

        }).on("error", (err) => {

            fs.unlink(outputPath, () => {});
            reject(err);

        });

    });
}

async function main() {

    const files = fs.readdirSync(CAPES_DIR);

    const pngFiles = files.filter(file => file.endsWith(".png"));

    console.log(`Found ${pngFiles.length} cape textures`);

    for (const file of pngFiles) {

        const capeId = path.parse(file).name;

        const url =
            `https://cdn.capeserver.picapes.syanic.org/renders/capes/webp/${capeId}.webp`;

        const output =
            path.join(RENDERS_DIR, `${capeId}.webp`);

        try {

            console.log(`Downloading render for cape ${capeId}...`);

            await downloadFile(url, output);

            console.log(`Saved -> ${output}`);

        } catch (err) {

            console.error(
                `Failed for cape ${capeId}:`,
                err.message
            );

        }
    }

    console.log("Done.");
}

main();