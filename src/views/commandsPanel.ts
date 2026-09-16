import joplin from "api";

export interface CommandButton {
    label: string;
    command: string;
}

export class CommandsPanel {
    private panelHandle: string;
    private commands: CommandButton[];

    private created = false;

    constructor(commands: CommandButton[]) {
        this.panelHandle = "templatesCommandsPanel";
        this.commands = commands;
    }

    public async create(): Promise<void> {
        if (this.created) {
            await joplin.views.panels.show(this.panelHandle, true);
            return;
        }

        try {
            // Create the panel
            this.panelHandle = await joplin.views.panels.create(this.panelHandle);

            // Set up message handler
            await joplin.views.panels.onMessage(this.panelHandle, async (message) => {
                console.log("Received message from webview:", message);
                if (message.type === "executeCommand") {
                    console.log("Executing command:", message.command);
                    try {
                        await joplin.commands.execute("dismissPluginPanels");
                    } catch (error) {
                        // Ignore error
                    }
                    await joplin.commands.execute(message.command);
                }
            });

            // Set the panel HTML
            const html = this.generateHtml();
            await joplin.views.panels.setHtml(this.panelHandle, html);
            await joplin.views.panels.addScript(this.panelHandle, "./views/webview.js");

            // Show the panel
            await joplin.views.panels.show(this.panelHandle, true);
            this.created = true;
        } catch (error) {
            console.error("Error creating commands panel:", error);
            throw error;
        }
    }

    private generateHtml(): string {
        const buttons = this.commands.map(cmd => `
            <button class="template-button" data-command="${cmd.command}">
                ${cmd.label}
            </button>
        `).join("\n");

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        padding: 5px;
                        max-height: 100vh;
                        overflow-y: auto;
                    }
                    .template-button {
                        margin: 5px 0;
                        display: block;
                        width: 100%;
                        background-color: var(--joplin-background-color);
                        color: var(--joplin-color);
                        border-color: rgb(118, 118, 118);
                        border-width: 1px;
                        border-radius: 3px;
                        border-spacing: 5px;
                        border-style: solid;
                        cursor: pointer;
                        font-size: var(--joplin-font-size);
                    }
                    .template-button:hover {
                        background-color: var(--joplin-background-color-hover3);
                    }
                    #debug-info {
                        color: red;
                        font-size: 12px;
                        margin-bottom: 10px;
                        white-space: pre-wrap;
                    }
                </style>
            </head>
            <body>
                ${buttons}
            </body>
            </html>
        `;
    }
}
