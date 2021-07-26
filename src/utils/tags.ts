import joplin from "api";
import { Note } from "./folders";

export interface Tag {
    id: string;
    title: string;
}

export const getTagWithTitle = async (title: string): Promise<Tag | null> => {
    const { items } = await joplin.data.get(["search"], { query: title, type: "tag" });

    if (!items.length) {
        return null;
    }

    return {
        id: items[0].id,
        title: items[0].title
    };
}

export const getAllNotesWithTag = async (tagId: string): Promise<Note[]> => {
    let pageNum = 1;
    let response;
    let notes = [];

    do {
        response = await joplin.data.get(["tags", tagId, "notes"], { fields: ["id", "title", "body"], page: pageNum });
        notes = notes.concat(response.items);
        pageNum++;
    } while (response.has_more);

    return notes;
}
