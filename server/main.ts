import { httpLogger, mainLogger } from "./logger.ts";
mainLogger.info("Validating .env values");

const env_role = Deno.env.get("ROLE");
const env_secret = Deno.env.get("SECRET");
const env_port = Deno.env.get("PORT");
const env_baseurl = Deno.env.get("BASEURL");
const env_name = Deno.env.get("NAME");
const env_loglvl = Deno.env.get("NAME");

function missingMessage(name: string, type: string) {
    mainLogger.error(`Missing ${name}`);
    mainLogger.error(`\\ ${name} needs be a ${type} and cant be empty`);
    mainLogger.error("\\ Make sure the .env is created and setup correctly");
    Deno.exit(1);
}
function invalidMessage(name: string, type: string) {
    mainLogger.error(`Invalid ${name}`);
    mainLogger.error(`\\ ${name} needs be a ${type}\n`);
    mainLogger.error("\\ Make sure the .env is created and setup correctly");
    Deno.exit(1);
}
function unneededMessage(name: string, notUsedIn: string) {
    mainLogger.warning("Unneeded Env");
    mainLogger.warning(
        `\\ ${name} is not used in ${notUsedIn} mode and is not required.`,
    );
}

if (env_role == "server") {
    if (!env_port) {
        missingMessage("PORT", "string");
    }
    const port = parseInt(env_port);
    if (isNaN(port)) {
        invalidMessage("PORT", "number");
    }
    if (env_baseurl) {
        unneededMessage("BASEURL", "server");
    }
} else if (env_role == "node") {
    if (!env_baseurl) {
        missingMessage("BASEURL", "URL");
    }

    try {
        new URL(env_baseurl);
        if (!env_baseurl.endsWith("/")) {
            Deno.env.set("BASEURL", env_baseurl + "/");
        }
    } catch {
        invalidMessage("BASEURL", "URL");
    }

    if (!env_name) {
        missingMessage("NAME", "string");
    }

    if (env_port) {
        unneededMessage("PORT", "node");
    }
} else {
    invalidMessage("ROLE", "server or node");
}

if (!env_secret) {
    missingMessage("SECRET", "string");
}
if (env_secret.length < 8) {
    mainLogger.warning("Unsecure Secret");
    mainLogger.warning(
        `\\ Secret should be a fairly long and random string. Yours is under 8 characters, consider generating a more secure Secret`,
    );
}
if (!env_loglvl) {
    mainLogger.warning("%Missing LOGLVL");
    mainLogger.warning(`\\ No LOGLVL set, defaulting to 0`);
    Deno.env.set("LOGLVL", "0");
} else {
    const lvl = parseInt(Deno.env.get("LOGLVL"));
    if (isNaN(lvl)) {
        mainLogger.warning("%Invalid LOGLVL");
        mainLogger.warning(`\\ LOGLVL is not a valid number. Defaulting to 0`);
        Deno.env.set("LOGLVL", "0");
    } else {
        if (lvl > 5 || lvl < 0) {
            mainLogger.warning("%Invalid LOGLVL");
            mainLogger.warning(`\\ LOGLVL is not 0,1,2,3. Defaulting to 0`);
            Deno.env.set("LOGLVL", "0");
        }
    }
}

export const isServer = env_role == "server";
mainLogger.info(`Running as ${isServer ? "Server" : "Client"}`);
import { clientSocketManager } from "./node.ts";
import { serverHandler } from "./server.ts";

if (isServer) {
    mainLogger.info(`Starting Server`);
    Deno.serve(
        {
            port: parseInt(env_port!),
            onListen: (add) =>
                httpLogger.info(`Server Listening on port ${add.port}`),
        },
        (request, info) => {
            mainLogger.debug(
                `Request received for ${request.url} by ${info.remoteAddr.hostname}`,
            );
            return serverHandler(request);
        },
    );
} else {
    mainLogger.info(`Starting Node`);
    clientSocketManager();
}
