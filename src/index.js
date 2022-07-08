const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User does not exist' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usersAlreadyExists = users.some((user) => user.username === username);

  if (usersAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.use(checksExistsUserAccount);

app.get('/todos', (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === request.params.id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo does not exist' });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.send();
});

app.patch('/todos/:id/done', (request, response) => {
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === request.params.id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo does not exist' });
  }

  todo.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', (request, response) => {
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === request.params.id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo does not exist' });
  }

  user.todos.splice(todo, 1);  

  return response.status(204).send();
});

module.exports = app;