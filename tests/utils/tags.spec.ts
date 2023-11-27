import joplin from "api";
import * as dataApi from "@templates/utils/dataApi";
import { Note } from "@templates/utils/templates";
import * as tagUtils from "@templates/utils/tags";
import * as mockApiResponse from "../mock-joplin-api-response";


const testExpectedCalls = (mockedFunction: any, expectedCalls: number): void => {
    expect(mockedFunction.mock.calls.length).toBe(expectedCalls);
}

beforeEach(() => {
    jest.clearAllMocks();
});


describe("getAllTagsWithTitle", () => {

    test("should return empty list if title is empty", async () => {
        jest.spyOn(dataApi, "fetchAllItems").mockResolvedValue([]);

        await expect(tagUtils.getAllTagsWithTitle(""))
            .resolves.toHaveLength(0);
        testExpectedCalls(dataApi.fetchAllItems, 0)
    });

    test("should return empty list when no tag found", async () => {
        jest.spyOn(dataApi, "fetchAllItems").mockResolvedValue([]);

        await expect(tagUtils.getAllTagsWithTitle("notexistingtag"))
            .resolves.toHaveLength(0);
        testExpectedCalls(dataApi.fetchAllItems, 1)
    });

    test("should return all matched tags", async () => {
        const tags: tagUtils.Tag[] = [
            {id: "1", title: "tag1"},
            {id: "2", title: "tag22"},
            {id: "3", title: "tag345"}
        ];

        const fetchResponse: mockApiResponse.Tag[] = [];
        for(const tag of tags){
            fetchResponse
                .push(new mockApiResponse.Tag(tag.id, tag.title));
        }

        jest.spyOn(dataApi, "fetchAllItems")
            .mockResolvedValue(fetchResponse);

        await expect(tagUtils.getAllTagsWithTitle("tag*"))
            .resolves.toEqual(tags);
        testExpectedCalls(dataApi.fetchAllItems, 1)
    });
});

describe("getAnyTagWithTitle", () => {
    test("should reject promise if title is empty", async () => {
        jest.spyOn(tagUtils, "getAllTagsWithTitle")
            .mockResolvedValue([]);
        jest.spyOn(joplin.data, "post").mockResolvedValue({});

        await expect(tagUtils.getAnyTagWithTitle(""))
            .rejects.toThrow();
        testExpectedCalls(tagUtils.getAllTagsWithTitle, 0)
        testExpectedCalls(joplin.data.post, 0)
    });

    test("should return first tag if tag[s] exist", async () => {
        const mockTags: tagUtils.Tag[] = [
            { id: "1", title: "existingtag1" },
            { id: "2", title: "existingtag2" },
            { id: "3", title: "existingtag3" }
        ];

        jest.spyOn(tagUtils, "getAllTagsWithTitle")
            .mockResolvedValue(mockTags);
        jest.spyOn(joplin.data, "post").mockResolvedValue({});

        await expect(tagUtils.getAnyTagWithTitle("existingtag*"))
            .resolves.toEqual(mockTags[0]);
        testExpectedCalls(tagUtils.getAllTagsWithTitle, 1);
        testExpectedCalls(joplin.data.post, 0);
    });

    test("should create new tag if tag does not exist", async () => {
        const tagTitle = "unexistingtag";

        jest.spyOn(tagUtils, "getAllTagsWithTitle")
            .mockResolvedValue([]);
        jest.spyOn(joplin.data, "post").mockImplementation(
            async (path: unknown, query?: any, body?: any, files?: any[]): Promise<any> => {
                return new mockApiResponse.Tag("1", body.title);
            }
        );

        await expect(tagUtils.getAnyTagWithTitle(tagTitle))
            .resolves.toHaveProperty("title", tagTitle);
        testExpectedCalls(tagUtils.getAllTagsWithTitle, 1);
        testExpectedCalls(joplin.data.post, 1);
    });
});

describe("getAllNotesWithTag", () => {
    test("should return empty list if title is empty", async () => {
        jest.spyOn(dataApi, "fetchAllItems").mockResolvedValue([]);

        await expect(tagUtils.getAllNotesWithTag(""))
            .resolves.toHaveLength(0);
        testExpectedCalls(dataApi.fetchAllItems, 0);
    });

    test("should return empty list if no note exist", async () => {
        jest.spyOn(dataApi, "fetchAllItems").mockResolvedValue([]);

        await expect(tagUtils.getAllNotesWithTag("sometag"))
            .resolves.toHaveLength(0);
        testExpectedCalls(dataApi.fetchAllItems, 1);
    });

    test("should return all notes with the given tag", async () => {
        const mockNotes: Note[] = [
            {id: "1", title: "C", body: "# Functions\n"},
            {id: "2", title: "Go", body: "# Garbage Collection\n"},
            {id: "3", title: "Python", body: "# Interpreter\n"},
            {id: "4", title: "Java", body: "# OOP\n"}
        ];

        jest.spyOn(dataApi, "fetchAllItems")
            .mockResolvedValue(mockNotes);

        await expect(tagUtils.getAllNotesWithTag("programming"))
            .resolves.toEqual(mockNotes);
        testExpectedCalls(dataApi.fetchAllItems, 1);
    });
});

describe("applyTagToNote", () => {
    test("should reject promise if either or both tag id and note id is empty", async () => {
        jest.spyOn(joplin.data, "post")
            .mockRejectedValue("mocked error");

        await expect(tagUtils.applyTagToNote("", ""))
            .rejects.toThrow();

        await expect(tagUtils.applyTagToNote("45", ""))
            .rejects.toThrow();

        await expect(tagUtils.applyTagToNote("", "87"))
            .rejects.toThrow();

        testExpectedCalls(joplin.data.post, 0);
    });

    test("should call the post api with given arguments", async () => {
        const tagId: string = "54";
        const noteId: string = "23";

        const mockPost = jest.spyOn(joplin.data, "post");
        mockPost.mockResolvedValue({});

        await tagUtils.applyTagToNote(tagId, noteId);

        // TODO: use less stricter equality
        //   with expect.addEqualityTesters or jest-extended matchers
        expect(mockPost).toBeCalledWith(
            ["tags", tagId, "notes"],
            null,
            { id: noteId }
        ); 
    });
});
