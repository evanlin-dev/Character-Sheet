export const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const abilityLabels = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};

export const skillsMap = {
  athletics: 'str',
  acrobatics: 'dex',
  sleight_of_hand: 'dex',
  stealth: 'dex',
  arcana: 'int',
  history: 'int',
  investigation: 'int',
  nature: 'int',
  religion: 'int',
  animal_handling: 'wis',
  insight: 'wis',
  medicine: 'wis',
  perception: 'wis',
  survival: 'wis',
  deception: 'cha',
  intimidation: 'cha',
  performance: 'cha',
  persuasion: 'cha',
};

export const skillLabels = {
  athletics: 'Athletics',
  acrobatics: 'Acrobatics',
  sleight_of_hand: 'Sleight of Hand',
  stealth: 'Stealth',
  arcana: 'Arcana',
  history: 'History',
  investigation: 'Investigation',
  nature: 'Nature',
  religion: 'Religion',
  animal_handling: 'Animal Handling',
  insight: 'Insight',
  medicine: 'Medicine',
  perception: 'Perception',
  survival: 'Survival',
  deception: 'Deception',
  intimidation: 'Intimidation',
  performance: 'Performance',
  persuasion: 'Persuasion',
};

export const skillDescriptions = {
  athletics: 'Covers difficult situations you encounter while climbing, jumping, or swimming.',
  acrobatics: 'Covers your attempt to stay on your feet in a tricky situation (ice, tightrope, etc).',
  sleight_of_hand: 'Checks manual trickery, such as planting something on someone else.',
  stealth: 'Covers your ability to conceal yourself from enemies.',
  arcana: 'Measures your ability to recall lore about spells, magic items, and planes.',
  history: 'Measures your ability to recall lore about historical events.',
  investigation: 'Looks around for clues and makes deductions based on them.',
  nature: 'Measures your ability to recall lore about terrain, plants, and animals.',
  religion: 'Measures your ability to recall lore about deities and rites.',
  animal_handling: 'Checks your ability to calm down a domesticated animal.',
  insight: 'Decides whether you can determine the true intentions of a creature.',
  medicine: 'Allows you to try to stabilize a dying companion or diagnose an illness.',
  perception: 'Lets you spot, hear, or otherwise detect the presence of something.',
  survival: 'Allows you to follow tracks, hunt wild game, and predict weather.',
  deception: 'Determines whether you can convincingly hide the truth.',
  intimidation: 'Allows you to influence others through overt threats.',
  performance: 'Determines how well you can delight an audience.',
  persuasion: 'Attempts to influence someone with tact and social graces.',
  save_str: 'Used to resist a force that would physically move or bind you.',
  save_dex: "Used to dodge out of harm's way (e.g. fireballs, lightning bolts, breath weapons, traps).",
  save_con: 'Used to endure a toxic or physically taxing effect (e.g. poison, disease, concentration checks).',
  save_int: 'Used to disbelieve certain illusions or resist mental assaults.',
  save_wis: 'Used to resist effects that charm, frighten, or assault your willpower.',
  save_cha: 'Used to withstand effects, such as possession or banishment.',
};

export const xpTable = [
  { xp: 0, lvl: 1, prof: 2 }, { xp: 300, lvl: 2, prof: 2 },
  { xp: 900, lvl: 3, prof: 2 }, { xp: 2700, lvl: 4, prof: 2 },
  { xp: 6500, lvl: 5, prof: 3 }, { xp: 14000, lvl: 6, prof: 3 },
  { xp: 23000, lvl: 7, prof: 3 }, { xp: 34000, lvl: 8, prof: 3 },
  { xp: 48000, lvl: 9, prof: 4 }, { xp: 64000, lvl: 10, prof: 4 },
  { xp: 85000, lvl: 11, prof: 4 }, { xp: 100000, lvl: 12, prof: 4 },
  { xp: 120000, lvl: 13, prof: 5 }, { xp: 140000, lvl: 14, prof: 5 },
  { xp: 165000, lvl: 15, prof: 5 }, { xp: 195000, lvl: 16, prof: 5 },
  { xp: 225000, lvl: 17, prof: 6 }, { xp: 265000, lvl: 18, prof: 6 },
  { xp: 305000, lvl: 19, prof: 6 }, { xp: 355000, lvl: 20, prof: 6 },
];

export const weaponProficiencyOptions = [
  { category: 'Categories', items: ['Simple Weapons', 'Martial Weapons', 'Firearms', 'Shields'] },
  { category: 'Properties/Groups', items: ['Finesse Weapons', 'Heavy Weapons', 'Light Weapons', 'Reach Weapons', 'Thrown Weapons', 'Versatile Weapons'] },
];

export const conditionsDB = {
  Blinded: "You can't see. Attacks against you have Advantage. Your attacks have Disadvantage.",
  Charmed: "You can't attack the charmer. The charmer has Advantage on social checks against you.",
  Deafened: "You can't hear. You fail checks involving hearing.",
  Exhaustion: 'Suffering from levels of exhaustion. 1: Disadv on checks. 2: Speed halved. 3: Disadv on attacks/saves. 4: HP max halved. 5: Speed 0. 6: Death.',
  Frightened: 'Disadvantage on checks/attacks while source of fear is visible. Can\'t move closer to source.',
  Grappled: 'Speed is 0. Ends if grappler is incapacitated or you are moved away.',
  Incapacitated: "You can't take actions or reactions.",
  Invisible: "You can't be seen. You have Advantage on attacks. Attacks against you have Disadvantage.",
  Paralyzed: "Incapacitated. Can't move/speak. Auto-fail Str/Dex saves. Attacks against you have Advantage and are crits if within 5ft.",
  Petrified: 'Transformed to stone. Incapacitated. Resistant to all damage. Immune to poison/disease.',
  Poisoned: 'Disadvantage on attack rolls and ability checks.',
  Prone: 'Move at half speed. Attacks have Disadvantage. Melee attacks against you have Advantage; Ranged have Disadvantage.',
  Restrained: 'Speed is 0. Attacks against you have Advantage. Your attacks have Disadvantage. Disadvantage on Dex saves.',
  Stunned: "Incapacitated. Can't move/speak. Fails Str/Dex saves. Attacks against you have Advantage.",
  Unconscious: "Incapacitated. Drop held items. Prone. Auto-fail Str/Dex saves. Attacks against you have Advantage and are crits if within 5ft.",
};

export const conditionIcons = {
  Blinded: '🙈', Charmed: '❤️', Deafened: '🙉', Exhaustion: '😫',
  Frightened: '😱', Grappled: '🤼', Incapacitated: '🤕', Invisible: '👻',
  Paralyzed: '⚡', Petrified: '🗿', Poisoned: '🤢', Prone: '🛌',
  Restrained: '⛓️', Stunned: '💫', Unconscious: '💤',
};

export let dndWeaponsDB = {
  'Club':           { type: 'Simple',  cat: 'Melee',  dmg: '1d4',  dtype: 'bludgeoning', props: ['Light'],                                        mastery: 'Slow'   },
  'Dagger':         { type: 'Simple',  cat: 'Melee',  dmg: '1d4',  dtype: 'piercing',     props: ['Finesse', 'Light', 'Thrown (20/60)'],             mastery: 'Nick'   },
  'Greatclub':      { type: 'Simple',  cat: 'Melee',  dmg: '1d8',  dtype: 'bludgeoning', props: ['Two-Handed'],                                    mastery: 'Push'   },
  'Handaxe':        { type: 'Simple',  cat: 'Melee',  dmg: '1d6',  dtype: 'slashing',     props: ['Light', 'Thrown (20/60)'],                       mastery: 'Vex'    },
  'Javelin':        { type: 'Simple',  cat: 'Melee',  dmg: '1d6',  dtype: 'piercing',     props: ['Thrown (30/120)'],                               mastery: 'Slow'   },
  'Light Hammer':   { type: 'Simple',  cat: 'Melee',  dmg: '1d4',  dtype: 'bludgeoning', props: ['Light', 'Thrown (20/60)'],                       mastery: 'Nick'   },
  'Mace':           { type: 'Simple',  cat: 'Melee',  dmg: '1d6',  dtype: 'bludgeoning', props: [],                                               mastery: 'Sap'    },
  'Quarterstaff':   { type: 'Simple',  cat: 'Melee',  dmg: '1d6',  dtype: 'bludgeoning', props: ['Versatile (1d8)'],                               mastery: 'Topple' },
  'Sickle':         { type: 'Simple',  cat: 'Melee',  dmg: '1d4',  dtype: 'slashing',     props: ['Light'],                                        mastery: 'Nick'   },
  'Spear':          { type: 'Simple',  cat: 'Melee',  dmg: '1d6',  dtype: 'piercing',     props: ['Thrown (20/60)', 'Versatile (1d8)'],             mastery: 'Sap'    },
  'Light Crossbow': { type: 'Simple',  cat: 'Ranged', dmg: '1d8',  dtype: 'piercing',     props: ['Ammunition (80/320)', 'Loading', 'Two-Handed'],  mastery: 'Slow'   },
  'Dart':           { type: 'Simple',  cat: 'Ranged', dmg: '1d4',  dtype: 'piercing',     props: ['Finesse', 'Thrown (20/60)'],                     mastery: 'Vex'    },
  'Shortbow':       { type: 'Simple',  cat: 'Ranged', dmg: '1d6',  dtype: 'piercing',     props: ['Ammunition (80/320)', 'Two-Handed'],             mastery: 'Vex'    },
  'Sling':          { type: 'Simple',  cat: 'Ranged', dmg: '1d4',  dtype: 'bludgeoning', props: ['Ammunition (30/120)'],                           mastery: 'Slow'   },
  'Battleaxe':      { type: 'Martial', cat: 'Melee',  dmg: '1d8',  dtype: 'slashing',     props: ['Versatile (1d10)'],                              mastery: 'Topple' },
  'Flail':          { type: 'Martial', cat: 'Melee',  dmg: '1d8',  dtype: 'bludgeoning', props: [],                                               mastery: 'Sap'    },
  'Glaive':         { type: 'Martial', cat: 'Melee',  dmg: '1d10', dtype: 'slashing',     props: ['Heavy', 'Reach', 'Two-Handed'],                 mastery: 'Graze'  },
  'Greataxe':       { type: 'Martial', cat: 'Melee',  dmg: '1d12', dtype: 'slashing',     props: ['Heavy', 'Two-Handed'],                          mastery: 'Cleave' },
  'Greatsword':     { type: 'Martial', cat: 'Melee',  dmg: '2d6',  dtype: 'slashing',     props: ['Heavy', 'Two-Handed'],                          mastery: 'Graze'  },
  'Halberd':        { type: 'Martial', cat: 'Melee',  dmg: '1d10', dtype: 'slashing',     props: ['Heavy', 'Reach', 'Two-Handed'],                 mastery: 'Cleave' },
  'Lance':          { type: 'Martial', cat: 'Melee',  dmg: '1d12', dtype: 'piercing',     props: ['Reach', 'Special'],                             mastery: 'Topple' },
  'Longsword':      { type: 'Martial', cat: 'Melee',  dmg: '1d8',  dtype: 'slashing',     props: ['Versatile (1d10)'],                              mastery: 'Sap'    },
  'Maul':           { type: 'Martial', cat: 'Melee',  dmg: '2d6',  dtype: 'bludgeoning', props: ['Heavy', 'Two-Handed'],                          mastery: 'Topple' },
  'Morningstar':    { type: 'Martial', cat: 'Melee',  dmg: '1d8',  dtype: 'piercing',     props: [],                                               mastery: 'Sap'    },
  'Pike':           { type: 'Martial', cat: 'Melee',  dmg: '1d10', dtype: 'piercing',     props: ['Heavy', 'Reach', 'Two-Handed'],                 mastery: 'Push'   },
  'Rapier':         { type: 'Martial', cat: 'Melee',  dmg: '1d8',  dtype: 'piercing',     props: ['Finesse'],                                      mastery: 'Vex'    },
  'Scimitar':       { type: 'Martial', cat: 'Melee',  dmg: '1d6',  dtype: 'slashing',     props: ['Finesse', 'Light'],                             mastery: 'Nick'   },
  'Shortsword':     { type: 'Martial', cat: 'Melee',  dmg: '1d6',  dtype: 'piercing',     props: ['Finesse', 'Light'],                             mastery: 'Vex'    },
  'Trident':        { type: 'Martial', cat: 'Melee',  dmg: '1d6',  dtype: 'piercing',     props: ['Thrown (20/60)', 'Versatile (1d8)'],             mastery: 'Topple' },
  'War Pick':       { type: 'Martial', cat: 'Melee',  dmg: '1d8',  dtype: 'piercing',     props: [],                                               mastery: 'Sap'    },
  'Warhammer':      { type: 'Martial', cat: 'Melee',  dmg: '1d8',  dtype: 'bludgeoning', props: ['Versatile (1d10)'],                              mastery: 'Push'   },
  'Whip':           { type: 'Martial', cat: 'Melee',  dmg: '1d4',  dtype: 'slashing',     props: ['Finesse', 'Reach'],                             mastery: 'Slow'   },
  'Blowgun':        { type: 'Martial', cat: 'Ranged', dmg: '1',    dtype: 'piercing',     props: ['Ammunition (25/100)', 'Loading'],               mastery: 'Vex'    },
  'Hand Crossbow':  { type: 'Martial', cat: 'Ranged', dmg: '1d6',  dtype: 'piercing',     props: ['Ammunition (30/120)', 'Light', 'Loading'],      mastery: 'Vex'    },
  'Heavy Crossbow': { type: 'Martial', cat: 'Ranged', dmg: '1d10', dtype: 'piercing',     props: ['Ammunition (100/400)', 'Heavy', 'Loading', 'Two-Handed'], mastery: 'Push' },
  'Longbow':        { type: 'Martial', cat: 'Ranged', dmg: '1d8',  dtype: 'piercing',     props: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'],  mastery: 'Slow'   },
  'Net':            { type: 'Martial', cat: 'Ranged', dmg: '0',    dtype: '-',            props: ['Special', 'Thrown (5/15)'],                     mastery: null     },
  'Musket':         { type: 'Martial', cat: 'Ranged', dmg: '1d12', dtype: 'piercing',     props: ['Ammunition (40/120)', 'Loading', 'Two-Handed'], mastery: 'Slow'   },
  'Pistol':         { type: 'Martial', cat: 'Ranged', dmg: '1d10', dtype: 'piercing',     props: ['Ammunition (30/90)', 'Loading'],                mastery: 'Vex'    },
};

export let masteryDescriptions = {
  Cleave:  'Hit a creature → make a second attack (no action) against a different creature within 5 ft.',
  Graze:   'When you miss, the target still takes damage equal to your ability modifier.',
  Nick:    'The extra attack from the Light property uses your Action instead of your Bonus Action.',
  Push:    'On a hit, push the target up to 10 ft directly away from you.',
  Sap:     'On a hit, the target has Disadvantage on its next attack roll before your next turn.',
  Slow:    "On a hit, the target's Speed is reduced by 10 ft until the start of your next turn.",
  Topple:  'On a hit, the target must succeed on a Constitution saving throw or fall Prone.',
  Vex:     'On a hit that deals damage, you gain Advantage on your next attack roll against the same target.',
};

export let weaponPropertyDescriptions = {
  ammunition: "You can make a ranged attack only if you have ammunition to fire from the weapon. Each time you attack, you expend one piece of ammunition. Drawing the ammunition from a quiver, case, or other container is part of the attack. At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield.",
  finesse: "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls.",
  heavy: "Small creatures have disadvantage on attack rolls with heavy weapons. A heavy weapon's size and bulk make it too large for a Small creature to use effectively.",
  light: "A light weapon is small and easy to handle, making it ideal for use when fighting with two weapons. When you take the Attack action and attack with a light melee weapon that you're holding in one hand, you can use a bonus action to attack with a different light melee weapon that you're holding in the other hand. You don't add your ability modifier to the damage of the bonus attack, unless that modifier is negative.",
  loading: "Because of the time required to load this weapon, you can fire only one piece of ammunition from it when you use an action, bonus action, or reaction to fire it, regardless of the number of attacks you can normally make.",
  reach: "This weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for opportunity attacks with it.",
  special: "A weapon with the special property has unusual rules governing its use, explained in the weapon's description (see 'Special Weapons' later in this section).",
  thrown: "If a weapon has the thrown property, you can throw the weapon to make a ranged attack. If the weapon is a melee weapon, you use the same ability modifier for that attack roll and damage roll that you would use for a melee attack with the weapon. For example, if you throw a handaxe, you use your Strength, but if you throw a dagger, you can use either your Strength or your Dexterity, since the dagger has the finesse property.",
  'two-handed': "This weapon requires two hands when you attack with it.",
  versatile: "This weapon can be used with one or two hands. A damage value in parentheses appears with the property—the damage when the weapon is used with two hands to make a melee attack."
};


export const RESOURCE_FORMULA_OPTS = [
  { key: 'fixed',      label: 'Fixed number' },
  { key: 'pb',         label: 'Proficiency Bonus' },
  { key: 'pb_x2',      label: 'Prof. Bonus × 2' },
  { key: 'level',      label: 'Level' },
  { key: 'half_level', label: 'Half Level' },
  { key: 'level_x5',   label: 'Level × 5' },
  { key: 'str_mod',    label: 'STR modifier' },
  { key: 'dex_mod',    label: 'DEX modifier' },
  { key: 'con_mod',    label: 'CON modifier' },
  { key: 'int_mod',    label: 'INT modifier' },
  { key: 'wis_mod',    label: 'WIS modifier' },
  { key: 'cha_mod',    label: 'CHA modifier' },
  { key: 'str_mod_pb', label: 'STR mod + Prof. Bonus' },
  { key: 'dex_mod_pb', label: 'DEX mod + Prof. Bonus' },
  { key: 'con_mod_pb', label: 'CON mod + Prof. Bonus' },
  { key: 'int_mod_pb', label: 'INT mod + Prof. Bonus' },
  { key: 'wis_mod_pb', label: 'WIS mod + Prof. Bonus' },
  { key: 'cha_mod_pb', label: 'CHA mod + Prof. Bonus' },
];

export const ALIGNMENT_OPTIONS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

export const THEMES = [
  { key: '',                label: 'Default',    color: '#8b2e2e' },
  { key: 'theme-artificer', label: 'Artificer',  color: '#008080' },
  { key: 'theme-barbarian', label: 'Barbarian',  color: '#c0392b' },
  { key: 'theme-bard',      label: 'Bard',       color: '#8e44ad' },
  { key: 'theme-cleric',    label: 'Cleric',     color: '#7f8c8d' },
  { key: 'theme-druid',     label: 'Druid',      color: '#2d6a4f' },
  { key: 'theme-fighter',   label: 'Fighter',    color: '#922b21' },
  { key: 'theme-monk',      label: 'Monk',       color: '#27ae60' },
  { key: 'theme-paladin',   label: 'Paladin',    color: '#283747' },
  { key: 'theme-ranger',    label: 'Ranger',     color: '#355e3b' },
  { key: 'theme-rogue',     label: 'Rogue',      color: '#212f3c' },
  { key: 'theme-sorcerer',  label: 'Sorcerer',   color: '#d35400' },
  { key: 'theme-warlock',   label: 'Warlock',    color: '#4a148c' },
  { key: 'theme-wizard',    label: 'Wizard',     color: '#1f3a93' },
];

export const pbCosts = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

/**
 * A database of spells.
 * This is a placeholder. The application is intended to be used with a user-provided database.
 * You can add more spells here to make them available in the search.
 */
export const dndSpellsDB = [
  { name: 'Acid Splash', level: 0, school: 'C', time: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', description: 'You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage.' },
  { name: 'Fire Bolt', level: 0, school: 'E', time: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn\'t being worn or carried.' },
  { name: 'Magic Missile', level: 1, school: 'E', time: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.' },
  { name: 'Shield', level: 1, school: 'A', time: '1 reaction', range: 'Self', components: 'V, S', duration: '1 round', description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.' },
];

// Automatically enriches constants from IndexedDB if it exists
export async function enrichConstantsFromDB() {
  try {
    const { openDB, STORE_NAME } = await import('src/utils/db');
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise((resolve) => {
      const req = store.get('currentData');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    if (!data) return;

    const { cleanText } = await import('src/utils/dndEntries');

    data.forEach(file => {
      if (!file.name.toLowerCase().endsWith('.json')) return;
      try {
        const json = JSON.parse(file.content);

        // Extract weapon property definitions
        const propArrays = [json.itemProperty, json.itemProperties];
        propArrays.forEach(arr => {
          if (!Array.isArray(arr)) return;
          arr.forEach(prop => {
            if (!prop.entries || !prop.entries.length) return;
            const abbr = (prop.abbreviation || prop.name || '').toLowerCase().trim();
            const name = (prop.name || prop.abbreviation || '').toLowerCase().trim();
            let desc = '';
            prop.entries.forEach(entry => {
              if (typeof entry === 'string') desc = entry;
              else if (entry && entry.entries) {
                entry.entries.forEach(e => { if (typeof e === 'string' && !desc) desc = e; });
              }
            });
            if (desc) {
              desc = cleanText ? cleanText(desc) : desc;
              if (abbr) weaponPropertyDescriptions[abbr] = desc;
              if (name && name !== abbr) weaponPropertyDescriptions[name] = desc;
            }
          });
        });

        // Extract weapon mastery definitions
        const mastArrays = [json.itemMastery, json.itemMasteries];
        mastArrays.forEach(arr => {
          if (!Array.isArray(arr)) return;
          arr.forEach(mast => {
            if (!mast.name || !mast.entries) return;
            const key = mast.name.toLowerCase().trim();
            let desc = '';
            mast.entries.forEach(e => { if (typeof e === 'string' && !desc) desc = e; });
            if (desc) {
               desc = cleanText ? cleanText(desc) : desc;
               masteryDescriptions[key] = desc;
               masteryDescriptions[mast.name] = desc; // Title case fallback for direct lookup
            }
          });
        });
      } catch (e) {}
    });
  } catch (e) {
    console.error("Failed to enrich constants from DB:", e);
  }
}

enrichConstantsFromDB();
