import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock IndexedDB (not used in tests, just prevent errors)
global.indexedDB = {
  open: () => ({ onupgradeneeded: null, onsuccess: null, onerror: null }),
};

// Suppress known non-critical console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React Router')) return;
  originalWarn(...args);
};
