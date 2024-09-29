import { SettingItemType } from "api/types";
import { createSimpleSetting } from "./base";

export const DefaultTodoTemplateIdSetting = createSimpleSetting<string | null>("defaultTodoTemplateId", {
    public: false,
    type: SettingItemType.String,
    value: null,
    label: "Default to-do template ID"
});
