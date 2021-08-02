import joplin from "api";
import { fetchAllItems } from "./dataApi";
import { Note } from "./templates";

export interface Tag {
    id: string;
    title: string;
}

export const getAllTagsWithTitle = async (title: string): Promise<Tag[]> => {
    return (await fetchAllItems(["search"], { query: title, type: "tag" })).map(tag => {
        return {
            id: tag.id,
            title: tag.title
        }
    });
}

export const getAnyTagWithTitle = async (title: string): Promise<Tag> => {
    const existingTags = await getAllTagsWithTitle(title);
    if (existingTags.length) {
        return existingTags[0];
    }

    const tag = await joplin.data.post(["tags"], null, { title: title });
    return {
        id: tag.id,
        title: tag.title
    };
}

export const getAllNotesWithTag = async (tagId: string): Promise<Note[]> => {
    return fetchAllItems(["tags", tagId, "notes"], { fields: ["id", "title", "body"] });
}

export const applyTagToNote = async (tagId: string, noteId: string): Promise<void> => {
    await joplin.data.post(["tags", tagId, "notes"], null, { id: noteId });
}
