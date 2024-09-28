import joplin from "api";
import { DateAndTimeUtils } from "./utils/dateAndTime";
import { createFolder } from "./utils/folders";
import { applyTagToNote, getAnyTagWithTitle } from "./utils/tags";

const README_BODY = (
    `**✅ Legacy Templates successfully imported!**

 Quick tips for the Templates Plugin:
  - All notes or to-dos with the \`template\` tag are considered templates, so this import folder can be renamed / reorganized / deleted.
  - To create a new template, create a new note or to-do and add tag \`template\`.
  - Your legacy templates are still in your Joplin directory but have been renamed from \`.md\` to \`.md.old\`.
    - These backups can be deleted once you've confirmed that your templates were correctly imported.
  - Templates now support built in variables 🎉 and more. For full documentation and features, see the [README](https://github.com/joplin/plugin-templates#readme).`);

const createTemplatesFolder = async (utils: DateAndTimeUtils): Promise<string> => {
    const folderTitle = `Imported Templates - ${utils.getCurrentTime(utils.getDateFormat())}`;
    return createFolder(folderTitle);
}

const getTemplatesTag = async (): Promise<string> => {
    return (await getAnyTagWithTitle("template")).id;
}

export const loadLegacyTemplates = async (dateAndTimeUtils: DateAndTimeUtils, profileDir: string): Promise<void> => {
    const fs = joplin.require("fs-extra");

    let folderId: string | null = null;
    let templatesTagId: string | null = null;

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
