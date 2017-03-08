const express = require('express');
const bodyParser = require('body-parser');

require('./db/mongoose');

const Todo = require('./models/Todo');
// const User = require('./models/User');

const app = express();
app.use(bodyParser.json());

// POST /todos
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });
  todo.save()
    .then(doc => res.send(doc))
    .catch(err => res.status(400).send(err));
});

// GET /todos
app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => res.json({ todos }))
    .catch(err => res.status(500).send(err));
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

module.exports = app;