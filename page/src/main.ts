import { mount } from 'svelte'
import './app.scss'
import App from './App.svelte'

export type BookmarksType =  {
    type: "link",
    icon: string,
    title: string,
    link: string
} | {
    type: "folder",
    icon: string,
    title: string,
    bookmarks: BookmarksType[]
}
export type BookmarksArray = BookmarksType[]


export const bookmarks:BookmarksArray = [
    { type: "link",
      icon: "y",
      title: "Youtube",
      link: "" },
    { type: "link",
      icon: "g",
      title: "Github",
      link: "" },
    { type: "link",
      icon: "t",
      title: "Twitch",
      link: "" },
    { type: "folder",
      icon: "r",
      title: "Repositories",
      bookmarks: [
        { type: "link",
          icon: "f",
          title: "Finamp",
          link: "" },
        { type: "link",
          icon: "c",
          title: "Copyparty",
          link: "" },
        { type: "folder",
          icon: "r",
          title: "Users",
          bookmarks: [
            { type: "link",
              icon: "F",
              title: "Flloschy",
              link: "" },
            { type: "link",
              icon: "F",
              title: "F4",
              link: "" },
            { type: "link",
              icon: "C",
              title: "Chaphasilor",
              link: "" }
        ]
        }
      ]
    }
]
export let currentBookmarks: BookmarksArray = bookmarks
export function setCurrentBookmarks(overwrite: BookmarksArray) {currentBookmarks = overwrite}
export let parentBookmarks: BookmarksArray[] = []

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
