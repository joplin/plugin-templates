import joplin from "api";
import { MenuItemLocation, SettingItemType } from "api/types";
import { Parser } from "./parser";
import { DateAndTimeUtils } from "./utils/dateAndTime";
import { getTemplateFromId, getUserTemplateSelection, Note } from "./utils/templates";
import { setDefaultTemplatesView } from "./views/defaultTemplates";
import { TemplateAction, performAction } from "./actions";
import { loadLegacyTemplates } from "./legacyTemplates";
import * as open from "open";
import { Logger } from "./logger";

const DOCUMENTATION_URL = "https://github.com/joplin/plugin-templates#readme";

joplin.plugins.register({
    onStart: async function() {
        // Register setting section
        await joplin.settings.registerSection("templatesPlugin", {
            label: "Templates",
        });


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
            },
            "applyTagsWhileInserting": {
                public: true,
                type: SettingItemType.Bool,
                value: true,
                label: "Apply tags while inserting template",
                description: "Apply tags using 'template_tags' variable while inserting template to notes/to-dos.",
                section: "templatesPlugin"
            },
            "getTemplatesByTagsOrNotebook":{
                public: true,
                type: SettingItemType.String,
                isEnum: true,
                value: "tag",
                options: {
                    "tag": "Tag",
                    "notebook": "Notebook"
                },
                label: "Are templates set with tags or stored in a notebook?",
                description: "If set to 'Tag', any note/to-do with a 'template' tag is considered a template. If set to 'Notebook', any note/todo stored in a 'Template' notebook is considered a template",
                section: "templatesPlugin"
            },
        });


        // Global variables
        const dialogViewHandle = await joplin.views.dialogs.create("dialog");

        const userLocale = await joplin.settings.globalValue("locale");
        const userDateFormat = await joplin.settings.globalValue("dateFormat");
        const userTimeFormat = await joplin.settings.globalValue("timeFormat");
        const profileDir = await joplin.settings.globalValue("profileDir");

        const dateAndTimeUtils = new DateAndTimeUtils(userLocale, userDateFormat, userTimeFormat);
        const logger = new Logger(profileDir);
        const parser = new Parser(dateAndTimeUtils, dialogViewHandle, logger);


        // Asynchronously load legacy templates
        loadLegacyTemplates(dateAndTimeUtils, profileDir);


        // Utility Functions
        const performActionWithParsedTemplate = async (action: TemplateAction, template: Note | null) => {
            const parsedTemplate = await parser.parseTemplate(template);
            if (parsedTemplate) {
                await performAction(action, parsedTemplate);
            }
        }

        const getTemplateAndPerformAction = async (action: TemplateAction) => {
            const template: Note = JSON.parse(await getUserTemplateSelection());
            await performActionWithParsedTemplate(action, template);
        }


        // Register all commands
        await joplin.commands.register({
            name: "createNoteFromTemplate",
            label: "Create note from template",
            execute: async () => {
                await getTemplateAndPerformAction(TemplateAction.NewNote);
            }
        });

        await joplin.commands.register({
            name: "createTodoFromTemplate",
            label: "Create to-do from template",
            execute: async () => {
                await getTemplateAndPerformAction(TemplateAction.NewTodo);
            }
        });

        await joplin.commands.register({
            name: "insertTemplate",
            label: "Insert template",
            execute: async () => {
                await getTemplateAndPerformAction(TemplateAction.InsertText);
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
                    return await performActionWithParsedTemplate(TemplateAction.NewNote, template);
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
                    return await performActionWithParsedTemplate(TemplateAction.NewTodo, template);
                }
                await joplin.views.dialogs.showMessageBox("No default to-do template is set.");
            }
        });

        await joplin.commands.register({
            name: "showPluginDocumentation",
            label: "Help",
            execute: async () => {
                open(DOCUMENTATION_URL);
            }
        });

        await joplin.commands.register({
            name: "copyFolderID",
            label: "Copy notebook ID",
            execute: async (folderId: string) => {
                if (typeof folderId === "undefined") {
                    const selectedFolder = await joplin.workspace.selectedFolder();
                    folderId = selectedFolder.id;
                }
                await joplin.clipboard.writeText(folderId);

                await joplin.commands.execute("editor.focus");
            }
        });


        // Create templates menu
        await joplin.views.menus.create("templates", "Templates", [
            {
                commandName: "createNoteFromTemplate",
                accelerator: "Alt+Ctrl+Shift+N"
            },
            {
                commandName: "createNoteFromDefaultTemplate",
                accelerator: "Alt+Shift+N"
            },
            {
                commandName: "createTodoFromTemplate",
                accelerator: "Alt+Ctrl+Shift+T"
            },
            {
                commandName: "createTodoFromDefaultTemplate",
                accelerator: "Alt+Shift+T"
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
                    }
                ]
            },
            {
                commandName: "showPluginDocumentation"
            }
        ]);


        // Folder context menu
        await joplin.views.menuItems.create("templates_folderid", "copyFolderID", MenuItemLocation.FolderContextMenu);
    },
});
