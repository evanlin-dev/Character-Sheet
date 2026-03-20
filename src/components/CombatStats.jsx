import { useState, useEffect } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { calcMod, formatMod } from '../utils/calculations';
import { conditionsDB, conditionIcons } from '../data/constants';
import { openDB, STORE_NAME } from '../utils/db';
import { processEntries, cleanText } from '../utils/dndEntries';

export default function CombatStats() {
  const { character, update, openModal } = useCharacter();

  const dexMod = calcMod(parseInt(character.dex) || 10);
  const initiative = formatMod(dexMod);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    update({ [field]: val });
  };

  const activeConditions = character.activeConditions || [];
  const conditionDisplay = activeConditions.length > 0
    ? activeConditions.map(c => `${conditionIcons[c] || ''} ${c}`).join(', ')
    : 'None';

  return (
    <div className="sheet-section">
      <h2 className="section-title">Combat Stats</h2>

      <div className="combat-stats">
        <div className="combat-stat">
          <div className="combat-stat-label">Armor Class</div>
          <input type="number" value={character.baseAC} onChange={handleChange('baseAC')} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            <input
              type="checkbox"
              id="shieldEquipped"
              checked={character.shield || false}
              onChange={(e) => update({ shield: e.target.checked })}
              style={{ width: 14, height: 14, cursor: 'pointer' }}
            />
            <label htmlFor="shieldEquipped" style={{ fontSize: '0.7rem', fontFamily: "'Cinzel', serif", color: 'var(--ink-light)', cursor: 'pointer' }}>
              Shield (+2)
            </label>
          </div>
        </div>

        <div className="combat-stat">
          <div className="combat-stat-label">Initiative</div>
          <input type="text" className="combat-stat-value" value={initiative} readOnly />
        </div>

        <div className="combat-stat">
          <div className="combat-stat-label">Speed</div>
          <input type="number" className="combat-stat-value" value={character.speed} onChange={handleChange('speed')} />
        </div>

        <div className="combat-stat">
          <div className="combat-stat-label">Size</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
            <select
              value={character.charSize || 'Medium'}
              onChange={handleChange('charSize')}
              className="combat-stat-value"
              style={{ fontSize: '1rem', width: 'auto', padding: 0 }}
            >
              <option value="Tiny">Tiny</option>
              <option value="Small">Small</option>
              <option value="Medium">Med</option>
              <option value="Large">Large</option>
              <option value="Huge">Huge</option>
              <option value="Gargantuan">Garg</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" value={character.sizeFt || 5} onChange={handleChange('sizeFt')} style={{ width: 40, fontSize: '1.5rem' }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.8rem', color: 'var(--red-dark)' }}>ft</span>
            </div>
          </div>
        </div>

        <div className="combat-stat">
          <div className="combat-stat-label">Proficiency Bonus</div>
          <input type="number" className="combat-stat-value" value={character.profBonus} onChange={handleChange('profBonus')} />
        </div>

        <div className="combat-stat">
          <div className="combat-stat-label">Attacks / Action</div>
          <input type="number" className="combat-stat-value" value={character.attacksPerAction || 1} onChange={handleChange('attacksPerAction')} min="1" max="10" />
        </div>
      </div>

      <div className="grid grid-3">
        <div className="field">
          <label className="field-label">Armor Training</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12, paddingLeft: 8 }}>
            {[['armorLight','Light'], ['armorMedium','Medium'], ['armorHeavy','Heavy'], ['armorShield','Shield']].map(([field, label]) => (
              <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id={field} checked={character[field] || false} onChange={handleChange(field)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <label htmlFor={field}>{label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Weapon Proficiency</label>
          <div
            className="tag-display"
            onClick={() => openModal('weaponProf')}
            style={{ cursor: 'pointer', minHeight: 44, padding: '4px 0' }}
          >
            {character.weaponProfs
              ? character.weaponProfs.split(',').filter(Boolean).map(p => (
                  <span key={p} className="prof-tag">{p.trim()}</span>
                ))
              : <span style={{ color: 'var(--ink-light)', fontStyle: 'italic', fontSize: '0.9rem' }}>Click to select...</span>
            }
          </div>
        </div>

        <div className="field">
          <label className="field-label">Tool Proficiency</label>
          <textarea
            value={character.toolProfs || ''}
            onChange={handleChange('toolProfs')}
            placeholder="e.g. Thieves' Tools, Lute..."
            style={{ minHeight: 60 }}
          />
        </div>

        <div
          className="combat-stat"
          onClick={() => openModal('condition')}
          style={{ cursor: 'pointer', gridColumn: '1 / -1', height: 'auto', minHeight: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div className="combat-stat-label">Conditions</div>
          <div style={{ fontSize: '1.1rem', color: activeConditions.length ? 'var(--red-dark)' : 'var(--ink-light)', padding: '8px 16px', fontWeight: 'bold', fontFamily: "'Crimson Text', serif", fontStyle: 'italic', whiteSpace: 'normal', lineHeight: 1.6, textAlign: 'center' }}>
            {conditionDisplay}
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Defenses</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['resistances','Resistances','e.g. Fire, Poison...'], ['immunities','Immunities','e.g. Charmed, Frightened...'], ['vulnerabilities','Vulnerabilities','e.g. Cold...']].map(([field, label, ph]) => (
            <div key={field}>
              <div className="field-label" style={{ fontSize: '0.7rem', marginBottom: 2 }}>{label}</div>
              <textarea value={character[field] || ''} onChange={(e) => update({ [field]: e.target.value })} placeholder={ph} style={{ minHeight: 44 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConditionModal() {
  const { modals, closeModal, character, update } = useCharacter();
  const [dbConditions, setDbConditions] = useState(conditionsDB);

  useEffect(() => {
    async function loadConditions() {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve, reject) => {
          const req = store.get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });

        if (!data) return;

        const conditionMap = new Map();
        data.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            const arrays = [json.condition, json.conditions, json.status];
            arrays.forEach(arr => {
                if (Array.isArray(arr)) {
                    arr.forEach(c => {
                        if (!c.name) return;
                        if (!conditionMap.has(c.name)) {
                            conditionMap.set(c.name, c);
                        } else {
                            const existing = conditionMap.get(c.name);
                            if (c.source === 'XPHB') conditionMap.set(c.name, c);
                            else if (c.source === 'PHB' && existing.source !== 'XPHB') conditionMap.set(c.name, c);
                        }
                    });
                }
            });
          } catch(e) {}
        });

        if (conditionMap.size > 0) {
            const newConds = { ...conditionsDB };
            Array.from(conditionMap.keys()).sort().forEach(name => {
                const c = conditionMap.get(name);
                let desc = processEntries(c.entries);
                desc = cleanText(desc);
                newConds[name] = desc;
            });
            
            const sortedConds = {};
            Object.keys(newConds).sort().forEach(k => {
                sortedConds[k] = newConds[k];
            });
            setDbConditions(sortedConds);
        }
      } catch (e) {
        console.error("Failed to load conditions", e);
      }
    }
    if (modals.condition) {
      loadConditions();
    }
  }, [modals.condition]);

  if (!modals.condition) return null;

  const active = character.activeConditions || [];

  const toggle = (condition) => {
    if (active.includes(condition)) {
      update({ activeConditions: active.filter(c => c !== condition) });
    } else {
      update({ activeConditions: [...active, condition] });
    }
  };

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }}>
      <div className="info-modal-content" style={{ maxWidth: 500, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <button className="close-modal-btn" onClick={() => closeModal('condition')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Conditions</h3>
        <div className="checklist-grid" style={{ gridTemplateColumns: '1fr', flex: 1, overflowY: 'auto', gap: 8 }}>
          {Object.entries(dbConditions).map(([name, desc]) => (
            <div
              key={name}
              style={{
                border: `2px solid ${active.includes(name) ? 'var(--red)' : 'var(--gold)'}`,
                borderRadius: 6,
                padding: '8px 12px',
                background: active.includes(name) ? 'rgba(139,46,46,0.1)' : 'white',
                cursor: 'pointer',
              }}
              onClick={() => toggle(name)}
            >
              <div style={{ fontWeight: 'bold', fontFamily: "'Cinzel',serif", fontSize: '0.9rem' }}>
                {conditionIcons[name]} {name}
                {active.includes(name) && <span style={{ color: 'var(--red)', marginLeft: 8 }}>✓</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: 4 }} dangerouslySetInnerHTML={{ __html: desc }} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, borderTop: '1px solid var(--gold)', paddingTop: 10 }}>
          <button className="btn" onClick={() => closeModal('condition')}>Done</button>
        </div>
      </div>
    </div>
  );
}

export function WeaponProfModal() {
  const { modals, closeModal, character, update } = useCharacter();
  if (!modals.weaponProf) return null;

  const categories = [
    { category: 'Categories', items: ['Simple Weapons', 'Martial Weapons', 'Firearms', 'Shields'] },
    { category: 'Properties/Groups', items: ['Finesse Weapons', 'Heavy Weapons', 'Light Weapons', 'Reach Weapons', 'Thrown Weapons', 'Versatile Weapons'] },
  ];

  const currentProfs = (character.weaponProfs || '').split(',').map(s => s.trim()).filter(Boolean);

  const toggle = (item) => {
    if (currentProfs.includes(item)) {
      update({ weaponProfs: currentProfs.filter(p => p !== item).join(', ') });
    } else {
      update({ weaponProfs: [...currentProfs, item].join(', ') });
    }
  };

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }}>
      <div className="info-modal-content" style={{ maxWidth: 600 }}>
        <button className="close-modal-btn" onClick={() => closeModal('weaponProf')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Weapon Proficiencies</h3>
        {categories.map(cat => (
          <div key={cat.category} style={{ marginBottom: 16 }}>
            <div className="field-label" style={{ marginBottom: 8 }}>{cat.category}</div>
            <div className="checklist-grid">
              {cat.items.map(item => (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'white', border: '1px solid var(--gold)', borderRadius: 4, cursor: 'pointer' }}>
                  <input type="checkbox" checked={currentProfs.includes(item)} onChange={() => toggle(item)} />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="btn" onClick={() => closeModal('weaponProf')}>Done</button>
        </div>
      </div>
    </div>
  );
}
