const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'formatshort',
  database: 'quest',
});

// connection.connect();
// connection.end();

app.use('/emp/:id', (req, res) => {
  let empid = req.params.id;
  const sql1 = `SELECT empid FROM data WHERE empid = ?`;
  connection.query(sql1, [empid], function (err, result, fel) {
    if (err) {
      console.log(err);
      res.send(err)
    }
    else {
      if (result.length) {
        res.send("exists");
      }
      else {
        const sql2 = `SELECT * FROM emps WHERE id = '${empid}'`;
        console.log(sql2);
        connection.query(sql2, function (error, results, fields) {
          if (error) throw error;
          console.log('The solution is: ', results[0]);
          res.header("Access-Control-Allow-Origin", "*");
          res.send(results[0]);
        });
      }
    }
  });

});

app.get('/quest', (req, res) => {
  const sql = `SELECT * FROM questions`;
  connection.query(sql, (err, rows, fields) => {
    if (err) console.log(err);
    res.send(rows);
  })
})

app.post("/save", (req, res) => {
  let data = JSON.parse(req.body.all);
  console.log(data);
  // let values = Object.values(data);
  if(!data.sugg) data.sugg = "";
  // const obj = { a: 5, b: 7, c: 9 }
  let values = [];
  let keys = [];
  Object.entries(data).forEach(([key, value]) => {
    // console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
    keys.push(key);
    values.push(value);
  });

  let sql = `INSERT INTO data (${keys.join(',')}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  console.log({ sql, values });

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      res.send("done");
    }
  })
});


app.get("/rows", (req, res) => {
  let sql = `SELECT gdir, count(*) as 'rows' FROM data JOIN emps on emps.id = empid GROUP BY gdir`;
  connection.query(sql, (err, rows) => {
    res.send(rows);
  });
});

app.get("/results", (req, res) => {
  let qs = [];
  for(let i = 1; i < 21; i++) qs.push(`avg(q${i}) as q${i}`);
  let sql = `SELECT ${qs.join(', ')} FROM data`;
  console.log(sql);
  connection.query(sql, (err, rows) => {
    res.send(rows[0]);
  });
});


app.get("/suggs", (req, res) => {
  let sql = `SELECT sugg FROM data WHERE sugg <> ""`;
  connection.query(sql, (err, rows) => {
    res.send(rows);
  });
});

app.listen(3000, () => console.log("server is running..."));