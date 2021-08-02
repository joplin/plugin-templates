import joplin from "api";
import { DateAndTimeUtils } from "./utils/dateAndTime";
import { createFolder } from "./utils/folders";
import { applyTagToNote, getAnyTagWithTitle } from "./utils/tags";

const README_BODY = (
        `**Templates successfully imported!**

  Here are some quick tips for getting started with the templates plugin:
  - You can rename this notebook if you want, or shift your templates to any other notebook.
  - All notes or to-dos with the \`template\` tag are used as templates.
  - You can delete this readme or notebook if you've shifted your templates to any other notebook.
  - Your templates are still present in your templates directory but are renamed from \`.md\` to \`.md.old\`.
    - These backups can be delete once you've confirmed that your templates have been safely imported
  - For full documentation and features, please refer to the official [readme](https://github.com/joplin/plugin-templates#readme).`);

const createTemplatesFolder = async (utils: DateAndTimeUtils): Promise<string> => {
    const folderTitle = `Imported Templates - ${utils.getCurrentTime(utils.getDateFormat())}`;
    return createFolder(folderTitle);
}

const getTemplatesTag = async (): Promise<string> => {
    return (await getAnyTagWithTitle("template")).id;
}

export const loadLegacyTemplates = async (dateAndTimeUtils: DateAndTimeUtils): Promise<void> => {
    const fs = joplin.require("fs-extra");

    let folderId = null;
    let templatesTagId = null;

    const profileDir = await joplin.settings.globalValue("profileDir");
    const templatesDir = `${profileDir}/templates`;

    if (await fs.pathExists(templatesDir)) {
        try {
            const directoryContents = await fs.readdir(templatesDir);
            for (const contentName of directoryContents) {
                const contentPath = `${templatesDir}/${contentName}`;
                if (contentName.endsWith(".md") && (await fs.stat(contentPath)).isFile()) {
                    if (!folderId) folderId = await createTemplatesFolder(dateAndTimeUtils);
                    if (!templatesTagId) templatesTagId = await getTemplatesTag();

                    const templateBody = await fs.readFile(contentPath, "utf-8");

                    const note = await joplin.data.post(["notes"], null, { title: contentName, body: templateBody, parent_id: folderId });
                    await applyTagToNote(templatesTagId, note.id);

                    const newPath = `${contentPath}.old`;
                    await fs.rename(contentPath, newPath);
                }
            }
        } catch (error) {
            console.error(`Failed to load legacy templates: ${error}`);
        }
    }

    if (folderId) {
        await joplin.data.post(["notes"], null, { title: "README", body: README_BODY, parent_id: folderId });
    }
}
