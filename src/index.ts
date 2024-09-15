import joplin from "api";
import { MenuItemLocation, SettingItemType } from "api/types";
import { Parser } from "./parser";
import { DateAndTimeUtils } from "./utils/dateAndTime";
import { getFolderFromId, getSelectedFolder, getUserFolderSelection, Folder } from "./utils/folders";
import { getTemplateFromId, getUserDefaultTemplateTypeSelection, getUserTemplateSelection, setDefaultTemplate, Note, DefaultTemplatesConfigSetting } from "./utils/templates";
import { setDefaultTemplatesView, DefaultTemplatesDisplayData, NotebookDefaultTemplatesDisplayData } from "./views/defaultTemplates";
import { TemplateAction, performAction } from "./actions";
import { loadLegacyTemplates } from "./legacyTemplates";
import * as open from "open";
import { Logger } from "./logger";
import { PromiseGroup } from "./utils/promises";

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
            "defaultTemplatesConfig": {
                public: false,
                type: SettingItemType.Object,
                value: null,
                label: "Default templates config"
            },
            "applyTagsWhileInserting": {
                public: true,
                type: SettingItemType.Bool,
                value: true,
                label: "Apply tags while inserting template",
                description: "Apply tags using 'template_tags' variable while inserting template to notes/to-dos.",
                section: "templatesPlugin"
            },
            "templatesSource": {
                public: true,
                type: SettingItemType.String,
                isEnum: true,
                value: "tag",
                options: {
                    "tag": "Tag",
                    "notebook": "Notebook"
                },
                label: "Are templates set with tags or stored in a notebook?",
                description: "If set to 'Tag', any note/to-do with a 'template' tag is considered a template. If set to 'Notebook', any note/todo stored in a notebook titled 'Templates' is considered a template.",
                section: "templatesPlugin"
            },
        });


        // Global variables
        const joplinGlobalApis = new PromiseGroup();

        joplinGlobalApis.set("dialogViewHandle", joplin.views.dialogs.create("dialog"));
        joplinGlobalApis.set("userLocale", joplin.settings.globalValue("locale"));
        joplinGlobalApis.set("userDateFormat", joplin.settings.globalValue("dateFormat"));
        joplinGlobalApis.set("userTimeFormat", joplin.settings.globalValue("timeFormat"));
        joplinGlobalApis.set("profileDir", joplin.settings.globalValue("profileDir"));

        const {
            dialogViewHandle, userLocale, userDateFormat,
            userTimeFormat, profileDir
        } = await joplinGlobalApis.groupAll();

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

        const getNotebookDefaultTemplatesDisplayData = async (settings: DefaultTemplatesConfigSetting): Promise<NotebookDefaultTemplatesDisplayData[]> => {
            const getDisplayDataForNotebook = async (notebookId: string, defaultTemplateNoteId: string, defaultTemplateTodoId: string): Promise<NotebookDefaultTemplatesDisplayData | null> => {
                const promiseGroup = new PromiseGroup();
                promiseGroup.set("notebook", getFolderFromId(notebookId));
                promiseGroup.set("noteTemplate", getTemplateFromId(defaultTemplateNoteId));
                promiseGroup.set("todoTemplate", getTemplateFromId(defaultTemplateTodoId));
                const { notebook, noteTemplate, todoTemplate } = await promiseGroup.groupAll();

                // TODO: We can remove the deleted notebooks from settings storage.
                if (notebook === null) return null;
                return {
                    notebookTitle: notebook.title,
                    defaultNoteTemplateTitle: noteTemplate ? noteTemplate.title : null,
                    defaultTodoTemplateTitle: todoTemplate ? todoTemplate.title : null
                };
            }

            const notebookDisplayDataPromiseGroup = new PromiseGroup();
            for (const [notebookId, defaultTemplates] of Object.entries(settings)) {
                notebookDisplayDataPromiseGroup.add(getDisplayDataForNotebook(
                    notebookId, defaultTemplates.defaultNoteTemplateId, defaultTemplates.defaultTodoTemplateId));
            }
            return (await notebookDisplayDataPromiseGroup.groupAll())[PromiseGroup.UNNAMED_KEY].filter(x => x !== null);
        }


        // Register all commands
        const joplinCommands = new PromiseGroup();

        joplinCommands.add(joplin.commands.register({
            name: "createNoteFromTemplate",
            label: "Create note from template",
            execute: async () => {
                await getTemplateAndPerformAction(TemplateAction.NewNote);
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "createTodoFromTemplate",
            label: "Create to-do from template",
            execute: async () => {
                await getTemplateAndPerformAction(TemplateAction.NewTodo);
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "insertTemplate",
            label: "Insert template",
            execute: async () => {
                await getTemplateAndPerformAction(TemplateAction.InsertText);
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "showDefaultTemplates",
            label: "Show default templates",
            execute: async () => {
                const noteTemplate = await getTemplateFromId(await joplin.settings.value("defaultNoteTemplateId"));
                const todoTemplate = await getTemplateFromId(await joplin.settings.value("defaultTodoTemplateId"));

                let defaultTemplatesConfig: DefaultTemplatesConfigSetting | null = await joplin.settings.value("defaultTemplatesConfig");
                if (defaultTemplatesConfig === null) defaultTemplatesConfig = {};

                const globalDefaultTemplates: DefaultTemplatesDisplayData = {
                    defaultNoteTemplateTitle: noteTemplate ? noteTemplate.title : null,
                    defaultTodoTemplateTitle: todoTemplate ? todoTemplate.title : null
                };
                const notebookDisplayData = await getNotebookDefaultTemplatesDisplayData(defaultTemplatesConfig);

                await setDefaultTemplatesView(dialogViewHandle, globalDefaultTemplates, notebookDisplayData);
                await joplin.views.dialogs.open(dialogViewHandle);
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "setDefaultTemplate",
            label: "Set default template",
            execute: async () => {
                const templateId = await getUserTemplateSelection("id");
                if (templateId === null) return;

                const defaultType = await getUserDefaultTemplateTypeSelection();
                if (defaultType === null) return;

                await setDefaultTemplate(null, templateId, defaultType);
                await joplin.views.dialogs.showMessageBox("Default template set successfully!");
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "setDefaultTemplateForNotebook",
            label: "Set default template for notebook",
            execute: async () => {
                const folder: Folder | null = JSON.parse(await getUserFolderSelection());
                if (folder === null) return;

                const templateId = await getUserTemplateSelection("id", `Default template for "${folder.title}":`);
                if (templateId === null) return;

                const defaultType = await getUserDefaultTemplateTypeSelection();
                if (defaultType === null) return;

                await setDefaultTemplate(folder.id, templateId, defaultType);
                await joplin.views.dialogs.showMessageBox(`Default template set for "${folder.title}" successfully!`);
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "createNoteFromDefaultTemplate",
            label: "Create note from default template",
            execute: async () => {
                let defaultTemplate: Note | null = null;

                let defaultTemplatesConfig: DefaultTemplatesConfigSetting | null = await joplin.settings.value("defaultTemplatesConfig");
                if (defaultTemplatesConfig === null) defaultTemplatesConfig = {};

                const currentFolderId = await getSelectedFolder();
                if (currentFolderId in defaultTemplatesConfig) {
                    defaultTemplate = await getTemplateFromId(defaultTemplatesConfig[currentFolderId].defaultNoteTemplateId);
                }

                if (defaultTemplate === null) {
                    defaultTemplate = await getTemplateFromId(await joplin.settings.value("defaultNoteTemplateId"));
                }

                if (defaultTemplate) {
                    return await performActionWithParsedTemplate(TemplateAction.NewNote, defaultTemplate);
                }
                await joplin.views.dialogs.showMessageBox("No default note template is set.");
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "createTodoFromDefaultTemplate",
            label: "Create to-do from default template",
            execute: async () => {
                let defaultTemplate: Note | null = null;

                let defaultTemplatesConfig: DefaultTemplatesConfigSetting | null = await joplin.settings.value("defaultTemplatesConfig");
                if (defaultTemplatesConfig === null) defaultTemplatesConfig = {};

                const currentFolderId = await getSelectedFolder();
                if (currentFolderId in defaultTemplatesConfig) {
                    defaultTemplate = await getTemplateFromId(defaultTemplatesConfig[currentFolderId].defaultTodoTemplateId);
                }

                if (defaultTemplate === null) {
                    defaultTemplate = await getTemplateFromId(await joplin.settings.value("defaultTodoTemplateId"));
                }

                if (defaultTemplate) {
                    return await performActionWithParsedTemplate(TemplateAction.NewTodo, defaultTemplate);
                }
                await joplin.views.dialogs.showMessageBox("No default to-do template is set.");
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "showPluginDocumentation",
            label: "Help",
            execute: async () => {
                open(DOCUMENTATION_URL);
            }
        }));

        joplinCommands.add(joplin.commands.register({
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
        }));


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
                        commandName: "setDefaultTemplate"
                    },
                    {
                        commandName: "setDefaultTemplateForNotebook"
                    }
                ]
            },
            {
                commandName: "showPluginDocumentation"
            }
        ]);

        await joplinCommands.groupAll();


        // Folder context menu
        await joplin.views.menuItems.create("templates_folderid", "copyFolderID", MenuItemLocation.FolderContextMenu);
    },
});
