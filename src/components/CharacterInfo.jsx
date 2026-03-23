import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCharacter } from '../context/CharacterContext';
import { xpTable } from '../data/constants';
import { getProfBonus } from '../utils/calculations';
import {
  ModalOverlay, ModalBox, ModalTitle, CloseBtn,
  Row, CinzelLabel,
} from '../styles/shared';
import { openDB, STORE_NAME } from '../utils/db';
import { processEntries, cleanText } from '../utils/dndEntries';
import FluffImage from './FluffImage';
import { getGlobalSourcePriority } from '../utils/formatHelpers';

// ─── Styled atoms local to this file ─────────────────────────────────────────

const XpHint = styled.div`
  font-size: 0.75rem;
  color: var(--ink-light);
  margin-top: 4px;
`;

const FieldInput = styled.input`
  background: white;
  border: 1px solid var(--gold);
  padding: 8px;
  text-align: center;
  width: 100%;
  font-family: 'Crimson Text', serif;
  font-size: 1.1rem;
  border-radius: 4px;
`;

// ─── CharacterInfo ────────────────────────────────────────────────────────────

const toTitleCase = (s) => (s || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function cleanTextWithLinks(str) {
  if (!str) return '';
  const cleaned = str.replace(/\{@(\w+)\s*([^}]+)?\}/g, (match, tag, content) => {
    if (!content) return '';
    const parts = content.split('|');
    const name = parts[0] || '';
    if (tag === 'spell') {
      const display = parts[2] || toTitleCase(name);
      return `<span class="spell-link-detail" data-spell="${name.toLowerCase()}" style="color:var(--red-dark);font-weight:bold;cursor:pointer;border-bottom:1px dashed var(--red-dark);">${display}</span>`;
    }
    if (tag === 'recharge') return content ? `(Recharge ${content}-6)` : '(Recharge 6)';
    if (tag === 'h') return 'Hit: ';
    if (tag === 'm') return 'Miss: ';
    if (tag === 'b' || tag === 'bold') return `<b>${name}</b>`;
    if (tag === 'i' || tag === 'italic') return `<i>${name}</i>`;
    if (tag === 'dc') return `DC ${name}`;
    if (tag === 'hit') return `+${name}`;
    if (tag === 'filter') return name.split(';')[0].trim();
    if (parts.length >= 3 && parts[2]) return parts[2];
    return name;
  });
  return /\{@\w+/.test(cleaned) ? cleanTextWithLinks(cleaned) : cleaned;
}

function SpellPreviewModal({ spell, onClose }) {
  if (!spell) return null;
  const timeStr = spell.time && spell.time[0] ? `${spell.time[0].number} ${spell.time[0].unit}` : spell.time || '';
  const rangeStr = spell.range?.distance ? `${spell.range.distance.amount || ''} ${spell.range.distance.type}`.trim() : spell.range?.type || '';
  let desc = spell._desc || (spell.entries ? cleanTextWithLinks(processEntries(spell.entries)) : '');
  return (
    <ModalOverlay style={{ zIndex: 10001 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="520px" style={{ maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center', marginBottom: 4 }}>{spell.name}</ModalTitle>
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: 12, fontStyle: 'italic' }}>
          {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} {spell.school || ''}
          {spell.meta?.ritual ? ' · Ritual' : ''}
        </div>
        {(timeStr || rangeStr) && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: '0.85rem' }}>
            {timeStr && <span><strong>Casting Time:</strong> {timeStr}</span>}
            {rangeStr && <span><strong>Range:</strong> {rangeStr}</span>}
          </div>
        )}
        <div className="info-modal-text" style={{ overflowY: 'auto', flex: 1 }}
          dangerouslySetInnerHTML={{ __html: desc }} />
      </ModalBox>
    </ModalOverlay>
  );
}

const fmtCell = (cell) => {
  if (cell === null || cell === undefined) return '—';
  if (cell === 0) return '—';
  if (typeof cell === 'object') {
    if (cell.toRoll) return cell.toRoll.map(d => `${d.number}d${d.faces}`).join('+');
    if (cell.type === 'dice') return cell.toRoll?.map(d => `${d.number}d${d.faces}`).join('+') || '—';
    return String(cell.value ?? cell.average ?? '—');
  }
  return String(cell);
};

function ClassTableModal({ cls, onClose }) {
  const groups = cls?.classTableGroups || [];
  if (!groups.length) return null;
  return (
    <ModalOverlay style={{ zIndex: 10001 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="700px" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center', marginBottom: 12 }}>{cls.name} Progression</ModalTitle>
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
          <table className="currency-table" style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '4px 8px', textAlign: 'center' }}>Lvl</th>
                <th style={{ padding: '4px 8px', textAlign: 'center' }}>Prof</th>
                {groups.map((g, gi) =>
                  (g.colLabels || []).map((col, ci) => (
                    <th key={`${gi}-${ci}`} style={{ padding: '4px 8px', textAlign: 'center' }}
                      title={g.title || ''}>{cleanText(col)}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 20 }, (_, i) => i).map(lvl => {
                const prof = lvl < 4 ? 2 : lvl < 8 ? 3 : lvl < 12 ? 4 : lvl < 16 ? 5 : 6;
                return (
                  <tr key={lvl} style={{ background: lvl % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
                    <td style={{ padding: '3px 8px', textAlign: 'center', fontWeight: 'bold' }}>{lvl + 1}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'center' }}>+{prof}</td>
                    {groups.map((g, gi) =>
                      (g.colLabels || []).map((_, ci) => {
                        const cell = g.rows?.[lvl]?.[ci];
                        return <td key={`${gi}-${ci}`} style={{ padding: '3px 8px', textAlign: 'center' }}>{fmtCell(cell)}</td>;
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

function CompendiumDetailModal({ modal, onClose, spells }) {
  const [spellPreview, setSpellPreview] = useState(null);
  const [showClassTable, setShowClassTable] = useState(false);
  const [imgAspect, setImgAspect] = useState(null); // 'portrait' | 'landscape' | null
  if (!modal) return null;

  const { type, title, subtitle, fluff, baseObj, imgType, imgName, imgSource, imgClassName, imgSubclassName, imgShortName, headerHtml, features, entryHtml } = modal;

  const handleContentClick = (e) => {
    const link = e.target.closest('.spell-link-detail');
    if (link && spells) {
      const spellName = link.getAttribute('data-spell');
      const found = spells.find(s => s.name?.toLowerCase() === spellName);
      if (found) setSpellPreview(found);
    }
  };

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="680px" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', position: 'relative' }}>
        <CloseBtn onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>&times;</CloseBtn>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '16px 20px 20px' }}>
            {/* Race: always float right alongside description text */}
            {type === 'race' && (
              <FluffImage
                fluff={fluff} baseObj={baseObj} type={imgType} name={imgName} source={imgSource}
                className={imgClassName} subclassName={imgSubclassName} subclassShortName={imgShortName}
              />
            )}
            {/* Class/subclass: hidden probe to detect aspect, then render appropriately */}
            {type !== 'race' && imgAspect === null && (
              <FluffImage
                fluff={fluff} baseObj={baseObj} type={imgType} name={imgName} source={imgSource}
                className={imgClassName} subclassName={imgSubclassName} subclassShortName={imgShortName}
                onNaturalSize={(w, h) => setImgAspect(w > h ? 'landscape' : 'portrait')}
                imgStyle={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
              />
            )}
            {/* Landscape → full-width banner above title */}
            {type !== 'race' && imgAspect === 'landscape' && (
              <FluffImage
                fluff={fluff} baseObj={baseObj} type={imgType} name={imgName} source={imgSource}
                className={imgClassName} subclassName={imgSubclassName} subclassShortName={imgShortName}
                imgStyle={{ float: 'none', display: 'block', width: '100%', height: '220px', objectFit: 'cover', borderRadius: 8, margin: '0 0 16px' }}
              />
            )}
            <ModalTitle style={{ textAlign: 'center', marginBottom: 4 }}>{title}</ModalTitle>
            {subtitle && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: 8, fontStyle: 'italic' }}>
                {subtitle}
              </div>
            )}
            {type === 'class' && baseObj?.classTableGroups?.length > 0 && (
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '3px 12px' }}
                  onClick={() => setShowClassTable(true)}>
                  View Class Table
                </button>
              </div>
            )}
            {headerHtml && (
              <div className="info-modal-text" style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--parchment-dark)', borderRadius: 6, border: '1px solid var(--gold-light)' }}
                dangerouslySetInnerHTML={{ __html: headerHtml }} />
            )}
            {/* Boxed features — portrait image floats right *next to* the first feature via BFC */}
            {features && features.length > 0 && (
              <div>
                {imgAspect === 'portrait' && (
                  <FluffImage
                    fluff={fluff} baseObj={baseObj} type={imgType} name={imgName} source={imgSource}
                    className={imgClassName} subclassName={imgSubclassName} subclassShortName={imgShortName}
                    imgStyle={{ width: '180px', height: '460px', objectFit: 'cover', objectPosition: 'top', maxWidth: 'none', maxHeight: 'none' }}
                  />
                )}
                {features.map((f, i) => (
                  <div key={i} className="feature-box" style={{ padding: '10px 14px', overflow: 'hidden', marginBottom: 8 }} onClick={handleContentClick}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.95rem', color: 'var(--red-dark)', fontWeight: 'bold', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span>{f.name}</span>
                      {f.level != null && <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', fontWeight: 'normal' }}>Level {f.level}</span>}
                    </div>
                    <div className="info-modal-text" style={{ fontSize: '0.88rem' }}
                      dangerouslySetInnerHTML={{ __html: f.html }} />
                  </div>
                ))}
              </div>
            )}
            {/* Race entry */}
            {entryHtml && (
              <div className="info-modal-text" onClick={handleContentClick}
                dangerouslySetInnerHTML={{ __html: entryHtml }} />
            )}
          </div>
        </div>
      </ModalBox>
      {spellPreview && <SpellPreviewModal spell={spellPreview} onClose={() => setSpellPreview(null)} />}
      {showClassTable && <ClassTableModal cls={baseObj} onClose={() => setShowClassTable(false)} />}
    </ModalOverlay>
  );
}

export default function CharacterInfo({ onShortRest, onLongRest }) {
  const { character, update, openModal } = useCharacter();
  const [compData, setCompData] = useState(null); // { classes, races, classFeats, subclasses, subclassFeats }
  const [detailModal, setDetailModal] = useState(null); // { type, title, subtitle, html }

  useEffect(() => {
    async function load() {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve) => {
          const req = store.get('currentData');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (!data) return;

        const classMap = new Map(), raceMap = new Map(), subclassMap = new Map();
        const spells = [], classFeats = [], subclassFeats = [];

        const dedupeByPriority = (map, item) => {
          const key = item.name?.toLowerCase();
          if (!key) return;
          const existing = map.get(key);
          if (!existing || getGlobalSourcePriority(item.source) > getGlobalSourcePriority(existing.source)) {
            map.set(key, item);
          }
        };

        data.forEach((file) => {
          if (!file.name.toLowerCase().endsWith('.json')) return;
          try {
            const json = JSON.parse(file.content);
            if (json.class) json.class.forEach(c => dedupeByPriority(classMap, c));
            if (json.race) json.race.forEach(r => dedupeByPriority(raceMap, r));
            if (json.subclass) json.subclass.forEach(sc => {
              const key = `${(sc.className || sc.class || '').toLowerCase()}-${(sc.shortName || sc.name || '').toLowerCase()}`;
              const existing = subclassMap.get(key);
              if (!existing || getGlobalSourcePriority(sc.source) > getGlobalSourcePriority(existing.source)) {
                subclassMap.set(key, sc);
              }
            });
            if (json.spell) spells.push(...json.spell);
            if (json.spells) spells.push(...json.spells);
            if (json.classFeature) classFeats.push(...json.classFeature);
            if (json.subclassFeature) subclassFeats.push(...json.subclassFeature);
          } catch (e) {}
        });

        const classes = Array.from(classMap.values());
        const races = Array.from(raceMap.values());
        const subclasses = Array.from(subclassMap.values());
        setCompData({ classes, races, spells, classFeats, subclasses, subclassFeats });
      } catch (e) {}
    }
    load();
  }, []);

  const dedupe = (feats) => {
    const seen = new Set();
    return feats.filter(f => {
      const key = `${f.name}-${f.level}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  };

  const featToHtml = (f) => {
    const raw = f.entries ? processEntries(f.entries) : f.entry ? processEntries(f.entry) : '';
    return cleanTextWithLinks(raw);
  };

  const openClassDetail = () => {
    if (!compData || !character.charClass) return;
    const className = character.charClass.trim();
    const cls = compData.classes.find(c => c.name?.toLowerCase() === className.toLowerCase());

    const feats = dedupe(
      compData.classFeats
        .filter(f => (f.className || f.class)?.toLowerCase() === className.toLowerCase() && !f.subclassShortName)
        .sort((a, b) => a.level - b.level)
    );

    let headerHtml = '';
    if (cls) {
      if (cls.hd) headerHtml += `<strong>Hit Die:</strong> d${cls.hd.faces || cls.hd} &nbsp; `;
      if (cls.proficiency) headerHtml += `<strong>Saving Throws:</strong> ${cls.proficiency.map(p => p.toUpperCase()).join(', ')}`;
    }

    const features = feats.length
      ? feats.map(f => ({ name: f.name, level: f.level, html: featToHtml(f) }))
      : [{ name: 'No features found', html: '<p style="color:var(--ink-light);font-style:italic;">No class features found in loaded data.</p>' }];

    setDetailModal({
      type: 'class', title: className, subtitle: cls?.source || '',
      fluff: cls?._fluff || null, baseObj: cls || null,
      imgType: 'classes', imgName: className, imgSource: cls?.source || '',
      imgClassName: null, imgSubclassName: null, imgShortName: null,
      headerHtml, features, entryHtml: null,
    });
  };

  const openRaceDetail = () => {
    if (!compData || !character.race) return;
    const raceName = character.race.trim();
    const race = compData.races.find(r => r.name?.toLowerCase() === raceName.toLowerCase());

    let headerHtml = '';
    let entryHtml = '';
    if (race) {
      if (race.speed) {
        const spd = typeof race.speed === 'object' ? `${race.speed.walk || 30} ft.` : `${race.speed} ft.`;
        headerHtml += `<strong>Speed:</strong> ${spd}`;
      }
      if (race.ability) {
        const abilityNames = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
        const bonuses = race.ability.flatMap(a => Object.entries(a).map(([k, v]) => `${abilityNames[k] || k} +${v}`));
        if (bonuses.length) {
          if (headerHtml) headerHtml += ' &nbsp; ';
          headerHtml += `<strong>Ability Scores:</strong> ${bonuses.join(', ')}`;
        }
      }
      if (race.entries) entryHtml = cleanTextWithLinks(processEntries(race.entries));
    }
    if (!entryHtml) entryHtml = '<p style="color:var(--ink-light);font-style:italic;">No species details found in loaded data.</p>';

    setDetailModal({
      type: 'race', title: raceName, subtitle: race?.source || '',
      fluff: race?._fluff || null, baseObj: race || null,
      imgType: 'races', imgName: raceName, imgSource: race?.source || '',
      imgClassName: null, imgSubclassName: null, imgShortName: null,
      headerHtml: headerHtml || null, features: null, entryHtml,
    });
  };

  const openSubclassDetail = () => {
    if (!compData || !character.charSubclass || !character.charClass) return;
    const className = character.charClass.trim();
    const subclassName = character.charSubclass.trim();

    const sc = compData.subclasses.find(s => {
      const cName = s.className || s.class;
      const sName = s.shortName || s.name;
      return cName?.toLowerCase() === className.toLowerCase() && sName?.toLowerCase() === subclassName.toLowerCase();
    });

    const feats = dedupe(
      compData.subclassFeats
        .filter(f => {
          const cName = f.className || f.class;
          const sName = f.subclassShortName || f.subclassName || f.subclass;
          return cName?.toLowerCase() === className.toLowerCase() && sName?.toLowerCase() === subclassName.toLowerCase();
        })
        .sort((a, b) => a.level - b.level)
    );

    const features = feats.length
      ? feats.map(f => ({ name: f.name, level: f.level, html: featToHtml(f) }))
      : [{ name: 'No features found', html: '<p style="color:var(--ink-light);font-style:italic;">No subclass features found in loaded data.</p>' }];

    // Use exact name/shortName from data for image URL matching
    const scFullName = sc?.name || subclassName;
    const shortName = sc?.shortName || subclassName;
    setDetailModal({
      type: 'subclass', title: subclassName, subtitle: sc ? `${className} · ${sc.source || ''}` : className,
      fluff: sc?._fluff || null, baseObj: sc || null,
      imgType: 'subclasses', imgName: scFullName, imgSource: sc?.source || '',
      imgClassName: className, imgSubclassName: scFullName, imgShortName: shortName,
      headerHtml: null, features, entryHtml: null,
    });
  };

  const InfoQBtn = ({ onClick }) => (
    <span
      className="skill-info-btn"
      onClick={onClick}
      style={{ width: 16, height: 16, fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}
    >?</span>
  );

  const [showRestModal, setShowRestModal] = useState(false);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (field === 'level') {
      const level = parseInt(val) || 1;
      const oldLevel = parseInt(character.level) || 1;
      update({ level, profBonus: getProfBonus(level) });
      if (level > oldLevel) {
        setTimeout(() => openModal('levelUp', { open: true, level, oldLevel }), 100);
      }
    } else {
      update({ [field]: val });
    }
  };

  return (
    <div className="sheet-section full-width">
      <div className="grid grid-4">
        <div className="field">
          <label className="field-label">Character Name</label>
          <input type="text" value={character.charName} onChange={handleChange('charName')} placeholder="Enter name..." />
        </div>
        <div className="field" id="tutorial-class-field">
          <Row $justify="space-between" style={{ marginBottom: 6 }}>
            <label className="field-label" style={{ marginBottom: 0 }}>Class</label>
            {compData && character.charClass && <InfoQBtn onClick={openClassDetail} />}
          </Row>
          <input type="text" value={character.charClass} onChange={handleChange('charClass')} placeholder="e.g., Fighter" />
        </div>
        <div className="field">
          <Row $justify="space-between" style={{ marginBottom: 6 }}>
            <label className="field-label" style={{ marginBottom: 0 }}>Level</label>
            <button type="button" className="mini-btn" onClick={() => openModal('levelUp', { open: true, level: parseInt(character.level) || 1, oldLevel: Math.max(1, (parseInt(character.level) || 1) - 1) })} title="Level Up Features">▲</button>
          </Row>
          <input type="number" value={character.level} onChange={handleChange('level')} min="1" max="20" />
        </div>
        <div className="field" id="tutorial-subclass-field">
          <Row $justify="space-between" style={{ marginBottom: 6 }}>
            <label className="field-label" style={{ marginBottom: 0 }}>Subclass</label>
            {compData && character.charSubclass && character.charClass && <InfoQBtn onClick={openSubclassDetail} />}
          </Row>
          <input type="text" value={character.charSubclass} onChange={handleChange('charSubclass')} placeholder="e.g., Champion" />
        </div>
      </div>

      <div className="grid grid-4">
        <div className="field" id="tutorial-race-field">
          <Row $justify="space-between" style={{ marginBottom: 6 }}>
            <label className="field-label" style={{ marginBottom: 0 }}>Race</label>
            {compData && character.race && <InfoQBtn onClick={openRaceDetail} />}
          </Row>
          <input type="text" value={character.race} onChange={handleChange('race')} placeholder="Race" />
        </div>
        <div className="field">
          <label className="field-label">Background</label>
          <input type="text" value={character.background} onChange={handleChange('background')} placeholder="Background" />
        </div>
        <div className="field">
          <label className="field-label">Alignment</label>
          <input
            type="text"
            value={character.alignment}
            onClick={() => openModal('alignment')}
            placeholder="Click to set"
            readOnly
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="field">
          <Row $justify="space-between" style={{ marginBottom: 6 }}>
            <Row $gap="5px">
              <label className="field-label" style={{ marginBottom: 0 }}>Experience</label>
              <span className="skill-info-btn" onClick={() => openModal('xpTable')} style={{ width: 16, height: 16, fontSize: '0.7rem', cursor: 'pointer' }}>?</span>
            </Row>
            <button type="button" className="mini-btn" onClick={() => openModal('expModal')}>+</button>
          </Row>
          <input type="number" value={character.experience} onChange={handleChange('experience')} />
        </div>
      </div>

      {(onShortRest || onLongRest) && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <button
            className="rest-btn"
            style={{ padding: '6px 20px', fontSize: '0.85rem', background: 'linear-gradient(135deg, var(--parchment-dark), var(--parchment))', border: '1px solid var(--gold)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowRestModal(true)}
          >
            <span style={{ fontSize: '1rem' }}>☽</span> Rest
          </button>
          {showRestModal && (
            <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setShowRestModal(false); }}>
              <ModalBox $maxWidth="280px" $center>
                <ModalTitle style={{ textAlign: 'center', marginBottom: 16 }}>Take a Rest</ModalTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {onShortRest && (
                    <button className="rest-btn rest-btn-sr" style={{ padding: '10px', fontSize: '0.95rem', width: '100%' }}
                      onClick={() => { setShowRestModal(false); onShortRest(); }}>
                      Short Rest
                    </button>
                  )}
                  {onLongRest && (
                    <button className="rest-btn rest-btn-lr" style={{ padding: '10px', fontSize: '0.95rem', width: '100%' }}
                      onClick={() => { setShowRestModal(false); onLongRest(); }}>
                      Long Rest
                    </button>
                  )}
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowRestModal(false)}>Cancel</button>
                </div>
              </ModalBox>
            </ModalOverlay>
          )}
        </div>
      )}

      <Row $justify="center" style={{ marginBottom: 10 }}>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderColor: 'var(--red)' }}>
          <label className="field-label" style={{ marginBottom: 0, color: 'var(--red-dark)' }}>Heroic Inspiration</label>
          <input
            type="checkbox"
            checked={character.heroicInspiration}
            onChange={handleChange('heroicInspiration')}
            style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--red)' }}
          />
        </div>
      </Row>

      <CompendiumDetailModal key={detailModal ? `${detailModal.type}-${detailModal.title}` : 'none'} modal={detailModal} onClose={() => setDetailModal(null)} spells={compData?.spells} />
    </div>
  );
}

// ─── MobileMoreModal ──────────────────────────────────────────────────────────

export function MobileMoreModal() {
  const { modals, closeModal, update, character, openModal } = useCharacter();
  if (!modals.mobileMore) return null;

  const currentLevel = parseInt(character.level) || 1;
  const curEntry = xpTable.find(r => r.lvl === currentLevel) || xpTable[0];
  const next = xpTable.find(r => r.lvl === currentLevel + 1);
  const totalXp = curEntry.xp + (parseInt(character.experience) || 0);

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) closeModal('mobileMore'); }}>
      <ModalBox $maxWidth="400px">
        <CloseBtn onClick={() => closeModal('mobileMore')}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center' }}>Character Details</ModalTitle>

        <div className="field" style={{ marginBottom: 12 }}>
          <label className="field-label">Background</label>
          <input type="text" value={character.background || ''} onChange={e => update({ background: e.target.value })} placeholder="Background" />
        </div>

        <div className="field" style={{ marginBottom: 12 }}>
          <label className="field-label">Alignment</label>
          <input
            type="text"
            value={character.alignment || ''}
            onClick={() => { closeModal('mobileMore'); openModal('alignment'); }}
            placeholder="Click to set"
            readOnly
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className="field" style={{ marginBottom: 12 }}>
          <Row $justify="space-between" style={{ marginBottom: 6 }}>
            <Row $gap="6px">
              <label className="field-label" style={{ marginBottom: 0 }}>Experience</label>
              <span
                className="skill-info-btn"
                onClick={() => { closeModal('mobileMore'); openModal('xpTable'); }}
                style={{ width: 16, height: 16, fontSize: '0.7rem', cursor: 'pointer' }}
              >?</span>
            </Row>
            <button type="button" className="mini-btn" onClick={() => { closeModal('mobileMore'); openModal('expModal'); }}>+</button>
          </Row>
          <input type="number" value={character.experience || 0} onChange={e => update({ experience: parseInt(e.target.value) || 0 })} />
          <XpHint>
            {next
              ? `Next level (${next.lvl}) at ${next.xp.toLocaleString()} XP — ${(next.xp - totalXp).toLocaleString()} to go`
              : 'Max level reached'}
          </XpHint>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

// ─── XpTableModal ─────────────────────────────────────────────────────────────

export function XpTableModal() {
  const { modals, closeModal, character } = useCharacter();
  if (!modals.xpTable) return null;
  const currentLevel = parseInt(character.level) || 1;

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) closeModal('xpTable'); }}>
      <ModalBox $maxWidth="400px">
        <CloseBtn onClick={() => closeModal('xpTable')}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center' }}>Leveling Thresholds</ModalTitle>
        <div className="info-modal-text">
          <table className="currency-table" style={{ width: '100%' }}>
            <thead><tr><th>Level</th><th>XP</th><th>To Next</th><th>Prof</th></tr></thead>
            <tbody>
              {xpTable.map((row, i) => {
                const next = xpTable[i + 1];
                const toNext = next ? (next.xp - row.xp).toLocaleString() : '—';
                return (
                  <tr key={row.lvl} style={row.lvl === currentLevel ? { background: 'color-mix(in srgb, var(--gold) 25%, var(--parchment))', fontWeight: 'bold' } : {}}>
                    <td>{row.lvl}</td>
                    <td>{row.xp.toLocaleString()}</td>
                    <td>{toNext}</td>
                    <td>+{row.prof}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

// ─── AlignmentModal ───────────────────────────────────────────────────────────

export function AlignmentModal() {
  const { modals, closeModal, update } = useCharacter();
  if (!modals.alignment) return null;

  const alignments = [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
    'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
  ];

  return (
    <ModalOverlay>
      <ModalBox $maxWidth="340px" $center>
        <ModalTitle>Select Alignment</ModalTitle>
        <div className="alignment-grid">
          {alignments.map(a => (
            <div key={a} className="alignment-option" onClick={() => { update({ alignment: a }); closeModal('alignment'); }}>{a}</div>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => closeModal('alignment')}>Cancel</button>
      </ModalBox>
    </ModalOverlay>
  );
}

// ─── ExpModal ─────────────────────────────────────────────────────────────────

export function ExpModal() {
  const { modals, closeModal, character, update, openModal } = useCharacter();
  if (!modals.expModal) return null;

  let totalInput = 0, partySize = 1;

  const handleConfirm = () => {
    const share = Math.floor(totalInput / partySize);
    const oldLevel = parseInt(character.level) || 1;
    const leftoverStored = parseInt(character.experience) || 0;

    const curLvlEntry = xpTable.find(x => x.lvl === oldLevel) || xpTable[0];
    let currentXp = curLvlEntry.xp + leftoverStored + share;

    let newLevel = oldLevel;
    let newProf = getProfBonus(oldLevel);
    let newEntry = curLvlEntry;

    for (const entry of xpTable) {
      if (currentXp >= entry.xp) {
        newLevel = entry.lvl;
        newProf = entry.prof;
        newEntry = entry;
      } else break;
    }

    const newLeftover = currentXp - newEntry.xp;

    update({ experience: newLeftover, level: newLevel, profBonus: newProf });
    if (newLevel > oldLevel) {
      setTimeout(() => openModal('levelUp', { open: true, level: newLevel, oldLevel }), 100);
    }
    closeModal('expModal');
  };

  return (
    <ModalOverlay>
      <ModalBox $maxWidth="300px" $center>
        <ModalTitle>Add Experience</ModalTitle>
        <div style={{ marginBottom: 10 }}>
          <CinzelLabel style={{ display: 'block', marginBottom: 4 }}>Total XP</CinzelLabel>
          <FieldInput
            type="number"
            placeholder="Total Amount"
            onChange={(e) => { totalInput = parseInt(e.target.value) || 0; }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <CinzelLabel style={{ display: 'block', marginBottom: 4 }}>Split By (Players)</CinzelLabel>
          <FieldInput
            type="number"
            defaultValue={1}
            min="1"
            onChange={(e) => { partySize = parseInt(e.target.value) || 1; }}
          />
        </div>
        <Row $justify="center">
          <button className="btn" onClick={handleConfirm}>Add Share</button>
          <button className="btn btn-secondary" onClick={() => closeModal('expModal')}>Cancel</button>
        </Row>
      </ModalBox>
    </ModalOverlay>
  );
}
