import { Pool } from 'pg';
import { User, UserDistribution } from './types/user';
import dotenv from 'dotenv';
dotenv.config();

const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;

const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: Number(DB_PORT)
});

export async function initDb(){
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.users (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                age INT NOT NULL,
                address JSONB NULL,
                additional_info JSONB NULL
            );
        `);
        console.log("Connected to Database with table users!");
    }
    catch (err) {
        console.error("Error creating table and setting up db client: ", err);
    }
    finally {
        client.release();
    }
}

export async function insertUsers(users: User[]) {
    const valuePlaceholders = users.map((user, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(", ");
    const valueParams = users.flatMap((user, i) => 
            [user.name, user.age, JSON.stringify(user.address ?? null), JSON.stringify(user.additional_info ?? null)]
        );
    
    await pool.query(`
      INSERT INTO users (name, age, address, additional_info)
      VALUES ${valuePlaceholders};
    `, valueParams);
}

export async function getDistribution() {
    
    const result = await pool.query(`
        SELECT t.age_group, COUNT(*) as "distribution"
        FROM (
                SELECT age,
                    CASE
                        WHEN age <= 20 THEN ' <20 '
                        WHEN age > 20
                        and age <= 40 THEN '20-40'
                        WHEN age > 40
                        and age <= 60 THEN '40-60'
                        ELSE ' >60 '
                    END as age_group
                FROM users
                ORDER BY age ASC
            ) t
        GROUP BY t.age_group
        ORDER BY 
        CASE t.age_group
            WHEN ' <20 ' THEN 1
            WHEN '20-40' THEN 2
            WHEN '40-60' THEN 3
            WHEN ' >60 ' THEN 4
        END;
    `);

    return result.rows as UserDistribution[];
}

export async function clearDb() {
    await pool.query(`
        DELETE FROM users;
    `)

    console.log("Cleared users table");
}