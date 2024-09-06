const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = 8080;

const mfamilyQuery = `
    CREATE TABLE IF NOT EXISTS MonsterFamilies(
        FamilyId SERIAL PRIMARY KEY,
        FamilyName NVARCHAR(255) NOT NULL,
        FamilyDescription NVARCHAR(255) NULL
    );
`;

const monsterQuery = `
    CREATE TABLE IF NOT EXISTS Monsters (
        MonsterId int SERIAL PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Description nvarchar(500) null,
        PowerLevel float null,
        ImageUrl nvarchar(255) null,
        Habitat nvarchar(255) null,
        FamilyId int FOREIGN KEY REFERENCES MonsterFamilies(FamilyId) null,
        IsLegendary bit null,
    );
`;

const userQuery = `
    CREATE TABLE IF NOT EXISTS Users(
        UserId SERIAL PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL,
        DisplayName NVARCHAR(50) NOT NULL
    );
`;

const uMonsterQuery = `
    CREATE TABLE IF NOT EXISTS UserMonsters(
        UserId PRIMARY KEY FOREIGN KEY REFERENCES Users(UserId) NOT NULL,
        MonsterId PRIMARY KEY FOREIGN KEY REFERENCES Monsters(MonsterId) NOT NULL
    );
`;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

app.use(express.json());

async function createTables(query) {
  try {
    // const query = mfamilyQuery;

    await pool.query(query);
    console.log("Table created!");
  } catch (err) {
    console.error(err);
    console.error("Error: couldn't create table");
  }
}

createTables(mfamilyQuery); // try creating query

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
