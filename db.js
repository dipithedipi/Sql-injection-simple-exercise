const sqlite3 = require("sqlite3").verbose();
const filepath = "./users.db";
const fs = require("fs");

function createDbConnection() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
      createTable(db);
      defaultData(db)
    });
    console.log("Connection with new SQLite has been established");
    return db;
  }
}

function createTable(db) {
  db.exec(`
    CREATE TABLE users (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(128) NOT NULL,
      password VARCHAR(128) NOT NULL
    );`
  )
}

function defaultData(db) {
  db.run("INSERT INTO users (username, password) VALUES ('admin', 'HG37bPYyLl')");
  db.run("INSERT INTO users (username, password) VALUES ('user', 'HudKe437t')");
  db.run("INSERT INTO users (username, password) VALUES ('test', 'Lm23A9sDf')");
}


function execQuery(db, query, callback) {
  db.all(query, (error, rows) => {
    if (error) {
      console.error(error.message);
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

module.exports = {
  createDbConnection,
  execQuery
};
