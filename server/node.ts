import { socketLogger } from "./logger.ts";
let socket: WebSocket;

function runCommand(command: string, args?: string[]) {
    const cmd = new Deno.Command(command, {
        args,
    });
    const out = cmd.outputSync().stdout;
    const txt = new TextDecoder().decode(out);
    return txt;
}

function cpuUsage() {
    const raw = Deno.loadavg();

    return {
        min1: raw[0],
        min5: raw[1],
        min15: raw[2],
    };
}

function memUsage() {
    const raw = Deno.systemMemoryInfo();
    raw.total;

    return {
        ram: {
            total: raw.total,
            free: raw.free,
        },
        swap: {
            total: raw.swapTotal,
            free: raw.swapFree,
        },
    };
}

function diskUsage() {
    /**
     * Filesystem          1MB-blocks     Used    Available Use% Mounted on
     * dev                     16310M       0M       16310M   0% /dev
     * run                     16334M       3M       16332M   1% /run
     * efivarfs                    1M       1M           1M  49% /sys/firmware/efi/efivars
     */
    const raw = runCommand("df", ["-BM"]);
    const parsed = raw
        .split("\n")
        .slice(1, -1)
        .map((line) =>
            line
                .split(" ")
                .map((v) => v.trim())
                .filter((v) => v != "")
        )
        .filter((line) => line[0].startsWith("/"))
        .map((line) => [line[5], {
            size: parseInt(line[1].replace("M", "")),
            used: parseInt(line[2].replace("M", "")),
        }]);

    return Object.fromEntries(parsed);
}

function cpuTemp() {
    const raw = runCommand("cat", ["/sys/class/hwmon/hwmon4/temp1_input"]);
    console.log(raw);
    const parsed = parseInt(raw);
    return parsed / 1000;
}

type CustomRequest = {
    type: "system";
};
type CustomResponse = {
    type: "system";
    clientName?: string; // added by server
    uptime: number; // seconds
    cpu: {
        min1: number;
        min5: number;
        min15: number;
        temp: number; // Celsius
    };
    memory: {
        ram: {
            total: number; // Kibibyte
            free: number; // Kibibyte
        };
        swap: {
            total: number; // Kibibyte
            free: number; // Kibibyte
        };
    };
    disk: {
        [mountPoint: string]: {
            total: number; // Mebibyte
            used: number; // Mebibyte
        };
    };
};

export function clientHandle(json: CustomRequest): CustomResponse | undefined {
    if (json.type == "system") {
        return {
            type: "system",
            uptime: Deno.osUptime(),
            cpu: {
                ...cpuUsage(),
                temp: cpuTemp(),
            },
            memory: memUsage(),
            disk: diskUsage(),
        };
    }
}

export function clientSocketManager() {
    const url = Deno.env.get("BASEURL")!;
    const secret = Deno.env.get("SECRET")!;
    const name = Deno.env.get("NAME")!;

    socket = new WebSocket(
        `${url}socketNode?secret=${secret}&nodeName=${name}`,
    );

    socket.addEventListener("close", () => {
        socketLogger.info("Connection Closed. Reconnecting...");
        setTimeout(clientSocketManager, 10000);
    });

    socket.addEventListener("open", () => {
        socketLogger.info("Connection Established");
    });

    socket.addEventListener("message", (event) => {
        if (event.data == "ping") {
            socketLogger.debug(`ping pong`);
            socket.send("pong");
            return;
        }

        const str = typeof event.data == "string";
        if (!str) return socketLogger.debug("Server Message isn't a string");

        const isJson = event.data.startsWith("json:");
        if (!isJson) return socketLogger.debug("Server Message isn't a json");

        const raw = event.data.slice(5);
        const json = JSON.parse(raw);
        const response = clientHandle(json);
        if (!response) {
            return socketLogger.debug(
                "Metrics response was empty. Not responding",
            );
        }
        socketLogger.debug("Sending Metrics back to Server");
        socket.send(`json:${JSON.stringify(response)}`);
    });
}
