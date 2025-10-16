import { addBook, deleteBook, getBooks } from './state.js';
import { loadSeed, importBooks, exportBooks } from './storage.js';
import { totalBooks, totalPages, topTag, recentBook } from './stats.js';
import { searchBooks } from './search.js';
import { validateBook } from './validators.js';
import { loadNotes, addNote, deleteNote, updateNote } from './notes.js';

document.addEventListener('DOMContentLoaded', async () => {
  // DOM references
  const tbody = document.getElementById('books-tbody');
  const form = document.getElementById('book-form');
  const search = document.getElementById('search-bar');
  const themeSelect = document.getElementById('theme-select');
  const chartCanvas = document.getElementById('booksGraph');
  const importBtn = document.getElementById('import-json');
  const exportBtn = document.getElementById('export-json');
  const navButtons = document.querySelectorAll('.sidebar-nav [data-nav]');
  const cancelBtn = document.getElementById('cancel-btn');
  // Notes DOM
  const notesList = document.getElementById('notes-list');
  const notesSearch = document.getElementById('notes-search');
  const addNoteBtn = document.getElementById('add-note-btn');
  const noteEditor = document.getElementById('note-editor');
  const noteTitle = document.getElementById('note-title');
  const noteBody = document.getElementById('note-body');
  const saveNoteBtn = document.getElementById('save-note');
  const cancelNoteBtn = document.getElementById('cancel-note');
  let editingNoteId = null;

  // Stats DOM
  const totalBooksEl = document.getElementById('total-books');
  const totalPagesEl = document.getElementById('total-pages');
  const topTagEl = document.getElementById('top-tag');
  const recentEl = document.getElementById('recent');
  // weekly goal DOM
  const weeklyGoalInput = document.getElementById('weekly-goal-input');
  const setWeeklyGoalBtn = document.getElementById('set-weekly-goal');
  const clearWeeklyGoalBtn = document.getElementById('clear-weekly-goal');
  const weeklyGoalValue = document.getElementById('weekly-goal-value');
  const weeklyProgressBar = document.getElementById('weekly-progress-bar');
  const weeklyProgressText = document.getElementById('weekly-progress-text');

  // key for storing weekly goal in localStorage
  const WEEKLY_GOAL_KEY = 'bv_weekly_goal_v1';

  await loadSeed();
  renderLibrary();
  updateStats();
  renderChart();
  renderNotes();
  renderWeeklyGoal();

  // Navigation / view switching
  function normalizeKey(s) { return String(s || '').trim().toLowerCase(); }

  function findPageKey(name) {
    const key = normalizeKey(name);
    const pages = Array.from(document.querySelectorAll('.page'));
    // try direct id match
    let match = pages.find(p => normalizeKey(p.id) === key);
    if (match) return normalizeKey(match.id);
    // try data-page attribute
    match = pages.find(p => normalizeKey(p.getAttribute('data-page')) === key);
    if (match) return normalizeKey(match.id);
    // try matching by heading text inside page (h2)
    match = pages.find(p => {
      const h = p.querySelector('h2');
      return h && normalizeKey(h.textContent) === key;
    });
    if (match) return normalizeKey(match.id);
    return null;
  }

  function switchPage(name) {
    if (!name) return;
    const requestedKey = normalizeKey(name);
    const pageKey = findPageKey(requestedKey);
    if (!pageKey) {
      console.warn('No matching page found for', name);
      return;
    }
    const pages = document.querySelectorAll('.page');
    if (!pages || !pages.length) { console.warn('No .page elements found'); return; }
    pages.forEach(p => p.classList.toggle('active', normalizeKey(p.id) === pageKey));
    // nav buttons (data-nav) - guard missing dataset
    if (navButtons && navButtons.length) {
      navButtons.forEach(b => {
        const btnKey = normalizeKey((b.dataset && b.dataset.nav) || b.textContent);
        const isActive = btnKey === pageKey;
        b.classList.toggle('active', isActive);
        if (isActive) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      });
    }

    // when showing certain pages, refresh data BEFORE scrolling so content is present
    if (name === 'dashboard') {
      renderChart();
      updateStats();
    }
    if (name === 'library') renderLibrary();
    if (name === 'notes') renderNotes();

    // ensure the viewport shows the top of the newly activated page (scroll the page element)
    try {
      const activeEl = document.getElementById(pageKey) || document.querySelector('.page.active');
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        // use instant scroll to avoid animated jumps which interact with layout reflow
        activeEl.scrollIntoView({ block: 'start', behavior: 'auto' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    } catch (e) { window.scrollTo(0,0); }
  }

  // Attach click handlers to nav buttons
  if (navButtons && navButtons.length) {
    navButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        // support anchors and buttons
        try { e.preventDefault(); } catch (err) {}
        const target = String(e.currentTarget.dataset.nav || (e.currentTarget.getAttribute('href') || '')).replace(/^#/, '').toLowerCase();
        if (!target) return;
        switchPage(target);
        try { history.replaceState(null, '', '#' + target); } catch (err) { /* ignore */ }
      });
    });
  } else {
    console.warn('No navigation elements found with [data-nav]');
  }

  // Extra: event delegation on sidebar nav to catch any button clicks (more robust)
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    sidebarNav.addEventListener('click', e => {
      const el = e.target.closest('[data-nav]');
      if (!el) return;
      try { e.preventDefault(); } catch (err) {}
      const raw = el.dataset.nav || el.getAttribute('href') || el.textContent;
      const key = String(raw || '').replace(/^#/, '').trim().toLowerCase();
      if (!key) return;
      switchPage(key);
      try { history.replaceState(null, '', '#' + key); } catch (err) { /* ignore */ }
    });
  }

  // Cancel button on add-new: go back to dashboard
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => switchPage('dashboard'));
  }

  // initial route: use hash if provided, else leave default (dashboard)
  (function initRoute(){
    const hash = (location.hash || '').replace(/^#/, '').toLowerCase();
    if (hash) switchPage(hash);
  })();

  // Notes handlers
  function renderNotes(filter = '') {
    const notes = loadNotes();
    const list = notes.filter(n => (n.title + '\n' + n.body).toLowerCase().includes(filter.toLowerCase()));
    notesList.innerHTML = '';
    if (!list.length) {
      notesList.innerHTML = '<div>No notes</div>';
      return;
    }
    list.forEach(n => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.innerHTML = `
        <h4>${n.title || 'Untitled'}</h4>
        <div class="note-body-preview">${(n.body || '').slice(0,200).replace(/\n/g,'<br>')}</div>
        <div class="note-actions">
          <button data-edit="${n.id}">Edit</button>
          <button data-delete="${n.id}">Delete</button>
        </div>
      `;
      notesList.appendChild(card);
    });
  }

  notesList && notesList.addEventListener('click', e => {
    const del = e.target.closest('[data-delete]');
    if (del) {
      deleteNote(del.dataset.delete);
      renderNotes(notesSearch.value || '');
      return;
    }
    const ed = e.target.closest('[data-edit]');
    if (ed) {
      const notes = loadNotes();
      const note = notes.find(n => n.id === ed.dataset.edit);
      if (!note) return;
      editingNoteId = note.id;
      noteTitle.value = note.title;
      noteBody.value = note.body;
      noteEditor.style.display = '';
      return;
    }
  });

  addNoteBtn && addNoteBtn.addEventListener('click', () => {
    editingNoteId = null;
    noteTitle.value = '';
    noteBody.value = '';
    noteEditor.style.display = '';
  });

  saveNoteBtn && saveNoteBtn.addEventListener('click', () => {
    const payload = { title: noteTitle.value.trim(), body: noteBody.value.trim(), updatedAt: new Date().toISOString() };
    if (editingNoteId) {
      updateNote({ ...payload, id: editingNoteId });
    } else {
      addNote(payload);
    }
    noteEditor.style.display = 'none';
    renderNotes(notesSearch.value || '');
  });

  cancelNoteBtn && cancelNoteBtn.addEventListener('click', () => {
    noteEditor.style.display = 'none';
  });

  notesSearch && notesSearch.addEventListener('input', e => renderNotes(e.target.value));

  // Add Book
  form.addEventListener('submit', e => {
    e.preventDefault();
    const book = {
      title: document.getElementById('title-input').value.trim(),
      author: document.getElementById('author').value.trim(),
      pages: Number(document.getElementById('pages').value),
      tag: document.getElementById('tag').value.trim(),
      date: document.getElementById('date-added').value
    };
    if (!validateBook(book)) return alert('Please fill all fields properly.');
    addBook(book);
    form.reset();
    renderLibrary();
    updateStats();
    renderChart();
  });

  // Delete (event delegation)
  tbody.addEventListener('click', e => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;
    deleteBook(Number(btn.dataset.index));
    renderLibrary();
    updateStats();
    renderChart();
  });

  // Search
  search.addEventListener('input', e => {
    const results = searchBooks(e.target.value);
    renderLibrary(results);
  });

  // Import
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = ev => {
      const file = ev.target.files[0];
      importBooks(file, ok => {
        if (ok) {
          renderLibrary();
          updateStats();
          renderChart();
        } else alert('Invalid JSON file.');
      });
    };
    input.click();
  });

  // Export
  exportBtn.addEventListener('click', exportBooks);

  // Theme
  themeSelect.addEventListener('change', e => {
    const theme = e.target.value;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
  applySavedTheme();

  // diagnostics removed for production UI

  // -------- Helper functions --------
  function renderLibrary(list = getBooks()) {
    tbody.innerHTML = '';
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No books</td></tr>';
      return;
    }
    list.forEach((b, i) => {
      const tr = document.createElement('tr');
      const displayDate = b.date || b.dateAdded || (b.createdAt ? String(b.createdAt).split('T')[0] : '');
      tr.innerHTML = `
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.pages}</td>
        <td>${b.tag}</td>
        <td>${displayDate}</td>
        <td><button class="delete-btn" data-index="${i}">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function updateStats() {
    totalBooksEl.textContent = totalBooks();
    totalPagesEl.textContent = totalPages();
    topTagEl.textContent = topTag();
    recentEl.textContent = recentBook();
    // also refresh weekly goal progress whenever stats update
    renderWeeklyGoal();
  }

  // Weekly goal: persistent and computed from book dates

  function getWeeklyGoal() {
    const raw = localStorage.getItem(WEEKLY_GOAL_KEY);
    return raw ? Number(raw) : 0;
  }

  function setWeeklyGoal(value) {
    localStorage.setItem(WEEKLY_GOAL_KEY, String(value));
  }

  function clearWeeklyGoal() {
    localStorage.removeItem(WEEKLY_GOAL_KEY);
  }

  function pagesThisWeek() {
    const books = getBooks();
    const now = new Date();
    // get Monday of current week
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return books.reduce((sum, b) => {
      const d = new Date(b.date || b.dateAdded || (b.createdAt ? String(b.createdAt).split('T')[0] : null));
      if (isNaN(d)) return sum;
      if (d >= weekStart && d < weekEnd) return sum + (Number(b.pages) || 0);
      return sum;
    }, 0);
  }

  function renderWeeklyGoal() {
    const goal = getWeeklyGoal() || 0;
    weeklyGoalValue.textContent = goal;
    const pages = pagesThisWeek();
    if (!goal) {
      weeklyProgressBar.style.width = '0%';
      weeklyProgressText.textContent = 'No goal set';
      return;
    }
    const pct = Math.min(100, Math.round((pages / goal) * 100));
    weeklyProgressBar.style.width = pct + '%';
    weeklyProgressText.textContent = `${pages} / ${goal} pages (${pct}%) this week`;
  }

  setWeeklyGoalBtn && setWeeklyGoalBtn.addEventListener('click', () => {
    const v = Number(weeklyGoalInput.value || 0);
    if (isNaN(v) || v < 0) return alert('Enter a valid number');
    setWeeklyGoal(v);
    renderWeeklyGoal();
  });

  clearWeeklyGoalBtn && clearWeeklyGoalBtn.addEventListener('click', () => {
    clearWeeklyGoal();
    weeklyGoalInput.value = '';
    renderWeeklyGoal();
  });

  function renderChart() {
    const ctx = chartCanvas.getContext('2d');
    const books = getBooks().filter(b => b.date);

    // helper to format date as YYYY-MM-DD (stable key)
    const formatISO = d => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    // count books per day (using ISO date string keys)
    const dateCount = {};
    books.forEach(b => {
      const dt = new Date(b.date);
      if (isNaN(dt)) return; // skip invalid dates
      const key = formatISO(dt);
      dateCount[key] = (dateCount[key] || 0) + 1;
    });

    // if no valid dated books, show an empty chart for the recent 14 days instead
    const keys = Object.keys(dateCount).sort();
    let minDate, maxDate;
    if (!keys.length) {
      maxDate = new Date();
      minDate = new Date();
      minDate.setDate(minDate.getDate() - 13); // 14-day window
      // fill dateCount with zeros so the chart draws empty axes
      for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        dateCount[formatISO(new Date(d))] = 0;
      }
    } else {
      // build full date range from min to max and fill missing days with 0
      minDate = new Date(keys[0]);
      maxDate = new Date(keys[keys.length - 1]);
    }

    // choose aggregation based on span to avoid crowded x-axis
    const daySpan = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
    let aggregate = 'daily';
    if (daySpan > 120) aggregate = 'monthly'; // long span -> monthly
    else if (daySpan > 30) aggregate = 'weekly'; // medium span -> weekly

    const labels = [];
    const values = [];

    if (aggregate === 'daily') {
      for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        const key = formatISO(new Date(d));
        labels.push(key);
        values.push(dateCount[key] || 0);
      }
    } else if (aggregate === 'weekly') {
      // group by ISO week (YYYY-Www)
      const weekCount = {};
      const weekLabels = [];
      for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        const dt = new Date(d);
        // get week start (Monday)
        const day = dt.getDay();
        const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(dt.setDate(diff));
        const key = formatISO(weekStart);
        weekCount[key] = (weekCount[key] || 0) + (dateCount[formatISO(new Date(d))] || 0);
        if (!weekLabels.length || weekLabels[weekLabels.length - 1] !== key) weekLabels.push(key);
      }
      weekLabels.forEach(k => {
        labels.push(k);
        values.push(weekCount[k] || 0);
      });
    } else {
      // monthly
      const monthCount = {};
      const monthLabels = [];
      for (let d = new Date(minDate); d <= maxDate; d.setMonth(d.getMonth() + 1)) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthLabels.push(key);
      }
      // ensure we count all days into months
      Object.keys(dateCount).forEach(k => {
        const [y, m] = k.split('-');
        const key = `${y}-${m}`;
        monthCount[key] = (monthCount[key] || 0) + dateCount[k];
      });
      monthLabels.forEach(k => {
        labels.push(k);
        values.push(monthCount[k] || 0);
      });
    }

    const daily = values;
    // cumulative counts for better trend visibility (based on aggregated values)
    const cumulative = [];
    daily.reduce((acc, cur, i) => (cumulative[i] = acc + cur, acc + cur), 0);

    if (window.booksChart) window.booksChart.destroy();
    window.booksChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily Books Added',
            data: daily,
            borderColor: '#3e95cd',
            backgroundColor: 'rgba(62,149,205,0.15)',
            fill: true,
            tension: 0.25,
            pointRadius: 3
          },
          {
            label: 'Cumulative Total',
            data: cumulative,
            borderColor: '#8e5ea2',
            backgroundColor: 'rgba(142,94,162,0.05)',
            fill: false,
            tension: 0.25,
            pointRadius: 0,
            borderDash: [6, 4]
          }
        ],
        // optionally add a simple 3-point moving average to highlight trend
        
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Books Added Over Time',
            font: { size: 16 }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top'
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              // reduce ticks further for aggregated views
              maxTicksLimit: aggregate === 'daily' ? 12 : 8
            }
          },
          y: {
            title: {
              display: true,
              text: 'Books'
            },
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  function applySavedTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    themeSelect.value = saved;
  }

  // Ensure the <aside class="sidebar"> is in the expected place and add a mobile toggle
  (function ensureSidebarPlacement(){
    try {
      const aside = document.querySelector('aside.sidebar');
      const main = document.getElementById('main-content');
      if (!aside) return;

      // If aside is not the previous sibling of main, move it so layout styles expecting that order work
      if (main && aside.nextElementSibling !== main) {
        main.parentNode.insertBefore(aside, main);
      }

      // Add accessibility attributes
      aside.setAttribute('role', 'complementary');
      aside.setAttribute('aria-label', aside.querySelector('.sidebar-title')?.textContent?.trim() || 'Sidebar');

      // Create a simple mobile toggle if not present
      if (!document.querySelector('.sidebar-toggle')) {
        const toggle = document.createElement('button');
        toggle.className = 'sidebar-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-controls', aside.id || '');
        toggle.title = 'Toggle sidebar';
        toggle.textContent = '☰';
        // insert toggle before main so it's visually near top-left on narrow screens
        if (main) main.parentNode.insertBefore(toggle, main);

        // create overlay (used on small screens) if not present
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'sidebar-overlay';
          document.body.appendChild(overlay);
        }

        // Wire up toggle behavior
        toggle.addEventListener('click', () => {
          // toggle collapsed state
          aside.classList.toggle('collapsed');
          const expanded = !aside.classList.contains('collapsed');
          // reflect open state with an explicit class and aria
          aside.classList.toggle('open', expanded);
          toggle.setAttribute('aria-expanded', String(expanded));
          // lock page scroll while sidebar is open (mobile)
          document.body.classList.toggle('sidebar-open', expanded);
          // persist state
          localStorage.setItem('bv_sidebar_open', String(expanded));
        });

        // clicking overlay closes the sidebar
        overlay.addEventListener('click', () => {
          aside.classList.add('collapsed');
          aside.classList.remove('open');
          const togg = document.querySelector('.sidebar-toggle');
          if (togg) togg.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('sidebar-open');
          localStorage.setItem('bv_sidebar_open', 'false');
        });

        // close on Escape key when sidebar is open
        document.addEventListener('keydown', (ev) => {
          if (ev.key === 'Escape' && !aside.classList.contains('collapsed')) {
            aside.classList.add('collapsed');
            aside.classList.remove('open');
            const togg = document.querySelector('.sidebar-toggle');
            if (togg) togg.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('sidebar-open');
            localStorage.setItem('bv_sidebar_open', 'false');
          }
        });
      }

      // Ensure CSS-friendly classes exist for initial state on small screens
      // if no explicit state saved, keep sidebar visible on wide screens and collapsed on narrow
      const saved = localStorage.getItem('bv_sidebar_open');
      if (saved !== null) {
        aside.classList.toggle('collapsed', saved === 'false');
        aside.classList.toggle('open', saved === 'true');
        const togg = document.querySelector('.sidebar-toggle');
        if (togg) togg.setAttribute('aria-expanded', String(saved === 'true'));
        // ensure body scroll lock matches saved state
        document.body.classList.toggle('sidebar-open', saved === 'true');
      } else {
        // heuristic: collapse if viewport width < 720
        const shouldCollapse = window.innerWidth < 720;
        aside.classList.toggle('collapsed', shouldCollapse);
        const togg = document.querySelector('.sidebar-toggle');
        if (togg) togg.setAttribute('aria-expanded', String(!shouldCollapse));
      }

      // persist collapse state when changed
      const togg = document.querySelector('.sidebar-toggle');
      if (togg) {
        togg.addEventListener('click', () => {
          const open = !document.querySelector('aside.sidebar').classList.contains('collapsed');
          localStorage.setItem('bv_sidebar_open', String(open));
        });
      }
    } catch (err) {
      console.warn('Sidebar placement helper failed', err);
    }
  })();
});


