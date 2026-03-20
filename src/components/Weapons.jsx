import { useState, useEffect, useRef } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { dndWeaponsDB, masteryDescriptions } from '../data/constants';
import { calcMod, formatMod, getProfBonus } from '../utils/calculations';
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from '../styles/shared';

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
        [json.baseitem, json.baseitems].forEach((arr) => {
          if (!Array.isArray(arr)) return;
          arr.forEach((item) => {
            if (!item.weaponCategory || !item.name) return;

            const type   = item.weaponCategory.toLowerCase() === 'martial' ? 'Martial' : 'Simple';
            const rawT   = (item.type || '').split('|')[0];
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

            result[item.name] = { type, cat, dmg, dtype, props, mastery, fromDB: true };
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
  const notes    = [...weaponData.props, weaponData.mastery ? `Mastery: ${weaponData.mastery}` : ''].filter(Boolean).join(', ');

  return { atk, damage, notes };
}

// ─── WeaponItem ───────────────────────────────────────────────────────────────

function WeaponItem({ weapon, index, char, onUpdate, onDelete }) {
  const { openModal } = useCharacter();
  const containerRef = useRef(null);

  const openPicker = () => {
    // Pre-load the DB cache if it's not already loading/loaded
    if (_dbWeaponsCache === null) loadDBWeapons();

    openModal('weaponPicker', {
      open: true,
      // The callback that will be executed by the modal when a weapon is selected
      callback: (weaponName) => {
        // This logic is the same as the original handleSelect
        const allWeapons = { ...dndWeaponsDB, ...(_dbWeaponsCache || {}) };
        const data = allWeapons[weaponName];
        const autoStats = autoCalcWeapon(weaponName, data, char);
        onUpdate(autoStats ? { ...weapon, name: weaponName, ...autoStats } : { ...weapon, name: weaponName });
      }
    });
  };

  return (
    <div className="feature-box weapon-item" style={{ paddingRight: 40, position: 'relative' }}>
      <div style={{ display: 'flex', position: 'absolute', top: 5, right: 5, gap: 4, zIndex: 10 }}>
        <button className="delete-feature-btn" style={{ width: 24, height: 24 }} onClick={() => onDelete(index)}>&times;</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="grid grid-3" style={{ marginBottom: 0, gap: 10 }}>
          <div className="field">
            <span className="field-label">Weapon Name</span>
            <div ref={containerRef} style={{ position: 'relative' }}>
              <input
                type="text"
                className="weapon-name"
                value={weapon.name}
                onChange={(e) => onUpdate({ ...weapon, name: e.target.value })}
                onFocus={openPicker}
                placeholder="Enter or pick weapon…"
                style={{ fontWeight: 'bold', color: 'var(--red-dark)' }}
              />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Atk Bonus</span>
            <input type="text" className="weapon-atk" value={weapon.atk || ''} onChange={(e) => onUpdate({ ...weapon, atk: e.target.value })} placeholder="+0" />
          </div>
          <div className="field">
            <span className="field-label">Damage</span>
            <input type="text" className="weapon-damage" value={weapon.damage || ''} onChange={(e) => onUpdate({ ...weapon, damage: e.target.value })} placeholder="1d6+0" />
          </div>
        </div>
        <div className="field">
          <span className="field-label">Notes</span>
          <textarea
            className="weapon-notes"
            value={weapon.notes || ''}
            onChange={(e) => onUpdate({ ...weapon, notes: e.target.value })}
            placeholder="Properties…"
            rows={1}
          />
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
