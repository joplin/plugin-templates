import joplin from "api";
import { encode } from "html-entities";

const getVariableHtml = (variable: string, type: string): string => {
    type = type.trim();

    if (type == "text") {
        return (
            `
            <div class="variableInput">
                <div class="variableName">
                    ${encode(variable)}
                </div>
                <div>
                    <input name="${encode(variable)}" type="text"></input>
                </div>
            </div>
            `
        );
    }

    if (type == "number") {
        return (
            `
            <div class="variableInput">
                <div class="variableName">
                    ${encode(variable)}
                </div>
                <div>
                    <input name="${encode(variable)}" type="number"></input>
                </div>
            </div>
            `
        );
    }

    if (type == "boolean") {
        return (
            `
            <div class="variableInput">
                <div class="variableName">
                    ${encode(variable)}
                </div>
                <div>
                    <select name="${encode(variable)}">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
            </div>
            `
        );
    }

    if (type.startsWith("enum(") && type.endsWith(")")) {
        const optionsHtml = type.substr(5, type.length - 6).split(",").map(o => {
            return `<option value="${encode(o.trim())}">${encode(o.trim())}</option>`
        }).join("");

        return (
            `
            <div class="variableInput">
                <div class="variableName">
                    ${encode(variable)}
                </div>
                <div>
                    <select name="${encode(variable)}">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
            `
        );
    }

    return `<div class="invalidVariable"><i>${encode(variable)} has an invalid type.</i></div>`;
}

export const setTemplateVariablesView = async (viewHandle: string, title: string, variables: Record<string, string>): Promise<void> => {
    await joplin.views.dialogs.addScript(viewHandle, "./views/webview.css");

    const variablesFormInputHtml = Object.keys(variables).map(variable => {
        return getVariableHtml(variable, variables[variable]);
    });

    await joplin.views.dialogs.setHtml(
        viewHandle,
        `
        <h2> ${encode(title)} </h2>
        <form name="variables">
            ${variablesFormInputHtml.join("")}
        </form>
        `
    );

    await joplin.views.dialogs.setButtons(viewHandle, [{ id: "ok" }, { id: "cancel" }]);
}
