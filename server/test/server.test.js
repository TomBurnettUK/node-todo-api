const { expect } = require('chai');
const request = require('supertest');

const app = require('../server');
const Todo = require('../models/Todo');

const seedTodos = [
  { text: 'First test todo' },
  { text: 'Second test todo' },
];

beforeEach((done) => {
  Todo.remove({})
    .then(() => Todo.insertMany(seedTodos))
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create new todo', (done) => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).to.equal(text);
      })
      .end(err => {
        if (err) return done(err);

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).to.equal(1);
            expect(todos[0].text).to.equal(text);
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should not create todo with invalid text', (done) => {
    request(app)
      .post('/todos')
      .send({ invalid: 'data' })
      .expect(400)
      .end(err => {
        if (err) return done(err);

        Todo.find()
          .then(todos => {
            expect(todos.length).to.equal(2);
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should retrieve all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).to.equal(2);
      })
      .end(done);
  });
});