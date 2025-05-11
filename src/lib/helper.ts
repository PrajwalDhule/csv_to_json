import { createInterface } from "readline";
import { clearDb, getDistribution, insertUsers } from "../db";
import { User, UserDistribution } from "../types/user";
import { BATCH_SIZE } from "../config";
import fs from 'fs';

export function setNestedObject(header: string, value: string, obj: {[key: string]: any}): void {
    const keys = header.split(".");
    let currentObject = obj;

    keys.forEach((key, i) => {
        if (i === keys.length - 1) {
            currentObject[key] = value;
        }
        else{
            if (!currentObject[key]) {
                currentObject[key] = {};
            }
            currentObject = currentObject[key];
        }
    })
}

export function getUserFromJson(jsonObject: {[key: string]: any}): User {
    const user: User = {
        name: jsonObject.name.firstName + " " + jsonObject.name.lastName,
        age: jsonObject.age,
    }

    if (jsonObject.address) {
        user.address = jsonObject.address;
    }

    const defaultKeys = new Set(["name", "age", "address"]);
    for(const [key, value] of Object.entries(jsonObject)){
        if(!defaultKeys.has(key)){
            if(!user.additional_info) user.additional_info = {};
            user.additional_info[key] = value;
        }
    }

    return user;
}

export async function getDistributionFromCsvFile(filePath: string): Promise<UserDistribution[]> {
    await clearDb();

    let headers: string[] = [];
    let batchUsers: User[] = []; // to process data in batches for performance

    const csvStream = fs.createReadStream(filePath, { encoding: "utf-8" });

    const rl = createInterface({
        input: csvStream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        const jsonObject: {[key: string]: any} = {};

        if (headers.length === 0) {
            headers = line.split(",");
        } else {
            const values = line.split(",");
            headers.forEach((header, index) => {
                setNestedObject(header, values[index], jsonObject);
            });

            const user = getUserFromJson(jsonObject);
            batchUsers.push(user);

            if (batchUsers.length >= BATCH_SIZE) {
                await insertUsers(batchUsers);
                batchUsers = [];
            }
        }

    }

    if(batchUsers.length > 0) {
        await insertUsers(batchUsers);
    }

    return await getDistribution();
}