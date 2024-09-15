import { SettingItemType } from "api/types";
import { createSimpleSetting } from "./base";

export const ApplyTagsWhileInsertingSetting = createSimpleSetting<boolean>("applyTagsWhileInserting", {
    public: true,
    type: SettingItemType.Bool,
    value: true,
    label: "Apply tags while inserting template",
    description: "Apply tags using 'template_tags' variable while inserting template to notes/to-dos.",
    section: "templatesPlugin"
});
