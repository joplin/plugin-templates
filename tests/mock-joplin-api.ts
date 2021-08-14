export default {
    commands: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (cmd: string, props: unknown): Promise<unknown> => { return ""; }
    },
    views: {
        dialogs: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            showMessageBox: async (message: string): Promise<number> => { return 0; }
        }
    }
};
