import express from "express";
import Database from "better-sqlite3";
const app = express();
const port = process.env.PORT || 3001;
const db = new Database("app.db");
app.set("view engine", "ejs");

app.get("/", (_req, res) => res.type("html").send(html));
app.use(express.urlencoded({ extended: false }));

app.get("/time", (_req, res) => {
    res
        .type("html")
        .send(`<html><body>Server Time: ${new Date().toISOString()}</body></html>`);
});

app.get("/hello/:name", (req, res) => {
    const name = req.params.name;
    res.type("text/plain").send(`Hello, ${name}!`);
});

app.get("/birthday", (req, res) => {
    res.type("text/plain").send("Happy Birthday!");
});
app.get("/birthday/:name", (req, res) => {
    const name = req.params.name;
    res.type("text/plain").send(`Happy Birthday, ${name}!`);
});

//app.use((req, res, next) => {
//    console.log(`${req.method} ${req.url}`);
//    next();
//});
app.use(express.json());

app.get("/items", (_req, res) => {
    try {
        const items = db
            .prepare("SELECT id, name, notes FROM items ORDER BY id")
            .all();
        res.render("items-list", { items: items });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});
app.post("/items/create", (req, res) => {
    console.log(req.body);
    const { name, notes } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).send("Name is required");
    }
    const notesValue = notes ?? "";
    if (typeof notesValue !== "string") {
        return res.status(400).send("Notes must be a string");
    }
    try {
        db.prepare("INSERT INTO items (name, notes) VALUES (?, ?)").run(
            name,
            notesValue,
        );
        res.redirect("/items");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

app.get("/items/update/:id", (req, res) => {
    const id = req.params.id;
    try {
        const item = db
            .prepare("SELECT id, name, notes FROM items WHERE id = ?")
            .get(id);
        if (!item) {
            return res.status(404).send("Item not found");
        }
        res.render("items-update", { item: item });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

app.post("/items/update/:id", (req, res) => {
    const id = req.params.id;
    const { name, notes } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).send("Name is required");
    }
    const notesValue = notes ?? "";
    if (typeof notesValue !== "string") {
        return res.status(400).send("Notes must be a string");
    }
    try {
        const result = db
            .prepare("UPDATE items SET name = ?, notes = ? WHERE id = ?")
            .run(name, notesValue, id);
        if (result.changes === 0) {
            return res.status(404).send("Item not found");
        }
        res.redirect("/items");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

app.get("/items/delete/:id", (req, res) => {
    const id = req.params.id;
    try {
        const result = db.prepare("DELETE FROM items WHERE id = ?").run(id);
        if (result.changes === 0) {
            return res.status(404).send("Item not found");
        }
        res.redirect("/items");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

app.get("/items/create", (req, res) => {
    res.render("items-create");
});

app.post("/api/items", (req, res) => {
    const { name, notes } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "name is required" });
    }
    const notesValue = notes ?? "";
    if (typeof notesValue !== "string") {
        return res.status(400).json({ error: "notes must be a string" });
    }
    try {
        const result = db
            .prepare("INSERT INTO items (name, notes) VALUES (?, ?)")
            .run(name, notesValue);
        res.status(201).json({
            id: result.lastInsertRowid,
            name: name,
            notes: notesValue,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.put("/api/items/:id", (req, res) => {
    const id = req.params.id;
    const { name, notes } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "name is required" });
    }
    const notesValue = notes ?? "";
    if (typeof notesValue !== "string") {
        return res.status(400).json({ error: "notes must be a string" });
    }
    try {
        const result = db
            .prepare("UPDATE items SET name = ?, notes = ? WHERE id = ?")
            .run(name, notesValue, id);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json({ id: Number(id), name: name, notes: notesValue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.delete("/api/items/:id", (req, res) => {
    const id = req.params.id;
    try {
        const result = db.prepare("DELETE FROM items WHERE id = ?").run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/items", (_req, res) => {
    try {
        const items = db
            .prepare("SELECT id, name, notes FROM items ORDER BY id")
            .all();
        res.render("items-list", { items: items });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

app.get("/api/items/:id", (req, res) => {
    const id = req.params.id;
    try {
        const item = db
            .prepare("SELECT id, name, notes FROM items WHERE id = ?")
            .get(id);
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

const server = app.listen(port, () =>
    console.log(`Example app listening on port ${port}!`),
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Christian!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Christian!
    </section>
    <a href="/items">Checkout the database!</a>
  </body>
</html>
`;
