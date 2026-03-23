import { useState, useEffect, useCallback, useRef } from 'react';
import { useCharacter } from 'src/context/CharacterContext';
import { dndWeaponsDB } from 'src/data/constants';

const PAD = 10;
const TOOLTIP_W = 320;
const TOOLTIP_H = 260; // max estimated height for layout math

const FAKE_SPELLS = [
  { name: 'Tutorial: Magic Missile', level: 1, time: '1 action', range: '120 ft', description: 'Fires magic missiles.', prepared: true },
  { name: 'Tutorial: Healing Word', level: 1, time: '1 bonus action', range: '60 ft', description: 'Heals a creature.', prepared: true },
  { name: 'Tutorial: Shield', level: 1, time: '1 reaction', range: 'Self', description: 'Boosts AC.', prepared: true },
  { name: 'Tutorial: Identify', level: 1, time: '1 minute', range: 'Touch', description: 'Identifies magic items.', prepared: true }
];

// ── Step definitions ─────────────────────────────────────────────────────────

const SIDEBAR_STEPS = [
  {
    target: '#tut-sb-characters',
    title: '👥 Characters',
    body: 'Manage your saved characters. You can switch between them, create new ones, or delete old ones.',
    position: 'right',
    onPrevClick: '.close-sidebar-btn',
  },
  {
    target: '#tut-sb-creator',
    title: '🛠️ Character Creator',
    body: 'Opens a step-by-step wizard to build a new character from scratch.',
    position: 'right',
  },
  {
    target: '#tut-sb-data',
    title: '📁 Data Browser',
    body: 'Manage the underlying compendium data. You can load new JSON files or clear the database here.',
    position: 'right',
  },
  {
    target: '#tut-sb-compendium',
    title: '📖 Compendium',
    body: 'Browse all available spells, items, monsters, and rules. (Only appears if data is loaded).',
    position: 'right',
  },
  {
    target: '#tut-sb-custom',
    title: '✏️ Custom Data / Templates',
    body: 'Download templates to write your own homebrew content, or upload your custom JSON files.',
    position: 'right',
  },
  {
    target: '#tut-sb-dense',
    title: '⊞ Dense Mode',
    body: 'Toggles a compact layout. Great for laptops or smaller screens during active play.',
    position: 'right',
  },
  {
    target: '#tut-sb-swap',
    title: '🔄 Swap Score/Mod',
    body: 'Swaps the position of the large ability score and the smaller modifier in the Stats panel.',
    position: 'right',
  },
  {
    target: '#tut-sb-theme',
    title: '🎨 Select Theme',
    body: 'Change the visual style and colors of the character sheet.',
    position: 'right',
  },
  {
    target: '#tut-sb-save',
    title: '💾 Save JSON',
    body: 'Downloads your current character as a .json file for safekeeping.',
    position: 'right',
  },
  {
    target: '#tut-sb-load',
    title: '📂 Load JSON',
    body: 'Uploads a previously saved character .json file.',
    position: 'right',
  },
  {
    target: '#tut-sb-last',
    title: '🕒 Last Saved Data',
    body: 'View or copy the raw JSON data of your character exactly as it was last saved in the browser.',
    position: 'right',
  },
  {
    target: '#tut-sb-appview',
    title: '📱 App View',
    body: 'Switch to a mobile-friendly paginated view. (This is the default on phones!)',
    position: 'right',
  },
  {
    target: '#tut-sb-tutorial',
    title: '🎓 Tutorial',
    body: 'Replay this tutorial anytime. (Only appears if data is loaded).',
    position: 'right',
  },
  {
    target: '#tut-sb-reset',
    title: '⚠️ Reset Sheet',
    body: 'Wipes the current character sheet completely. Be careful!',
    position: 'right',
    onNextClick: '.close-sidebar-btn',
  }
];

const DESKTOP_STEPS = [
  {
    target: '.header',
    title: '👤 Character Header',
    body: 'Your character name, class, level, background, and XP live here. Click any field to edit it directly.',
    position: 'bottom',
  },
  {
    target: '#tutorial-class-field',
    title: '📖 Class Details',
    body: 'If compendium data is loaded and your class is set, a question mark (?) button will appear here.\n\nClick Next to open the details modal.',
    position: 'bottom',
    hasModalStep: true,
    actionTarget: '#tutorial-class-field .skill-info-btn',
  },
  {
    target: 'modal',
    title: '📖 Exploring Class Details',
    body: 'Scroll inside the modal to explore. Click Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#tutorial-subclass-field',
    title: '📖 Subclass Details',
    body: 'Similarly, once you enter a subclass, a (?) button will let you read about your specific subclass features and lore.\n\nClick Next to open the details modal.',
    position: 'bottom',
    hasModalStep: true,
    actionTarget: '#tutorial-subclass-field .skill-info-btn',
  },
  {
    target: 'modal',
    title: '📖 Exploring Subclass Details',
    body: 'Scroll inside the modal to explore. Click Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#tutorial-race-field',
    title: '📖 Species / Race Details',
    body: 'The (?) button here will display information about your chosen species, including speed, ability score modifiers, and innate traits.\n\nClick Next to open the details modal.',
    position: 'bottom',
    hasModalStep: true,
    actionTarget: '#tutorial-race-field .skill-info-btn',
  },
  {
    target: 'modal',
    title: '📖 Exploring Species Details',
    body: 'Scroll inside the modal to explore. Click Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#jump-scores',
    title: '🎲 Ability Scores',
    body: 'Your 6 core ability scores (STR, DEX, CON, INT, WIS, CHA) and their modifiers, plus all 18 skills.\n\nProficiency means you\'re trained in a skill — your proficiency bonus (based on level) gets added to checks with that skill. Expertise doubles that bonus. Advantage means rolling two dice and taking the higher result.\n\nClick a score or skill to toggle proficiency and expertise for it.',
    position: 'right',
  },
  {
    target: '#jump-hp',
    title: '❤️ Hit Points & Combat',
    body: 'Manage HP, AC, speed, and initiative here. Use the + / − buttons or type directly to adjust your current HP. Death saves appear when you hit 0 HP.',
    position: 'bottom',
  },
  {
    target: '#tutorial-hit-dice',
    title: '🎲 Hit Dice',
    body: 'Hit Dice are used to recover HP during a Short Rest — roll one and add your CON modifier to regain that much HP.\n\nYour hit die type is set by your class (e.g. d10 for Fighter, d8 for Rogue, d6 for Wizard). You regain half your total hit dice on a Long Rest.',
    position: 'left',
  },
  {
    target: '#tutorial-manage-hp',
    title: '⚙️ Manage HP',
    body: 'Opens the full HP management panel where you can set your max HP, configure your hit die type, track used hit dice, and manage temporary HP.\n\nClick Next to open the panel.',
    position: 'bottom',
    hasModalStep: true,
    actionFunc: 'openHpModal',
  },
  {
    target: 'modal',
    title: '⚙️ Managing HP',
    body: 'Scroll inside the modal to explore. Click Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#jump-resources',
    title: '⚡ Resources',
    body: 'Limited-use class abilities — Rage, Ki, Superiority Dice, Spell Slots, and more. Use + / − to track uses.\n\nClick Next to add a sample resource.',
    position: 'top',
    actionFunc: 'createSampleResource',
  },
  {
    target: '#resourcesContainer > div',
    title: '⚡ Sample Resource',
    body: 'A sample resource has been added!\n\nClick Next to highlight its settings button.',
    position: 'top',
  },
  {
    target: 'button[title="Resource settings"]',
    title: '⚙️ Resource Settings',
    body: 'Click Next to open the settings panel.',
    position: 'top',
    hasModalStep: true,
    actionFunc: 'openResourceSettingsModal',
  },
  {
    target: 'modal',
    title: '⚙️ Resource Settings',
    body: 'Here you can set up formulas for your resources, like basing max uses on your Proficiency Bonus or Level. It will automatically update as you grow!\n\nClick Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#jump-weapons',
    title: '⚔️ Weapons & Attacks',
    body: 'Add weapons and roll attacks or damage with one click. Hit the + button to add from the compendium or create a custom weapon.\n\nClick Next to add a sample weapon.',
    position: 'top',
    actionFunc: 'createSampleWeapon',
  },
  {
    target: '#weapon-list > div',
    title: '🗡️ Sample Weapon',
    body: 'A sample weapon has been added! The attack and damage rolls were auto-filled.\n\nClick Next to view its details.',
    position: 'top',
    actionFunc: 'ensureWeaponExpanded',
  },
  {
    target: '#weapon-list > div',
    title: '🏷️ Weapon Details',
    body: 'When expanded, you can see the weapon\'s properties, descriptions, and any Weapon Masteries applied to it.\n\nClick Next to highlight its formula settings button.',
    position: 'top',
    prevActionFunc: 'ensureWeaponCollapsed',
  },
  {
    target: 'button[title="Set formula"]',
    title: '⚙️ Weapon Formula',
    body: 'Click Next to open the weapon formula settings.',
    position: 'top',
    hasModalStep: true,
    actionFunc: 'openWeaponSettingsModal',
  },
  {
    target: 'modal',
    title: '⚙️ Weapon Formula',
    body: 'Define formulas for your attack and damage rolls using your ability scores and proficiency bonus. This ensures your attacks scale automatically as your stats increase!\n\nClick Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#jump-actions',
    title: '🔄 Action Economy',
    body: 'Track your Action, Bonus Action, Reaction, and Movement each turn during combat.\n\nNotice how the temporary spells we just added automatically sorted themselves into the correct categories based on their casting times!',
    position: 'top',
    onEnter: 'addTemporarySpells',
    onLeave: 'removeTemporarySpells',
  },
  {
    target: '#jump-tabs',
    title: '📋 Content Tabs',
    body: 'Switch between Features & Traits, Equipment & Inventory, Spells, Notes, and Summons using these tabs.',
    position: 'top',
  },
  {
    target: '.hamburger-btn',
    title: '☰ Sidebar Menu',
    body: 'Access the main menu to manage characters, data, and settings.\n\nClick Next to open it and explore the options.',
    position: 'right',
    noScroll: true,
    onNextClick: '.hamburger-btn',
  },
  ...SIDEBAR_STEPS
];

const MOBILE_STEPS = [
  {
    target: '.header',
    title: '👤 Character Header',
    body: 'Your character name, class, level, and background. Tap any field to edit it.',
    position: 'bottom',
  },
  {
    target: '#jump-scores',
    title: '🎲 Ability Scores',
    body: 'Your 6 core ability scores (STR, DEX, CON, INT, WIS, CHA) and their modifiers, plus all 18 skills.\n\nProficiency means you\'re trained in a skill — your proficiency bonus (based on level) gets added to checks with that skill. Expertise doubles that bonus. Advantage means rolling two dice and taking the higher result.\n\nTap a score or skill to toggle proficiency and expertise for it.',
    position: 'right',
  },
  {
    target: '#jump-hp',
    title: '❤️ Hit Points & Combat',
    body: 'Track your HP, AC, initiative, and death saves. Tap the HP section to heal or take damage.\n\nTap Next to open the panel.',
    position: 'bottom',
    hasModalStep: true,
    actionFunc: 'openHpModal',
  },
  {
    target: 'modal',
    title: '⚙️ Managing HP',
    body: 'Scroll inside the modal to explore. Tap Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#jump-resources',
    title: '⚡ Resources',
    body: 'Limited-use abilities like Rage, Ki, and Spell Slots. Tap + / − to track uses.\n\nTap Next to add a sample resource.',
    position: 'top',
    actionFunc: 'createSampleResource',
  },
  {
    target: '#resourcesContainer > div',
    title: '⚡ Sample Resource',
    body: 'A sample resource has been added!\n\nTap Next to highlight its settings button.',
    position: 'top',
  },
  {
    target: 'button[title="Resource settings"]',
    title: '⚙️ Resource Settings',
    body: 'Tap Next to open the settings panel.',
    position: 'top',
    hasModalStep: true,
    actionFunc: 'openResourceSettingsModal',
  },
  {
    target: 'modal',
    title: '⚙️ Resource Settings',
    body: 'Here you can set up formulas for your resources, like basing max uses on your Proficiency Bonus or Level. It will automatically update as you grow!\n\nTap Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#jump-weapons',
    title: '⚔️ Weapons',
    body: 'Roll attack and damage with a tap. Use the + button to add weapons from the compendium or create custom ones.\n\nTap Next to add a sample weapon.',
    position: 'top',
    actionFunc: 'createSampleWeapon',
  },
  {
    target: '#weapon-list > div',
    title: '🗡️ Sample Weapon',
    body: 'A sample weapon has been added! The attack and damage rolls were auto-filled.\n\nTap Next to view its details.',
    position: 'top',
    actionFunc: 'ensureWeaponExpanded',
  },
  {
    target: '#weapon-list > div',
    title: '🏷️ Weapon Details',
    body: 'When expanded, you can see the weapon\'s properties, descriptions, and any Weapon Masteries applied to it.\n\nTap Next to highlight its formula settings button.',
    position: 'top',
    prevActionFunc: 'ensureWeaponCollapsed',
  },
  {
    target: 'button[title="Set formula"]',
    title: '⚙️ Weapon Formula',
    body: 'Tap Next to open the weapon formula settings.',
    position: 'top',
    hasModalStep: true,
    actionFunc: 'openWeaponSettingsModal',
  },
  {
    target: 'modal',
    title: '⚙️ Weapon Formula',
    body: 'Define formulas for your attack and damage rolls using your ability scores and proficiency bonus. This ensures your attacks scale automatically as your stats increase!\n\nTap Next to close it and continue.',
    position: 'bottom',
    isModalStep: true,
  },
  {
    target: '#jump-tabs',
    title: '📋 Tabs',
    body: 'Access Features, Equipment, Spells, Notes, and Summons — tap a tab to switch.',
    position: 'top',
  },
  {
    target: '.grid-menu-btn',
    title: '📱 App View',
    body: 'Tap this for the mobile-optimized App View — the best way to use the sheet at the table on a phone or tablet.\n\nTap Next to open the menu.',
    position: 'left',
    noScroll: true,
    hasModalStep: true,
    actionTarget: '.grid-menu-btn',
  },
  {
    target: 'modal',
    title: '📱 App View Menu',
    body: 'Here you can jump directly to specific pages of the App View.\n\nTap Next to jump to the Stats page.',
    position: 'bottom',
    isModalStep: true,
    onNextClick: '#nav-view-stats',
  },
  {
    target: '#tab-btn-stats',
    title: '📊 App View',
    body: 'You are now in the App View! The horizontal bar lets you tap to switch pages, or you can simply swipe left and right anywhere on the screen as a quick alternative to using the bottom-right menu.\n\nTap Next to explore this page.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-legacy',
  },
  {
    target: '#app-view-stats',
    title: '📊 Ability Scores & Skills',
    body: 'Here you can edit your ability scores and toggle proficiencies for saving throws and skills.\n\nTap Next to navigate to the Actions tab.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-actions',
  },
  {
    target: '#tab-btn-actions',
    title: '⚔️ Actions Tab',
    body: 'The Actions tab organizes your combat capabilities.\n\nTap Next to view the page contents.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-stats',
  },
  {
    target: '#app-view-actions',
    title: '⚔️ Actions View',
    body: 'Here you can find all your combat actions, weapons, and resources in one place.\n\nTap Next to see the Inventory tab.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-inventory',
  },
  {
    target: '#tab-btn-inventory',
    title: '🎒 Inventory Tab',
    body: 'The Inventory tab keeps track of your loot and gear.\n\nTap Next to view the page contents.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-actions',
  },
  {
    target: '#app-view-inventory',
    title: '🎒 Inventory View',
    body: 'Manage your equipment, currency, and carry weight.\n\nTap Next to see the Spells tab.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-spells',
  },
  {
    target: '#tab-btn-spells',
    title: '🔮 Spells Tab',
    body: 'The Spells tab contains all your magical abilities.\n\nTap Next to view the page contents.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-inventory',
  },
  {
    target: '#app-view-spells',
    title: '🔮 Spells View',
    body: 'Cast spells, manage spell slots, and track concentration.\n\nTap Next to see the Features tab.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-features',
  },
  {
    target: '#tab-btn-features',
    title: '📚 Features Tab',
    body: 'The Features tab tracks your passive abilities.\n\nTap Next to view the page contents.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-spells',
  },
  {
    target: '#app-view-features',
    title: '📚 Features View',
    body: 'Review your class, species, background, and feat features.\n\nTap Next to see the Defenses tab.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-defenses',
  },
  {
    target: '#tab-btn-defenses',
    title: '🛡️ Defenses Tab',
    body: 'The Defenses tab keeps you alive.\n\nTap Next to view the page contents.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-features',
  },
  {
    target: '#app-view-defenses',
    title: '🛡️ Defenses View',
    body: 'Check your AC, speed, resistances, immunities, and vulnerabilities.\n\nTap Next to see the Proficiencies tab.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-proficiencies',
  },
  {
    target: '#tab-btn-proficiencies',
    title: '🛠️ Proficiencies Tab',
    body: 'The Proficiencies tab tracks your training.\n\nTap Next to view the page contents.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-defenses',
  },
  {
    target: '#app-view-proficiencies',
    title: '🛠️ Proficiencies View',
    body: 'Track your armor, weapon, tool, and language proficiencies.\n\nTap Next to see the Notes tab.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-notes',
  },
  {
    target: '#tab-btn-notes',
    title: '📝 Notes Tab',
    body: 'The Notes tab is your personal journal.\n\nTap Next to view the page contents.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-proficiencies',
  },
  {
    target: '#app-view-notes',
    title: '📝 Notes View',
    body: 'Keep track of personality traits, ideals, bonds, flaws, and general notes.\n\nTap Next to see the Summons tab.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-summons',
  },
  {
    target: '#tab-btn-summons',
    title: '🐾 Summons Tab',
    body: 'The Summons tab handles extra creatures.\n\nTap Next to view the page contents.',
    position: 'bottom',
    noScroll: true,
    onPrevClick: '#tab-btn-notes',
  },
  {
    target: '#app-view-summons',
    title: '🐾 Summons View',
    body: 'Manage your summoned creatures, pets, and familiars.\n\nTap Next to return to the Full Sheet.',
    position: 'center',
    noScroll: true,
    onNextClick: '#tab-btn-legacy',
  },
  {
    target: '.hamburger-btn',
    title: '☰ Menu',
    body: 'Tap here for the main menu to manage characters, change themes, and more.\n\nTap Next to open it and explore the options.',
    position: 'right',
    noScroll: true,
    onNextClick: '.hamburger-btn',
  },
  ...SIDEBAR_STEPS
];

// ── Scroll lock helpers ───────────────────────────────────────────────────────
// html element has overflow-y: auto in styles.css, so we must lock both

function lockScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

// ── Spotlight / tooltip helpers ───────────────────────────────────────────────

function spotlightStyle(rect, modalMode) {
  const pad = modalMode ? 0 : PAD;
  return {
    position: 'fixed',
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
    borderRadius: 8,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
    outline: '2px solid rgba(212,165,116,0.85)',
    outlineOffset: 2,
    zIndex: 100002, // Topmost to ensure outline draws over the modal
    pointerEvents: 'none',
    transition: 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
  };
}

function tooltipPosition(rect, position) {
  const GAP = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const actualW = Math.min(TOOLTIP_W, vw - 24);
  const cx = rect.left + rect.width / 2;
  const clampedLeft = Math.max(12, Math.min(vw - actualW - 12, cx - actualW / 2));

  const below = vh - rect.bottom - PAD - GAP;
  const above = rect.top - PAD - GAP;
  const right = vw - rect.right - PAD - GAP;
  const left  = rect.left - PAD - GAP;

  let pos = position;
  if      (pos === 'bottom' && below < TOOLTIP_H) pos = above >= TOOLTIP_H ? 'top'   : right >= actualW ? 'right' : left >= actualW ? 'left' : 'center';
  else if (pos === 'top'    && above < TOOLTIP_H) pos = below >= TOOLTIP_H ? 'bottom': right >= actualW ? 'right' : left >= actualW ? 'left' : 'center';
  else if (pos === 'right'  && right < actualW) pos = left  >= actualW ? 'left'  : below >= TOOLTIP_H ? 'bottom': above >= TOOLTIP_H ? 'top' : 'center';
  else if (pos === 'left'   && left  < actualW) pos = right >= actualW ? 'right' : below >= TOOLTIP_H ? 'bottom': above >= TOOLTIP_H ? 'top' : 'center';

  const midY = Math.max(12, Math.min(vh - TOOLTIP_H - 12, rect.top + rect.height / 2 - TOOLTIP_H / 2));

  if (pos === 'bottom') return { top: Math.min(rect.bottom + PAD + GAP, vh - TOOLTIP_H - 12), left: clampedLeft };
  if (pos === 'top')    return { top: Math.max(12, rect.top - PAD - GAP - TOOLTIP_H),          left: clampedLeft };
  if (pos === 'right')  return { top: midY, left: Math.min(rect.right  + PAD + GAP, vw - actualW - 12) };
  if (pos === 'left')   return { top: midY, left: Math.max(12, rect.left - PAD - GAP - actualW) };
  return { top: Math.max(12, Math.min(120, vh / 2 - TOOLTIP_H)), left: clampedLeft };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TutorialOverlay({ onClose, openHpModal, closeHpModal }) {
  const { character, update, openModal } = useCharacter();
  const [phase, setPhase] = useState('choose');
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [modalMode, setModalMode] = useState(false);
  const prevRectRef = useRef(null);
  const ignoreModalRef = useRef(false);
  const [tooltipCollapsed, setTooltipCollapsed] = useState(false);
  const actionsRef = useRef({});

  const createSampleResource = () => {
    if (!character.resourcesData || character.resourcesData.length === 0) {
      update({ resourcesData: [{ name: 'New Resource', max: 3, used: 0, reset: 'lr', formulaKey: 'fixed', fixedMax: 3 }] });
    }
  };

  const openResourceSettingsModal = () => {
    setTimeout(() => { openModal('resourceSettings', { open: true, index: 0 }); }, 100);
  };

  const createSampleWeapon = () => {
    if (!character.weapons || character.weapons.length === 0) {
      const weaponNames = Object.keys(dndWeaponsDB);
      const randomName = weaponNames[Math.floor(Math.random() * weaponNames.length)];
      const wData = dndWeaponsDB[randomName];
      const newWeapon = { name: randomName, atk: '', damage: wData.dmg + (wData.dtype ? ' ' + wData.dtype : ''), notes: wData.props ? wData.props.join(', ') : '' };
      update({ weapons: [newWeapon] });
    }
  };

  const openWeaponSettingsModal = () => {
    setTimeout(() => { openModal('weaponFormula', { open: true, index: 0 }); }, 100);
  };

  const ensureWeaponExpanded = () => {
    const weaponContainer = document.querySelector('#weapon-list > div');
    if (weaponContainer) {
      const header = weaponContainer.querySelector('div:first-child');
      const chevron = weaponContainer.querySelector('span[style*="rotate(180deg)"]');
      if (header && !chevron) header.click();
    }
  };

  const ensureWeaponCollapsed = () => {
    const weaponContainer = document.querySelector('#weapon-list > div');
    if (weaponContainer) {
      const header = weaponContainer.querySelector('div:first-child');
      const chevron = weaponContainer.querySelector('span[style*="rotate(180deg)"]');
      if (header && chevron) header.click();
    }
  };

  const addTemporarySpells = () => {
    const currentSpells = character.preparedSpellsList || [];
    if (!currentSpells.some(s => s?.name?.startsWith('Tutorial:'))) {
      update({ preparedSpellsList: [...currentSpells, ...FAKE_SPELLS] });
    }
  };

  const removeTemporarySpells = () => {
    const currentSpells = character.preparedSpellsList || [];
    if (currentSpells.some(s => s?.name?.startsWith('Tutorial:'))) {
      update({ preparedSpellsList: currentSpells.filter(s => !s?.name?.startsWith('Tutorial:')) });
    }
  };

  actionsRef.current = { openHpModal, closeHpModal, createSampleResource, openResourceSettingsModal, createSampleWeapon, openWeaponSettingsModal, ensureWeaponExpanded, ensureWeaponCollapsed, addTemporarySpells, removeTemporarySpells };

  const steps = mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS;
  const current = steps[step];
  const [showToc, setShowToc] = useState(false);

  // ── Navigation with step hooks ──────────────────────────────────────────────

  const leaveStep = useCallback((s, stepList) => {
    const leaving = stepList[s];
    if (leaving?.onLeave && actionsRef.current[leaving.onLeave]) {
      actionsRef.current[leaving.onLeave]();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enterStep = useCallback((s, stepList) => {
    const entering = stepList[s];
    if (entering?.onEnter && actionsRef.current[entering.onEnter]) {
      actionsRef.current[entering.onEnter]();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll lock (applied for entire tour lifetime) ───────────────────────────

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  // ── Modal tracking ──────────────────────────────────────────────────────────

  const getModalBox = useCallback(() => {
    const closeBtns = Array.from(document.querySelectorAll('button')).filter(b => 
      (b.textContent.includes('×') || b.textContent.includes('✕') || b.classList.contains('close-modal-btn')) &&
      !b.closest('#tutorial-overlay-container') &&
      !b.classList.contains('close-sidebar-btn') &&
      !b.classList.contains('delete-feature-btn') &&
      b.title !== 'Delete' &&
      b.title !== 'Remove' &&
      b.getBoundingClientRect().width > 0
    );
    for (const btn of closeBtns) {
       const box = btn.closest('.info-modal-content') || btn.closest('.note-modal') || btn.parentElement;
       if (box && box.tagName !== 'BODY') return box;
    }
    return null;
  }, []);

  const closeOpenModal = useCallback(() => {
    const closeBtns = Array.from(document.querySelectorAll('button')).filter(b => 
      (b.textContent.includes('×') || b.textContent.includes('✕') || b.classList.contains('close-modal-btn')) &&
      !b.closest('#tutorial-overlay-container') &&
      !b.classList.contains('close-sidebar-btn') &&
      !b.classList.contains('delete-feature-btn') &&
      b.title !== 'Delete' &&
      b.title !== 'Remove' &&
      b.getBoundingClientRect().width > 0
    );
    if (closeBtns.length > 0) closeBtns[0].click();
  }, []);

  // ── Measure target element ────────────────────────────────────────────────

  const measureStep = useCallback((stepIdx, stepList) => {
    const s = stepList[stepIdx];
    if (!s) return;
    const el = document.querySelector(s.target);
    if (!el) {
      if (stepIdx < stepList.length - 1) setStep(stepIdx + 1);
      else onClose();
      return;
    }

    const doMeasure = () => {
      const r = el.getBoundingClientRect();
      prevRectRef.current = r;
      setRect(r);
      lockScroll();
    };

    if (s.noScroll) {
      doMeasure();
    } else {
      unlockScroll();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(doMeasure, 340);
    }
  }, [onClose]);

  useEffect(() => {
    if (phase === 'tour' && mode && !modalMode) {
      setRect(null);
      measureStep(step, mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS);
      enterStep(step, mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS);
    }
  }, [phase, mode, step, modalMode, measureStep, enterStep]);

  useEffect(() => {
    if (phase !== 'tour') return;
    const interval = setInterval(() => {
      if (ignoreModalRef.current) return;
      const modalBox = getModalBox();
      const list = mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS;
      const currentStep = list[step];

      if (modalBox) {
        if (!modalMode) {
          setModalMode(true);
          if (currentStep?.hasModalStep) {
            leaveStep(step, list);
            setStep(s => s + 1);
          }
        }
        const r = modalBox.getBoundingClientRect();
        prevRectRef.current = r;
        setRect(r);
      } else {
        if (modalMode) {
          setModalMode(false);
          if (currentStep?.isModalStep) {
            leaveStep(step, list);
            if (step < list.length - 1) setStep(s => s + 1);
            else { unlockScroll(); onClose(); }
          }
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phase, modalMode, step, getModalBox, mode, leaveStep, onClose]);

  useEffect(() => {
    if (phase !== 'tour' || modalMode) return;
    const list = mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS;
    const handler = () => measureStep(step, list);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [phase, mode, step, measureStep]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleChoose = (m) => {
    setMode(m);
    setStep(0);
    setPhase('tour');
  };

  const jumpToStep = (idx) => {
    const list = mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS;
    if (modalMode) {
      ignoreModalRef.current = true;
      closeOpenModal();
      setModalMode(false);
      setTimeout(() => ignoreModalRef.current = false, 300);
    }
    leaveStep(step, list);
    setShowToc(false);
    setStep(idx);
  };

  const goNext = () => {
    const list = mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS;
    const currentStep = list[step];

    if (modalMode) {
      ignoreModalRef.current = true;
      if (currentStep?.onNextClick) {
        const btn = document.querySelector(currentStep.onNextClick);
        if (btn) btn.click();
      } else {
        closeOpenModal();
      }
      setModalMode(false);
      setTimeout(() => ignoreModalRef.current = false, 300);
    }
    leaveStep(step, list);

    let nextStep = step + 1;
    if (currentStep?.hasModalStep && !modalMode) {
      let opened = false;
      if (currentStep.actionFunc && actionsRef.current[currentStep.actionFunc]) {
        actionsRef.current[currentStep.actionFunc]();
        opened = true;
      } else if (currentStep.actionTarget) {
        const btn = document.querySelector(currentStep.actionTarget);
        if (btn && btn.getBoundingClientRect().width > 0) {
          btn.click();
          opened = true;
        }
      }
        if (opened) {
          ignoreModalRef.current = true;
          setModalMode(true);
          setStep(nextStep);
          setTimeout(() => ignoreModalRef.current = false, 300);
          return;
        } else {
        // Fallback: Skip modal exploration if the button isn't available (e.g., no data)
        nextStep = step + 2;
      }
    } else if (currentStep?.onNextClick) {
      const btn = document.querySelector(currentStep.onNextClick);
      if (btn) btn.click();
      setTimeout(() => {
        if (nextStep < list.length) setStep(nextStep);
        else { unlockScroll(); onClose(); }
      }, 350);
      return;
    } else if (currentStep?.actionFunc && actionsRef.current[currentStep.actionFunc]) {
      actionsRef.current[currentStep.actionFunc]();
      setTimeout(() => {
        if (nextStep < list.length) setStep(nextStep);
        else { unlockScroll(); onClose(); }
      }, 350);
      return;
    }

    if (nextStep < list.length) setStep(nextStep);
    else { unlockScroll(); onClose(); }
  };

  const goPrev = () => {
    const list = mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS;
    const currentStep = list[step];

    if (modalMode) {
      ignoreModalRef.current = true;
      closeOpenModal();
      setModalMode(false);
      setTimeout(() => ignoreModalRef.current = false, 300);
    }
    leaveStep(step, list);

    let prevStep = step - 1;
    const previousStepDef = list[prevStep];
    if (previousStepDef?.isModalStep) {
      prevStep -= 1;
    }

    if (currentStep?.prevActionFunc && actionsRef.current[currentStep.prevActionFunc]) {
      actionsRef.current[currentStep.prevActionFunc]();
      setTimeout(() => {
        if (prevStep >= 0) setStep(prevStep);
      }, 350);
      return;
    } else if (currentStep?.onPrevClick) {
      const btn = document.querySelector(currentStep.onPrevClick);
      if (btn) btn.click();
      setTimeout(() => {
        if (prevStep >= 0) setStep(prevStep);
      }, 350);
      return;
    }

    if (prevStep >= 0) setStep(prevStep);
  };

  const handleClose = () => {
    if (modalMode) {
      ignoreModalRef.current = true;
      closeOpenModal();
    }
    
    // Ensure sidebar is closed if we exit early during sidebar steps
    const sidebarOpen = document.querySelector('.sidebar-nav.open');
    if (sidebarOpen) {
      document.querySelector('.close-sidebar-btn')?.click();
    }

    const list = mode === 'mobile' ? MOBILE_STEPS : DESKTOP_STEPS;
    if (phase === 'tour') leaveStep(step, list);
    unlockScroll();
    onClose();
  };

  // ── Platform choice screen ────────────────────────────────────────────────

  if (phase === 'choose') {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
        zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'var(--parchment)',
          border: '2px solid var(--gold)',
          borderRadius: 12,
          padding: '36px 24px',
          maxWidth: 420,
          width: '90vw',
          boxSizing: 'border-box',
          boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
          textAlign: 'center',
          position: 'relative',
        }}>
          <button onClick={handleClose} style={{
            position: 'absolute', top: 12, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.5rem', color: 'var(--ink-light)', lineHeight: 1,
          }}>&times;</button>

          <h2 style={{
            fontFamily: 'Cinzel, serif', color: 'var(--red-dark)',
            marginTop: 0, marginBottom: 10, fontSize: '1.3rem',
          }}>
            Interactive Tutorial
          </h2>
          <p style={{ color: 'var(--ink)', lineHeight: 1.65, marginBottom: 28, fontSize: '0.95rem' }}>
            We'll walk you through every section of the character sheet with highlighted tooltips.
            <br /><br />
            Are you using this on <strong>mobile / tablet</strong> or on <strong>desktop</strong>?
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => handleChoose('mobile')} style={{
              padding: '13px 22px', borderRadius: 8, minWidth: 140,
              background: 'var(--parchment-dark)', border: '2px solid var(--gold)',
              cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
              color: 'var(--ink)', fontWeight: 'bold',
            }}>
              📱 Mobile / Tablet
            </button>
            <button onClick={() => handleChoose('desktop')} style={{
              padding: '13px 22px', borderRadius: 8, minWidth: 140,
              background: 'var(--red-dark)', border: '2px solid var(--gold)',
              cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
              color: '#fff', fontWeight: 'bold',
            }}>
              🖥️ Desktop
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tour screen ───────────────────────────────────────────────────────────

  const displayRect = rect || prevRectRef.current;
  const tipPos = displayRect ? tooltipPosition(displayRect, current.position) : null;
  const allowClickThrough = modalMode;

  return (
    <div id="tutorial-overlay-container">
      {/* Non-interactive dark background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 100001, pointerEvents: allowClickThrough ? 'none' : 'auto' }} />

      {/* Spotlight */}
      {displayRect && <div style={spotlightStyle(displayRect, modalMode)} />}

      {/* Tooltip card */}
      {displayRect && tipPos && (
        <div
          style={{
            position: 'fixed',
            ...tipPos,
            width: TOOLTIP_W,
            maxWidth: 'calc(100vw - 24px)',
            background: 'var(--parchment)',
            border: '2px solid var(--gold)',
            borderRadius: 10,
            padding: '14px 16px 12px',
            boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(0,0,0,0.65)',
            zIndex: 100003,
          }}
        >
          {/* Header row: progress + close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
              <div style={{
                height: '100%',
                width: `${((step + 1) / steps.length) * 100}%`,
                background: 'var(--red-dark)',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-light)', fontFamily: 'Cinzel, serif', whiteSpace: 'nowrap' }}>
              {step + 1} / {steps.length}
            </span>
            <button
              onClick={() => {
                setShowToc(!showToc);
                if (tooltipCollapsed) setTooltipCollapsed(false);
              }}
              title="Table of Contents"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: showToc ? 'var(--red-dark)' : 'var(--ink-light)', fontSize: '1.2rem', lineHeight: 1,
                padding: '0 4px', marginLeft: 2,
              }}
            >
              ☰
            </button>
            <button
              onClick={() => setTooltipCollapsed(!tooltipCollapsed)}
              title={tooltipCollapsed ? "Expand tooltip" : "Collapse tooltip"}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: tooltipCollapsed ? 'var(--red-dark)' : 'var(--ink-light)', fontSize: '1.2rem', lineHeight: 1,
                padding: '0 4px', marginLeft: 2, fontWeight: 'bold'
              }}
            >
              {tooltipCollapsed ? '+' : '−'}
            </button>
            <button
              onClick={handleClose}
              title="Close tutorial"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ink-light)', fontSize: '1.1rem', lineHeight: 1,
                padding: '0 2px', marginLeft: 2,
              }}
            >
              &times;
            </button>
          </div>

          {showToc ? (
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4, marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--red-dark)', margin: '0 0 8px', fontSize: '0.95rem' }}>
                Jump to Section:
              </h3>
              {steps.map((s, i) => {
                if (s.isModalStep) return null; // hide inner modal exploring steps from ToC
                return (
                  <button
                    key={i}
                    onClick={() => jumpToStep(i)}
                    style={{
                      textAlign: 'left', padding: '8px 12px', borderRadius: 6,
                      background: i === step ? 'var(--red-dark)' : 'var(--parchment-dark)',
                      color: i === step ? '#fff' : 'var(--ink)',
                      border: `1px solid ${i === step ? 'var(--gold-dark)' : 'var(--gold)'}`, cursor: 'pointer',
                      fontSize: '0.85rem', fontFamily: 'Cinzel, serif', fontWeight: i === step ? 'bold' : 'normal'
                    }}
                  >
                    {i + 1}. {s.title}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <h3 style={{
                fontFamily: 'Cinzel, serif', color: 'var(--red-dark)',
                margin: '0 0 8px', fontSize: '0.95rem',
              }}>
                {current.title}
              </h3>

              {!tooltipCollapsed && (
                <>
                  <div style={{ color: 'var(--ink)', lineHeight: 1.6, margin: '0 0 14px', fontSize: '0.88rem' }}>
                    {current.body.split('\n\n').map((para, i) => (
                      <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0' }}>{para}</p>
                    ))}
                  </div>

                  {modalMode && !current.isModalStep && (
                    <div style={{ marginBottom: 14, fontSize: '0.85rem', color: 'var(--red-dark)', fontStyle: 'italic', textAlign: 'center' }}>
                      Modal opened. Close it to continue the tour.
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={goPrev}
                  disabled={step === 0}
                  style={{
                    padding: '7px 14px', borderRadius: 6,
                    background: step === 0 ? 'transparent' : 'var(--parchment-dark)',
                    border: `1px solid ${step === 0 ? 'transparent' : 'var(--gold)'}`,
                    cursor: step === 0 ? 'default' : 'pointer',
                    color: step === 0 ? 'var(--ink-light)' : 'var(--ink)',
                    fontSize: '0.82rem', fontFamily: 'Cinzel, serif',
                    opacity: step === 0 ? 0.4 : 1,
                  }}
                >
                  ← Back
                </button>

                <button
                  onClick={goNext}
                  style={{
                    padding: '7px 18px', borderRadius: 6,
                    background: 'var(--red-dark)', border: '2px solid var(--gold)',
                    cursor: 'pointer', color: '#fff',
                    fontSize: '0.85rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold',
                  }}
                >
                  {step === steps.length - 1 ? 'Done ✓' : 'Next →'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Loading pill */}
      {!rect && !prevRectRef.current && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--parchment)', border: '2px solid var(--gold)',
          borderRadius: 20, padding: '10px 24px', zIndex: 10001,
          color: 'var(--ink-light)', fontStyle: 'italic', fontSize: '0.9rem',
        }}>
          Navigating…
        </div>
      )}
    </div>
  );
}
