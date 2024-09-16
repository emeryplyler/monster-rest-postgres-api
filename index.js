const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = 8080;

const mfamilyQuery = `
    CREATE TABLE IF NOT EXISTS MonsterFamilies(
        FamilyId SERIAL PRIMARY KEY,
        FamilyName VARCHAR(255) NOT NULL,
        FamilyDescription VARCHAR(255) NULL
    );
`;

const monsterQuery = `
    CREATE TABLE IF NOT EXISTS Monsters (
        MonsterId int SERIAL PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Description VARCHAR(500) null,
        PowerLevel float null,
        ImageUrl VARCHAR(255) null,
        Habitat VARCHAR(255) null,
        FamilyId int FOREIGN KEY REFERENCES MonsterFamilies(FamilyId) null,
        IsLegendary bit null,
    );
`;

const userQuery = `
    CREATE TABLE IF NOT EXISTS Users(
        UserId SERIAL PRIMARY KEY,
        Username VARCHAR(50) NOT NULL,
        DisplayName VARCHAR(50) NOT NULL
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
    console.log("Table is ready");
  } catch (err) {
    console.error(err);
    console.error("Couldn't create table");
  }
}

createTables(mfamilyQuery); // make sure family table exists

app.get("/", (req, res) => {
  res.send("Monster API v1.1");
});

// Monster Family Methods:

app.get("/monsterfamilies", async (req, res) => {
  try {
    const query = "SELECT * FROM monsterFamilies;";
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get failed");
  }
});

app.get("/monsterfamilies/:familyId", async (req, res) => {
  try {
    const { familyId } = req.params;
    const query = `SELECT * FROM MonsterFamilies WHERE familyId = $1;`;
    const { rows } = await pool.query(query, [familyId]);

    if (rows.length == 0) {
      return res.status(404).send("Family not found in the database");
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get failed");
  }
});

app.post("/monsterfamilies", async (req, res) => {
  // validate
  const { name, desc } = req.body;
  console.log(req.body);
  if (!name) {
    return res.status(400).send("Name required");
  }

  try {
    const query = `
      INSERT INTO MonsterFamilies (FamilyName, FamilyDescription)
      VALUES ($1, $2)
      RETURNING FamilyId;
    `;
    const values = [name, desc];
    const result = await pool.query(query, values);
    res
      .status(201)
      .send({ message: "New family created", familyId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Unable to enter data into family table");
  }
});

app.put("/monsterfamilies/:familyId", async (req, res) => {
  try {
    const { familyId } = req.params;
    const { name, desc } = req.body;

    if (!name) {
      return res.status(400).send("Name required");
    }

    const query = `
      UPDATE MonsterFamilies
      SET FamilyName = COALESCE($1, FamilyName),
          FamilyDescription = COALESCE($2, FamilyDescription)
      WHERE FamilyId = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, desc, familyId]);

    if (rows.length == 0) {
      return res.status(404).send("Couldn't find a family with that id");
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Put failed");
  }
});

app.delete("/monsterfamilies/:familyId", async (req, res) => {
  try {
    const { familyId } = req.params;
    const query =
      "DELETE FROM MonsterFamilies WHERE FamilyId = $1 RETURNING *;";
    const { rows } = await pool.query(query, [familyId]);

    if (rows.length == 0) {
      return res.status(404).send("Couldn't find a family with that id");
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
