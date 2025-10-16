// Simple notes module: stores notes in localStorage
const NOTES_KEY = 'bv_notes_v1';

export function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function addNote(note) {
  const notes = loadNotes();
  notes.push({ ...note, id: 'n_' + Date.now() });
  saveNotes(notes);
  return notes;
}

export function deleteNote(id) {
  let notes = loadNotes();
  notes = notes.filter(n => n.id !== id);
  saveNotes(notes);
  return notes;
}

export function updateNote(updated) {
  const notes = loadNotes().map(n => (n.id === updated.id ? updated : n));
  saveNotes(notes);
  return notes;
}
