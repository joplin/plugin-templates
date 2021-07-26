import joplin from "api";
import { encode } from "html-entities";
import { getAllFolders } from "../utils/folders";

export const setTemplatesFolderView = async (viewHandle: string): Promise<void> => {
    await joplin.views.dialogs.addScript(viewHandle, "./views/webview.css");

    const allFolders = await getAllFolders();
    const folderOptionsHtml = allFolders.map(folder => {
        return `<option value="${encode(folder.id)}">${encode(folder.title)}</option>`;
    }).join("");

    await joplin.views.dialogs.setHtml(
        viewHandle,
        `
        <h2> Templates notebook </h2>
        <form name="folders">
            <div>
                <div class="formLabel">
                    Choose an existing notebook or create a new one
                </div>
                <div>
                    <select name="folder">
                        <option value="new">Create a new notebook</option>
                        ${folderOptionsHtml}
                    </select>
                </div>
            </div>
        </form>
        `
    );

    await joplin.views.dialogs.setButtons(viewHandle, [{ id: "ok" }]);
}
