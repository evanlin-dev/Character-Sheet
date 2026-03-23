import { useState, useEffect, useRef } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { dndWeaponsDB, masteryDescriptions, weaponPropertyDescriptions } from '../data/constants';
import { calcMod, getProfBonus } from '../utils/calculations';
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from '../styles/shared';
import { processEntries, cleanText } from '../utils/dndEntries';

// ─── IndexedDB weapon loader ──────────────────────────────────────────────────
// Module-level cache — only fetched once per page load.
let _dbWeaponsCache = null; // null = not yet loaded

async function loadDBWeapons() {
  if (_dbWeaponsCache !== null) return _dbWeaponsCache;

  try {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('DndDataDB', 7);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onblocked = () => {};
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (d.objectStoreNames.contains('files')) d.deleteObjectStore('files');
        d.createObjectStore('files');
      };
    });

    const data = await new Promise((resolve, reject) => {
      const req = db.transaction('files', 'readonly').objectStore('files').get('currentData');
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });

    if (!data) { _dbWeaponsCache = {}; return {}; }

    const PROP_MAP = {
      L: 'Light', F: 'Finesse', T: 'Thrown', '2H': 'Two-Handed',
      H: 'Heavy', R: 'Reach',   V: 'Versatile', LD: 'Loading', A: 'Ammunition',
    };
    const DMG_TYPE = { S: 'slashing', P: 'piercing', B: 'bludgeoning' };

    const result = {};

    data.forEach((file) => {
      if (!file.name.toLowerCase().endsWith('.json')) return;
      try {
        const json = JSON.parse(file.content);
        [json.baseitem, json.baseitems, json.item, json.items].forEach((arr) => {
          if (!Array.isArray(arr)) return;
          arr.forEach((item) => {
            const rawT   = (item.type || '').split('|')[0];
            const isWeapon = item.weaponCategory || ['M', 'R'].includes(rawT) || (item.property && item.property.length > 0);
            if (!isWeapon || !item.name) return;

            const type   = (item.weaponCategory || 'Simple').toLowerCase() === 'martial' ? 'Martial' : 'Simple';
            const cat    = rawT === 'R' || rawT === 'F' ? 'Ranged' : 'Melee';
            const dmg    = item.dmg1 || '';
            const dtype  = DMG_TYPE[item.dmgType] || item.dmgType || '';

            const props = [];
            if (item.property) {
              item.property.forEach((p) => {
                const pStr   = typeof p === 'string' ? p : (p.uid || p.name || '');
                const cleanP = pStr.split('|')[0];
                let propName = PROP_MAP[cleanP] || cleanP;
                if ((cleanP === 'T' || cleanP === 'A') && item.range) {
                  const r = item.range;
                  propName += typeof r === 'string' ? ` (${r})` : r.normal ? ` (${r.normal}/${r.long})` : '';
                }
                if (cleanP === 'V' && item.dmg2) propName += ` (${item.dmg2})`;
                props.push(propName);
              });
            }

            let mastery = item.mastery || null;
            if (Array.isArray(mastery)) mastery = mastery[0];
            if (mastery) mastery = mastery.split('|')[0];
            
            let specialDesc = '';
            if (item.special) {
              specialDesc = cleanText(processEntries(item.special));
            } else if (item.entries) {
              const spec = item.entries.find(e => e.name === 'Special' || (typeof e === 'string' && e.startsWith('Special')));
              if (spec) {
                if (typeof spec === 'string') specialDesc = cleanText(processEntries([spec]));
                else specialDesc = cleanText(processEntries(spec.entries || spec.entry || []));
              } else {
                const txt = item.entries.filter(e => typeof e === 'string').join(' ');
                if (txt.toLowerCase().includes('special')) specialDesc = cleanText(processEntries(item.entries));
              }
            }
            if (specialDesc) {
              specialDesc = specialDesc.replace(/<[^>]+>/g, '').replace(/^Special\.?\s*/i, '').trim();
            }

            result[item.name] = { type, cat, dmg, dtype, props, mastery, specialDesc, fromDB: true };
          });
        });
      } catch {}
    });

    _dbWeaponsCache = result;
    return result;
  } catch {
    _dbWeaponsCache = {};
    return {};
  }
}

// ─── Auto-calc stats for a known weapon ───────────────────────────────────────

function autoCalcWeapon(name, weaponData, char) {
  if (!weaponData) return null;
  const str    = parseInt(char.str) || 10;
  const dex    = parseInt(char.dex) || 10;
  const strMod = calcMod(str);
  const dexMod = calcMod(dex);
  const pb     = parseInt(char.profBonus) || getProfBonus(parseInt(char.level) || 1);
  const profStr = char.weaponProfs || '';

  let abilityMod = strMod;
  if (weaponData.props.includes('Finesse')) {
    abilityMod = Math.max(strMod, dexMod);
  } else if (weaponData.cat === 'Ranged' && !weaponData.props.some(p => p.includes('Thrown'))) {
    abilityMod = dexMod;
  }

  const isProficient =
    (weaponData.type === 'Simple'  && profStr.includes('Simple Weapons'))  ||
    (weaponData.type === 'Martial' && profStr.includes('Martial Weapons')) ||
    profStr.includes(name);

  const totalAtk = abilityMod + (isProficient ? pb : 0);
  const atk      = totalAtk >= 0 ? `+${totalAtk}` : `${totalAtk}`;
  const damage   = `${weaponData.dmg} ${abilityMod >= 0 ? '+' : ''}${abilityMod} ${weaponData.dtype}`;

  let notesArr = [...weaponData.props];
  if (weaponData.mastery) notesArr.push(`Mastery: ${weaponData.mastery}`);
  if (weaponData.specialDesc) {
    const sIdx = notesArr.findIndex(p => p.toLowerCase() === 'special' || p.toLowerCase() === 's');
    if (sIdx !== -1) {
      notesArr[sIdx] = `Special (${weaponData.specialDesc})`;
    } else {
      notesArr.push(`Special (${weaponData.specialDesc})`);
    }
  }
  const notes = notesArr.filter(Boolean).join(', ');

  return { atk, damage, notes };
}

// ─── WeaponItem ───────────────────────────────────────────────────────────────

function WeaponItem({ weapon, index, char, onUpdate, onDelete }) {
  const { openModal } = useCharacter();
  const containerRef = useRef(null);
  const [editing, setEditing] = useState(false);

  // Parse mastery + properties from notes (same logic as MobileAppView WeaponActionCard)
  const notes = weapon.notes || '';
  const masteryMatch = notes.match(/Mastery:\s*(\w+)/i);
  const masteryName = masteryMatch ? masteryMatch[1] : '';
  const masteryDesc = masteryName ? masteryDescriptions[masteryName] || '' : '';
  const notesWithoutMastery = notes.replace(/,?\s*Mastery:\s*\w+/gi, '').trim().replace(/^,\s*/, '');

  const propMap = {
    A: "Ammunition",
    F: "Finesse",
    H: "Heavy",
    L: "Light",
    LD: "Loading",
    R: "Reach",
    S: "Special",
    T: "Thrown",
    "2H": "Two-Handed",
    V: "Versatile",
    RL: "Reload",
    BF: "Burst Fire",
  };

  const propLookup = (p) => {
    let key = p.split("(")[0].trim();
    key = propMap[key.toUpperCase()] || key;
    return weaponPropertyDescriptions[key.toLowerCase()];
  };

  const propertyNames = notesWithoutMastery.split(/,\s*(?![^()]*\))/).map(p => p.trim()).filter(Boolean);
  const matchedProperties = propertyNames.filter(p => propLookup(p));
  const unmatchedNotes = propertyNames.filter(p => !propLookup(p)).join(', ').trim();

  const atk = weapon.atk || '';
  const atkDisplay = atk && !atk.startsWith('+') && !atk.startsWith('-') ? `+${atk}` : atk;

  const openPicker = () => {
    if (_dbWeaponsCache === null) loadDBWeapons();
    openModal('weaponPicker', {
      open: true,
      callback: (weaponName) => {
        const allWeapons = { ...dndWeaponsDB, ...(_dbWeaponsCache || {}) };
        const data = allWeapons[weaponName];
        const autoStats = autoCalcWeapon(weaponName, data, char);
        onUpdate(autoStats ? { ...weapon, name: weaponName, ...autoStats } : { ...weapon, name: weaponName });
      }
    });
  };

  const [showDetail, setShowDetail] = useState(false);

  const btnStyle = { background: 'transparent', border: '1px solid var(--gold)', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer', color: 'var(--ink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px 5px', height: 22 };

  // All pills: unmatched notes (no desc), mastery (gold), matched props (neutral)
  const allPills = [
    ...(unmatchedNotes ? unmatchedNotes.split(/,\s*(?![^()]*\))/).map(n => ({ label: n, type: 'plain', desc: null })) : []),
    ...(masteryName ? [{ label: `Mastery: ${masteryName}`, type: 'mastery', desc: masteryDesc }] : []),
    ...matchedProperties.map(p => {
      let baseKey = p.split('(')[0].trim();
      let keyName = propMap[baseKey.toUpperCase()] || baseKey;
      let extra = p.includes('(') ? ' ' + p.substring(p.indexOf('(')) : '';
      let finalDesc = propLookup(p);
      
      if (keyName.toLowerCase() === 'special' && p.includes('(')) {
        const match = p.match(/\(([\s\S]*)\)/);
        if (match && match[1] && match[1].length > 15) {
          finalDesc = match[1];
          extra = '';
        }
      }
      
      return { label: keyName + extra, type: 'prop', desc: finalDesc };
    }),
  ];
  const hasDetail = allPills.some(p => p.desc);

  const pillBase = { padding: '2px 8px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word', border: '1px solid' };
  const pillStyles = {
    plain:   { ...pillBase, background: 'rgba(0,0,0,0.05)', color: 'var(--ink-light)', borderColor: 'var(--gold-light)' },
    mastery: { ...pillBase, background: 'color-mix(in srgb, var(--gold) 20%, white)', color: '#7a5c00', borderColor: 'var(--gold)' },
    prop:    { ...pillBase, background: 'rgba(255,255,255,0.7)', color: 'var(--ink)', borderColor: 'var(--gold)' },
  };

  if (!editing) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--gold)', borderRadius: 4, marginBottom: 6, fontSize: '0.9rem' }}>
        {/* Header row — click to toggle detail */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', padding: '8px 12px', cursor: hasDetail ? 'pointer' : 'default' }}
          onClick={() => hasDetail && setShowDetail(v => !v)}
        >
          <span style={{ fontWeight: 'bold', color: 'var(--red-dark)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {weapon.name || <span style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>unnamed</span>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {atkDisplay && <span style={{ background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', padding: '1px 7px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Hit {atkDisplay}</span>}
            {weapon.damage && <span style={{ background: 'color-mix(in srgb, var(--red) 10%, var(--parchment))', color: 'var(--red-dark)', border: '1px solid color-mix(in srgb, var(--red) 30%, var(--gold))', padding: '1px 7px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{weapon.damage}</span>}
            <button style={btnStyle} title="Edit weapon" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>✎</button>
            <button style={btnStyle} title="Set formula" onClick={(e) => { e.stopPropagation(); openModal('weaponFormula', { open: true, index }); }}>⚙</button>
            <button style={{ ...btnStyle, color: 'var(--red-dark)', borderColor: 'var(--red)' }} title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(index); }}>&times;</button>
            {hasDetail && <span style={{ color: 'var(--ink-light)', fontSize: '0.85rem', display: 'inline-block', transform: showDetail ? 'rotate(180deg)' : '', marginLeft: 2 }}>▾</span>}
          </div>
        </div>
        {/* Property pills — always visible */}
        {allPills.length > 0 && (
          <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {allPills.map(({ label, type }) => (
              <span key={label} style={pillStyles[type]}>{label}</span>
            ))}
          </div>
        )}
        {/* All descriptions expanded at once on click */}
        {showDetail && (
          <div style={{ borderTop: '1px solid rgba(201,173,106,0.3)', padding: '8px 12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6, wordBreak: 'break-word' }}>
            {allPills.filter(p => p.desc).map(({ label, desc }) => (
              <div key={label}>
                <strong style={{ fontFamily: "'Cinzel', serif", color: 'var(--ink)' }}>{label.replace('Mastery: ', '')}:</strong>{' '}{desc}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Edit mode — full form
  return (
    <div className="feature-box weapon-item" data-wformula={weapon.formulaData ? JSON.stringify(weapon.formulaData) : undefined} style={{ paddingRight: 40, position: 'relative' }}>
      <div style={{ display: 'flex', position: 'absolute', top: 5, right: 5, gap: 4, zIndex: 10 }}>
        <button style={{ ...btnStyle, fontSize: '0.65rem', padding: '2px 6px', height: 24 }} title="Done editing" onClick={() => setEditing(false)}>Done</button>
        <button className="weapon-formula-btn" title="Set formula" onClick={() => openModal('weaponFormula', { open: true, index })} style={{ width: 24, height: 24, background: 'transparent', border: '1px solid var(--gold)', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer', color: 'var(--ink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙</button>
        <button className="delete-feature-btn" style={{ width: 24, height: 24 }} onClick={() => onDelete(index)}>&times;</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 0 }}>
          <div className="field" style={{ flex: '1 1 140px', marginBottom: 0 }}>
            <span className="field-label">Weapon Name</span>
            <div ref={containerRef} style={{ position: 'relative' }}>
              <input type="text" className="weapon-name" value={weapon.name} onChange={(e) => onUpdate({ ...weapon, name: e.target.value })} onFocus={openPicker} data-custom-weapon={weapon.customWeapon ? "1" : undefined} placeholder="Enter or pick weapon…" style={{ fontWeight: 'bold', color: 'var(--red-dark)' }} />
            </div>
          </div>
          <div className="field" style={{ flex: '1 1 60px', marginBottom: 0 }}>
            <span className="field-label">Atk Bonus</span>
            <input type="text" className="weapon-atk" value={weapon.atk || ''} onChange={(e) => onUpdate({ ...weapon, atk: e.target.value })} placeholder="+0" />
          </div>
          <div className="field" style={{ flex: '1 1 100px', marginBottom: 0 }}>
            <span className="field-label">Damage</span>
            <input type="text" className="weapon-damage" value={weapon.damage || ''} onChange={(e) => onUpdate({ ...weapon, damage: e.target.value })} placeholder="1d6+0" />
          </div>
        </div>
        <div className="field">
          <span className="field-label">Notes</span>
          <textarea className="weapon-notes" value={weapon.notes || ''} onChange={(e) => onUpdate({ ...weapon, notes: e.target.value })} placeholder="Properties…" rows={1} />
        </div>
      </div>
    </div>
  );
}

// ─── Weapons section ──────────────────────────────────────────────────────────

export default function Weapons() {
  const { character, update, openModal } = useCharacter();
  const weapons = character.weapons || [];

  const updateWeapon = (index, newWeapon) =>
    update({ weapons: weapons.map((w, i) => i === index ? newWeapon : w) });

  const deleteWeapon = (index) =>
    update({ weapons: weapons.filter((_, i) => i !== index) });

  const addWeapon = () =>
    update({ weapons: [...weapons, { name: '', atk: '', damage: '', notes: '' }] });

  return (
    <div className="sheet-section">
      <h2 className="section-title">
        Weapon Attacks
        <span
          className="skill-info-btn"
          onClick={() => openModal('mastery')}
          style={{ width: 22, height: 22, fontSize: '0.9rem', marginLeft: 8 }}
        >?</span>
      </h2>
      <div className="grid">
        <div id="weapon-list" className="vertical-list">
          {weapons.map((w, i) => (
            <WeaponItem
              key={i}
              weapon={w}
              index={i}
              char={character}
              onUpdate={(newW) => updateWeapon(i, newW)}
              onDelete={deleteWeapon}
            />
          ))}
        </div>
        <button className="add-feature-btn" onClick={addWeapon}>+ Add Weapon</button>
      </div>
    </div>
  );
}

// ─── Mastery Modal ────────────────────────────────────────────────────────────

export function MasteryModal() {
  const { modals, closeModal } = useCharacter();
  if (!modals.mastery) return null;

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal('mastery'); }}>
      <div className="info-modal-content" style={{ maxWidth: 500 }}>
        <button className="close-modal-btn" onClick={() => closeModal('mastery')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Weapon Mastery Properties</h3>
        <div className="ref-box" style={{ maxHeight: '60vh', fontSize: '0.95rem' }}>
          {Object.entries(masteryDescriptions).map(([name, desc]) => (
            <div key={name} style={{ marginBottom: 8 }}>
              <span className="ref-title">{name}</span> {desc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Weapon Picker Modal ──────────────────────────────────────────────────────

const GROUP_ORDER = ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'];

function groupKey(data) {
  return `${data.type} ${data.cat}`;
}

export function WeaponPickerModal() {
  const { modals, closeModal } = useCharacter();
  const { open, callback } = modals.weaponPicker;

  const [search, setSearch] = useState('');
  const [dbWeapons, setDbWeapons] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const searchRef = useRef(null);

  // Effect for modal lifecycle
  useEffect(() => {
    if (open) {
      // Focus search bar on open
      searchRef.current?.focus();

      // Load DB weapons if not already loaded
      if (dbWeapons === null && !dbLoading) {
        setDbLoading(true);
        loadDBWeapons().then((loaded) => {
          setDbWeapons(loaded);
          setDbLoading(false);
        });
      }

      // Add background blur effect
      document.getElementById('root')?.classList.add('modal-open-background');
      
      // Add keydown listener for escape
      const handleEsc = (e) => { if (e.key === 'Escape') closeModal('weaponPicker'); };
      document.addEventListener('keydown', handleEsc);
      
      // Cleanup
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.getElementById('root')?.classList.remove('modal-open-background');
      };
    }
  }, [open, dbWeapons, dbLoading, closeModal]);

  if (!open) return null;

  const allWeapons = { ...dndWeaponsDB, ...(dbWeapons || {}) };

  const handleSelect = (weaponName) => {
    if (callback) callback(weaponName);
    closeModal('weaponPicker');
  };

  const handleClose = () => {
    closeModal('weaponPicker');
  };

  const filtered = Object.entries(allWeapons)
    .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const groups = {};
  filtered.forEach(([name, data]) => {
    const key = groupKey(data);
    if (!groups[key]) groups[key] = [];
    groups[key].push([name, data]);
  });
  
  const rowStyle = {
    padding: '8px 20px',
    cursor: 'pointer',
    borderBottom: '1px dashed rgba(201,173,106,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.88rem',
  };

  return (
    <ModalOverlay onClick={handleClose} $zIndex={1200}>
      <ModalBox onClick={(e) => e.stopPropagation()} $maxWidth="500px">
        <CloseBtn onClick={handleClose}>&times;</CloseBtn>
        <ModalTitle>Select a Weapon</ModalTitle>
        
        {/* Search bar */}
        <div style={{ padding: '6px 0 12px', borderBottom: '1px solid var(--gold)', flexShrink: 0, display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            ref={searchRef}
            type="text"
            placeholder={dbLoading ? 'Loading DB…' : 'Search weapons…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--gold)', borderRadius: 3, fontSize: '0.9rem', background: 'white' }}
          />
          {dbLoading && <span style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}>⏳</span>}
        </div>

        {/* Results */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', flex: 1, margin: '8px -20px -20px' }}>
          {filtered.length === 0 && !dbLoading && (
            <div style={{ padding: '8px 20px', color: 'var(--ink-light)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              No weapons match.
            </div>
          )}

          {GROUP_ORDER.filter(g => groups[g]?.length).map((groupName) => (
            <div key={groupName}>
              <div style={{
                padding: '3px 10px', fontSize: '0.65rem', fontFamily: "'Cinzel', serif", fontWeight: 700,
                color: 'var(--ink-light)', background: 'var(--parchment-dark)', borderTop: '1px solid var(--gold)',
                borderBottom: '1px solid var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase',
                position: 'sticky', top: 0, zIndex: 1,
              }}>
                {groupName}
              </div>
              {groups[groupName].map(([name, data]) => (
                <div
                  key={name}
                  onClick={() => handleSelect(name)}
                  style={rowStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--parchment-dark)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontWeight: 600, flex: 1 }}>{name}</span>
                  {data.dmg && (
                    <span style={{ color: 'var(--red-dark)', fontSize: '0.8rem', fontFamily: "'Cinzel', serif" }}>
                      {data.dmg} {data.dtype}
                    </span>
                  )}
                  {data.mastery && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--ink-light)', fontStyle: 'italic' }}>
                      {data.mastery}
                    </span>
                  )}
                  {data.fromDB && (
                    <span style={{
                      fontSize: '0.6rem', fontFamily: "'Cinzel', serif", fontWeight: 700,
                      background: 'var(--gold)', color: 'var(--ink)', borderRadius: 2, padding: '1px 4px',
                    }}>
                      DB
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {/* Custom name option */}
          <div
            onClick={handleClose}
            style={{ ...rowStyle, fontStyle: 'italic', color: 'var(--ink-light)', fontSize: '0.82rem', borderTop: '1px solid var(--gold-dark)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--parchment-dark)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            ✎ Use custom name
          </div>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

export function WeaponFormulaModal() {
  const { modals, closeModal, character, update } = useCharacter();
  const { open, index } = modals.weaponFormula || {};
  const weapon = open && index !== null ? character.weapons[index] : null;

  const [formula, setFormula] = useState({
    atkAbility: 'none',
    atkProf: true,
    dmgAbility: 'none',
    saveDCAbility: 'none',
    damageDice: '',
    damageType: ''
  });

  useEffect(() => {
    if (weapon) {
      const f = weapon.formulaData || {};
      let dDice = f.damageDice || '';
      let dType = f.damageType || '';
      if (!dDice && weapon.damage) {
        const diceMatch = weapon.damage.match(/^([\dd\s]+)/i);
        if (diceMatch) dDice = diceMatch[1].trim();
        const typeMatch = weapon.damage.match(/(slashing|piercing|bludgeoning|fire|cold|lightning|acid|poison|necrotic|radiant|thunder|psychic|force)/i);
        if (typeMatch) dType = typeMatch[1].toLowerCase();
      }
      setFormula({
        atkAbility: f.atkAbility || 'none',
        atkProf: f.atkProf !== false,
        dmgAbility: f.dmgAbility || 'none',
        saveDCAbility: f.saveDCAbility || 'none',
        damageDice: dDice,
        damageType: dType
      });
    }
  }, [weapon]);

  if (!open || !weapon) return null;

  const ABILITY_OPTS = [
    { key: 'none', label: 'Manual / None' },
    { key: 'str', label: 'STR' }, { key: 'dex', label: 'DEX' },
    { key: 'con', label: 'CON' }, { key: 'int', label: 'INT' },
    { key: 'wis', label: 'WIS' }, { key: 'cha', label: 'CHA' },
  ];

  const getAbilityMod = (ab) => Math.floor(((parseInt(character[ab]) || 10) - 10) / 2);
  const pb = parseInt(character.profBonus) || Math.ceil((parseInt(character.level) || 1) / 4) + 1;

  const getPreview = () => {
    const lines = [];
    if (formula.atkAbility && formula.atkAbility !== 'none') {
        const mod = getAbilityMod(formula.atkAbility);
        const total = mod + (formula.atkProf ? pb : 0);
        lines.push(`Attack: ${total >= 0 ? '+' : ''}${total}`);
    }
    if (formula.dmgAbility && formula.dmgAbility !== 'none') {
        const mod = getAbilityMod(formula.dmgAbility);
        let s = formula.damageDice || '';
        if (mod > 0) s += ` + ${mod}`;
        else if (mod < 0) s += ` - ${Math.abs(mod)}`;
        if (formula.damageType) s += ` ${formula.damageType}`;
        lines.push(`Damage: ${s || `modifier: ${mod >= 0 ? '+' : ''}${mod}`}`);
    }
    if (formula.saveDCAbility && formula.saveDCAbility !== 'none') {
        lines.push(`Save DC: ${8 + getAbilityMod(formula.saveDCAbility) + pb}`);
    }
    if (lines.length === 0) return <span style={{ color: 'var(--ink-light)' }}>No formula — manual input only.</span>;
    return lines.map((l, i) => <div key={i}><strong>{l.split(': ')[0]}:</strong> {l.split(': ')[1]}</div>);
  };

  const handleApply = () => {
    const newWeapons = [...character.weapons];
    const w = { ...newWeapons[index], formulaData: formula };
    
    if (formula.atkAbility && formula.atkAbility !== 'none') {
        const mod = getAbilityMod(formula.atkAbility);
        const total = mod + (formula.atkProf ? pb : 0);
        w.atk = total >= 0 ? `+${total}` : `${total}`;
    }
    if (formula.dmgAbility && formula.dmgAbility !== 'none') {
        const mod = getAbilityMod(formula.dmgAbility);
        let s = formula.damageDice || '';
        if (mod > 0) s += ` + ${mod}`;
        else if (mod < 0) s += ` - ${Math.abs(mod)}`;
        if (formula.damageType) s += ` ${formula.damageType}`;
        w.damage = s;
    }
    newWeapons[index] = w;
    update({ weapons: newWeapons });
    closeModal('weaponFormula');
  };

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) closeModal('weaponFormula'); }}>
      <ModalBox $maxWidth="360px">
        <CloseBtn onClick={() => closeModal('weaponFormula')}>&times;</CloseBtn>
        <ModalTitle>Weapon Formula</ModalTitle>
        
        <div style={{ marginBottom: 10 }}>
            <span className="field-label">Attack Bonus — Ability</span>
            <select value={formula.atkAbility} onChange={e => setFormula({...formula, atkAbility: e.target.value})} style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid var(--gold)', borderRadius: 4, background: 'var(--parchment)' }}>
                {ABILITY_OPTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <input type="checkbox" checked={formula.atkProf} onChange={e => setFormula({...formula, atkProf: e.target.checked})} style={{ width: 16, height: 16 }} id="wfAtkProf" />
            <label htmlFor="wfAtkProf" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.82rem', color: 'var(--ink)' }}>Add Proficiency Bonus</label>
        </div>
        <div style={{ marginBottom: 10 }}>
            <span className="field-label">Damage Modifier — Ability</span>
            <select value={formula.dmgAbility} onChange={e => setFormula({...formula, dmgAbility: e.target.value})} style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid var(--gold)', borderRadius: 4, background: 'var(--parchment)' }}>
                {ABILITY_OPTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
        </div>
        <div style={{ marginBottom: 14 }}>
            <span className="field-label">Save DC — Ability (= 8 + mod + PB)</span>
            <select value={formula.saveDCAbility} onChange={e => setFormula({...formula, saveDCAbility: e.target.value})} style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid var(--gold)', borderRadius: 4, background: 'var(--parchment)' }}>
                {ABILITY_OPTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
        </div>

        <div style={{ background: 'var(--parchment-dark)', border: '1px solid var(--gold)', borderRadius: 4, padding: 8, marginBottom: 16, fontSize: '0.85rem', fontFamily: "'Crimson Text', serif", lineHeight: 1.6 }}>
            {getPreview()}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={handleApply}>Apply</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => closeModal('weaponFormula')}>Cancel</button>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}
