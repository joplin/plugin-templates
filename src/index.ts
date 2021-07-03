import joplin from "api";
import { SettingItemType } from "api/types";
import { parseTemplate } from "./parser";
import { doesFolderExist } from "./utils/folders";
import { getTemplateFromId, getUserTemplateSelection } from "./utils/templates";
import { setDefaultTemplatesView } from "./views/defaultTemplates";

joplin.plugins.register({
    onStart: async function() {
        // Register all settings
        // TODO: The settings name i.e. "templatesFolderId" in this case should be stored in a variable.
        await joplin.settings.registerSettings({
            "templatesFolderId": {
                public: false,
                type: SettingItemType.String,
                value: null,
                label: "Templates folder ID"
            },
            "defaultNoteTemplateId": {
                public: false,
                type: SettingItemType.String,
                value: null,
                label: "Default note template ID"
            },
            "defaultTodoTemplateId": {
                public: false,
                type: SettingItemType.String,
                value: null,
                label: "Default to-do template ID"
            }
        });

        const templatesFolderId = await joplin.settings.value("templatesFolderId");
        if (templatesFolderId == null || !(await doesFolderExist(templatesFolderId))) {
            const folder = await joplin.data.post(["folders"], null, { title: "Templates" });
            await joplin.settings.setValue("templatesFolderId", folder.id);
        }


        // Register a dialog box
        const dialogViewHandle = await joplin.views.dialogs.create("dialog");


        // Register all commands
        await joplin.commands.register({
            name: "createNoteFromTemplate",
            label: "Create note from template",
            execute: async () => {
                const template = await getUserTemplateSelection(templatesFolderId);
                if (template) {
                    await joplin.commands.execute("newNote", await parseTemplate(template));
                }
            }
        });

        await joplin.commands.register({
            name: "createTodoFromTemplate",
            label: "Create to-do from template",
            execute: async () => {
                const template = await getUserTemplateSelection(templatesFolderId);
                if (template) {
                    await joplin.commands.execute("newTodo", await parseTemplate(template));
                }
            }
        });

        await joplin.commands.register({
            name: "insertTemplate",
            label: "Insert template",
            execute: async () => {
                const template = await getUserTemplateSelection(templatesFolderId);
                if (template) {
                    await joplin.commands.execute("insertText", await parseTemplate(template));
                }
            }
        });

        await joplin.commands.register({
            name: "showDefaultTemplates",
            label: "Show default templates",
            execute: async () => {
                const noteTemplate = await getTemplateFromId(await joplin.settings.value("defaultNoteTemplateId"));
                const todoTemplate = await getTemplateFromId(await joplin.settings.value("defaultTodoTemplateId"));

                const noteTemplateTitle = noteTemplate ? noteTemplate.title : null;
                const todoTemplateTitle = todoTemplate ? todoTemplate.title : null;

                await setDefaultTemplatesView(dialogViewHandle, noteTemplateTitle, todoTemplateTitle);
                await joplin.views.dialogs.open(dialogViewHandle);
            }
        });

        await joplin.commands.register({
            name: "setDefaultNoteTemplate",
            label: "Set default note template",
            execute: async () => {
                const templateId = await getUserTemplateSelection(templatesFolderId, "id");
                if (templateId) {
                    await joplin.settings.setValue("defaultNoteTemplateId", templateId);
                    await joplin.views.dialogs.showMessageBox("Default note template set successfully!");
                }
            }
        });

        await joplin.commands.register({
            name: "setDefaultTodoTemplate",
            label: "Set default to-do template",
            execute: async () => {
                const templateId = await getUserTemplateSelection(templatesFolderId, "id");
                if (templateId) {
                    await joplin.settings.setValue("defaultTodoTemplateId", templateId);
                    await joplin.views.dialogs.showMessageBox("Default to-do template set successfully!");
                }
            }
        });

        await joplin.commands.register({
            name: "createNoteFromDefaultTemplate",
            label: "Create note from default template",
            execute: async () => {
                const template = await getTemplateFromId(await joplin.settings.value("defaultNoteTemplateId"));
                if (template) {
                    await joplin.commands.execute("newNote", await parseTemplate(template.body));
                    return;
                }
                await joplin.views.dialogs.showMessageBox("No default note template is set.");
            }
        });

        await joplin.commands.register({
            name: "createTodoFromDefaultTemplate",
            label: "Create to-do from default template",
            execute: async () => {
                const template = await getTemplateFromId(await joplin.settings.value("defaultTodoTemplateId"));
                if (template) {
                    await joplin.commands.execute("newTodo", await parseTemplate(template.body));
                    return;
                }
                await joplin.views.dialogs.showMessageBox("No default to-do template is set.");
            }
        });


        // Create templates menu
        await joplin.views.menus.create("templates", "Templates", [
            {
                commandName: "createNoteFromTemplate"
            },
            {
                commandName: "createTodoFromTemplate"
            },
            {
                commandName: "insertTemplate",
                accelerator: "Alt+Ctrl+I"
            },
            {
                label: "Default templates",
                submenu: [
                    {
                        commandName: "showDefaultTemplates"
                    },
                    {
                        commandName: "setDefaultNoteTemplate"
                    },
                    {
                        commandName: "setDefaultTodoTemplate"
                    },
                    {
                        commandName: "createNoteFromDefaultTemplate",
                        accelerator: "Alt+Shift+N"
                    },
                    {
                        commandName: "createTodoFromDefaultTemplate",
                        accelerator: "Alt+Shift+T"
                    }
                ]
            }
        ]);
    },
});
