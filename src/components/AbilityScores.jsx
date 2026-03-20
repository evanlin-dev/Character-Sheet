import { useState } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { abilities, abilityLabels, skillsMap, skillLabels, skillDescriptions } from '../data/constants';
import { calcMod, formatMod, getSkillTotal, getSaveTotal, getProfBonus } from '../utils/calculations';

const abilitySkillsMap = {
  str: ['athletics'],
  dex: ['acrobatics', 'sleight_of_hand', 'stealth'],
  con: [],
  int: ['arcana', 'history', 'investigation', 'nature', 'religion'],
  wis: ['animal_handling', 'insight', 'medicine', 'perception', 'survival'],
  cha: ['deception', 'intimidation', 'performance', 'persuasion'],
};

function InfoModal({ title, text, onClose }) {
  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="info-modal-content">
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h3 className="info-modal-title">{title}</h3>
        <div className="info-modal-text">{text}</div>
      </div>
    </div>
  );
}

function SkillItem({ name, isProf, isExpertise, hasAdvantage, mod, label, onToggle, onInfo, onToggleExp, onToggleAdv }) {
  return (
    <div className="skill-item" onClick={onToggle}>
      <div className={`skill-checkbox${isProf ? ' checked' : ''}${isExpertise ? ' expertise' : ''}`}>
        <div className="checkmark">✓</div>
      </div>
      <button 
        className={`expertise-btn${isExpertise ? ' expertise-active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleExp && onToggleExp(); }}
        title="Expertise"
      >
        E
      </button>
      <div className="skill-name">{label}</div>
      <span className="skill-info-btn" onClick={(e) => { e.stopPropagation(); onInfo(); }}>?</span>
      <button
        className={`adv-toggle${hasAdvantage ? ' active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleAdv && onToggleAdv(); }}
        title="Advantage"
      >
        A
      </button>
      <div className="skill-mod">{formatMod(mod)}</div>
    </div>
  );
}

export default function AbilityScores() {
  const { character, update, openModal } = useCharacter();
  const [infoModal, setInfoModal] = useState(null);

  const pb = parseInt(character.profBonus) || getProfBonus(parseInt(character.level) || 1);

  const toggleSkillProf = (skill) => {
    const current = character.skillProficiency?.[skill];
    if (!current) {
      update({ skillProficiency: { ...character.skillProficiency, [skill]: true } });
    } else {
      const newProf = { ...character.skillProficiency };
      const newExp = { ...character.skillExpertise };
      delete newProf[skill];
      delete newExp[skill];
      update({ skillProficiency: newProf, skillExpertise: newExp });
    }
  };

  const toggleSaveProf = (ability) => {
    const current = character.saveProficiency?.[ability];
    if (!current) {
      update({ saveProficiency: { ...character.saveProficiency, [ability]: true } });
    } else {
      const newProf = { ...character.saveProficiency };
      const newExp = { ...character.saveExpertise };
      delete newProf[ability];
      delete newExp[ability];
      update({ saveProficiency: newProf, saveExpertise: newExp });
    }
  };

  const toggleSkillExp = (skill) => {
    const isExp = character.skillExpertise?.[skill] || false;
    update({ skillExpertise: { ...(character.skillExpertise || {}), [skill]: !isExp } });
  };

  const toggleSaveExp = (ability) => {
    const isExp = character.saveExpertise?.[ability] || false;
    update({ saveExpertise: { ...(character.saveExpertise || {}), [ability]: !isExp } });
  };

  const toggleSkillAdv = (skill) => {
    const isAdv = character.skillAdvantage?.[skill] || false;
    update({ skillAdvantage: { ...(character.skillAdvantage || {}), [skill]: !isAdv } });
  };

  const toggleSaveAdv = (ability) => {
    const isAdv = character.saveAdvantage?.[ability] || false;
    update({ saveAdvantage: { ...(character.saveAdvantage || {}), [ability]: !isAdv } });
  };

  const showSkillInfo = (key) => {
    const label = skillDescriptions[key] ? (key.startsWith('save_') ? `${abilityLabels[key.replace('save_','')] || ''} Saving Throw` : skillLabels[key] || key) : key;
    setInfoModal({ title: label, text: skillDescriptions[key] || '' });
  };

  return (
    <div className="sheet-section full-width">
      <h2 className="section-title">Ability Scores, Saves &amp; Skills</h2>
      <div className="setup-scores-container" style={{ textAlign: 'center', marginBottom: 20 }}>
        <button className="btn btn-secondary" onClick={() => openModal('score')} style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
          Set Up Ability Scores
        </button>
      </div>

      <div className="stat-block">
        {abilities.map(ability => {
          const score = parseInt(character[ability]) || 10;
          const mod = calcMod(score);
          const skills = abilitySkillsMap[ability] || [];
          const saveTotal = getSaveTotal(character, ability);
          const isSaveProf = character.saveProficiency?.[ability];
          const isSaveExp = character.saveExpertise?.[ability];

          return (
            <div key={ability} className="stat-card">
              <div className="stat">
                <div className="stat-name">{abilityLabels[ability]}</div>
                <input
                  type="number"
                  className="stat-value"
                  value={character[ability] !== undefined ? character[ability] : 10}
                  min="1" max="30"
                  onChange={(e) => update({ [ability]: e.target.value.replace(/^0+(?=\d)/, "") })}
                />
                <div className="stat-modifier">
                  <input type="text" value={formatMod(mod)} readOnly style={{ width: 50 }} />
                </div>
              </div>
              <div className="stat-skills">
                <SkillItem
                  name={`save_${ability}`}
                  isProf={!!isSaveProf}
                  isExpertise={!!isSaveExp}
                  hasAdvantage={!!character.saveAdvantage?.[ability]}
                  mod={saveTotal}
                  label="Saving Throw"
                  onToggle={() => toggleSaveProf(ability)}
                  onInfo={() => showSkillInfo(`save_${ability}`)}
                  onToggleExp={() => toggleSaveExp(ability)}
                  onToggleAdv={() => toggleSaveAdv(ability)}
                />
                {skills.map(skill => {
                  const skillTotal = getSkillTotal(character, skill);
                  return (
                    <SkillItem
                      key={skill}
                      name={skill}
                      isProf={!!character.skillProficiency?.[skill]}
                      isExpertise={!!character.skillExpertise?.[skill]}
                      hasAdvantage={!!character.skillAdvantage?.[skill]}
                      mod={skillTotal}
                      label={skillLabels[skill]}
                      onToggle={() => toggleSkillProf(skill)}
                      onInfo={() => showSkillInfo(skill)}
                      onToggleExp={() => toggleSkillExp(skill)}
                      onToggleAdv={() => toggleSkillAdv(skill)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {infoModal && (
        <InfoModal
          title={infoModal.title}
          text={infoModal.text}
          onClose={() => setInfoModal(null)}
        />
      )}
    </div>
  );
}

export function ScoreModal() {
  const { modals, closeModal, update, character } = useCharacter();
  const [tab, setTab] = useState('standard');
  const [saSelections, setSaSelections] = useState({ str: '', dex: '', con: '', int: '', wis: '', cha: '' });
  const [pbScores, setPbScores] = useState({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });

  if (!modals.score) return null;

  const standardArray = [15, 14, 13, 12, 10, 8];
  const pbCosts = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
  const maxPoints = 27;

  const usedPoints = abilities.reduce((sum, a) => sum + (pbCosts[pbScores[a]] || 0), 0);
  const remaining = maxPoints - usedPoints;

  const usedValues = Object.values(saSelections).filter(v => v !== '');

  const applyStandardArray = () => {
    const newScores = {};
    abilities.forEach(a => { if (saSelections[a]) newScores[a] = parseInt(saSelections[a]); });
    update(newScores);
    closeModal('score');
  };

  const applyPointBuy = () => {
    update({ ...pbScores });
    closeModal('score');
  };

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }}>
      <div className="info-modal-content" style={{ maxWidth: 500 }}>
        <button className="close-modal-btn" onClick={() => closeModal('score')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Ability Score Generator</h3>
        <div className="score-modal-tabs">
          <div className={`score-tab${tab === 'standard' ? ' active' : ''}`} onClick={() => setTab('standard')}>Standard Array</div>
          <div className={`score-tab${tab === 'pointbuy' ? ' active' : ''}`} onClick={() => setTab('pointbuy')}>Point Buy</div>
        </div>

        {tab === 'standard' && (
          <div className="score-method-container active">
            <p style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: 15, fontSize: '0.9rem' }}>
              Assign each number once: 15, 14, 13, 12, 10, 8
            </p>
            <div className="sa-grid">
              {abilities.map(a => (
                <div key={a} className="sa-item">
                  <label className="field-label">{abilityLabels[a]}</label>
                  <select
                    className="sa-select"
                    value={saSelections[a]}
                    onChange={(e) => setSaSelections(prev => ({ ...prev, [a]: e.target.value }))}
                  >
                    <option value="">—</option>
                    {standardArray.map(v => (
                      <option key={v} value={v} disabled={usedValues.includes(String(v)) && saSelections[a] !== String(v)}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button className="btn" onClick={applyStandardArray}>Apply Standard Array</button>
            </div>
          </div>
        )}

        {tab === 'pointbuy' && (
          <div className="score-method-container active">
            <div className="point-buy-header">
              Remaining Points: <span style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{remaining}</span> / 27
            </div>
            {abilities.map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '8px 12px', background: 'white', border: '1px solid var(--gold)', borderRadius: 6 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, width: 110, fontSize: '0.85rem' }}>{abilityLabels[a]}</span>
                <button className="mini-btn" onClick={() => {
                  const cur = pbScores[a];
                  if (cur > 8) setPbScores(p => ({ ...p, [a]: cur - 1 }));
                }}>−</button>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: '1.2rem', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{pbScores[a]}</span>
                <button className="mini-btn" onClick={() => {
                  const cur = pbScores[a];
                  const nextCost = pbCosts[cur + 1];
                  if (cur < 15 && nextCost !== undefined && remaining >= (nextCost - (pbCosts[cur] || 0))) {
                    setPbScores(p => ({ ...p, [a]: cur + 1 }));
                  }
                }}>+</button>
                <span style={{ marginLeft: 'auto', color: 'var(--ink-light)', fontSize: '0.8rem' }}>
                  Mod: {formatMod(calcMod(pbScores[a]))}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button className="btn" onClick={applyPointBuy}>Apply Point Buy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
