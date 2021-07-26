import joplin from "api";

export interface Note {
    id: string;
    title: string;
    body: string;
}

export interface Folder {
    id: string;
    title: string;
}

export const doesFolderExist = async (folderId: string): Promise<boolean> => {
    try {
        await joplin.data.get([ "folders", folderId ], { fields: ["title"] });
        return true;
    } catch (error) {
        return false;
    }
};

export const getAllNotesInFolder = async (folderId: string): Promise<Note[]> => {
    let pageNum = 1;
    let response;
    let notes = [];

    do {
        response = await joplin.data.get(["folders", folderId, "notes"], { fields: ["id", "title", "body"], page: pageNum });
        notes = notes.concat(response.items);
        pageNum++;
    } while (response.has_more);

    return notes;
}

export const getAllFolders = async (): Promise<Folder[]> => {
    let pageNum = 1;
    let response;
    let folders = [];

    do {
        response = await joplin.data.get(["folders"], { fields: ["id", "title"], page: pageNum });
        folders = folders.concat(response.items);
        pageNum++;
    } while (response.has_more);

    return folders;
}
