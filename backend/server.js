// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');
const data = require('./data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'To-Do Planner API' });
});

// Get todos for user and optional mode
// GET /todos?user=NAME&mode=daily
app.get('/todos', (req, res) => {
  const user = req.query.user;
  const mode = req.query.mode;
  if (!user) return res.status(400).json({ error: 'user query param required' });

  let todos = data.getTodosForUser(user);
  if (mode) todos = todos.filter(t => t.mode === mode);
  res.json({ todos });
});

// Create todo
// body: { user, mode, title, due (string), meta (optional) }
app.post('/todos', (req, res) => {
  const { user, mode, title, due, meta } = req.body;
  if (!user || !mode || !title) return res.status(400).json({ error: 'user, mode, and title required' });

  const todo = {
    id: shortid.generate(),
    user,
    mode,           // 'daily' | 'weekly' | 'monthly'
    title,
    due: due || null,   // for daily/monthly -> date string; for weekly -> weekday like 'Monday'
    meta: meta || null,
    completed: false,
    createdAt: new Date().toISOString()
  };

  data.addTodo(todo);
  res.status(201).json({ todo });
});

// Update todo
// PUT /todos/:id  body: { title?, due?, completed?, meta? }
app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const updated = data.updateTodo(id, updates);
  if (!updated) return res.status(404).json({ error: 'todo not found' });
  res.json({ todo: updated });
});

// Delete todo
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  const ok = data.deleteTodo(id);
  if (!ok) return res.status(404).json({ error: 'todo not found' });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`To-Do Planner API listening on http://localhost:${PORT}`);
});
