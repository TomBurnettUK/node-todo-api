const { expect } = require('chai');
const request = require('supertest');
const { ObjectId } = require('mongoose').Types;

const app = require('../server');
const Todo = require('../models/Todo');
const User = require('../models/User');

const { seedTodos, seedUsers, populateTodos, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).to.equal(seedUsers[0]._id.toHexString());
        expect(res.body.email).to.equal(seedUsers[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body._id).to.not.exist;
        expect(res.body.email).to.not.exist;
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'example@example.com';
    const password = 'password123';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).to.exist;
        expect(res.body._id).to.exist;
        expect(res.body.email).to.equal(email);
      })
      .end(err => {
        if (err) return done(err);

        User.findOne({ email })
          .then(user => {
            expect(user).to.exist;
            expect(user.password).to.not.equal(password);
            done();
          })
          .catch(err => done(err));
      })
      
  });

  it('should return error if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({ email: 'invalid', pass: 'x'})
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).to.not.exist;
        expect(res.body._id).to.not.exist;
        expect(res.body.email).to.not.exist;
      })
      .end(done);
  });

  it('should not create user if duplicate email', (done) => {
    request(app)
      .post('/users')
      .send({ email: seedUsers[0].email, password: 'password'})
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).to.not.exist;
        expect(res.body._id).to.not.exist;
        expect(res.body.email).to.not.exist;
      })
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({ email: seedUsers[1].email, password: seedUsers[1].password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).to.exist;
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(seedUsers[1]._id)
          .then(user => {
            expect(user.tokens[0]).to.include({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({ email: seedUsers[1].email, password: 'incorrect' })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).to.not.exist;
      })
      .end((err) => {
        if(err) return done(err);

        User.findById(seedUsers[1]._id)
          .then(user => {
            expect(user.tokens[0]).to.not.exist;
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .end(err => {
        if (err) return done(err);

        User.findById(seedUsers[0]._id)
          .then(user => {
            expect(user.tokens[0]).to.not.exist;
            done();
          })
          .catch(err => done(err));
      })
  });
});