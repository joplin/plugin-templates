import joplin from "api";
import { SettingItem } from "api/types";

import { ApplyTagsWhileInsertingSetting } from "./applyTagsWhileInserting";
import { DefaultNoteTemplateIdSetting } from "./defaultNoteTemplateId";
import { DefaultTemplatesConfigSetting } from "./defaultTemplatesConfig";
import { DefaultTodoTemplateIdSetting } from "./defaultTodoTemplateId";
import { TemplatesSourceSetting } from "./templatesSource";
import { FocusTitleAfterCreateSetting } from "./focusTitleAfterCreate";

import { PluginSetting } from "./base";

export class PluginSettingsRegistry {
    private static allPluginSettings: PluginSetting<unknown>[] = [
        ApplyTagsWhileInsertingSetting,
        DefaultNoteTemplateIdSetting,
        DefaultTemplatesConfigSetting,
        DefaultTodoTemplateIdSetting,
        TemplatesSourceSetting,
        FocusTitleAfterCreateSetting,
    ];

    public static async registerSettings(): Promise<void> {
        // Register setting section
        await joplin.settings.registerSection("templatesPlugin", {
            label: "Templates",
        });

        // Register all settings
        const settingsManifest: Record<string, SettingItem> = this.allPluginSettings.reduce((manifest, setting) => {
            manifest[setting.id] = setting.manifest;
            return manifest;
        }, {});
        await joplin.settings.registerSettings(settingsManifest);
    }
}
