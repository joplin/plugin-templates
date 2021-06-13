import joplin from "api";

export const doesFolderExist = async (folderId: string): Promise<boolean> => {
    try {
        await joplin.data.get([ "folders", folderId ], { fields: ['title'] });
        return true;
    } catch (error) {
        return false;
    }
};
