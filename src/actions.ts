import joplin from "api";
import { getSelectedFolder } from "./utils/folders";

export enum TemplateAction {
    NewNote = "newNote",
    NewTodo = "newTodo",
    InsertText = "insertText"
}

const performInsertTextAction = async (template: string) => {
    await joplin.commands.execute("insertText", template);
}

const performNewNoteAction = async (template: string) => {
    const currentFolder = await getSelectedFolder();
    const note = await joplin.data.post(["notes"], null, { body: template, parent_id: currentFolder });
    await joplin.commands.execute("openNote", note.id);
}

const performNewTodoAction = async (template: string) => {
    const currentFolder = await getSelectedFolder();
    const note = await joplin.data.post(["notes"], null, { body: template, parent_id: currentFolder, is_todo: 1 });
    await joplin.commands.execute("openNote", note.id);
}

export const performAction = async (action: TemplateAction, template: string): Promise<void> => {
    switch (action) {
        case TemplateAction.InsertText:
            await performInsertTextAction(template);
            break;
        case TemplateAction.NewNote:
            await performNewNoteAction(template);
            break;
        case TemplateAction.NewTodo:
            await performNewTodoAction(template);
            break;
    }
}
