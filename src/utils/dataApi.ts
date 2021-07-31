import joplin from "api";

// eslint-disable-next-line
export const fetchAllItems = async (path: string[], query: any): Promise<any[]> => {
    let pageNum = 1;
    let response;
    let items = [];

    do {
        response = await joplin.data.get(path, { ...query, page: pageNum });
        items = items.concat(response.items);
        pageNum++;
    } while (response.has_more);

    return items;
}
