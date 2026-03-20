import { useState } from 'react';
import { useCharacter } from '../context/CharacterContext';

export function HpManagementModal() {
  const { character, update, modals, closeModal } = useCharacter();
  const [amount, setAmount] = useState('');
  if (!modals.hpManage) return null;

  const hp = parseInt(character.hp) || 0;
  const maxHp = parseInt(character.maxHp) || 1;
  const tempHp = parseInt(character.tempHp) || 0;
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
    const newHp = Math.max(0, hp - remaining);
    update({ hp: newHp, tempHp: newTemp });
    setAmount('');
  };

  const applyHeal = () => {
    if (amt <= 0) return;
    update({ hp: Math.min(maxHp, hp + amt) });
    setAmount('');
  };

  const setTempHp = () => {
    if (amt < 0) return;
    update({ tempHp: Math.max(tempHp, amt) });
    setAmount('');
  };

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal('hpManage'); }}>
      <div className="info-modal-content" style={{ maxWidth: 360 }}>
        <button className="close-modal-btn" onClick={() => closeModal('hpManage')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Manage Hit Points</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, fontSize: '0.95rem' }}>
          <span>HP: <strong>{hp} / {maxHp}</strong></span>
          {tempHp > 0 && <span>Temp: <strong>{tempHp}</strong></span>}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Max HP</label>
          <input
            type="number"
            className="combat-stat-value"
            value={character.maxHp}
            onChange={(e) => update({ maxHp: parseInt(e.target.value) || 0 })}
            style={{ width: '100%', textAlign: 'center' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Amount</label>
          <input
            type="number"
            className="combat-stat-value"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            style={{ width: '100%', textAlign: 'center' }}
            onKeyDown={(e) => { if (e.key === 'Enter') applyHeal(); }}
            autoFocus
            min="0"
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-danger" onClick={applyDamage}>Damage</button>
          <button className="btn" onClick={applyHeal} style={{ background: 'var(--green, #4a7c59)', color: '#fff', borderColor: 'var(--green-dark, #2d5a3d)' }}>Heal</button>
          <button className="btn btn-secondary" onClick={setTempHp}>Set Temp HP</button>
        </div>
      </div>
    </div>
  );
}

export default function HitPoints() {
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

  return (
    <div className="sheet-section">
      <h2 className="section-title" style={{ cursor: 'default' }}>
        Hit Points &amp; Death Saves
        <button
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

        <div className="combat-stat">
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

        <div className="death-saves-box">
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
        </div>
      </div>
    </div>
  );
}
