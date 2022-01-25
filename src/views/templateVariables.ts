import joplin from "api";
import { encode } from "html-entities";
import { CustomVariable } from "../variables/types/base";

export const setTemplateVariablesView = async (viewHandle: string, title: string, variables: Record<string, CustomVariable>): Promise<void> => {
    await joplin.views.dialogs.addScript(viewHandle, "./views/webview.css");

    const variablesFormInputHtml = Object.values(variables).map(variable => variable.toHTML());
    await joplin.views.dialogs.setHtml(
        viewHandle,
        `
        <h2> ${encode(title)} </h2>
        <form class="variablesForm" name="variables">
            ${variablesFormInputHtml.join("")}
        </form>
        `
    );

    await joplin.views.dialogs.setButtons(viewHandle, [{ id: "ok" }, { id: "cancel" }]);
}
