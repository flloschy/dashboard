import { clientHandle } from "./node.ts";
import { httpLogger, socketLogger } from "./logger.ts";

const nodes = new Map<string, {
    socket: WebSocket;
}>();
const browsers = new Map<string, {
    socket: WebSocket;
}>();
let connections = 0;

function handleClientSocket(request: Request, url: URL) {
    const nodeName = url.searchParams.get("nodeName");
    if (!nodeName) {
        socketLogger.info("Request didn't include nodeName");
        return new Response(null, { status: 500 });
    }

    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.addEventListener("open", () => {
        if (nodes.keys().find((v) => v == nodeName)) {
            socketLogger.debug(
                `Node Name ${nodeName} already exists, closing old socket`,
            );
            nodes.get(nodeName)?.socket.close();
        }
        socketLogger.info(`Node Connected (${nodeName})`);
        nodes.set(nodeName, {
            socket,
        });
    });

    socket.addEventListener("close", () => {
        socketLogger.info(`Node Disconnected (${nodeName})`);
        nodes.delete(nodeName);
    });

    socket.addEventListener("message", (event) => {
        if (event.data == "ping") {
            socketLogger.debug(`ping ping [${nodeName}]`);
            socket.send("pong");
            return;
        }

        socketLogger.debug(`Node Message received by ${nodeName}`);

        const str = typeof event.data == "string";
        if (!str) return socketLogger.debug("Node Message isn't a string");

        const isJson = event.data.startsWith("json:");
        if (!isJson) return socketLogger.debug("Node Message isn't a json");

        const raw = (event.data + " ").slice(5, -1);
        const json = JSON.parse(raw);
        json["nodeName"] = nodeName;
        const data = JSON.stringify(json);

        socketLogger.info(`Redirecting response to ${browsers.size} Browsers`);
        socketLogger.debug(
            `Redirecting response to ${browsers.size} Browsers with message ${data}`,
        );
        for (const browserSocket of browsers.values()) {
            browserSocket.socket.send(`json:${data}`);
        }
    });

    return response;
}
function handleBrowserSocket(request: Request) {
    const { socket, response } = Deno.upgradeWebSocket(request);
    const id = (connections++).toString();

    socket.addEventListener("open", () => {
        socketLogger.info(`Browser Connected (${id})`);
        browsers.set(id, {
            socket,
        });
    });

    socket.addEventListener("close", () => {
        socketLogger.info(`Browser Disconnected (${id})`);
        nodes.delete(id);
    });

    socket.addEventListener("message", (event) => {
        if (event.data == "ping") {
            socketLogger.debug(`ping pong (${id})`);
            socket.send("pong");
            return;
        }

        socketLogger.debug(`Browser Message received by ${id}`);

        const str = typeof event.data == "string";
        if (!str) return socketLogger.debug("Browser Message isn't a string");

        const isJson = event.data.startsWith("json:");
        if (!isJson) return socketLogger.debug("Browser Message isn't a json");

        socketLogger.info(`Redirecting request to ${nodes.size + 1} Nodes`);
        socketLogger.debug(
            `Redirecting request to ${
                nodes.size + 1
            } Nodes with message ${event.data}`,
        );

        for (const nodeSocket of nodes.values()) {
            nodeSocket.socket.send(event.data);
        }

        const raw = (event.data + " ").slice(5, -1);
        const json = JSON.parse(raw);
        const response = clientHandle(json);
        if (!response) {
            return socketLogger.debug("Server metrics response was empty");
        }
        socketLogger.debug(`Sending server metrics to Browser ${id}`);
        response["nodeName"] = "server";
        socket.send(`json:${JSON.stringify(response)}`);
    });

    return response;
}

export function serverHandler(request: Request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const secret = url.searchParams.get("secret");
    if (secret != Deno.env.get("SECRET")) {
        httpLogger.info("Attempted connection with invalid secret");
        return new Response(null, { status: 401 });
    }

    if (pathname == "/socketNode") return handleClientSocket(request, url);
    if (pathname == "/socketBrowser") return handleBrowserSocket(request);

    httpLogger.info("Requested path does not exists. Returning 404");
    return new Response(null, { status: 404 });
}
