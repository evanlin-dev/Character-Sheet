export const VIEWS = [
  { id: 'stats',         label: 'Stats' },
  { id: 'actions',       label: 'Actions' },
  { id: 'inventory',     label: 'Inventory' },
  { id: 'spells',        label: 'Spells' },
  { id: 'features',      label: 'Features' },
  { id: 'defenses',      label: 'Defenses' },
  { id: 'proficiencies', label: 'Proficiencies' },
  { id: 'notes',         label: 'Notes' },
  { id: 'summons',       label: 'Summons' },
];

export default function ViewSelectorModal({ currentView, onSelect, onClose }) {
  return (
    <div className="info-modal-overlay" style={{ background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1050 }}>
      <div className="info-modal-content" style={{ background: 'var(--parchment)', border: '2px solid var(--gold)', padding: 20, width: 320, borderRadius: 6, position: 'relative' }}>
        <button className="close-modal-btn" onClick={onClose} style={{ position: 'absolute', top: 10, right: 10 }}>×</button>
        <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--red-dark)', textAlign: 'center', marginTop: 0 }}>Switch View</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button onClick={() => onSelect('legacy')} className="btn" style={{ gridColumn: '1 / -1', fontStyle: 'italic', color: 'var(--ink-light)' }}>
            Full Sheet (Legacy)
          </button>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => onSelect(v.id)}
              className={`btn${currentView === v.id ? ' btn-primary' : ''}`}
              style={{ padding: '10px 8px', fontSize: '0.9rem' }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
