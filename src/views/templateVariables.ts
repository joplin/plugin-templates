import joplin from "api";
import { encode } from "html-entities";
import { CustomVariable } from "../variables/types/base";
import { AUTO_FOCUS_SCRIPT } from "../utils/dialogHelpers";

export const setTemplateVariablesView = async (viewHandle: string, title: string, variables: Record<string, CustomVariable>): Promise<void> => {
    await joplin.views.dialogs.addScript(viewHandle, "./views/webview.css");
    await joplin.views.dialogs.addScript(viewHandle, "./views/autocomplete.css");
    await joplin.views.dialogs.addScript(viewHandle, "./views/autocomplete.js");

    const variablesFormInputHtml = Object.values(variables).map(variable => variable.toHTML());

    // Add id for autofocus hack to the first input element
    let formHtml = variablesFormInputHtml.join("");
    formHtml = formHtml.replace(/<(input|select|textarea)(\s)/, "<$1 id=\"autofocus-target\"$2");

    await joplin.views.dialogs.setHtml(
        viewHandle,
        `
        <h2> ${encode(title)} </h2>
        <form class="variablesForm" name="variables">
            ${formHtml}
        </form>
        ${AUTO_FOCUS_SCRIPT}
        `
    );

    await joplin.views.dialogs.setButtons(viewHandle, [{ id: "ok" }, { id: "cancel" }]);
}
