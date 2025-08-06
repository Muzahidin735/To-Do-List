
function getTodos() {
  return JSON.parse(localStorage.getItem('todos') || '[]');
}
function setTodos(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// --- Main State ---
let todos = getTodos();
let currentFilter = 'all'; // 'all', 'active', 'completed'

// ---- DOM References ----
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');

// ---- Render Function ----
function renderTodos() {
  list.innerHTML = '';
  let filtered = todos;
  if (currentFilter === 'active') filtered = todos.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = todos.filter(t => t.completed);

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.innerHTML = `
      <div class="left">
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" />
        <input type="text" class="todo-text" value="${todo.text.replace(/"/g,'&quot;')}" readonly data-id="${todo.id}" />
      </div>
      <div>
        <button class="action-btn edit-btn" data-id="${todo.id}" title="Edit">&#9998;</button>
        <button class="action-btn delete-btn" data-id="${todo.id}" title="Delete">&#10060;</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// ---- Event Handlers ----

// Add new todo
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({
    id: Date.now(),
    text,
    completed: false
  });
  setTodos(todos);
  renderTodos();
  input.value = '';
});

// Checkbox toggle and edit/delete via event delegation
list.addEventListener('click', function(e) {
  const id = e.target.dataset.id;
  if (!id) return;

  // Complete toggle
  if (e.target.classList.contains('todo-checkbox')) {
    todos = todos.map(todo => (
      todo.id == id ? { ...todo, completed: !todo.completed } : todo
    ));
    setTodos(todos);
    renderTodos();
  }

  // Edit
  if (e.target.classList.contains('edit-btn')) {
    const textInput = list.querySelector(`.todo-text[data-id="${id}"]`);
    textInput.removeAttribute('readonly');
    textInput.focus();
    // Move the cursor at the end
    textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
  }

  // Delete
  if (e.target.classList.contains('delete-btn')) {
    todos = todos.filter(todo => todo.id != id);
    setTodos(todos);
    renderTodos();
  }
});

// Save edited todo on blur or Enter key
list.addEventListener('keydown', function(e) {
  if (e.target.classList.contains('todo-text')) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  }
});
list.addEventListener('blur', function(e) {
  if (e.target.classList.contains('todo-text')) {
    const id = e.target.dataset.id;
    const newText = e.target.value.trim();
    if (newText === '') {
      // Remove empty tasks
      todos = todos.filter(todo => todo.id != id);
    } else {
      todos = todos.map(todo => (
        todo.id == id ? { ...todo, text: newText } : todo
      ));
    }
    setTodos(todos);
    renderTodos();
  }
}, true);

// Filter
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// Initial render
renderTodos();
