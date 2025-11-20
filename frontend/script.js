// frontend/script.js

const API_BASE = 'http://localhost:3000'; // change if your server runs elsewhere

// page elements
const cover = document.getElementById('cover');
const dashboard = document.getElementById('dashboard');
const startBtn = document.getElementById('startBtn');
const nameInput = document.getElementById('nameInput');
const greeting = document.getElementById('greeting');
const logoutBtn = document.getElementById('logoutBtn');
const modeSelect = document.getElementById('modeSelect');
const sections = document.querySelectorAll('.notebook-sections .section');
const taskTitle = document.getElementById('taskTitle');
const addTaskBtn = document.getElementById('addTaskBtn');
const modeSpecificInputs = document.getElementById('modeSpecificInputs');
const tasksContainer = document.getElementById('tasksContainer');

let currentUser = null;
let currentMode = 'daily';

// --- Utilities ---
function showCover() {
  cover.classList.add('visible');
  dashboard.classList.remove('visible');
}
function showDashboard() {
  cover.classList.remove('visible');
  dashboard.classList.add('visible');
  updateGreeting();
}
function updateGreeting() {
  greeting.innerText = `Hello, ${currentUser} 👋`;
}

// persist user locally (session)
function saveUser(name) {
  localStorage.setItem('planner_user', name);
}
function loadUser() {
  return localStorage.getItem('planner_user');
}
function clearUser() {
  localStorage.removeItem('planner_user');
}

// --- start / logout ---
startBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert('Please enter your name');
    return;
  }
  currentUser = name;
  saveUser(name);
  showDashboard();
  loadTasks();
});

logoutBtn.addEventListener('click', () => {
  clearUser();
  currentUser = null;
  nameInput.value = '';
  showCover();
});

// auto-login if user saved
const saved = loadUser();
if (saved) {
  currentUser = saved;
  showDashboard();
  loadTasks();
}

// --- Mode / sections UI ---
function setMode(mode) {
  currentMode = mode;
  modeSelect.value = mode;
  sections.forEach(s => s.classList.toggle('active', s.dataset.mode === mode));
  renderModeInputs(mode);
  loadTasks();
}

sections.forEach(s => {
  s.addEventListener('click', () => {
    setMode(s.dataset.mode);
  });
});

modeSelect.addEventListener('change', (e) => {
  setMode(e.target.value);
});

// render inputs depending on mode
function renderModeInputs(mode) {
  modeSpecificInputs.innerHTML = '';
  if (mode === 'daily') {
    modeSpecificInputs.innerHTML = `<input id="dueInput" type="date" />`;
  } else if (mode === 'weekly') {
    // weekday dropdown
    modeSpecificInputs.innerHTML = `
      <select id="weekdayInput">
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
      </select>`;
  } else if (mode === 'monthly') {
    modeSpecificInputs.innerHTML = `<input id="monthDayInput" type="number" min="1" max="31" placeholder="Day of month (1-31)"/>`;
  }
}
renderModeInputs(currentMode);

// --- CRUD using API ---
// fetch tasks
async function loadTasks() {
  tasksContainer.innerHTML = `<p class="meta">Loading...</p>`;
  if (!currentUser) {
    tasksContainer.innerHTML = `<p class="meta">No user selected.</p>`;
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/todos?user=${encodeURIComponent(currentUser)}&mode=${encodeURIComponent(currentMode)}`);
    const data = await res.json();
    renderTasks(data.todos || []);
  } catch (err) {
    console.error(err);
    tasksContainer.innerHTML = `<p class="meta">Failed to load. Is the backend running?</p>`;
  }
}

// render tasks list
function renderTasks(todos) {
  if (!todos.length) {
    tasksContainer.innerHTML = `<p class="meta">No tasks yet. Add one in the left panel.</p>`;
    return;
  }
  tasksContainer.innerHTML = '';
  todos.forEach(t => {
    const el = document.createElement('div');
    el.className = 'task';
    el.innerHTML = `
      <div class="left">
        <input type="checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}" class="toggle" />
        <div>
          <div class="title">${escapeHtml(t.title)}</div>
          <div class="meta">${t.mode === 'weekly' ? 'Weekday: ' + (t.due || '-') : (t.mode === 'monthly' ? 'Day: ' + (t.due || '-') : 'Date: ' + (t.due || '-'))}</div>
        </div>
      </div>
      <div class="right">
        <button data-id="${t.id}" class="edit btn-ghost">Edit</button>
        <button data-id="${t.id}" class="delete btn-ghost">Delete</button>
      </div>
    `;
    tasksContainer.appendChild(el);
  });

  // attach events
  document.querySelectorAll('.toggle').forEach(cb => {
    cb.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      await toggleTaskComplete(id, e.target.checked);
    });
  });
  document.querySelectorAll('.delete').forEach(b => {
    b.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      if (confirm('Delete this task?')) {
        await deleteTask(id);
      }
    });
  });
  document.querySelectorAll('.edit').forEach(b => {
    b.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const newTitle = prompt('Edit task title:');
      if (newTitle && newTitle.trim()) {
        await updateTask(id, { title: newTitle.trim() });
      }
    });
  });
}

// escape for safety
function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, function(m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]); });
}

// add task
addTaskBtn.addEventListener('click', async () => {
  const title = taskTitle.value.trim();
  if (!title) return alert('Please enter a task title');

  let due = null;
  if (currentMode === 'daily') {
    const el = document.getElementById('dueInput');
    due = el ? el.value : null;
  } else if (currentMode === 'weekly') {
    const el = document.getElementById('weekdayInput');
    due = el ? el.value : null;
  } else if (currentMode === 'monthly') {
    const el = document.getElementById('monthDayInput');
    due = el ? el.value : null;
  }

  try {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser, mode: currentMode, title, due })
    });
    if (!res.ok) throw new Error('Failed to add');
    taskTitle.value = '';
    if (document.getElementById('dueInput')) document.getElementById('dueInput').value = '';
    await loadTasks();
  } catch (err) {
    console.error(err);
    alert('Failed to add task. Is the server running?');
  }
});

// toggle complete
async function toggleTaskComplete(id, completed) {
  try {
    await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    await loadTasks();
  } catch (err) {
    console.error(err);
    alert('Failed to update task');
  }
}

// delete
async function deleteTask(id) {
  try {
    await fetch(`${API_BASE}/todos/${id}`, { method: 'DELETE' });
    await loadTasks();
  } catch (err) {
    console.error(err);
    alert('Failed to delete');
  }
}

// update
async function updateTask(id, updates) {
  try {
    await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    await loadTasks();
  } catch (err) {
    console.error(err);
    alert('Failed to update task');
  }
}

