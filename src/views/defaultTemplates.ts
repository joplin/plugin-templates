import joplin from "api";
import { encode } from "html-entities";

export interface DefaultTemplatesDisplayData {
    defaultNoteTemplateTitle: string | null;
    defaultTodoTemplateTitle: string | null;
}

export interface NotebookDefaultTemplatesDisplayData extends DefaultTemplatesDisplayData {
    notebookTitle: string;
}

const getDisplayableTitle = (title: string | null): string => {
    return title ? encode(title) : "<i>Not set</i>";
}

const getHTMLForOverallDefaults = (globalDefaultTemplates: DefaultTemplatesDisplayData): string => {
    return `
    <h3> Overall defaults </h3>
    <table>
        <tr>
            <th> Note </th>
            <th> To-do </th>
        </tr>
        <tr>
            <td>${getDisplayableTitle(globalDefaultTemplates.defaultNoteTemplateTitle)}</td>
            <td>${getDisplayableTitle(globalDefaultTemplates.defaultTodoTemplateTitle)}</td>
        </tr>
    </table>
    `;
}

const getHTMLForNotbookDefaults = (notebookDefaultTemplates: NotebookDefaultTemplatesDisplayData[]): string => {
    if (!notebookDefaultTemplates.length) return "";
    return `
    <h3> Notebook defaults </h3>
    <table>
        <tr>
            <th> Notebook </th>
            <th> Note </th>
            <th> To-do </th>
        </tr>
    ${notebookDefaultTemplates.map(rowDisplayData => {
        return `
        <tr>
            <td>${getDisplayableTitle(rowDisplayData.notebookTitle)}</td>
            <td>${getDisplayableTitle(rowDisplayData.defaultNoteTemplateTitle)}</td>
            <td>${getDisplayableTitle(rowDisplayData.defaultTodoTemplateTitle)}</td>
        </tr>
        `
    }).join("")}
    </table>
    `;
}

export const setDefaultTemplatesView = async (viewHandle: string, globalDefaultTemplates: DefaultTemplatesDisplayData, notebookDefaultTemplates: NotebookDefaultTemplatesDisplayData[]): Promise<void> => {
    await joplin.views.dialogs.addScript(viewHandle, "./views/webview.css");

    await joplin.views.dialogs.setHtml(
        viewHandle,
        `
        <h2> Default Templates </h2>
        ${getHTMLForOverallDefaults(globalDefaultTemplates)}
        ${getHTMLForNotbookDefaults(notebookDefaultTemplates)}
        `
    );

    await joplin.views.dialogs.setButtons(viewHandle, [{ id: "ok" }]);
}
