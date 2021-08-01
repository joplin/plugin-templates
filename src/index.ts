import joplin from "api";
import { SettingItemType } from "api/types";
import { Parser } from "./parser";
import { DateAndTimeUtils } from "./utils/dateAndTime";
import { getTemplateFromId, getUserTemplateSelection, Note } from "./utils/templates";
import { setDefaultTemplatesView } from "./views/defaultTemplates";
import { JoplinCommand } from "./types";
import { loadLegacyTemplates } from "./legacyTemplates";

joplin.plugins.register({
    onStart: async function() {
        // Register all settings
        await joplin.settings.registerSettings({
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


        // Global variables
        const dialogViewHandle = await joplin.views.dialogs.create("dialog");

        const userLocale = await joplin.settings.globalValue("locale");
        const userDateFormat = await joplin.settings.globalValue("dateFormat");
        const userTimeFormat = await joplin.settings.globalValue("timeFormat");
        const dateAndTimeUtils = new DateAndTimeUtils(userLocale, userDateFormat, userTimeFormat);
        const parser = new Parser(dateAndTimeUtils, dialogViewHandle);


        // Asynchronously load legacy templates
        loadLegacyTemplates(dateAndTimeUtils);


        // Utility Functions
        const executeCommandWithParsedTemplate = async (command: JoplinCommand, template: Note | null) => {
            const parsedTemplate = await parser.parseTemplate(template);
            if (parsedTemplate) {
                await joplin.commands.execute(command, parsedTemplate);
            }
        }

        const getTemplateAndExecuteCommand = async (command: JoplinCommand) => {
            const template: Note = JSON.parse(await getUserTemplateSelection());
            await executeCommandWithParsedTemplate(command, template);
        }


        // Register all commands
        await joplin.commands.register({
            name: "createNoteFromTemplate",
            label: "Create note from template",
            execute: async () => {
                await getTemplateAndExecuteCommand(JoplinCommand.NewNote);
            }
        });

        await joplin.commands.register({
            name: "createTodoFromTemplate",
            label: "Create to-do from template",
            execute: async () => {
                await getTemplateAndExecuteCommand(JoplinCommand.NewTodo);
            }
        });

        await joplin.commands.register({
            name: "insertTemplate",
            label: "Insert template",
            execute: async () => {
                await getTemplateAndExecuteCommand(JoplinCommand.InsertText);
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
                const templateId = await getUserTemplateSelection("id");
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
                const templateId = await getUserTemplateSelection("id");
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
                    return await executeCommandWithParsedTemplate(JoplinCommand.NewNote, template);
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
                    return await executeCommandWithParsedTemplate(JoplinCommand.NewTodo, template);
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
