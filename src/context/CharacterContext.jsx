import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { getProfBonus } from '../utils/calculations';

export const DEFAULT_CHARACTER = {
  charName: '', charClass: '', charSubclass: '', level: 1,
  race: '', background: '', alignment: '', experience: 0,
  heroicInspiration: false,
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  baseAC: 10, shield: false,
  armorLight: false, armorMedium: false, armorHeavy: false, armorShield: false,
  weaponProfs: '', toolProfs: '',
  speed: 30, charSize: 'Medium', sizeFt: 5,
  hp: 10, maxHp: 10, tempHp: 0,
  profBonus: 2, hitDice: '1d8',
  activeConditions: [],
  resistances: '', immunities: '', vulnerabilities: '',
  resourcesData: [],
  summonsData: [],
  weapons: [],
  classFeatures: [], raceFeatures: [], backgroundFeatures: [], feats: [],
  actions: [], bonusActions: [], reactions: [],
  inventory: [], componentPouch: [],
  attunement: ['', '', ''],
  spellSlotsData: [{ level: 1, total: 1, used: 0 }],
  hitDiceUsed: 0,
  concentrationSpell: '',
  cantripsList: [], preparedSpellsList: [], spellsList: [],
  languages: '', personality: '', ideals: '', bonds: '',
  flaws: '', notes: '', deity: '',
  cp: 0, sp: 0, ep: 0, gp: 0, pp: 0,
  spellAbility: 'int', spellAttackMod: '', spellAttackBonus: '',
  skillProficiency: {}, saveProficiency: {},
  skillExpertise: {}, saveExpertise: {},
  deathSaves: { successes: [false, false, false], failures: [false, false, false] },
  advantageState: { skills: {}, saves: {}, initiative: false },
  currentTheme: '',
  attacksPerAction: 1,
  classes: [],
  activeTab: 'features',
};

function characterReducer(state, action) {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, ...action.payload };
    case 'LOAD':
      return { ...DEFAULT_CHARACTER, ...action.payload };
    case 'RESET':
      return { ...DEFAULT_CHARACTER };
    case 'UPDATE_LEVEL': {
      const level = parseInt(action.payload) || 1;
      const pb = getProfBonus(level);
      return { ...state, level, profBonus: pb };
    }
    default:
      return state;
  }
}

const CharacterContext = createContext(null);

export function CharacterProvider({ children }) {
  const [character, dispatch] = useReducer(
    characterReducer,
    null,
    () => {
      try {
        const saved = localStorage.getItem('dndCharacter');
        return saved ? { ...DEFAULT_CHARACTER, ...JSON.parse(saved) } : { ...DEFAULT_CHARACTER };
      } catch {
        return { ...DEFAULT_CHARACTER };
      }
    }
  );

  // Modal state
  const [modals, setModals] = useState({
    alignment: false,
    score: false,
    weaponProf: false,
    condition: false,
    theme: false,
    xpTable: false,
    lastSaved: false,
    mastery: false,
    currency: false,
    splitMoney: false,
    manageMoney: false,
    weaponPicker: { open: false, callback: null },
    resourceSettings: { open: false, index: null },
    weaponFormula: { open: false, index: null },
    info: { open: false, title: '', text: '' },
    expModal: false,
    hpManage: false,
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('dndCharacter', JSON.stringify(character));
    // Apply theme to body
    const themeClasses = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ')
      .trim();
    document.body.className = character.currentTheme
      ? `${themeClasses} ${character.currentTheme}`.trim()
      : themeClasses;
  }, [character]);

  const update = useCallback((payload) => dispatch({ type: 'UPDATE', payload }), []);
  const load = useCallback((data) => dispatch({ type: 'LOAD', payload: data }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const openModal = useCallback((name, data = true) => {
    setModals(m => ({ ...m, [name]: data }));
  }, []);

  const closeModal = useCallback((name) => {
    setModals(m => ({ ...m, [name]: typeof m[name] === 'object' && m[name] !== null
      ? { ...m[name], open: false }
      : false
    }));
  }, []);

  return (
    <CharacterContext.Provider value={{ character, update, load, reset, modals, openModal, closeModal }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacter must be used within CharacterProvider');
  return ctx;
}
