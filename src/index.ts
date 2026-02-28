import joplin from "api";
import { MenuItemLocation, ToolbarButtonLocation } from "api/types";
import { Parser } from "./parser";
import { DateAndTimeUtils } from "./utils/dateAndTime";
import { getFolderFromId, getSelectedFolder, getUserFolderSelection, Folder } from "./utils/folders";
import { getUserDefaultTemplateTypeSelection, setDefaultTemplate } from "./utils/defaultTemplates";
import { getTemplateFromId, getUserTemplateSelection, Note } from "./utils/templates";
import { setDefaultTemplatesView, DefaultTemplatesDisplayData, NotebookDefaultTemplatesDisplayData } from "./views/defaultTemplates";
import { TemplateAction, performAction } from "./actions";
import { loadLegacyTemplates } from "./legacyTemplates";
import { Logger } from "./logger";
import { PromiseGroup } from "./utils/promises";
import { PluginSettingsRegistry, DefaultNoteTemplateIdSetting, DefaultTodoTemplateIdSetting, DefaultTemplatesConfigSetting, KeyboardShortcutsSetting } from "./settings";
import { LocaleGlobalSetting, DateFormatGlobalSetting, TimeFormatGlobalSetting, ProfileDirGlobalSetting } from "./settings/global";
import { DefaultTemplatesConfig } from "./settings/defaultTemplatesConfig";
import { CommandsPanel } from "./views/commandsPanel";

const DOCUMENTATION_URL = "https://github.com/joplin/plugin-templates#readme";

joplin.plugins.register({
    onStart: async function() {
        // Register setting section
        await PluginSettingsRegistry.registerSettings();

        // Global variables
        const joplinGlobalApis = new PromiseGroup();

        joplinGlobalApis.set("dialogViewHandle", joplin.views.dialogs.create("dialog"));
        joplinGlobalApis.set("templateSelectorHandle", joplin.views.dialogs.create("templateSelector"));
        joplinGlobalApis.set("folderSelectorHandle", joplin.views.dialogs.create("folderSelector"));
        joplinGlobalApis.set("templateTypeSelectorHandle", joplin.views.dialogs.create("templateTypeSelector"));
        joplinGlobalApis.set("userLocale", LocaleGlobalSetting.get());
        joplinGlobalApis.set("userDateFormat", DateFormatGlobalSetting.get());
        joplinGlobalApis.set("userTimeFormat", TimeFormatGlobalSetting.get());
        joplinGlobalApis.set("profileDir", ProfileDirGlobalSetting.get());

        const {
            dialogViewHandle, templateSelectorHandle, folderSelectorHandle,
            templateTypeSelectorHandle, userLocale, userDateFormat,
            userTimeFormat, profileDir
        } = await joplinGlobalApis.groupAll();

        const dateAndTimeUtils = new DateAndTimeUtils(userLocale, userDateFormat, userTimeFormat);
        const logger = new Logger(profileDir);
        const parser = new Parser(dateAndTimeUtils, dialogViewHandle, logger);


        // Asynchronously load legacy templates
        const version = await joplin.versionInfo();
        if (version.platform === "desktop") {
            loadLegacyTemplates(dateAndTimeUtils, profileDir);
        } else {
            logger.log("Legacy templates loading skipped on mobile");
        }


        // Utility Functions
        const performActionWithParsedTemplate = async (action: TemplateAction, template: Note | null) => {
            const parsedTemplate = await parser.parseTemplate(template);
            if (parsedTemplate) {
                await performAction(action, parsedTemplate);
            }
        }

        const getTemplateAndPerformAction = async (action: TemplateAction) => {
            const template: Note = JSON.parse(await getUserTemplateSelection(templateSelectorHandle) || "null");
            await performActionWithParsedTemplate(action, template);
        }

        const getNotebookDefaultTemplatesDisplayData = async (settings: DefaultTemplatesConfig): Promise<NotebookDefaultTemplatesDisplayData[]> => {
            const getDisplayDataForNotebook = async (notebookId: string, defaultTemplateNoteId: string | null, defaultTemplateTodoId: string | null): Promise<NotebookDefaultTemplatesDisplayData | null> => {
                const promiseGroup = new PromiseGroup();
                promiseGroup.set("notebook", getFolderFromId(notebookId));
                promiseGroup.set("noteTemplate", getTemplateFromId(defaultTemplateNoteId));
                promiseGroup.set("todoTemplate", getTemplateFromId(defaultTemplateTodoId));
                const { notebook, noteTemplate, todoTemplate } = await promiseGroup.groupAll();

                if (notebook === null || (noteTemplate === null && todoTemplate === null)) {
                    // Async remove of the obsolete config
                    DefaultTemplatesConfigSetting.clearDefaultTemplates(notebookId);
                    return null;
                }
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
            iconName: "far fa-file-alt",
            execute: async () => {
                await getTemplateAndPerformAction(TemplateAction.NewNote);
            }
        }));

        joplin.views.toolbarButtons.create(
            "createNoteFromTemplateEditorToolbar",
            "createNoteFromTemplate",
            ToolbarButtonLocation.EditorToolbar
        );

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
                const noteTemplate = await getTemplateFromId(await DefaultNoteTemplateIdSetting.get());
                const todoTemplate = await getTemplateFromId(await DefaultTodoTemplateIdSetting.get());
                const defaultTemplatesConfig = await DefaultTemplatesConfigSetting.get();

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
                const templateId = await getUserTemplateSelection(templateSelectorHandle, "id");
                if (templateId === null) return;

                const defaultType = await getUserDefaultTemplateTypeSelection(templateTypeSelectorHandle);
                if (defaultType === null) return;

                await setDefaultTemplate(null, templateId, defaultType);
                await joplin.views.dialogs.showMessageBox("Default template set successfully!");
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "setDefaultTemplateForNotebook",
            label: "Set default template for notebook",
            execute: async () => {
                const folder: Folder | null = JSON.parse(await getUserFolderSelection(folderSelectorHandle) || "null");
                if (folder === null) return;

                const templateId = await getUserTemplateSelection(templateSelectorHandle, "id", `Default template for "${folder.title}":`);
                if (templateId === null) return;

                const defaultType = await getUserDefaultTemplateTypeSelection(templateTypeSelectorHandle);
                if (defaultType === null) return;

                await setDefaultTemplate(folder.id, templateId, defaultType);
                await joplin.views.dialogs.showMessageBox(`Default template set for "${folder.title}" successfully!`);
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "clearDefaultTemplatesForNotebook",
            label: "Clear default templates for notebook",
            execute: async () => {
                const folder: Folder | null = JSON.parse(await getUserFolderSelection(folderSelectorHandle) || "null");
                if (folder === null) return;

                await DefaultTemplatesConfigSetting.clearDefaultTemplates(folder.id);
                await joplin.views.dialogs.showMessageBox(`Default templates for "${folder.title}" cleared successfully!`);
            }
        }));

        joplinCommands.add(joplin.commands.register({
            name: "createNoteFromDefaultTemplate",
            label: "Create note from default template",
            execute: async () => {
                let defaultTemplate: Note | null = null;

                const defaultTemplatesConfig = await DefaultTemplatesConfigSetting.get();
                const currentFolderId = await getSelectedFolder();

                if (currentFolderId in defaultTemplatesConfig) {
                    defaultTemplate = await getTemplateFromId(defaultTemplatesConfig[currentFolderId].defaultNoteTemplateId);
                }

                if (defaultTemplate === null) {
                    defaultTemplate = await getTemplateFromId(await DefaultNoteTemplateIdSetting.get());
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

                const defaultTemplatesConfig = await DefaultTemplatesConfigSetting.get();
                const currentFolderId = await getSelectedFolder();

                if (currentFolderId in defaultTemplatesConfig) {
                    defaultTemplate = await getTemplateFromId(defaultTemplatesConfig[currentFolderId].defaultTodoTemplateId);
                }

                if (defaultTemplate === null) {
                    defaultTemplate = await getTemplateFromId(await DefaultTodoTemplateIdSetting.get());
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
                await joplin.commands.execute("openItem", DOCUMENTATION_URL);
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


        // Register keyboard-shortcut commands for individual templates (Issue #122)
        // Users configure these in Settings > Templates > "Template keyboard shortcuts (JSON)"
        const shortcutEntries = await KeyboardShortcutsSetting.get();
        const shortcutMenuItems: { commandName: string; accelerator?: string }[] = [];

        for (let i = 0; i < shortcutEntries.length; i++) {
            const entry = shortcutEntries[i];
            const commandName = `templateShortcut_${i + 1}`;

            const actionEnum: TemplateAction =
                entry.action === "newNote"
                    ? TemplateAction.NewNote
                    : entry.action === "newTodo"
                    ? TemplateAction.NewTodo
                    : TemplateAction.InsertText;

            joplinCommands.add(joplin.commands.register({
                name: commandName,
                label: entry.label || `Template shortcut ${i + 1}`,
                execute: async () => {
                    if (!entry.templateId) {
                        await joplin.views.dialogs.showMessageBox(
                            `Template shortcut ${i + 1}: no templateId configured.`);
                        return;
                    }
                    const template = await getTemplateFromId(entry.templateId);
                    if (!template) {
                        await joplin.views.dialogs.showMessageBox(
                            `Template shortcut ${i + 1}: template not found (ID: ${entry.templateId}).`);
                        return;
                    }
                    await performActionWithParsedTemplate(actionEnum, template);
                }
            }));

            const menuItem: { commandName: string; accelerator?: string } = { commandName };
            if (entry.accelerator && entry.accelerator.trim() !== "") {
                menuItem.accelerator = entry.accelerator.trim();
            }
            shortcutMenuItems.push(menuItem);
        }

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
                    },
                    {
                        commandName: "clearDefaultTemplatesForNotebook"
                    },
                ]
            },
            // Dynamically-added template shortcuts (Issue #122)
            ...(shortcutMenuItems.length > 0
                ? [{ label: "Template shortcuts", submenu: shortcutMenuItems }]
                : []),
            {
                commandName: "showPluginDocumentation"
            }
        ]);

        await joplinCommands.groupAll();

        // Folder context menu
        await joplin.views.menuItems.create("templates_folderid", "copyFolderID", MenuItemLocation.FolderContextMenu);

        if (version.platform === "mobile") {
            const commandsPanel = new CommandsPanel([
                {
                    label: "Create note from template",
                    command: "createNoteFromTemplate"
                },
                {
                    label: "Create note from default template",
                    command: "createNoteFromDefaultTemplate"
                },
                {
                    label: "Create to-do from template",
                    command: "createTodoFromTemplate"
                },
                {
                    label: "Create to-do from default template",
                    command: "createTodoFromDefaultTemplate"
                },
                {
                    label: "Insert template",
                    command: "insertTemplate"
                },
                {
                    label: "Show default templates",
                    command: "showDefaultTemplates"
                },
                {
                    label: "Set default template",
                    command: "setDefaultTemplate"
                },
                {
                    label: "Set default template for notebook",
                    command: "setDefaultTemplateForNotebook"
                },
                {
                    label: "Clear default templates for notebook",
                    command: "clearDefaultTemplatesForNotebook"
                },
                {
                    label: "Help",
                    command: "showPluginDocumentation"
                }
            ]);
            await commandsPanel.create();
        }
    },
});
