import joplin from "api";
import { NewNote, NOTE_ID_PLACEHOLDER } from "./parser";
import { getSelectedFolder } from "./utils/folders";
import { applyTagToNote, getAnyTagWithTitle } from "./utils/tags";
import { ApplyTagsWhileInsertingSetting, FocusTitleAfterCreateSetting } from "./settings";

export enum TemplateAction {
    NewNote = "newNote",
    NewTodo = "newTodo",
    InsertText = "insertText"
}


const performInsertTextAction = async (template: NewNote) => {
    // When inserting into an existing note, resolve {{ note_id }} to the
    // currently selected note's ID, since there is no "new note" being created.
    const currentNote = await joplin.workspace.selectedNote();
    const body = template.body.includes(NOTE_ID_PLACEHOLDER)
        ? template.body.split(NOTE_ID_PLACEHOLDER).join(currentNote.id)
        : template.body;

    await joplin.commands.execute("insertText", body);

    const applyTags = await ApplyTagsWhileInsertingSetting.get()
    if (applyTags) {
        for (const tag of template.tags) {
            const tagId = (await getAnyTagWithTitle(tag)).id;
            await applyTagToNote(tagId, currentNote.id);
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

    // Post-process: replace the note_id placeholder with the actual note ID
    if (template.body.includes(NOTE_ID_PLACEHOLDER)) {
        const updatedBody = template.body.split(NOTE_ID_PLACEHOLDER).join(note.id);
        await joplin.data.put(["notes", note.id], null, { body: updatedBody });
    }

    await joplin.commands.execute("openNote", note.id);

    // Focus title bar if the user has enabled the setting
    const focusTitle = await FocusTitleAfterCreateSetting.get();
    if (focusTitle) {
        try {
            await joplin.commands.execute("focusElement", "noteTitle");
        } catch {
            // focusElement may not be available in all Joplin versions — fail silently
        }
    }

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
