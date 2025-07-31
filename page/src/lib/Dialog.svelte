<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    export let onClose: ()=>void;

    function fn(e: KeyboardEvent) {
        if (e.key == "Escape") onClose()
    }
    onMount(()=>{
        document.addEventListener("keydown", fn)
    })
    onDestroy(() => {
        document.removeEventListener("keydown", fn)
    })
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="dialog" on:click={onClose}>
    <div class="content" on:click|stopPropagation>
        <slot/>
    </div>
</div>


<style>
    .dialog {
        z-index: 9999;
        position: absolute;
        top: 0;
        right: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
    
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content {
        padding: 20px;
        background-color: white;
        color: black;
        border-radius: 7px;

        width: fit-content;
        height: fit-content;
    }
</style>
