<script lang="ts">
    import { type BookmarksType } from "../main";

    export let data: BookmarksType;
    export let deeper: (data: BookmarksType)=>void
</script>


{#if data.type == "folder"}
    <button on:click={()=>deeper(data)}>
        <div class="icon monospace">{data.icon}</div>
        <div class="title">{data.title}</div>
    </button>
{:else}
    <a href="{data.link}" class="reactive">
        <div class="icon monospace">{data.icon}</div>
        <div class="title">{data.title}</div>
    </a>
{/if}


<style>
    a, button {
        display: grid;
        grid-template-columns: auto 1fr;
        width: fit-content;
        padding: 10px;
        background-color: white;
        border-radius: 7px;
        text-decoration: none;
        color: black
    }
    .icon {
        padding: 3px;
        margin-right: 8px;
    }
</style>
