import joplin from "api";
import { fetchAllItems } from "./dataApi";
import { Note } from "./templates";

export interface Folder {
    id: string;
    title: string;
}

type FolderProperty = "id" | "title";

export const getSelectedFolder = async (): Promise<string> => {
    const folder = await joplin.workspace.selectedFolder();
    return folder.id;
}

export const getFolderFromId = async (folderId: string | null): Promise<Folder | null> => {
    if (!folderId) {
        return null;
    }

    try {
        return await joplin.data.get([ "folders", folderId ], { fields: ["id", "title"] });
    } catch (error) {
        console.error("There was an error loading a folder from id", error);
        return null;
    }
}

export const createFolder = async (title: string): Promise<string> => {
    const folder = await joplin.data.post(["folders"], null, { title: title });
    return folder.id;
}

export const getAllNotesInFolder = async (title: string): Promise<Note[]> => {
    return await fetchAllItems(["search"], { query: `notebook:${title}`, fields: ["id", "title", "body"]})
}

export const doesFolderExist = async (folderId: string): Promise<boolean> => {
    try {
        await joplin.data.get([ "folders", folderId ], { fields: ["title"] });
        return true;
    } catch (error) {
        return false;
    }
};

const getAllFolders = async (): Promise<Folder[]> => {
    return (await fetchAllItems(["folders"], { fields: ["id", "title"] })).map(rawFolder => {
        return {
            id: rawFolder.id,
            title: rawFolder.title,
        }
    });
}

export const getUserFolderSelection = async (property?: FolderProperty): Promise<string | null> => {
    const folders = await getAllFolders();
    if (!folders.length) {
        await joplin.views.dialogs.showMessageBox("No notebooks found! Please create a notebook and try again.");
        return null;
    }

    const notebookOptions = folders.map(folder => {
        let optionValue;

        if (!property) {
            optionValue = JSON.stringify(folder);
        } else {
            optionValue = folder[property];
        }

        return {
            label: folder.title,
            value: optionValue
        };
    });

    const { answer } = await joplin.commands.execute("showPrompt", {
        label: "Notebook:",
        inputType: "dropdown",
        value: notebookOptions[0],
        autocomplete: notebookOptions
    });

    if (answer) {
        return answer.value;
    }

    return null;
}
