import { SettingItemType } from "api/types";
import { createEnumSetting } from "./base";

export enum TemplatesSource {
    Tag,
    Notebook,
}

const createValueMap = (): Record<string, TemplatesSource> => {
    const valueMap: Record<string, TemplatesSource> = {};
    valueMap["tag"] = TemplatesSource.Tag;
    valueMap["notebook"] = TemplatesSource.Notebook;
    return valueMap;
}

export const TemplatesSourceSetting = createEnumSetting<TemplatesSource>("templatesSource", {
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
}, createValueMap(), TemplatesSource.Tag);
