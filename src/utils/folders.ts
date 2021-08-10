import joplin from "api";

export const getSelectedFolder = async (): Promise<string> => {
    const folder = await joplin.workspace.selectedFolder();
    return folder.id;
}

export const createFolder = async (title: string): Promise<string> => {
    const folder = await joplin.data.post(["folders"], null, { title: title });
    return folder.id;
}
