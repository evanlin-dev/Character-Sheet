import styled from 'styled-components';
import { useCharacter } from '../context/CharacterContext';
import { xpTable } from '../data/constants';
import { getProfBonus } from '../utils/calculations';
import {
  ModalOverlay, ModalBox, ModalTitle, CloseBtn,
  Row, GhostBtn, PrimaryBtn, CinzelLabel,
} from '../styles/shared';

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

export default function CharacterInfo() {
  const { character, update, openModal } = useCharacter();

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (field === 'level') {
      const level = parseInt(val) || 1;
      update({ level, profBonus: getProfBonus(level) });
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
        <div className="field">
          <label className="field-label">Class</label>
          <input type="text" value={character.charClass} onChange={handleChange('charClass')} placeholder="e.g., Fighter" />
        </div>
        <div className="field">
          <label className="field-label">Level</label>
          <input type="number" value={character.level} onChange={handleChange('level')} min="1" max="20" />
        </div>
        <div className="field">
          <label className="field-label">Subclass</label>
          <input type="text" value={character.charSubclass} onChange={handleChange('charSubclass')} placeholder="e.g., Champion" />
        </div>
      </div>

      <div className="grid grid-4">
        <div className="field">
          <label className="field-label">Race</label>
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
        <GhostBtn onClick={() => openModal('mobileMore')} title="More info" style={{ fontSize: '1.2rem', padding: '4px 8px', lineHeight: 1 }}>⋮</GhostBtn>
      </Row>
    </div>
  );
}

// ─── MobileMoreModal ──────────────────────────────────────────────────────────

export function MobileMoreModal() {
  const { modals, closeModal, update, character, openModal } = useCharacter();
  if (!modals.mobileMore) return null;

  const xp = parseInt(character.experience) || 0;
  const next = xpTable.find(r => r.xp > xp);

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
              ? `Next level (${next.lvl}) at ${next.xp.toLocaleString()} XP — ${(next.xp - xp).toLocaleString()} to go`
              : 'Max level reached'}
          </XpHint>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

// ─── XpTableModal ─────────────────────────────────────────────────────────────

export function XpTableModal() {
  const { modals, closeModal } = useCharacter();
  if (!modals.xpTable) return null;

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
                  <tr key={row.lvl}>
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
  const { modals, closeModal, character, update } = useCharacter();
  if (!modals.expModal) return null;

  let totalInput = 0, partySize = 1;

  const handleConfirm = () => {
    const share = Math.floor(totalInput / partySize);
    update({ experience: (parseInt(character.experience) || 0) + share });
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
