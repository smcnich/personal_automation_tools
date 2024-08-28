import fsp from 'fs/promises';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/tasks.readonly'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
dotenv.config();
const TOKEN_PATH = process.env.GOOGLE_TOKEN;
const CREDENTIALS_PATH = process.env.GOOGLE_CRED;

export default class Tasks {

    /**
     * Reads previously authorized credentials from the save file.
     *
     * @return {Promise<OAuth2Client|null>}
    **/
    async #loadCredentials() {
        try {
            const content = await fsp.readFile(TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        } 
        catch (err) {
            return null;
        }
    }

    /**
     * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
     *
     * @param {OAuth2Client} client
     * @return {Promise<void>}
     */
    async #saveCredentials(client) {
        const content = await fsp.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fsp.writeFile(TOKEN_PATH, payload);
    }

    /**
     * Load or request or authorization to call APIs.
     *
     */
    async #authorize() {
        let client = await this.#loadCredentials();
        if (client) {
            return client;
        }
        client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        if (client.credentials) {
            await this.#saveCredentials(client);
        }
        
        return client;
    }


    async getLists() {

        const data = await this.#authorize().then(async (auth) => {

            const service = google.tasks({version: 'v1', auth});
            const res = await service.tasklists.list();
            
            return res.data.items;

        });

        return data
    }

    async getList(listName) {

        const lists = await this.getLists();
        lists.forEach(list => {
            if (list.title === listName) {
                return list
            }
        })
    }

    async getTasks(taskList, showCompleted = true) {
        /*
        method: Tasks::getTasks

        args:
         taskList (str): The name of the task list to retrieve tasks from.

        returns:
         data (lists): A list of tasks from the specified task list.

        calls:
         Tasks::getLists: Retrieves a list of task lists.
         Tasks::getList: Retrieves a specific task list.
         Tasks::#authorize: Authorizes the application to access the Google Tasks API.
        
        description:
         This method retrieves a list of tasks from the specified task list. 
         If no task list is specified, the first task list in the list of task lists is
        */
        
         // Get the list ID
        let listID;
        if (!taskList) {
            const resp = await this.getLists();
            listID = resp[0].id;
        }
        else {
            const resp = await this.getList(taskList);
            listID = resp.id;
        }
        
        // Get the tasks
        const data = await this.#authorize().then(async (auth) => {

            // Intialize the service and hit the API
            const service = google.tasks({version: 'v1', auth});
            const res = await service.tasks.list({
                tasklist: listID,
                showHidden: showCompleted
            });

            // return the response data from the async function
            return res.data.items;
        });

        // return the response
        return data
    }
    //
    // end of method
}