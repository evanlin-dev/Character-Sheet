import { useCharacter } from '../context/CharacterContext';
import { THEMES } from '../data/constants';

export function ThemeModal() {
  const { modals, closeModal, update } = useCharacter();
  if (!modals.theme) return null;

  const setTheme = (theme) => {
    update({ currentTheme: theme });
    closeModal('theme');
  };

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal('theme'); }}>
      <div className="info-modal-content" style={{ maxWidth: 600 }}>
        <button className="close-modal-btn" onClick={() => closeModal('theme')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Select Class Theme</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {THEMES.map(t => (
            <button
              key={t.key}
              className="btn btn-secondary"
              onClick={() => setTheme(t.key)}
              style={{
                background: t.color,
                color: 'white',
                border: `2px solid ${t.key === '' ? 'var(--ink)' : 'transparent'}`
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LastSavedModal() {
  const { modals, closeModal, load } = useCharacter();
  if (!modals.lastSaved) return null;

  const raw = localStorage.getItem('dndCharacter') || '{}';
  let textareaVal = raw;

  const handleLoad = () => {
    try {
      const data = JSON.parse(textareaVal);
      load(data);
      closeModal('lastSaved');
    } catch {
      alert('Invalid JSON. Please check the data.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(raw).then(() => alert('Copied to clipboard!'));
  };

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }}>
      <div className="info-modal-content" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <button className="close-modal-btn" onClick={() => closeModal('lastSaved')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Last Saved Data</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: 10 }}>
          This is the raw JSON stored in your browser. Copy as backup or paste valid JSON here to restore.
        </p>
        <textarea
          defaultValue={raw}
          onChange={(e) => { textareaVal = e.target.value; }}
          style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', padding: 10, border: '1px solid var(--gold)', borderRadius: 4, resize: 'none', background: 'white', marginBottom: 15, overflowY: 'auto' }}
        />
        <div style={{ textAlign: 'center', display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn" onClick={handleLoad}>Load / Restore</button>
          <button className="btn btn-secondary" onClick={copyToClipboard}>Copy to Clipboard</button>
        </div>
      </div>
    </div>
  );
}
