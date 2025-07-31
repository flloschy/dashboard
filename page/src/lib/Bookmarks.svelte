<script lang="ts">
    import Dialog from "./Dialog.svelte";
    import Bookmark from "./Bookmark.svelte";
    import { currentBookmarks, parentBookmarks, setCurrentBookmarks, type BookmarksType } from "../main";
    let dialogOpen = false
    let updates = 0
    enum DialogMode {
        link, folder
    }
    let dialogMode:DialogMode = DialogMode.link
    let dialogIcon = ""
    let dialogTitle = ""
    let dialogLink = ""

    function submit() {
        if (dialogIcon == "") return
        if (dialogTitle == "") return
        if (dialogMode == DialogMode.link) {
            if (dialogLink == "") return
            currentBookmarks.push({
                type: "link",
                icon: dialogIcon,
                title: dialogTitle,
                link: dialogLink
            })
            updates++
            close()
        } else if (dialogMode == DialogMode.folder) {
            currentBookmarks.push({
                type: "folder",
                icon: dialogIcon,
                title: dialogTitle,
                bookmarks: []
            })
            updates++
            close()
        }

    }
    function close() {
        dialogOpen = false
        dialogMode = DialogMode.link
        dialogIcon = ""
        dialogTitle = ""
        dialogLink = ""
    }
    function upper() {
        const parent = parentBookmarks.pop()
        if (parent) {
            setCurrentBookmarks(parent)
            updates++
        }
    }
    function deeper(data: BookmarksType) {
        if (data.type == "link") return
        parentBookmarks.push(currentBookmarks)
        setCurrentBookmarks(data.bookmarks)
        updates++
    }
</script>


<div class="bookmarks">
    {#key updates}
        {#if parentBookmarks.length > 0}
            <button on:click={upper}>..</button>
        {/if}

        {#each currentBookmarks as book}
            <Bookmark data={book} deeper={deeper} />
        {/each}
    {/key}
    <button class="add monospace" on:click={()=>dialogOpen = true}>
        +
    </button>
</div>

{#if dialogOpen}
    <Dialog onClose={close}>
        <div class="modeSelectorWrapper">
            <button
                class="modeSelector link"
                class:active={dialogMode==DialogMode.link}
                on:click={()=>dialogMode=DialogMode.link}>
                    Link
            </button>
            <button
                class="modeSelector folder"
                class:active={dialogMode==DialogMode.folder}
                on:click={()=>dialogMode=DialogMode.folder}>
                    Folder
            </button>
        </div>
        <div class="dialogGrid">
            <div>Icon</div>
            <input type="text" placeholder="icon" bind:value={dialogIcon}>
            <div>Title</div>
            <input type="text" placeholder="title" bind:value={dialogTitle}>
            {#if dialogMode==DialogMode.link}
                <div>Url</div>
                <input type="url" placeholder="link" bind:value={dialogLink}>
            {/if}
        </div>
        <button class="ok" on:click={submit}>Ok</button>
    </Dialog>
{/if}


<style lang="scss">
    .dialogGrid {
        margin-top: 2rem;
        display: grid;
        grid-template-columns: min-content 1fr;
    }
    .ok {
        margin-top: 2rem;
        width: 100%;
        padding: 10px;
        border-radius: 999px;
        background-color: rgb(216, 216, 216);
    }

    .modeSelectorWrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
        .modeSelector {
            padding: 10px;
            margin: 0;
            background-color: rgb(143, 143, 143);
            &.active {
                background-color: white;
                border-width: 1px;
                border-color: rgb(143, 143, 143);
                border-style: solid;
            }
            &.folder {
                border-top-right-radius: 7px;
                border-bottom-right-radius: 7px;
            }
            &.link {
                border-top-left-radius: 7px;
                border-bottom-left-radius: 7px;
            }
        }
    }
    .bookmarks {
        display: flex;
        width: 100vw;
        overflow-x: scroll;
        column-gap: 1px;
        scrollbar-width: none;
        justify-content: center;
    }
    .add {
        background-color: white;
        width: 2rem;
        border-radius: 7px;
    }
</style>
