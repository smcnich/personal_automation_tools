import Notion from "./utils/Notion.js";
import Tasks from "./utils/Tasks.js";

function formatEntry(task) {

    let status;
    if (task.status === "completed") {
        status = {
            type: "status",
            status: {
                color: "green",
                name: "Complete"
            }                
        };
    } else {
        status = {
            type: "status",
            status: {
                color: "default",
                name: "Not Started"
            }                
        }; 
    }

    let description;
    if (task.hasOwnProperty("notes")) {
        description = {
            type: "rich_text",
            rich_text: [{
                type: "text",
                text: {
                    content: task.notes,
                    link: null
                }
            }]
        };
    } else {
        description = {
            type: "rich_text",
            rich_text: []
        }
    }

    let deadline;
    if (task.hasOwnProperty("due")) {
        deadline = {
            type: "date",
            date: {
                start: task.due,
                end: null,
                time_zone: null
            }
        };
    } else {
        deadline = {
            type: "date",
            date: null
        };
    }

    return {
        Deadline: deadline,
        Group: {
            type: "select",
            select: {
                name: "Personal",
                color: "blue"
            }
        },
        Name: {
            type: "title",
            title: [{
                type: "text",
                href: null,
                plain_text: task.title,
                text: {
                    content: task.title,
                    link: null
                }
            }]
        },
        Status: status,
        Description: description
    };
}

const notion = new Notion();
const task = new Tasks();

const items = await notion.getItems("Planner");
const tasks = await task.getTasks();

tasks.forEach((task) => {

    if (!items.some((item) => item.properties.Name.title[0].text.content === task.title)) {
        notion.insertItem("Planner", formatEntry(task));
    }

    // // if the task name occurs in the list of notion item names
    // if (items.some((item) => item.properties.Name.title[0].text.content === task.title)) {
    //     console.log(`${task.title} (${task.id})`);
    // }
});
