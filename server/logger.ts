// deno-lint-ignore-file no-explicit-any
const loglvl = parseInt(Deno.env.get("LOGLVL"));

class Logger {
    private name: string;
    constructor(name: string) {
        this.name = name;
    }
    private log(lvl: number, ...messages: any[]): void {
        if (lvl < loglvl) return;
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = now.getMonth().toString().padStart(2, "0");
        const day = now.getDate().toString().padStart(2, "0");
        const hour = now.getHours().toString().padStart(2, "0");
        const minute = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        const mills = now.getMilliseconds().toString().slice(0, 5).padEnd(
            5,
            "0",
        );
        const timestamp =
            `${year}/${month}/${day} ${hour}:${minute}:${seconds}.${mills}`;

        const level = [
            { name: "DBG", color: "color: cyan" },
            { name: "INFO", color: "color: white" },
            { name: "WARN", color: "color: yellow" },
            { name: "ERR", color: "color: red" },
        ][lvl];

        console.log(
            `%c[${timestamp}]%c[/${this.name}/${level.name}]`,
            "color: grey",
            level.color,
            ...messages,
        );
    }
    debug(...messages: any[]) {
        this.log(0, ...messages);
    }
    info(...messages: any[]) {
        this.log(1, ...messages);
    }
    warning(...messages: any[]) {
        this.log(2, ...messages);
    }
    error(...messages: any[]) {
        this.log(3, ...messages);
    }
}

export const mainLogger = new Logger("main");
export const httpLogger = new Logger("http");
export const socketLogger = new Logger("socket");
