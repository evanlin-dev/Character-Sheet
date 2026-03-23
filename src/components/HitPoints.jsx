import { useState } from 'react';
import { useCharacter } from '../context/CharacterContext';

// ── Shared HP Modal UI (used by both context-based and prop-based versions) ──

export function HpModal({ hp, maxHp, tempHp, onUpdate, onClose }) {
  const [amount, setAmount] = useState('');
  const amt = parseInt(amount) || 0;

  const applyDamage = () => {
    if (amt <= 0) return;
    let remaining = amt;
    let newTemp = tempHp;
    if (newTemp > 0) {
      const absorbed = Math.min(newTemp, remaining);
      newTemp -= absorbed;
      remaining -= absorbed;
    }
    onUpdate({ hp: Math.max(0, hp - remaining), tempHp: newTemp });
    setAmount('');
  };

  const applyHeal = () => {
    if (amt <= 0) return;
    onUpdate({ hp: Math.min(maxHp, hp + amt) });
    setAmount('');
  };

  const applyTemp = () => {
    onUpdate({ tempHp: Math.max(tempHp, amt) });
    setAmount('');
  };

  const pct = Math.min(100, Math.max(0, (hp / maxHp) * 100));
  const tempPct = Math.min(100 - pct, (tempHp / maxHp) * 100);
  const isDying = hp === 0;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--parchment)', border: '2px solid var(--gold)', borderRadius: 10, padding: '24px 28px', width: 340, maxWidth: '92vw', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <button className="close-modal-btn" onClick={onClose} style={{ position: 'absolute', top: 10, right: 12 }}>&times;</button>

        {/* Title */}
        <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--red-dark)', textAlign: 'center', margin: '0 0 16px', fontSize: '1.1rem', letterSpacing: '0.05em' }}>
          Manage Hit Points
        </h3>

        {/* HP bar */}
        <div style={{ height: 12, background: '#e8d5b0', borderRadius: 6, overflow: 'hidden', marginBottom: 12, border: '1px solid var(--gold-light)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: isDying ? 'var(--red-dark)' : 'var(--red)', transition: 'width 0.3s', float: 'left' }} />
          {tempPct > 0 && <div style={{ height: '100%', width: `${tempPct}%`, background: '#5b8dd9', float: 'left' }} />}
        </div>

        {/* HP display */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '2.4rem', fontWeight: 700, color: isDying ? 'var(--red-dark)' : 'var(--ink)', lineHeight: 1 }}>{hp}</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: 'var(--ink-light)' }}>/ {maxHp}</span>
          {tempHp > 0 && <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: '#5b8dd9', marginLeft: 4 }}>+{tempHp} temp</span>}
        </div>

        {/* Max HP + Temp HP row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Max HP</div>
            <input
              type="number"
              value={maxHp}
              onChange={(e) => onUpdate({ maxHp: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', textAlign: 'center', border: '1px solid var(--gold)', borderRadius: 4, padding: '4px 6px', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', background: 'white' }}
            />
          </div>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Temp HP</div>
            <input
              type="number"
              value={tempHp || ''}
              placeholder="0"
              onChange={(e) => onUpdate({ tempHp: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', textAlign: 'center', border: '1px solid var(--gold)', borderRadius: 4, padding: '4px 6px', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', background: 'white', color: '#5b8dd9' }}
            />
          </div>
        </div>

        {/* Amount input */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, textAlign: 'center' }}>Amount</div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyHeal(); }}
            placeholder="0"
            autoFocus
            min="0"
            style={{ width: '100%', textAlign: 'center', border: '2px solid var(--gold)', borderRadius: 6, padding: '10px', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '2rem', color: 'var(--ink)', background: 'white' }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <button
            className="btn"
            onClick={applyDamage}
            style={{ background: '#8b0000', borderColor: '#5a0000', color: '#fff', fontSize: '1rem', padding: '10px', fontFamily: 'Cinzel, serif', fontWeight: 700 }}
          >
            Damage
          </button>
          <button
            className="btn"
            onClick={applyHeal}
            style={{ background: '#2d6a4f', borderColor: '#1b4332', color: '#fff', fontSize: '1rem', padding: '10px', fontFamily: 'Cinzel, serif', fontWeight: 700 }}
          >
            Heal
          </button>
        </div>
        <button
          className="btn btn-secondary"
          onClick={applyTemp}
          style={{ width: '100%', fontFamily: 'Cinzel, serif', fontWeight: 700 }}
        >
          Set Temp HP
        </button>
      </div>
    </div>
  );
}

// ── Context-wired wrapper (used via modals.hpManage) ─────────────────────────

export function HpManagementModal() {
  const { character, update, modals, closeModal } = useCharacter();
  if (!modals.hpManage) return null;
  return (
    <HpModal
      hp={parseInt(character.hp) || 0}
      maxHp={parseInt(character.maxHp) || 1}
      tempHp={parseInt(character.tempHp) || 0}
      onUpdate={update}
      onClose={() => closeModal('hpManage')}
    />
  );
}

export default function HitPoints({ compact = false }) {
  const { character, update, openModal } = useCharacter();

  const hp = parseInt(character.hp) || 0;
  const maxHp = parseInt(character.maxHp) || 1;
  const tempHp = parseInt(character.tempHp) || 0;
  const deathSaves = character.deathSaves || { successes: [false, false, false], failures: [false, false, false] };

  const currentPct = Math.min(100, Math.max(0, (hp / maxHp) * 100));
  const tempPct = Math.min(100, (tempHp / maxHp) * 100);
  const cappedTempPct = hp >= maxHp ? tempPct : Math.min(tempPct, 100 - currentPct);
  const tempLeft = hp >= maxHp ? 0 : currentPct;

  const adjustHP = (delta) => {
    const newHp = Math.min(maxHp, Math.max(0, hp + delta));
    update({ hp: newHp });
  };

  const adjustTempHP = (delta) => {
    const newTemp = Math.max(0, tempHp + delta);
    update({ tempHp: newTemp });
  };

  const toggleDeathSave = (type, index) => {
    const arr = [...(deathSaves[type === 'success' ? 'successes' : 'failures'])];
    arr[index] = !arr[index];
    update({ deathSaves: { ...deathSaves, [type === 'success' ? 'successes' : 'failures']: arr } });
  };

  if (compact) {
    return (
      <div className="sheet-section">
        <div className="hp-bar-container" style={{ marginBottom: 6 }}>
          <div className="hp-fill-current" style={{ width: `${currentPct}%` }} />
          <div className="hp-fill-temp" style={{ width: `${cappedTempPct}%`, left: `${tempLeft}%` }} />
          <div className="hp-overlay-text">
            <span>{hp}{tempHp > 0 ? ` (+${tempHp})` : ''}</span>
            {' / '}
            <span>{maxHp}</span>
          </div>
        </div>
        <div
          onClick={() => openModal('hpManage')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', background: 'white', border: '1px solid var(--gold)', borderRadius: 6, padding: '8px 12px' }}
          title="Click to manage HP"
        >
          <div style={{ textAlign: 'center' }}>
            <div className="combat-stat-label">HP</div>
            <div className="combat-stat-value" style={{ fontSize: '1.8rem', color: hp === 0 ? 'var(--red-dark)' : 'var(--ink)', lineHeight: 1 }}>
              {hp}{tempHp > 0 ? <span style={{ fontSize: '1rem', color: 'var(--ink-light)' }}> +{tempHp}</span> : ''}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--ink-light)' }}>/ {maxHp}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="combat-stat-label">Hit Dice</div>
            <div className="combat-stat-value" style={{ fontSize: '1.2rem' }}>{character.hitDice || '1d8'}</div>
          </div>
        </div>
        {hp === 0 && (
          <div className="death-saves-box" style={{ marginTop: 6 }}>
            <div className="death-saves-label">Death Saves</div>
            <div className="death-saves-content">
              {['success', 'failure'].map(type => (
                <div key={type} className="death-save-row">
                  <span className="save-label">{type === 'success' ? 'Successes:' : 'Failures:'}</span>
                  <div className="death-save-checkboxes">
                    {[0,1,2].map(i => (
                      <div key={i} className={`death-save-check${deathSaves[type === 'success' ? 'successes' : 'failures'][i] ? (type === 'success' ? ' filled' : ' filled failure') : ''}`} onClick={() => toggleDeathSave(type, i)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sheet-section">
      <h2 className="section-title" style={{ cursor: 'default' }}>
        Hit Points{hp === 0 ? ' & Death Saves' : ''}
        <button
          id="tutorial-manage-hp"
          className="btn btn-secondary"
          onClick={() => openModal('hpManage')}
          style={{ marginLeft: 10, fontSize: '0.75rem', padding: '2px 8px', verticalAlign: 'middle' }}
        >
          Manage HP
        </button>
      </h2>

      <div className="hp-bar-container">
        <div className="hp-fill-current" style={{ width: `${currentPct}%` }} />
        <div className="hp-fill-temp" style={{ width: `${cappedTempPct}%`, left: `${tempLeft}%` }} />
        <div className="hp-overlay-text">
          <span>{hp}{tempHp > 0 ? ` (+${tempHp})` : ''}</span>
          {' / '}
          <span>{maxHp}</span>
        </div>
      </div>

      <div className="hp-death-grid">
        <div className="combat-stat">
          <div className="combat-stat-label">Current HP</div>
          <div className="hp-controls">
            <button className="hp-btn" onClick={() => adjustHP(-1)}>-</button>
            <input
              type="number"
              className="combat-stat-value"
              value={character.hp}
              onChange={(e) => update({ hp: parseInt(e.target.value) || 0 })}
              style={{ width: 60 }}
            />
            <button className="hp-btn" onClick={() => adjustHP(1)}>+</button>
          </div>
        </div>

        <div className="combat-stat">
          <div className="combat-stat-label">Max HP</div>
          <input
            type="number"
            className="combat-stat-value"
            value={character.maxHp}
            onChange={(e) => update({ maxHp: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="combat-stat">
          <div className="combat-stat-label">Temp HP</div>
          <div className="hp-controls">
            <button className="hp-btn" onClick={() => adjustTempHP(-1)}>-</button>
            <input
              type="number"
              className="combat-stat-value"
              value={character.tempHp}
              onChange={(e) => update({ tempHp: parseInt(e.target.value) || 0 })}
              style={{ width: 60 }}
            />
            <button className="hp-btn" onClick={() => adjustTempHP(1)}>+</button>
          </div>
        </div>

        <div className="combat-stat" id="tutorial-hit-dice">
          <div className="combat-stat-label">Hit Dice</div>
          <input
            type="text"
            className="combat-stat-value"
            value={character.hitDice}
            onChange={(e) => update({ hitDice: e.target.value })}
            placeholder="1d8"
            style={{ fontSize: '1.5rem' }}
          />
        </div>

        {hp === 0 && <div className="death-saves-box">
          <div className="death-saves-label">Death Saves</div>
          <div className="death-saves-content">
            <div className="death-save-row">
              <span className="save-label">Successes:</span>
              <div className="death-save-checkboxes">
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    className={`death-save-check${deathSaves.successes[i] ? ' filled' : ''}`}
                    onClick={() => toggleDeathSave('success', i)}
                  />
                ))}
              </div>
            </div>
            <div className="death-save-row">
              <span className="save-label">Failures:</span>
              <div className="death-save-checkboxes">
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    className={`death-save-check${deathSaves.failures[i] ? ' filled failure' : ''}`}
                    onClick={() => toggleDeathSave('failure', i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
