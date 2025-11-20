// backend/data.js
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// initialize file if not exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ todos: [] }, null, 2));
}

function readDB() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeDB(obj) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

function getAllTodos() {
  return readDB().todos;
}

function getTodosForUser(user) {
  const db = readDB();
  return db.todos.filter(t => t.user === user);
}

function getTodos(user, mode) {
  const db = readDB();
  return db.todos.filter(t => t.user === user && t.mode === mode);
}

function addTodo(todo) {
  const db = readDB();
  db.todos.push(todo);
  writeDB(db);
  return todo;
}

function updateTodo(id, updates) {
  const db = readDB();
  const idx = db.todos.findIndex(t => t.id === id);
  if (idx === -1) return null;
  db.todos[idx] = { ...db.todos[idx], ...updates };
  writeDB(db);
  return db.todos[idx];
}

function deleteTodo(id) {
  const db = readDB();
  const initial = db.todos.length;
  db.todos = db.todos.filter(t => t.id !== id);
  writeDB(db);
  return db.todos.length < initial;
}

module.exports = {
  getAllTodos,
  getTodosForUser,
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo
};
