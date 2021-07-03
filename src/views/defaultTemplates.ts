import joplin from "api";
import { encode } from "html-entities";

export const setDefaultTemplatesView = async (viewHandle: string, noteTemplate: string | null, todoTemplate: string | null): Promise<void> => {
    await joplin.views.dialogs.addScript(viewHandle, "./views/webview.css");

    await joplin.views.dialogs.setHtml(
        viewHandle,
        `
        <h2> Default Templates </h2>
        <table>
            <tr>
                <td><u> Note </u></td>
                <td>${noteTemplate ? encode(noteTemplate) : "<i>Not set</i>"}</td>
            </tr>
            <tr>
                <td><u> To-do </u></td>
                <td>${todoTemplate ? encode(todoTemplate) : "<i>Not set</i>"}</td>
            </tr>
        </table>
        `
    );

    await joplin.views.dialogs.setButtons(viewHandle, [{ id: "ok" }]);
}
