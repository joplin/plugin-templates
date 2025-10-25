export default {
    commands: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (cmd: string, props: unknown): Promise<unknown> => { return ""; }
    },
    views: {
        dialogs: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            create: async (id: string): Promise<string> => { return id; },
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setHtml: async (handle: string, html: string): Promise<void> => { return; },
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            addScript: async (handle: string, script: string): Promise<void> => { return; },
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setButtons: async (handle: string, buttons: unknown[]): Promise<void> => { return; },
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setFitToContent: async (handle: string, fit: boolean): Promise<void> => { return; },

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            showMessageBox: async (message: string): Promise<number> => { return 0; },

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            open: async (handle: string): Promise<unknown> => { return { id: "ok", formData: {} }; }
        }
    },
    settings: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        globalValue: async (setting: string): Promise<string> => { return ""; },
        value: async (setting: string): Promise<string> => { return ""; }
    },
    versionInfo: async (): Promise<{ platform: string }> => { return { platform: "desktop" }; },
    require: (): unknown => { return ""; }
};
