import joplin from "api";
import { SettingItemType } from "api/types";
import { parseTempalte } from "./parser";
import { doesFolderExist } from "./utils/folders";
import { getUserTempateSelection } from "./utils/templates";

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
			}
		});

		const templatesFolderId = await joplin.settings.value("templatesFolderId");
		if (templatesFolderId == null || !(await doesFolderExist(templatesFolderId))) {
			const folder = await joplin.data.post(["folders"], null, { title: "Templates" });
			await joplin.settings.setValue("templatesFolderId", folder.id);
		}

		// Register all commands
		await joplin.commands.register({
			name: "createNoteFromTemplate",
			label: "Create note from template",
			execute: async () => {
				const template = await getUserTempateSelection(templatesFolderId);
				if (template) {
					await joplin.commands.execute("newNote", await parseTempalte(template));
				}
			}
		});

		await joplin.commands.register({
			name: "createTodoFromTemplate",
			label: "Create to-do from template",
			execute: async () => {
				const template = await getUserTempateSelection(templatesFolderId);
				if (template) {
					await joplin.commands.execute("newTodo", await parseTempalte(template));
				}
			}
		});

		await joplin.commands.register({
			name: "insertTemplate",
			label: "Insert template",
			execute: async () => {
				const template = await getUserTempateSelection(templatesFolderId);
				if (template) {
					await joplin.commands.execute("insertText", await parseTempalte(template));
				}
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
		]);
	},
});
