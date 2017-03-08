const { expect } = require('chai');
const request = require('supertest');
const { ObjectId } = require('mongoose').Types;

const app = require('../server');
const Todo = require('../models/Todo');

const seedTodos = [
  { _id: new ObjectId(), text: 'First test todo' },
  { _id: new ObjectId(), text: 'Second test todo', completed: true, completedAt: 123 },
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

describe('GET /todos/:id', () => {
  it('should return todo', (done) => {
    request(app)
      .get('/todos/' + seedTodos[0]._id.toHexString())
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(seedTodos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get('/todos/' + new ObjectId().toHexString())
      .expect(404)
      .end(done);
  });

  if('should return 400 if ObjectId invalid', (done) => {
    request(app)
      .get('/todos/123')
      .expect(400)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const id = seedTodos[0]._id.toHexString();

    request(app)
      .delete('/todos/' + id)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).to.equal(id);
      })
      .end((err) => {
        if (err) return done(err);

        Todo.findById(id)
          .then(todo => {
            expect(todo).to.not.exist;
            done();
          });
      });
  });

  it('should return 400 if ObjectId invalid', (done) => {
    request(app)
      .delete('/todos/' + '123abc')
      .expect(400)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete('/todos/' + new ObjectId())
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update todo', (done) => {
    const id = seedTodos[0]._id.toHexString();

    request(app)
      .patch('/todos/' + id)
      .send({ completed: true })
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).to.equal(id);
      })
      .end(err => {
        if (err) return done(err);

        Todo.findById(id)
          .then(todo => {
            expect(todo.completed).to.equal(true);
            expect(todo.completedAt).to.be.a('number');
            done();
          })
          .catch(err => done(err));
      });

  });

  it('should clear completedAt when completed set to false', (done) => {
    const id = seedTodos[1]._id.toHexString();

    request(app)
      .patch('/todos/' + id)
      .send({ completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).to.equal(id);
      })
      .end(err => {
        if (err) return done(err);

        Todo.findById(id)
          .then(todo => {
            expect(todo.completed).to.equal(false);
            expect(todo.completedAt).to.not.exist;
            done();
          })
          .catch(err => done(err));
      });
  });
});