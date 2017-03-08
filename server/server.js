require('./config/config')

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const mongoose = require('./db/mongoose');

const Todo = require('./models/Todo');
const User = require('./models/User');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

// POST /todos
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });
  todo.save()
    .then(todo => res.json(todo))
    .catch(err => res.status(400).send(err));
});

// GET /todos
app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => res.json({ todos }))
    .catch(err => res.status(500).send(err));
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send();

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      res.json({todo})
    })
    .catch(err => res.status(500).send(err));
});

// PATCH /todos/:id
app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send();

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) return res.status(404).send();
      res.json({ todo });
    })
    .catch(err => res.status(500).send(err));
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send();

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      res.json({todo})
    })
    .catch(err => res.status(500).send(err));
});

// POST /users
app.post('/users', (req, res) => {
  const userInfo = _.pick(req.body, ['email', 'password']);
  const user = new User(userInfo);

  user.save()
    .then(user => user.generateAuthToken())
    .then(token => res.header('x-auth', token).json(user))
    .catch(err => res.status(400).send(err));
});

app.listen(PORT, () => {
  console.log('Server started on port', PORT);
});

module.exports = app;