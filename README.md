# DIRCT - Dashboard (with) Integrated Realtime Client Telemetry
> I would like the DIRECT name but idk what to use for the e :(

A single webpage you can use as your browser's blank page, its not only a standalone dashboard
but it also displays information from your server and an arbitrary amount of other nodes.

## Terminologies
Ui = the Frontend, the Dashboard, the browser 

Server = Is a proxy of sorts and handles communication between Ui and Nodes

Node = Nodes are telemetry gatherer from who'm the Ui will display telemetry

### How

The Page itself is a Svelte (not SvelteKit) project since I really like the framework and its reactivity makes creating dynamic sites super straight forwards. Using a vite plugin the project then gets compiled into a single vanilla HTML file to make using it easier.

Once the Webpage is opened it runs an interval to request fresh data from the server (via. websocket), the server then requests all connected nodes (via. websocket) and forwards their response back to the browser.

### Configuration
The server+node (bundled in one) script uses a .env file to determine its behavior
| value name | required         | Accepted Values     | Description |
|:----------:|:-----------------|:--------------------|:------------|
| ROLE       | always           | "server" and "node" | Determines if the system should run as a Server or a Node
| SECRET     | always           | any string          | A Password to make sure only allowed clients and servers will be able to connect
| PORT       | when ROLE=server | number              | The port on which the server runs
| NAME       | when ROLE=client | any string          | The name of the Client so the Ui can differentiate between telemetry data
| BASEURL    | when ROLE=client | URL                 | The url on which the server is reachable 
| LOGLVL     | no               | 0,1,2,3             | Which logs to log and which not to log. 0=debug 1=info 2=warning 3=error

### Compatibility
Idk, works on my linux, very likely not on windows (at least not fully). Just use Linux honestly

# Development

`./server`
- running: `Deno run -A --env-file=.env main.ts`
    - `-A` = automatically allow every permission (env, network, etc. permission)
    - `--env-file=.env` = Deno doesn't automatically load .env files, so we let it know where it is
    - `main.ts` = da spice
- formatting: `Deno fmt --indent-width 4`

`./page`
- running: `npm run dev`
- compiling: `npm run build`
    - The compiled output file will end up in /dist

`-/setup.sh`
- just make it easier

`./compile.sh`
- This script in the future should spit out a standalone html file and two standalone files for server and nodes
