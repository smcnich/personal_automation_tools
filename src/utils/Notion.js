import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
dotenv.config();
const NOTION_TOKEN = process.env.NOTION_TOKEN;

export default class Notion {

    constructor() {

        // Initializing a client
        this.client = new Client({
            auth: NOTION_TOKEN,
        });

    }

    async getDatabases() {
        const response = await this.client.search({
            filter: {
                value: "database",
                property: "object",
            }
        })

        return response.results;
    }

    async getDatabase(databaseName) {
        const databases = await this.getDatabases();
        const database = databases.find(
            (database) => database.title[0].plain_text === databaseName
        );

        return database;
    }

    async getDatabaseId(databaseName) {
        const database = await this.getDatabase(databaseName);

        return database.id;
    }

    async getItems(databaseName) {
        const databaseId = await this.getDatabaseId(databaseName);
        const response = await this.client.databases.query({
            database_id: databaseId,
        });

        return response.results;
    }

    async insertItem(databaseName, pageProperties) {
        const databaseId = await this.getDatabaseId(databaseName);
        const response = await this.client.pages.create({
            parent: { database_id: databaseId },
            properties: pageProperties
        });

        return response;
    }
}