<script lang="ts">
    import { onMount } from 'svelte';

    type CustomResponse = {
        type: "system",
        nodeName: string, // added by server
        uptime: number, // seconds
        cpu: {
            min1: number,
            min5: number,
            min15: number,
            temp: number // Celsius
        },
        memory: {
            ram: {
                total: number, // Kibibyte
                free: number // Kibibyte
            },
            swap: {
                total: number, // Kibibyte
                free: number // Kibibyte
            }
        },
        disk: {
            [mountPoint: string]: {
                total: number, // Mebibyte
                used: number // Mebibyte
            }
        }
    }

    let socket:WebSocket|undefined;
    const systemData = new Map<string, CustomResponse>();
    let updated = 0

    function makeSocket() {
        socket = new WebSocket("http://localhost:8000/socketBrowser?secret=hallo")
        socket.addEventListener("open", ()=>{
            console.log("connected")
        })
        socket.addEventListener("message", (event) => {
            const raw = (event.data + " ").slice(5, -1)
            const json = JSON.parse(raw) as CustomResponse
            if (json.type == "system") {
                updated++
                systemData.set(json.nodeName, json)
            }
        })
        socket.addEventListener("close", () => {
            console.log("Connection closed")
            setTimeout(makeSocket, 10000)
        })
    }

    onMount(() => {
        makeSocket()
        setInterval(() => {
            socket?.send("json:"+JSON.stringify({
                type: "system"
            }))
        }, 1000)
    })
</script>

<main>
    {#key updated}
        {#each systemData.entries() as [clientName, json]}
            <div>
                <h1>{clientName}</h1>
                <pre>{JSON.stringify(json, (_, value) => value, 2)}</pre>
            </div>
        {/each}
    {/key}
</main>

<style>
</style>
