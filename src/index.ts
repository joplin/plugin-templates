import joplin from "api";
import { SettingItemType } from "api/types";
import { doesFolderExist } from './utils';

joplin.plugins.register({
	onStart: async function() {
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
	},
});
