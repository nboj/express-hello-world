import Database from "better-sqlite3";
const db = new Database("app.db");
// Create the table if it does not exist.
db.prepare(
  `
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT ""
)
`,
).run();
// Seed the table only if it is empty.
const row = db.prepare("SELECT COUNT(*) AS n FROM items").get();
if (row.n === 0) {
  const insert = db.prepare("INSERT INTO items (name, notes) VALUES (?, ?)");
  insert.run("Widget", "Basic example item");
  insert.run("Gadget", "Another example item");
  insert.run("Thingamajig", "Used for demos");
  console.log("Seeded items table.");
} else {
  console.log("Items table already populated.");
}
db.close();
