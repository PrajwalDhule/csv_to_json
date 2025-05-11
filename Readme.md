- Clone the repo and navigate to the appropriate directory:

```cd csv_to_json```

- Install dependencies

```npm install```

- refer to the .env.example file and create a .env file with the required content

```
CSV_FILE_PATH="./csv/user.csv"
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_NAME=your_db_name
DB_PORT=5432
```

- start the server

```npm run dev```

- make a ```POST``` request to ```/csv-to-json``` endpoint (without any body)

<br/>

- The DB will be populated with the csv contents in required format.<br/>
- The Distribution Table will be printed in the console.<br/>
- The Distribution data will be received as the response.
- (the db will be cleared at the start of every request).