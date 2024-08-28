import Notion from "./utils/Notion.js";
import Tasks from "./utils/Tasks.js";

const notion = new Notion();
const task = new Tasks();

const items = await notion.getItems("Planner");
const tasks = await task.getTasks();

console.log("Google Tasks:")
tasks.forEach((taskList) => {
    console.log(`${taskList.title} (${taskList.id})`);
});

console.log("Notion:")
items.forEach((item) => {
    console.log(`${item.title} (${item.id})`);
});
