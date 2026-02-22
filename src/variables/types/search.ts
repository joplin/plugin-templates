import { encode } from "html-entities";
import { CustomVariable, InvalidDefinitionError } from "./base";

interface SearchNote {
    id: string;
    title: string;
}

export class SearchCustomVariable extends CustomVariable {
    static definitionName = "search";
    private query: string;
    private notes: SearchNote[] = [];

    constructor(name: string, label: string, query: string = "") {
        super(name, label);
        this.query = query;
    }

    public getQuery(): string {
        return this.query;
    }

    public setNotes(notes: SearchNote[]): void {
        this.notes = notes;
    }

    protected inputHTML(): string {
        // Build a title->id map and a datalist of note titles for native autocomplete
        const titleToId: Record<string, string> = {};
        const options = this.notes.map(note => {
            titleToId[note.title] = note.id;
            return `<option value="${encode(note.title)}">`;
        }).join("\n");

        // Store title->id map as JSON with single-quoted attribute to avoid double-encoding
        const notesMapJson = JSON.stringify(titleToId).replace(/'/g, "&#39;");
        const datalistId = `datalist-${encode(this.name)}`;

        return `
            <div class="search-variable-container">
                <input type="text"
                    class="search-datalist-input"
                    list="${datalistId}"
                    placeholder="Type to search notes..."
                    data-notes-map='${notesMapJson}'
                    data-hidden-id="${encode(this.name)}"
                    autocomplete="off" />
                <input type="hidden"
                    name="${encode(this.name)}"
                    id="${encode(this.name)}"
                    value="" />
                <datalist id="${datalistId}">
                    ${options}
                </datalist>
            </div>
        `;
    }

    static createFromDefinition(name: string, definition: unknown): CustomVariable {
        if (typeof definition === "string" && definition.trim() === this.definitionName) {
            return new this(name, name);
        } else if (typeof definition === "object" && definition !== null) {
            if ("type" in definition && typeof definition["type"] === "string" && definition["type"].trim() === this.definitionName) {
                let label = name;
                if ("label" in definition && typeof definition["label"] === "string") {
                    label = definition["label"].trim();
                }

                let query = "";
                if ("query" in definition && typeof definition["query"] === "string") {
                    query = definition["query"].trim();
                }

                return new this(name, label, query);
            }
        }

        throw new InvalidDefinitionError();
    }
}
