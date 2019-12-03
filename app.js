const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const redis = require("redis");


const app = express();

// Create client

const client = redis.createClient();
client.on('connect', () => {
  console.log("redis server connected")
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const title = "Task list"

  client.lrange('task', 0, -1, (err, reply) => {
    res.render('index', {
      title: title,
      tasks: reply
    })
  })
})

app.listen(3000);
console.log('server started on port 3000');

module.exports = app;
