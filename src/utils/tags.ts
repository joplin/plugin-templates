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

export const getAllNotesWithTag = async (tagId: string): Promise<Note[]> => {
    return fetchAllItems(["tags", tagId, "notes"], { fields: ["id", "title", "body"] });
}
