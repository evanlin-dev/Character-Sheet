import { useState, useEffect } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from '../styles/shared';

const LOCAL_FORMULA_OPTS = [
  { key: 'fixed',         label: 'Fixed number' },
  { key: 'pb',            label: 'Proficiency Bonus',     compute: (c) => parseInt(c.profBonus) || Math.ceil((parseInt(c.level)||1) / 4) + 1 },
  { key: 'pb_x2',         label: 'Prof. Bonus × 2',       compute: (c) => (parseInt(c.profBonus) || Math.ceil((parseInt(c.level)||1) / 4) + 1) * 2 },
  { key: 'level',         label: 'Level',                 compute: (c) => parseInt(c.level) || 1 },
  { key: 'half_level',    label: 'Half Level',            compute: (c) => Math.max(1, Math.floor((parseInt(c.level)||1) / 2)) },
  { key: 'level_x5',      label: 'Level × 5',             compute: (c) => (parseInt(c.level)||1) * 5 },
  { key: 'str_mod',       label: 'STR modifier',          compute: (c) => Math.max(1, Math.floor(((parseInt(c.str)||10) - 10) / 2)) },
  { key: 'dex_mod',       label: 'DEX modifier',          compute: (c) => Math.max(1, Math.floor(((parseInt(c.dex)||10) - 10) / 2)) },
  { key: 'con_mod',       label: 'CON modifier',          compute: (c) => Math.max(1, Math.floor(((parseInt(c.con)||10) - 10) / 2)) },
  { key: 'int_mod',       label: 'INT modifier',          compute: (c) => Math.max(1, Math.floor(((parseInt(c.int)||10) - 10) / 2)) },
  { key: 'wis_mod',       label: 'WIS modifier',          compute: (c) => Math.max(1, Math.floor(((parseInt(c.wis)||10) - 10) / 2)) },
  { key: 'cha_mod',       label: 'CHA modifier',          compute: (c) => Math.max(1, Math.floor(((parseInt(c.cha)||10) - 10) / 2)) },
  { key: 'str_mod_pb',    label: 'STR mod + Prof. Bonus', compute: (c) => Math.max(1, Math.floor(((parseInt(c.str)||10) - 10) / 2) + (parseInt(c.profBonus) || Math.ceil((parseInt(c.level)||1) / 4) + 1)) },
  { key: 'dex_mod_pb',    label: 'DEX mod + Prof. Bonus', compute: (c) => Math.max(1, Math.floor(((parseInt(c.dex)||10) - 10) / 2) + (parseInt(c.profBonus) || Math.ceil((parseInt(c.level)||1) / 4) + 1)) },
  { key: 'con_mod_pb',    label: 'CON mod + Prof. Bonus', compute: (c) => Math.max(1, Math.floor(((parseInt(c.con)||10) - 10) / 2) + (parseInt(c.profBonus) || Math.ceil((parseInt(c.level)||1) / 4) + 1)) },
  { key: 'int_mod_pb',    label: 'INT mod + Prof. Bonus', compute: (c) => Math.max(1, Math.floor(((parseInt(c.int)||10) - 10) / 2) + (parseInt(c.profBonus) || Math.ceil((parseInt(c.level)||1) / 4) + 1)) },
  { key: 'wis_mod_pb',    label: 'WIS mod + Prof. Bonus', compute: (c) => Math.max(1, Math.floor(((parseInt(c.wis)||10) - 10) / 2) + (parseInt(c.profBonus) || Math.ceil((parseInt(c.level)||1) / 4) + 1)) },
  { key: 'cha_mod_pb',    label: 'CHA mod + Prof. Bonus', compute: (c) => Math.max(1, Math.floor(((parseInt(c.cha)||10) - 10) / 2) + (parseInt(c.profBonus) || Math.ceil((parseInt(c.level)||1) / 4) + 1)) },
  { key: 'rages',         label: 'Rages (Barbarian)',           group: 'class', compute: (c) => { const l = parseInt(c.level)||1; return l >= 17 ? 6 : l >= 12 ? 5 : l >= 6 ? 4 : l >= 3 ? 3 : 2; } },
  { key: 'channel_div_c', label: 'Channel Divinity (Cleric)',   group: 'class', compute: (c) => { const l = parseInt(c.level)||1; return l >= 18 ? 4 : l >= 6 ? 3 : 2; } },
  { key: 'wild_shape',    label: 'Wild Shape (Druid)',          group: 'class', compute: (c) => { const l = parseInt(c.level)||1; return l >= 17 ? 4 : l >= 6 ? 3 : 2; } },
  { key: 'second_wind',   label: 'Second Wind (Fighter)',       group: 'class', compute: (c) => { const l = parseInt(c.level)||1; return l >= 10 ? 4 : l >= 4 ? 3 : 2; } },
  { key: 'action_surge',  label: 'Action Surge (Fighter)',      group: 'class', compute: (c) => (parseInt(c.level)||1) >= 17 ? 2 : 1 },
  { key: 'indomitable',   label: 'Indomitable (Fighter)',       group: 'class', compute: (c) => { const l = parseInt(c.level)||1; return l >= 17 ? 3 : l >= 13 ? 2 : 1; } },
  { key: 'channel_div_p', label: 'Channel Divinity (Paladin)',  group: 'class', compute: (c) => (parseInt(c.level)||1) >= 11 ? 3 : 2 },
  { key: 'mystic_arcanum',label: 'Mystic Arcanum (Warlock)',    group: 'class', compute: (c) => { const l = parseInt(c.level)||1; return Math.max(0, Math.min(4, Math.floor((l - 9) / 2) + 1)); } },
];

function localComputeResourceMax(res, char) {
  if (!res.formulaKey || res.formulaKey === 'fixed') return res.fixedMax ?? res.max;
  const opt = LOCAL_FORMULA_OPTS.find(o => o.key === res.formulaKey);
  return (opt && opt.compute) ? Math.max(1, opt.compute(char)) : (res.fixedMax ?? res.max);
}

function ResourceItem({ res, index, char, onUpdate, onDelete }) {
  const { openModal } = useCharacter();
  const effectiveMax = localComputeResourceMax(res, char);
  const usePips = effectiveMax <= 10;
  const resetLabel = res.reset === 'sr' ? 'Short Rest' : res.reset === 'both' ? 'Both Rests' : 'Long Rest';
  const badgeClass = res.reset === 'sr' ? 'res-badge-sr' : res.reset === 'both' ? 'res-badge-both' : 'res-badge-lr';

  const toggleSlot = (i) => {
    const newUsed = i < res.used ? i : i + 1;
    onUpdate({ ...res, used: newUsed });
  };

  const stepResource = (delta) => {
    const newUsed = Math.max(0, Math.min(effectiveMax, (res.used || 0) + delta));
    onUpdate({ ...res, used: newUsed });
  };

  const formulaKey = res.formulaKey && res.formulaKey !== 'fixed' ? res.formulaKey : null;
  const formulaOpt = formulaKey ? LOCAL_FORMULA_OPTS.find(o => o.key === formulaKey) : null;

  const settingsBtn = !res.auto && (
    <button className="mini-btn" title="Resource settings" onClick={() => openModal('resourceSettings', { open: true, index })} style={{ padding: '0 5px', fontSize: '0.75rem', cursor: 'pointer' }}>⚙</button>
  );

  return (
    <div className="resource-item" style={{ position: 'relative' }}>
      {!res.auto && (
        <button className="delete-feature-btn" onClick={() => onDelete(index)} style={{ position: 'absolute', top: 4, right: 4, margin: 0 }}>&times;</button>
      )}
      <div className="resource-header" style={{ paddingRight: res.auto ? 0 : 22 }}>
        <input
          type="text"
          className="resource-name"
          value={res.name}
          onChange={(e) => onUpdate({ ...res, name: e.target.value })}
          placeholder="Resource Name"
          readOnly={!!res.auto}
          style={res.auto ? { pointerEvents: 'none' } : {}}
        />
        <div className="resource-controls" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {formulaKey && formulaOpt && (
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.72rem', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>
              {formulaOpt.label} = {effectiveMax}
            </span>
          )}
          <span className={`res-badge ${badgeClass}`} style={{ fontSize: '0.6rem' }}>{resetLabel}</span>
          {settingsBtn}
        </div>
      </div>
      <div className="resource-slots">
        {usePips ? (
          Array.from({ length: effectiveMax }).map((_, i) => (
            <div
              key={i}
              className={`resource-slot${i < (res.used || 0) ? ' used' : ''}`}
              onClick={() => toggleSlot(i)}
            />
          ))
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="mini-btn" onClick={() => stepResource(-1)}>−</button>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.9rem', minWidth: 24, textAlign: 'center' }}>{res.used || 0}</span>
            <span style={{ color: 'var(--ink-light)' }}>/</span>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.9rem' }}>{effectiveMax}</span>
            <button className="mini-btn" onClick={() => stepResource(1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResourceSettingsModal() {
  const { modals, closeModal, character, update } = useCharacter();
  const { open, index } = modals.resourceSettings || {};
  const res = open && index !== null ? character.resourcesData[index] : null;

  const [formulaKey, setFormulaKey] = useState('fixed');
  const [fixedMax, setFixedMax] = useState(3);
  const [resetType, setResetType] = useState('lr');

  useEffect(() => {
    if (res) {
      setFormulaKey(res.formulaKey || 'fixed');
      setFixedMax(res.fixedMax ?? res.max ?? 3);
      setResetType(res.reset || 'lr');
    }
  }, [res]);

  if (!open || !res) return null;

  const handleApply = () => {
    const newResources = [...character.resourcesData];
    const updatedRes = { ...newResources[index], formulaKey, fixedMax, reset: resetType };
    updatedRes.max = formulaKey === 'fixed' ? fixedMax : localComputeResourceMax(updatedRes, character);
    if (updatedRes.used > updatedRes.max) updatedRes.used = updatedRes.max;
    newResources[index] = updatedRes;
    update({ resourcesData: newResources });
    closeModal('resourceSettings');
  };

  const computedVal = formulaKey === 'fixed' ? fixedMax : localComputeResourceMax({ formulaKey, fixedMax }, character);

  const generalOpts = LOCAL_FORMULA_OPTS.filter(o => !o.group);
  const classOpts = LOCAL_FORMULA_OPTS.filter(o => o.group === 'class');

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) closeModal('resourceSettings'); }}>
      <ModalBox $maxWidth="340px">
        <CloseBtn onClick={() => closeModal('resourceSettings')}>&times;</CloseBtn>
        <ModalTitle>{res.name} — Settings</ModalTitle>

        <div className="field" style={{ marginBottom: 10 }}>
          <span className="field-label">Max Pips Formula</span>
          <select
            value={formulaKey}
            onChange={e => setFormulaKey(e.target.value)}
            style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid var(--gold)', borderRadius: 4, background: 'var(--parchment)', fontSize: '0.9rem' }}
          >
            {generalOpts.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            <optgroup label="─── Class Resources ───">
              {classOpts.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </optgroup>
          </select>
        </div>

        {formulaKey === 'fixed' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.8rem', color: 'var(--ink)' }}>Fixed max:</span>
            <button className="mini-btn" onClick={() => setFixedMax(Math.max(1, fixedMax - 1))}>−</button>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '1rem', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{fixedMax}</span>
            <button className="mini-btn" onClick={() => setFixedMax(fixedMax + 1)}>+</button>
          </div>
        )}

        <div style={{ fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: 16 }}>
          Computed value: <strong>{computedVal}</strong>
        </div>

        <div className="field" style={{ marginBottom: 12 }}>
          <span className="field-label">Resets on</span>
          <select
            value={resetType}
            onChange={e => setResetType(e.target.value)}
            style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid var(--gold)', borderRadius: 4, background: 'var(--parchment)', fontSize: '0.9rem' }}
          >
            <option value="lr">Long Rest</option>
            <option value="sr">Short Rest</option>
            <option value="both">Both Rests</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={handleApply}>Apply</button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => closeModal('resourceSettings')}>Cancel</button>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

export default function Resources() {
  const { character, update } = useCharacter();
  const resources = character.resourcesData || [];

  const updateResource = (index, newRes) => {
    const updated = resources.map((r, i) => i === index ? newRes : r);
    update({ resourcesData: updated });
  };

  const deleteResource = (index) => {
    if (window.confirm('Delete this resource?')) {
      update({ resourcesData: resources.filter((_, i) => i !== index) });
    }
  };

  const addResource = () => {
    update({ resourcesData: [...resources, { name: 'New Resource', max: 3, used: 0, reset: 'lr', formulaKey: 'fixed', fixedMax: 3 }] });
  };

  return (
    <div className="sheet-section">
      <h2 className="section-title">Class Resources</h2>
      <div id="resourcesContainer">
        {resources.map((res, i) => (
          <ResourceItem
            key={i}
            res={res}
            index={i}
            char={character}
            onUpdate={(newRes) => updateResource(i, newRes)}
            onDelete={deleteResource}
          />
        ))}
      </div>
      <button className="add-feature-btn" onClick={addResource}>+ Add Resource</button>
    </div>
  );
}
