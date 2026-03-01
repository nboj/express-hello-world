import express from "express";
import Database from "better-sqlite3";
const app = express();
const port = process.env.PORT || 3001;
const db = new Database("app.db");
app.set("view engine", "ejs");

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static("static"));

const server = app.listen(port, () =>
    console.log(`Example app listening on port ${port}!`),
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
app.get("/", (_req, res) => {
    res.type("text/html").send("<html><body>Hello!</body></html>");
});
