import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn, Row, PrimaryBtn, CinzelLabel } from 'src/styles/shared';
import { useCharacter } from 'src/context/CharacterContext';
import CharacterInfo, { AlignmentModal, XpTableModal, ExpModal, MobileMoreModal } from 'src/components/CharacterInfo';
import AbilityScores, { ScoreModal } from 'src/components/AbilityScores';
import HitPoints, { HpManagementModal } from 'src/components/HitPoints';
import CombatStats, { ConditionModal, WeaponProfModal } from 'src/components/CombatStats';
import Resources from 'src/components/Resources';
import Weapons, { MasteryModal, WeaponPickerModal } from 'src/components/Weapons';
import ActionEconomy from 'src/components/ActionEconomy';
import FeaturesTab from 'src/components/tabs/FeaturesTab';
import EquipmentTab, { CurrencyModal, SplitMoneyModal, ManageMoneyModal } from 'src/components/tabs/EquipmentTab';
import SpellsTab from 'src/components/tabs/SpellsTab';
import NotesTab from 'src/components/tabs/NotesTab';
import SummonsTab from 'src/components/tabs/SummonsTab';
import { ThemeModal, LastSavedModal } from 'src/components/SheetActions';
import MobileAppView, { MobileHeader } from 'src/components/MobileAppView';
import Sidebar, { SidebarBtn } from 'src/components/Sidebar';

const TABS = [
  { id: 'features', label: 'Features & Traits' },
  { id: 'equipment', label: 'Equipment & Inventory' },
  { id: 'spells', label: 'Spells' },
  { id: 'notes', label: 'Notes' },
  { id: 'summons', label: 'Summons' },
];

export default function CharacterSheetPage() {
  const { character, update, openModal, closeModal, modals, reset, load } = useCharacter();
  const activeTab = character.activeTab || 'features';
  const [appViewMode, setAppViewMode] = useState(false);
  const [appViewInitial, setAppViewInitial] = useState('stats');
  const [swapScores, setSwapScores] = useState(() => localStorage.getItem('swapScores') === 'true');
  const [denseMode, setDenseMode] = useState(() => localStorage.getItem('denseMode') === 'true');
  const [showNavModal, setShowNavModal] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef();

  const toggleSwapScores = () => {
    const next = !swapScores;
    setSwapScores(next);
    localStorage.setItem('swapScores', next);
    document.body.classList.toggle('swap-scores', next);
  };

  const toggleDenseMode = () => {
    const next = !denseMode;
    setDenseMode(next);
    localStorage.setItem('denseMode', next);
    document.body.classList.toggle('dense-mode', next);
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(character, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.charName || 'character'}_sheet.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        load(data);
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const applyShortRest = (hpGained, diceUsed) => {
    const maxHp = parseInt(character.maxHp) || 1;
    const newHp = Math.min(maxHp, (parseInt(character.hp) || 0) + (parseInt(hpGained) || 0));
    const newUsed = (parseInt(character.hitDiceUsed) || 0) + (parseInt(diceUsed) || 0);
    const newResources = (character.resourcesData || []).map(r =>
      r.recharge === 'sr' || r.recharge === 'lr' ? { ...r, used: 0 } : r
    );
    update({ hp: newHp, hitDiceUsed: newUsed, resourcesData: newResources });
    closeModal('shortRest');
  };

  const applyLongRest = () => {
    const maxHp = parseInt(character.maxHp) || 1;
    const resetSlots = (character.spellSlotsData || []).map(s => ({ ...s, used: 0 }));
    const resetResources = (character.resourcesData || []).map(r =>
      r.recharge === 'lr' || r.recharge === 'sr' ? { ...r, used: 0 } : r
    );
    update({
      hp: maxHp,
      tempHp: 0,
      hitDiceUsed: 0,
      spellSlotsData: resetSlots,
      resourcesData: resetResources,
      deathSaves: { successes: [false, false, false], failures: [false, false, false] },
    });
    closeModal('longRest');
  };

  return (
    <>
      <Sidebar>
        {(closeSidebar) => (
          <>
            <SidebarBtn onClick={() => { navigate('/'); closeSidebar(); }}>Characters</SidebarBtn>
            <SidebarBtn onClick={() => { navigate('/create'); closeSidebar(); }}>Character Creator</SidebarBtn>
            <SidebarBtn onClick={() => { navigate('/data'); closeSidebar(); }}>Data Browser</SidebarBtn>
            <hr/>
            <SidebarBtn onClick={() => { toggleDenseMode(); closeSidebar(); }}>
              {denseMode ? 'Toggle Dense View (On)' : 'Toggle Dense View'}
            </SidebarBtn>
            <SidebarBtn onClick={() => { toggleSwapScores(); closeSidebar(); }}>
              {swapScores ? 'Swap Score/Mod (On)' : 'Swap Score/Mod'}
            </SidebarBtn>
            <hr/>
            <SidebarBtn onClick={() => { openModal('theme'); closeSidebar(); }}>Select Theme</SidebarBtn>
            <SidebarBtn onClick={() => { downloadJSON(); closeSidebar(); }}>Save JSON</SidebarBtn>
            <SidebarBtn onClick={() => { fileRef.current.click(); closeSidebar(); }}>Load JSON</SidebarBtn>
            <SidebarBtn onClick={() => { openModal('lastSaved'); closeSidebar(); }}>Last Saved Data</SidebarBtn>
            <hr/>
            <SidebarBtn onClick={() => { setShowNavModal(true); closeSidebar(); }}>App View</SidebarBtn>
            <hr/>
            <SidebarBtn onClick={() => {
              if (window.confirm('Reset all character data? This cannot be undone.')) {
                reset();
              }
              closeSidebar();
            }} style={{ color: 'var(--red-dark)', borderColor: 'var(--red)' }}>Reset Sheet</SidebarBtn>
          </>
        )}
      </Sidebar>

      <input type="file" ref={fileRef} accept=".json" style={{ display: 'none' }} onChange={loadJSON} />

      {/* Grid/Apps button - bottom right */}
      <button
        className="grid-menu-btn"
        onClick={() => setShowNavModal(true)}
        title="App View"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
      </button>

      {appViewMode ? (
        <MobileAppView onExit={() => setAppViewMode(false)} initialView={appViewInitial} onShortRest={() => openModal('shortRest')} onLongRest={() => openModal('longRest')} />
      ) : (
        <div className="character-sheet">
          <style>{`
            .res-rest-row { display: none !important; }
            @media (min-width: 901px) {
              .character-sheet:not(.dm-mode) > .header { display: none !important; }
              #mobile-sync-header { display: none !important; }
            }
          `}</style>
          <div className="header">
            <h1>Character Sheet</h1>
            <Link to="/dm" className="dm-screen-button">DM Screen</Link>
            <div className="subtitle">Character</div>
          </div>

          <MobileHeader
            char={character}
            update={update}
            onOpenHp={() => openModal('hpManage')}
            onShortRest={() => openModal('shortRest')}
            onLongRest={() => openModal('longRest')}
            onMoreInfo={() => openModal('mobileMore')}
          />

          <CharacterInfo />
          <AbilityScores />
          <HitPoints />
          <CombatStats />
          <Resources />
          <Weapons />
          <ActionEconomy />

          {/* Tabs Section */}
          <div className="sheet-section full-width">
            <h2 className="section-title">Extra</h2>
            <div className="tabs">
              {TABS.map(tab => (
                <div
                  key={tab.id}
                  className={`tab${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => update({ activeTab: tab.id })}
                >
                  {tab.label}
                </div>
              ))}
            </div>

            <div className={`tab-content${activeTab === 'features' ? ' active' : ''}`} id="features">
              {activeTab === 'features' && <FeaturesTab />}
            </div>
            <div className={`tab-content${activeTab === 'equipment' ? ' active' : ''}`} id="equipment">
              {activeTab === 'equipment' && <EquipmentTab />}
            </div>
            <div className={`tab-content${activeTab === 'spells' ? ' active' : ''}`} id="spells">
              {activeTab === 'spells' && <SpellsTab />}
            </div>
            <div className={`tab-content${activeTab === 'notes' ? ' active' : ''}`} id="notes">
              {activeTab === 'notes' && <NotesTab />}
            </div>
            <div className={`tab-content${activeTab === 'summons' ? ' active' : ''}`} id="summons">
              {activeTab === 'summons' && <SummonsTab />}
            </div>
          </div>
        </div>
      )}

      {/* All Modals */}
      <AlignmentModal />
      <XpTableModal />
      <ExpModal />
      <ScoreModal />
      <ConditionModal />
      <WeaponProfModal />
      <MasteryModal />
      <ThemeModal />
      <LastSavedModal />
      <CurrencyModal />
      <SplitMoneyModal />
      <ManageMoneyModal />
      <HpManagementModal />
      <MobileMoreModal />
      <WeaponPickerModal />

      {showNavModal && (
        <NavModal
          onSelect={(viewId) => {
            setAppViewInitial(viewId);
            setAppViewMode(true);
            setShowNavModal(false);
          }}
          onFullSheet={() => { setAppViewMode(false); setShowNavModal(false); }}
          onClose={() => setShowNavModal(false)}
        />
      )}
      {modals.shortRest && (
        <ShortRestModal
          character={character}
          onFinish={applyShortRest}
          onClose={() => closeModal('shortRest')}
        />
      )}
      {modals.longRest && (
        <LongRestModal
          onFinish={applyLongRest}
          onClose={() => closeModal('longRest')}
        />
      )}
    </>
  );
}

const NAV_VIEWS = [
  { id: 'stats',         label: 'Ability Scores & Skills' },
  { id: 'actions',       label: 'Actions' },
  { id: 'inventory',     label: 'Inventory' },
  { id: 'spells',        label: 'Spells' },
  { id: 'features',      label: 'Features & Traits' },
  { id: 'defenses',      label: 'Speed & Defenses' },
  { id: 'proficiencies', label: 'Proficiencies & Training' },
  { id: 'notes',         label: 'Notes' },
  { id: 'summons',       label: 'Summons & Creatures' },
];

function NavModal({ onSelect, onFullSheet, onClose }) {
  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="340px">
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center' }}>App View</ModalTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NAV_VIEWS.map(v => (
            <button key={v.id} className="btn" onClick={() => onSelect(v.id)} style={{ padding: '10px 8px', fontSize: '0.85rem' }}>
              {v.label}
            </button>
          ))}
          <button className="btn btn-secondary" onClick={onFullSheet} style={{ padding: '10px 8px', fontSize: '0.85rem', marginTop: 4 }}>
            Full Sheet
          </button>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

function ShortRestModal({ character, onFinish, onClose }) {
  const [hpGained, setHpGained] = useState('');
  const [diceUsed, setDiceUsed] = useState('1');
  const hdStr = character.hitDice || '1d8';
  const hitDie = parseInt(String(hdStr).replace(/^\d+d/, '')) || 8;
  const totalDice = parseInt(hdStr) || 1;
  const usedDice = parseInt(character.hitDiceUsed) || 0;
  const availDice = Math.max(0, totalDice - usedDice);

  const rollHp = () => {
    const conMod = Math.floor(((parseInt(character.con) || 10) - 10) / 2);
    const n = parseInt(diceUsed) || 1;
    let total = 0;
    for (let i = 0; i < n; i++) total += Math.floor(Math.random() * hitDie) + 1;
    total += conMod * n;
    setHpGained(String(Math.max(0, total)));
  };

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="340px">
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center' }}>Short Rest</ModalTitle>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: 12 }}>
          Hit Dice: {availDice}/{totalDice} available (d{hitDie})
        </p>
        <div className="field" style={{ marginBottom: 12 }}>
          <CinzelLabel>Hit Dice to Spend</CinzelLabel>
          <Row $gap="8px" style={{ marginTop: 6 }}>
            <input type="number" min="0" max={availDice} value={diceUsed} onChange={e => setDiceUsed(e.target.value)} style={{ width: 60 }} />
            <button className="btn" onClick={rollHp}>Roll</button>
          </Row>
        </div>
        <div className="field" style={{ marginBottom: 16 }}>
          <CinzelLabel>HP Gained</CinzelLabel>
          <input type="number" value={hpGained} onChange={e => setHpGained(e.target.value)} style={{ width: '100%' }} />
        </div>
        <PrimaryBtn style={{ width: '100%' }} onClick={() => onFinish(hpGained, diceUsed)}>
          Finish Rest
        </PrimaryBtn>
      </ModalBox>
    </ModalOverlay>
  );
}

function LongRestModal({ onFinish, onClose }) {
  const [checks, setChecks] = useState({ hp: false, slots: false, resources: false, hitDice: false, deathSaves: false });
  const toggle = (key) => setChecks(c => ({ ...c, [key]: !c[key] }));
  const items = [
    { key: 'hp', label: 'Restore HP to maximum' },
    { key: 'slots', label: 'Restore all spell slots' },
    { key: 'resources', label: 'Restore short & long rest resources' },
    { key: 'hitDice', label: 'Reset hit dice used' },
    { key: 'deathSaves', label: 'Clear death save rolls' },
  ];

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="340px">
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center' }}>Long Rest</ModalTitle>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: 12 }}>The following will be restored:</p>
        {items.map(item => (
          <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', fontSize: '0.95rem' }}>
            <input type="checkbox" checked={checks[item.key]} onChange={() => toggle(item.key)} style={{ width: 18, height: 18 }} />
            {item.label}
          </label>
        ))}
        <PrimaryBtn style={{ width: '100%', marginTop: 8 }} onClick={onFinish}>
          Take Long Rest
        </PrimaryBtn>
      </ModalBox>
    </ModalOverlay>
  );
}
