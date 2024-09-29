import joplin from "api";
import { NewNote } from "./parser";
import { getSelectedFolder } from "./utils/folders";
import { applyTagToNote, getAnyTagWithTitle } from "./utils/tags";
import { ApplyTagsWhileInsertingSetting } from "./settings";

export enum TemplateAction {
    NewNote = "newNote",
    NewTodo = "newTodo",
    InsertText = "insertText"
}

const performInsertTextAction = async (template: NewNote) => {
    await joplin.commands.execute("insertText", template.body);

    const applyTags = await ApplyTagsWhileInsertingSetting.get()
    if (applyTags) {
        const noteId = (await joplin.workspace.selectedNote()).id;
        for (const tag of template.tags) {
            const tagId = (await getAnyTagWithTitle(tag)).id;
            await applyTagToNote(tagId, noteId);
        }
    }
}

const performNewNoteAction = async (template: NewNote, isTodo: 0 | 1) => {
    const folderId = template.folder ? template.folder : await getSelectedFolder();
    const notePayload = { body: template.body, parent_id: folderId, title: template.title, is_todo: isTodo };

    if (isTodo && template.todo_due) {
        notePayload["todo_due"] = template.todo_due;
    }

    const note = await joplin.data.post(["notes"], null, notePayload);
    await joplin.commands.execute("openNote", note.id);
    for (const tag of template.tags) {
        const tagId = (await getAnyTagWithTitle(tag)).id;
        await applyTagToNote(tagId, note.id);
    }
}

export const performAction = async (action: TemplateAction, template: NewNote): Promise<void> => {
    switch (action) {
        case TemplateAction.InsertText:
            await performInsertTextAction(template);
            break;
        case TemplateAction.NewNote:
            await performNewNoteAction(template, 0);
            break;
        case TemplateAction.NewTodo:
            await performNewNoteAction(template, 1);
            break;
    }
}
