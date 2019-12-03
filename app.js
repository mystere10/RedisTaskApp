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
    client.hgetall('call', (err, call) => {
      res.render('index', {
        title: title,
        tasks: reply,
        call: call
      })
    })
  })
})

app.post('/task/add', (req, res)=>{
  const task = req.body.task;

  client.lpush('task', task, (err, reply) => {
    if(err){
      console.log(err)
    }else{
      console.log('Task added...')
      res.redirect('/');
    }
  })
})

app.post('/task/delete', (req, res) => {
  const taskToDel = req.body.tasks;

  client.lrange('task', 0, -1, (err, reply) => {
    for(let i=0; i < reply.length; i++){
      if(taskToDel.indexOf(reply[i]) > -1){
        client.lrem('task', 0, reply[i], () => {
          if(err){
            console.log(err)
          }
        })
      }
    }
    res.redirect('/')
  })
})

app.post('/call/add', (req, res)=>{
  const newCall = {};

  newCall.name = req.body.name;
  newCall.company = req.body.company;
  newCall.phone = req.body.phone;
  newCall.time = req.body.time;

  client.hmset('call', ['name', newCall.name, 'company', newCall.company, 'phone', newCall.phone, 'time', newCall.time], (err, reply) => {
    if(err){
      console.log(err);
    }else{
      console.log(reply)
      res.redirect('/')
    }
  })
})

app.listen(3000);
console.log('server started on port 3000');

module.exports = app;
