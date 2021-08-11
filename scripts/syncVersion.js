const fs = require("fs-extra");

const PACKAGE_JSON_PATH = "./package.json";
const MANIFEST_JSON_PATH = "./src/manifest.json";

const syncVersion = async () => {
    const packageJsonVersion = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH, "utf-8")).version;
    const manifestJson = await fs.readFile(MANIFEST_JSON_PATH, "utf-8");

    const updatedManifest = manifestJson.replace(/"version".*/gm, `"version": "${packageJsonVersion}",`);
    await fs.writeFile(MANIFEST_JSON_PATH, updatedManifest);
}

syncVersion();
