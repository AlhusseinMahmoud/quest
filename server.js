var express = require("express");
var mysql = require("mysql2");
var bodyPaser = require("body-parser");

var app = express();
app.use(express.static('./public'));

app.use(bodyPaser.urlencoded());

var connection = mysql.createConnection({
    user: "root",
    password: "formatshort",
    database: "comp",
    host: "localhost"
});

app.get("/", (req, res) => {
    res.send("hhhhhhhhh");
});

app.get("/comp", (req, res) => {
    connection.query(`SELECT * FROM comps`, (err, rows) => {
        if(err) console.log(err);
        else res.send(rows);
    })
});

app.get("/comp/:id", (req, res) => {
    connection.query(`SELECT * FROM comps WHERE id = ${req.params.id}`, (err, rows) => {
        if(err) console.log(err);
        else res.send(rows);
    }) 
});


app.post("/save", (req, res) => {
    console.log(req.body);
    let {name, phone, type, address} = req.body;
    let sql = `INSERT INTO comps(id, name, phone, type, address) VALUES(null, "${name}", "${phone}", "${type}", "${address}")`
    connection.query(sql, (err, result) => {
        if(err) console.log(err);
        else res.send(result);
    })
    // res.send("recieved...");
});

app.listen(3001, () => console.log("SERVER IS RUNNING..."));