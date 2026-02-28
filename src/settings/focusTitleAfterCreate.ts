import { SettingItemType } from "api/types";
import { createSimpleSetting } from "./base";

export const FocusTitleAfterCreateSetting = createSimpleSetting<boolean>("focusTitleAfterCreate", {
    public: true,
    type: SettingItemType.Bool,
    value: false,
    label: "Focus title bar after creating a note from template",
    description: "When enabled, the cursor will be placed in the title bar instead of the note body after creating a note or to-do from a template.",
    section: "templatesPlugin"
});
