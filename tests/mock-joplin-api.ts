import { Path } from "api/types";

export default {
    commands: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (cmd: string, props: unknown): Promise<unknown> => { return ""; }
    },
    data: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        get: async (path: Path, query?: unknown): Promise<unknown> => { return { items: [], has_more: false }; }
    },
    views: {
        dialogs: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            showMessageBox: async (message: string): Promise<number> => { return 0; },

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            open: async (handle: string): Promise<unknown> => { return ""; }
        }
    },
    settings: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        globalValue: async (setting: string): Promise<string> => { return ""; },
        value: async (setting: string): Promise<string> => { return ""; }
    },
    require: (): unknown => { return ""; }
};
