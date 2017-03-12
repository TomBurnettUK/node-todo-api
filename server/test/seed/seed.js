const { ObjectId } = require('mongoose').Types;
const jwt = require('jsonwebtoken');

const Todo = require('../../models/Todo');
const User = require('../../models/User');

const userOneId = new ObjectId();
const userTwoId = new ObjectId();

const seedTodos = [
  { _id: new ObjectId(), text: 'First test todo', _creator: userOneId },
  { _id: new ObjectId(), text: 'Second test todo', completed: true, completedAt: 123, _creator: userTwoId },
];

const seedUsers = [
  { 
    _id: userOneId,
    email: 'userone@test.com',
    password: 'useronepass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
  }, {
    _id: userTwoId,
    email: 'usertwo@test.com',
    password: 'usertwopass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
  }
];

const populateTodos = (done) => {
  Todo.remove({})
    .then(() => Todo.insertMany(seedTodos))
    .then(() => done());
};

const populateUsers = (done) => {
  User.remove({})
    .then(() => {
      const userOne = new User(seedUsers[0]).save();
      const userTwo = new User(seedUsers[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = {
  seedTodos,
  seedUsers,
  populateTodos,
  populateUsers
};