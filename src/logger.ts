import joplin from "api";

const fs = joplin.require("fs-extra");

export class Logger {
    private logsFile: string;

    constructor(profileDir: string) {
        this.logsFile = `${profileDir}/templates-logs.txt`;
    }

    public async log(message: string): Promise<void> {
        await fs.appendFile(this.logsFile, `[${new Date().toISOString()}]\n${message}\n\n\n`);
    }
}
