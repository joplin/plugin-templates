import { SettingItemType } from "api/types";
import { createSimpleSetting } from "./base";

export const DefaultNoteTemplateIdSetting = createSimpleSetting<string | null>("defaultNoteTemplateId", {
    public: false,
    type: SettingItemType.String,
    value: null,
    label: "Default note template ID"
});
