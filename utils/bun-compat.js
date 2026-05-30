// bun-compat.js

import fs from "fs/promises";

const BunCompat = {
    file(path) {
        return {
            async text() {
                return fs.readFile(path, "utf8");
            },

            async json() {
                return JSON.parse(
                    await fs.readFile(path, "utf8")
                );
            },

            async exists() {
                try {
                    await fs.access(path);
                    return true;
                } catch {
                    return false;
                }
            },

            async delete() {
                await fs.unlink(path);
            }
        };
    },

    async write(path, data) {
        return fs.writeFile(path, data);
    },

    Glob: class {
        constructor(pattern) {
            this.pattern = pattern;
        }

        async *scan(dir) {
            const files = await fs.readdir(dir);

            const extension = this.pattern.replace("*", "");

            for (const file of files) {
                if (file.endsWith(extension)) {
                    yield `${dir}/${file}`;
                }
            }
        }
    }
};

export default BunCompat;