import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn, Row, PrimaryBtn, CinzelLabel } from 'src/styles/shared';
import { useCharacter } from 'src/context/CharacterContext';
import CharacterInfo, { AlignmentModal, XpTableModal, ExpModal, MobileMoreModal } from 'src/components/CharacterInfo';
import AbilityScores, { ScoreModal } from 'src/components/AbilityScores';
import HitPoints, { HpManagementModal } from 'src/components/HitPoints';
import CombatStats, { ConditionModal, WeaponProfModal, DefensesModal } from 'src/components/CombatStats';
import Resources, { ResourceSettingsModal } from 'src/components/Resources';
import Weapons, { MasteryModal, WeaponPickerModal, WeaponFormulaModal } from 'src/components/Weapons';
import ActionEconomy from 'src/components/ActionEconomy';
import FeaturesTab from 'src/components/tabs/FeaturesTab';
import EquipmentTab, { CurrencyModal, SplitMoneyModal, ManageMoneyModal } from 'src/components/tabs/EquipmentTab';
import SpellsTab from 'src/components/tabs/SpellsTab';
import NotesTab from 'src/components/tabs/NotesTab';
import SummonsTab from 'src/components/tabs/SummonsTab';
import { ThemeModal, LastSavedModal, CustomDataModal } from 'src/components/SheetActions';
import MobileAppView, { MobileHeader } from 'src/components/MobileAppView';
import Sidebar, { SidebarBtn } from 'src/components/Sidebar';
import { checkDataLoaded } from 'src/utils/db';
import LevelUpModal from 'src/components/LevelUpModal';
import TutorialOverlay from 'src/components/TutorialOverlay';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABS = [
  { id: 'features', label: 'Features & Traits' },
  { id: 'equipment', label: 'Equipment & Inventory' },
  { id: 'spells', label: 'Spells' },
  { id: 'notes', label: 'Notes' },
  { id: 'summons', label: 'Summons' },
];

export default function CharacterSheetPage({ isEmbedded = false, initiativeList = [], socket = null, roomId = null, myName = "" }) {
  const { character, update, openModal, closeModal, modals, reset, load } = useCharacter();
  const activeTab = character.activeTab || 'features';
  const [appViewMode, setAppViewMode] = useState(false);
  const [appViewInitial, setAppViewInitial] = useState('stats');
  const [swapScores, setSwapScores] = useState(() => {
    const v = localStorage.getItem('swapScores') === 'true';
    if (v) document.body.classList.add('swap-scores');
    return v;
  });
  const [denseMode, setDenseMode] = useState(() => {
    const v = localStorage.getItem('denseMode') === 'true';
    if (v) document.body.classList.add('dense-mode');
    return v;
  });
  const [showNavModal, setShowNavModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showJumpMenu, setShowJumpMenu] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const fileRef = useRef();

  useEffect(() => {
    checkDataLoaded().then(res => {
      setHasData(res);
      setDataLoading(false);
    });
  }, []);

  // Ensure ability score names are compressed on mobile full sheet view
  // and that vanilla JS DOM enhancements persist after React renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.updateResponsiveStatNames) window.updateResponsiveStatNames();
      
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
      if (isMobile && !appViewMode && !denseMode) {
        document.querySelectorAll('.stat-name').forEach(el => {
          if (el.dataset.originalText) {
            const text = el.dataset.originalText.substring(0, 3);
            el.textContent = text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(); // e.g., "Int"
          }
        });
      }
      if (isMobile && window.injectMobileModLabels) window.injectMobileModLabels();
      if (window.injectExpertiseButtons) window.injectExpertiseButtons();
    }, 50);
    return () => clearTimeout(timer);
  }, [character, appViewMode, denseMode]);

  const hasModal = Object.values(modals).some(Boolean) || showNavModal;
  useEffect(() => {
    if (hasModal) {
      window.__modalCount = (window.__modalCount || 0) + 1;
      document.body.classList.add('modal-open');
      return () => {
        window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
        if (window.__modalCount === 0) document.body.classList.remove('modal-open');
      };
    }
  }, [hasModal]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUser(session.user);
      else setUser(null);
    });
    return () => authListener?.subscription.unsubscribe();
  }, []);

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

  const applyLongRest = (checks = { hp: true, slots: true, resources: true, hitDice: true, deathSaves: true }) => {
    const updates = {};
    if (checks.hp) {
      updates.hp = parseInt(character.maxHp) || 1;
      updates.tempHp = 0;
    }
    if (checks.slots) updates.spellSlotsData = (character.spellSlotsData || []).map(s => ({ ...s, used: 0 }));
    if (checks.resources) updates.resourcesData = (character.resourcesData || []).map(r => r.recharge === 'lr' || r.recharge === 'sr' ? { ...r, used: 0 } : r);
    if (checks.hitDice) updates.hitDiceUsed = 0;
    if (checks.deathSaves) updates.deathSaves = { successes: [false, false, false], failures: [false, false, false] };
    update(updates);
    closeModal('longRest');
  };

  return (
    <>
      {!isEmbedded && (
        <Sidebar>
          {(closeSidebar) => (
            <>
                <SidebarBtn id="tut-sb-characters" onClick={() => { openModal('charManager'); closeSidebar(); }}>Characters</SidebarBtn>
                <SidebarBtn id="tut-sb-creator" onClick={() => { navigate('/create'); closeSidebar(); }}>Character Creator</SidebarBtn>
                <SidebarBtn id="tut-sb-data" onClick={() => { navigate('/data'); closeSidebar(); }}>Data Browser</SidebarBtn>
              {dataLoading ? (
                  <SidebarBtn id="tut-sb-compendium" style={{ opacity: 0.5, cursor: 'default' }}>Loading...</SidebarBtn>
              ) : hasData ? (
                  <SidebarBtn id="tut-sb-compendium" onClick={() => { navigate('/compendium'); closeSidebar(); }}>Compendium</SidebarBtn>
              ) : null}
                <SidebarBtn id="tut-sb-custom" onClick={() => { openModal('customData'); closeSidebar(); }}>Custom Data / Templates</SidebarBtn>
              <hr/>
                <SidebarBtn id="tut-sb-dense" onClick={() => { toggleDenseMode(); closeSidebar(); }}>
                {denseMode ? '⊞ Dense Mode (On)' : '⊞ Dense Mode'}
              </SidebarBtn>
                <SidebarBtn id="tut-sb-swap" onClick={() => { toggleSwapScores(); closeSidebar(); }}>
                {swapScores ? 'Swap Score/Mod (On)' : 'Swap Score/Mod'}
              </SidebarBtn>
              <hr/>
                <SidebarBtn id="tut-sb-theme" onClick={() => { openModal('theme'); closeSidebar(); }}>Select Theme</SidebarBtn>
                <SidebarBtn id="tut-sb-save" onClick={() => { downloadJSON(); closeSidebar(); }}>Save JSON</SidebarBtn>
                <SidebarBtn id="tut-sb-load" onClick={() => { fileRef.current.click(); closeSidebar(); }}>Load JSON</SidebarBtn>
                <SidebarBtn id="tut-sb-last" onClick={() => { openModal('lastSaved'); closeSidebar(); }}>Last Saved Data</SidebarBtn>
              <hr/>
                <SidebarBtn id="tut-sb-appview" onClick={() => { setShowNavModal(true); closeSidebar(); }}>App View</SidebarBtn>
              {dataLoading ? (
                  <SidebarBtn id="tut-sb-tutorial" style={{ opacity: 0.5, cursor: 'default' }}>Loading...</SidebarBtn>
              ) : hasData ? (
                  <SidebarBtn id="tut-sb-tutorial" onClick={() => { setShowTutorial(true); closeSidebar(); }}>Tutorial</SidebarBtn>
              ) : null}
              <hr/>
                <SidebarBtn id="tut-sb-reset" onClick={() => {
                if (window.confirm('Reset all character data? This cannot be undone.')) {
                  reset();
                }
                closeSidebar();
              }} style={{ color: 'var(--red-dark)', borderColor: 'var(--red)' }}>Reset Sheet</SidebarBtn>
            </>
          )}
        </Sidebar>
      )}

      <input type="file" ref={fileRef} accept=".json" style={{ display: 'none' }} onChange={loadJSON} />

      {/* Grid/Apps button - bottom right */}
      <button
        className="grid-menu-btn"
        onClick={() => setShowNavModal(true)}
        title="App View"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
      </button>

      {/* Quick-jump nav — normal mode only */}
      {!appViewMode && !denseMode && (
        <div style={{ position: 'fixed', bottom: 20, right: 72, zIndex: 1100 }}>
          {showJumpMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0 }} onClick={() => setShowJumpMenu(false)} />
              <div style={{ position: 'absolute', bottom: 48, right: 0, background: 'var(--parchment)', border: '2px solid var(--gold)', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', overflow: 'hidden', minWidth: 160 }}>
                {[
                  { label: 'Ability Scores', id: 'jump-scores' },
                  { label: 'Hit Points', id: 'jump-hp' },
                  { label: 'Combat', id: 'jump-combat' },
                  { label: 'Weapons', id: 'jump-weapons' },
                  { label: 'Resources', id: 'jump-resources' },
                  { label: 'Actions', id: 'jump-actions' },
                  { label: 'Features', id: 'jump-tabs', tab: 'features' },
                  { label: 'Equipment', id: 'jump-tabs', tab: 'equipment' },
                  { label: 'Spells', id: 'jump-tabs', tab: 'spells' },
                  { label: 'Notes', id: 'jump-tabs', tab: 'notes' },
                  { label: 'Summons', id: 'jump-tabs', tab: 'summons' },
                ].map(({ label, id, tab }) => (
                  <div
                    key={label}
                    onClick={() => {
                      if (tab) update({ activeTab: tab });
                      setTimeout(() => {
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, tab ? 50 : 0);
                      setShowJumpMenu(false);
                    }}
                    style={{ padding: '8px 16px', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: 'var(--ink)', borderBottom: '1px solid var(--gold-light)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--parchment-dark)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => setShowJumpMenu(v => !v)}
            title="Jump to section"
            style={{ width: 46, height: 46, borderRadius: '50%', background: showJumpMenu ? 'var(--red-dark)' : 'var(--red)', border: '3px solid var(--gold)', boxShadow: '0 3px 12px rgba(0,0,0,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background 0.15s' }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </button>
        </div>
      )}

      {appViewMode ? (
        <MobileAppView 
          onExit={() => setAppViewMode(false)} 
          initialView={appViewInitial} 
          onShortRest={() => openModal('shortRest')} 
          onLongRest={() => openModal('longRest')} 
          initiativeList={initiativeList}
          socket={socket}
          roomId={roomId}
          myName={myName}
        />
      ) : denseMode ? (
        /* ── Dense Mode: 2-column desktop layout ───────────────────────── */
        <div className={`dense-sheet${isEmbedded ? " w-full" : ""}`}>
          {isEmbedded && <style>{`.dense-sheet::before { display: none !important; }`}</style>}
          <style>{`.res-rest-row { display: none !important; } #mobile-sync-header { display: none !important; }`}</style>

          {!isEmbedded && (
            <div className="header" style={{ marginBottom: 8 }}>
              <h1>Character Sheet</h1>
              <Link to="/dm" className="dm-screen-button">DM Screen</Link>
              <div className="subtitle">
                Character
                {user && <div style={{ fontSize: '0.8rem', marginTop: 4, fontWeight: 'normal', textTransform: 'none', color: 'var(--ink-light)' }}>Logged in as: {user.email.split('@')[0]}</div>}
              </div>
            </div>
          )}

          <MobileHeader
            char={character}
            update={update}
            onOpenHp={() => openModal('hpManage')}
            onShortRest={() => openModal('shortRest')}
            onLongRest={() => openModal('longRest')}
            onMoreInfo={() => openModal('mobileMore')}
          />

          {/* Concentration & effects banners */}
          {character.concentrationSpell && (
            <div className="desktop-conc-banner" onClick={() => update({ concentrationSpell: "" })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--parchment-dark)', border: '2px solid var(--gold)', padding: '6px 16px', marginBottom: 8, borderRadius: 8, cursor: 'pointer' }}
              title="Click to drop concentration"
            >
              <span style={{ color: 'var(--red)', fontSize: '1.1rem' }}>◉</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 'bold', color: 'var(--ink)' }}>Concentrating:</span>
              <span style={{ color: 'var(--red-dark)', fontWeight: 'bold' }}>{character.concentrationSpell}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--ink-light)', fontSize: '0.85rem' }}>✕ Drop</span>
            </div>
          )}
          {character.activeEffects && character.activeEffects.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--parchment)', border: '1px solid var(--gold)', padding: '4px 12px', marginBottom: 8, borderRadius: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 'bold', color: 'var(--ink)', fontSize: '0.85rem' }}>Active Effects:</span>
              {character.activeEffects.map(eff => (
                <span key={eff} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.6)', padding: '1px 8px', borderRadius: 16, border: '1px solid var(--gold-light)', fontSize: '0.8rem', color: 'var(--ink)', fontWeight: 'bold', gap: 5 }}>
                  {eff}
                  <span style={{ cursor: 'pointer', color: 'var(--red)', fontSize: '0.9rem', lineHeight: 1 }} onClick={() => update({ activeEffects: character.activeEffects.filter(e => e !== eff) })}>&times;</span>
                </span>
              ))}
            </div>
          )}

          {/* Character info — full width, with rest buttons above heroic inspiration */}
          <CharacterInfo onShortRest={() => openModal('shortRest')} onLongRest={() => openModal('longRest')} />

          {/* Slim HP header strip */}
          {(() => {
            const hp = parseInt(character.hp) || 0;
            const maxHp = parseInt(character.maxHp) || 1;
            const tempHp = parseInt(character.tempHp) || 0;
            const pct = Math.min(100, Math.max(0, (hp / maxHp) * 100));
            const tempPct = Math.min(100 - pct, (tempHp / maxHp) * 100);
            const deathSaves = character.deathSaves || { successes: [false,false,false], failures: [false,false,false] };
            const toggleDS = (type, i) => {
              const key = type === 's' ? 'successes' : 'failures';
              const arr = [...(deathSaves[key])];
              arr[i] = !arr[i];
              update({ deathSaves: { ...deathSaves, [key]: arr } });
            };
            return (
              <div style={{ marginBottom: 8 }}>
                {/* HP bar */}
                <div style={{ height: 6, background: '#e8d5b0', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--gold-light)', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: hp === 0 ? 'var(--red-dark)' : 'var(--red)', float: 'left' }} />
                  {tempPct > 0 && <div style={{ height: '100%', width: `${tempPct}%`, background: '#5b8dd9', float: 'left' }} />}
                </div>
                {/* HP row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    onClick={() => openModal('hpManage')}
                    style={{ display: 'flex', alignItems: 'baseline', gap: 4, cursor: 'pointer', background: 'white', border: '1px solid var(--gold)', borderRadius: 5, padding: '3px 10px' }}
                    title="Click to manage HP"
                  >
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'var(--ink-light)', textTransform: 'uppercase', marginRight: 4 }}>HP</span>
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1.4rem', color: hp === 0 ? 'var(--red-dark)' : 'var(--ink)', lineHeight: 1 }}>{hp}</span>
                    {tempHp > 0 && <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: '#5b8dd9' }}>+{tempHp}</span>}
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: 'var(--ink-light)' }}>/ {maxHp}</span>
                  </div>
                  {hp === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {['s','f'].map(type => (
                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: type === 's' ? 'var(--ink)' : 'var(--red-dark)', fontWeight: 700, minWidth: 10 }}>{type === 's' ? 'S' : 'F'}</span>
                          {[0,1,2].map(i => (
                            <div
                              key={i}
                              onClick={() => toggleDS(type, i)}
                              style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${type === 's' ? 'var(--ink)' : 'var(--red-dark)'}`, background: deathSaves[type === 's' ? 'successes' : 'failures'][i] ? (type === 's' ? 'var(--ink)' : 'var(--red-dark)') : 'white', cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Two-column body */}
          <div className="dense-body">
            {/* Left: ability scores + saves + skills (sticky) */}
            <div className="dense-left">
              <AbilityScores />
            </div>

            {/* Right: everything else */}
            <div className="dense-right">
              <CombatStats />

              {/* Tabs */}
              <div className="sheet-section full-width">
                <div className="tabs">
                  {[{ id: 'actions', label: 'Actions' }, ...TABS].map(tab => (
                    <div key={tab.id} className={`tab${activeTab === tab.id ? ' active' : ''}`} onClick={() => update({ activeTab: tab.id })}>
                      {tab.label}
                    </div>
                  ))}
                </div>
                <div className={`tab-content${activeTab === 'actions' ? ' active' : ''}`} id="actions-d">
                  {activeTab === 'actions' && <><ActionEconomy initiativeList={initiativeList} socket={socket} roomId={roomId} myName={myName} /><Weapons /><Resources /></>}
                </div>
                <div className={`tab-content${activeTab === 'features' ? ' active' : ''}`} id="features-d">
                  {activeTab === 'features' && <FeaturesTab />}
                </div>
                <div className={`tab-content${activeTab === 'equipment' ? ' active' : ''}`} id="equipment-d">
                  {activeTab === 'equipment' && <EquipmentTab />}
                </div>
                <div className={`tab-content${activeTab === 'spells' ? ' active' : ''}`} id="spells-d">
                  {activeTab === 'spells' && <SpellsTab initiativeList={initiativeList} socket={socket} roomId={roomId} myName={myName} />}
                </div>
                <div className={`tab-content${activeTab === 'notes' ? ' active' : ''}`} id="notes-d">
                  {activeTab === 'notes' && <NotesTab />}
                </div>
                <div className={`tab-content${activeTab === 'summons' ? ' active' : ''}`} id="summons-d">
                  {activeTab === 'summons' && <SummonsTab initiativeList={initiativeList} socket={socket} roomId={roomId} myName={myName} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Normal Mode ────────────────────────────────────────────────── */
        <div className={isEmbedded ? "character-sheet w-full" : "character-sheet"} style={isEmbedded ? { maxWidth: '100%', padding: '0', background: 'transparent', boxShadow: 'none' } : {}}>
          {isEmbedded && <style>{`.character-sheet::before { display: none !important; }`}</style>}
          <style>{`
            .res-rest-row { display: none !important; }
            @media (min-width: 901px) {
              #mobile-sync-header { display: none !important; }
            }
            @media (max-width: 900px) {
              .desktop-conc-banner { display: none !important; }
              .desktop-only-hp { display: none !important; }
            }
          `}</style>
          {!isEmbedded && (
            <div className="header">
              <h1>Character Sheet</h1>
              <Link to="/dm" className="dm-screen-button">DM Screen</Link>
            <div className="subtitle">
              Character
              {user && <div style={{ fontSize: '0.8rem', marginTop: 4, fontWeight: 'normal', textTransform: 'none', color: 'var(--ink-light)' }}>Logged in as: {user.email.split('@')[0]}</div>}
            </div>
            </div>
          )}

          <MobileHeader
            char={character}
            update={update}
            onOpenHp={() => openModal('hpManage')}
            onShortRest={() => openModal('shortRest')}
            onLongRest={() => openModal('longRest')}
            onMoreInfo={() => openModal('mobileMore')}
          />

          {character.concentrationSpell && (
            <div
              className="desktop-conc-banner"
              onClick={() => update({ concentrationSpell: "" })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'var(--parchment-dark)',
                border: '2px solid var(--gold)',
                padding: '8px 16px',
                margin: '0 auto 16px',
                maxWidth: '800px',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 2px 8px var(--shadow)'
              }}
              title="Click to drop concentration"
            >
               <span style={{ color: 'var(--red)', fontSize: '1.2rem' }}>◉</span>
               <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 'bold', color: 'var(--ink)' }}>Concentrating:</span>
               <span style={{ color: 'var(--red-dark)', fontWeight: 'bold' }}>{character.concentrationSpell}</span>
               <span style={{ marginLeft: 'auto', color: 'var(--ink-light)', fontSize: '0.9rem' }}>✕ Drop</span>
            </div>
          )}

          {character.activeEffects && character.activeEffects.length > 0 && (
            <div
              className="desktop-effects-banner"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'var(--parchment)',
                border: '1px solid var(--gold)',
                padding: '6px 16px',
                margin: '0 auto 12px',
                maxWidth: '800px',
                borderRadius: 8,
                flexWrap: 'wrap'
              }}
            >
               <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 'bold', color: 'var(--ink)' }}>Active Effects:</span>
               {character.activeEffects.map(eff => (
                 <span key={eff} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.6)', padding: '2px 10px', borderRadius: 16, border: '1px solid var(--gold-light)', fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 'bold', gap: 6 }}>
                   {eff}
                   <span style={{ cursor: 'pointer', color: 'var(--red)', fontSize: '1rem', lineHeight: 1 }} onClick={() => update({ activeEffects: character.activeEffects.filter(e => e !== eff) })} title="Drop Effect">&times;</span>
                 </span>
               ))}
            </div>
          )}

          <CharacterInfo onShortRest={() => openModal('shortRest')} onLongRest={() => openModal('longRest')} />

          {/* HP + Combat side by side */}
          <div className="normal-hp-combat" id="jump-hp">
            <div className="desktop-only-hp">
              <HitPoints />
            </div>
            <div id="jump-combat"><CombatStats /></div>
          </div>

          {/* Ability Scores — full width, uses its own 3×2 internal grid */}
          <div id="jump-scores"><AbilityScores /></div>

          <div id="jump-actions"><ActionEconomy initiativeList={initiativeList} socket={socket} roomId={roomId} myName={myName} /></div>
          <div id="jump-weapons"><Weapons /></div>
          <div id="jump-resources"><Resources /></div>

          {/* Tabs */}
          <div id="jump-tabs" className="sheet-section full-width">
            <div className="tabs">
              {TABS.map(tab => (
                <div key={tab.id} className={`tab${activeTab === tab.id ? ' active' : ''}`} onClick={() => update({ activeTab: tab.id })}>
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
              {activeTab === 'spells' && <SpellsTab initiativeList={initiativeList} socket={socket} roomId={roomId} myName={myName} />}
            </div>
            <div className={`tab-content${activeTab === 'notes' ? ' active' : ''}`} id="notes">
              {activeTab === 'notes' && <NotesTab />}
            </div>
            <div className={`tab-content${activeTab === 'summons' ? ' active' : ''}`} id="summons">
              {activeTab === 'summons' && <SummonsTab initiativeList={initiativeList} socket={socket} roomId={roomId} myName={myName} />}
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
      <CustomDataModal />
      <CurrencyModal />
      <SplitMoneyModal />
      <ManageMoneyModal />
      <HpManagementModal />
      <MobileMoreModal />
      <WeaponPickerModal />
      <DefensesModal />
      <WeaponFormulaModal />
      <ResourceSettingsModal />
      <LevelUpModal />

      {showTutorial && (
        <TutorialOverlay
          onClose={() => setShowTutorial(false)}
          openHpModal={() => openModal('hpManage')}
          closeHpModal={() => closeModal('hpManage')}
        />
      )}

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
      {modals.charManager && (
        <CharacterManagerModal
          character={character}
          update={update}
          load={load}
          reset={reset}
          onClose={() => closeModal('charManager')}
          user={user}
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
            <button id={`nav-view-${v.id}`} key={v.id} className="btn" onClick={() => onSelect(v.id)} style={{ padding: '10px 8px', fontSize: '0.85rem' }}>
              {v.label}
            </button>
          ))}
          <button id="nav-view-legacy" className="btn btn-secondary" onClick={onFullSheet} style={{ padding: '10px 8px', fontSize: '0.85rem', marginTop: 4 }}>
            Full Sheet
          </button>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

function CharacterManagerModal({ character, update, load, reset, onClose, user }) {
  const [library, setLibrary] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dndLibrary') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (user) {
       const fetchDBChars = async () => {
          const { data, error } = await supabase.from('user_characters').select('char_id, data').eq('user_id', user.id);
          if (data && !error) {
             const dbLibrary = {};
             data.forEach(row => { dbLibrary[row.char_id] = row.data; });
             setLibrary(prev => {
                const merged = { ...prev, ...dbLibrary };
                localStorage.setItem('dndLibrary', JSON.stringify(merged));
                return merged;
             });
          }
       };
       fetchDBChars();
    }
  }, [user]);

  const saveCurrentToLibrary = async () => {
    let charID = character.charID;
    let charToSave = { ...character };
    if (!charID) {
      charID = crypto.randomUUID();
      charToSave.charID = charID;
      update({ charID });
    }
    const newLibrary = { ...library, [charID]: charToSave };
    localStorage.setItem('dndLibrary', JSON.stringify(newLibrary));
    setLibrary(newLibrary);

    if (user) {
      try {
         await supabase.from('user_characters').upsert({
            user_id: user.id, char_id: charID, data: charToSave
         }, { onConflict: 'user_id, char_id' });
      } catch (err) {
         console.error("Failed to sync to DB:", err);
      }
    }

    alert("Character saved to library!");
  };

  const loadFromLibrary = (id) => {
    if (!window.confirm("Load this character? Unsaved changes to the current sheet will be lost if not saved to the library.")) return;
    const data = library[id];
    if (data) {
      load(data);
      onClose();
    }
  };

  const deleteFromLibrary = async (id) => {
    if (!window.confirm("Permanently delete this character from the library?")) return;
    const newLibrary = { ...library };
    delete newLibrary[id];
    localStorage.setItem('dndLibrary', JSON.stringify(newLibrary));
    setLibrary(newLibrary);

    if (user) {
      try {
         await supabase.from('user_characters').delete().match({ user_id: user.id, char_id: id });
      } catch (err) {
         console.error("Failed to delete from DB:", err);
      }
    }
  };

  const createNewCharacter = () => {
    if (!window.confirm("Create new character? Make sure to save your current one to the library first!")) return;
    reset();
    onClose();
  };

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="500px">
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center' }}>Character Library</ModalTitle>
        
        <div style={{ marginBottom: 20, paddingBottom: 15, borderBottom: '1px solid var(--gold)' }}>
          <h4 style={{ marginBottom: 10, color: 'var(--ink)' }}>Current Character</h4>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={saveCurrentToLibrary} style={{ flex: 1, fontSize: '0.9rem' }}>Save to Library</button>
            <button className="btn btn-secondary" onClick={createNewCharacter} style={{ flex: 1, fontSize: '0.9rem' }}>New Character</button>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--ink-light)', fontStyle: 'italic' }}>
            "Save to Library" stores the current sheet so you can switch back to it later.
          </div>
        </div>

        <h4 style={{ marginBottom: 10, color: 'var(--ink)' }}>Saved Characters</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '50vh', overflowY: 'auto', paddingRight: 4 }}>
          {Object.keys(library).length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-light)', padding: 10 }}>No saved characters.</div>
          ) : (
            Object.entries(library).map(([id, char]) => (
              <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--gold)', padding: 10, borderRadius: 4, background: 'white' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{char.charName || "Unnamed"}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}>Lvl {char.level || 1} {char.charClass || "Adventurer"}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => loadFromLibrary(id)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Load</button>
                  <button className="delete-feature-btn" onClick={() => deleteFromLibrary(id)} title="Delete" style={{ margin: 0 }}>&times;</button>
                </div>
              </div>
            ))
          )}
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
  const totalDice = parseInt(character.level) || parseInt(hdStr) || 1;
  const usedDice = parseInt(character.hitDiceUsed) || 0;
  const availDice = Math.max(0, totalDice - usedDice);

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="340px">
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center' }}>Short Rest</ModalTitle>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: 12 }}>
          Hit Dice: {availDice}/{totalDice} available (d{hitDie})
        </p>
        <div className="field" style={{ marginBottom: 12, textAlign: 'center' }}>
          <CinzelLabel>Hit Dice to Spend</CinzelLabel>
          <Row $gap="8px" $justify="center" style={{ marginTop: 6 }}>
            <button className="mini-btn" onClick={() => setDiceUsed(String(Math.max(0, (parseInt(diceUsed) || 0) - 1)))}>−</button>
            <input type="number" min="0" max={availDice} value={diceUsed} onChange={e => setDiceUsed(e.target.value)} style={{ width: 60, textAlign: 'center' }} />
            <button className="mini-btn" onClick={() => setDiceUsed(String(Math.min(availDice, (parseInt(diceUsed) || 0) + 1)))}>+</button>
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
  const [checks, setChecks] = useState({ hp: true, slots: true, resources: true, hitDice: true, deathSaves: true });
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
        <PrimaryBtn style={{ width: '100%', marginTop: 8 }} onClick={() => onFinish(checks)}>
          Take Long Rest
        </PrimaryBtn>
      </ModalBox>
    </ModalOverlay>
  );
}
