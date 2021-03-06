const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if (!user) return response.status(400).send({ message: "User not exists" });
  
  request.user = user;
  next();
}

function checkExistisUserTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) return response.status(404).send({ error: "To do not found!" });

  request.todo = todo;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);
  if (userExists) return response.status(400).send({ error: "Username akready exists" })

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistisUserTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistisUserTodo, (request, response) => {
  const { todo } = request;
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistisUserTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo, 1);
  return response.status(204).json({ message: "To do deleted" });
});

module.exports = app;