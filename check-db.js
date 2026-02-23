import Database from "better-sqlite3";
const db = new Database("app.db");
const items = db.prepare("SELECT id, name, notes FROM items ORDER BY id").all();
console.log(items);
db.close();
