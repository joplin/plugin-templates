import joplin from "api";

export class Logger {
    private logsFile: string;
    private platform: string;

    private async initPlatform() {
        const version = await joplin.versionInfo();
        this.platform = version.platform;
    }

    constructor(profileDir: string) {
        this.logsFile = `${profileDir}/templates-logs.txt`;
        this.initPlatform();
    }

    public async log(message: string): Promise<void> {
        if (this.platform === "desktop") {
            const fs = joplin.require("fs-extra");
            await fs.appendFile(this.logsFile, `[${new Date().toISOString()}]\n${message}\n\n\n`);
        } else {
            console.log(`Templates Plugin: ${message}`);
        }
    }
}
