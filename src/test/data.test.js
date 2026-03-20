import { describe, it, expect } from 'vitest';
import { xpTable, skillsMap, RESOURCE_FORMULA_OPTS } from '../data/constants';

// ── xpTable ───────────────────────────────────────────────────────────────────
describe('xpTable', () => {
  it('has 20 entries (one per level)', () => {
    expect(xpTable).toHaveLength(20);
  });

  it('level 1 starts at 0 XP', () => {
    expect(xpTable[0]).toMatchObject({ lvl: 1, xp: 0 });
  });

  it('level 20 is the final entry', () => {
    expect(xpTable[19]).toMatchObject({ lvl: 20, xp: 355000 });
  });

  it('XP values are monotonically increasing', () => {
    for (let i = 1; i < xpTable.length; i++) {
      expect(xpTable[i].xp).toBeGreaterThan(xpTable[i - 1].xp);
    }
  });

  it('proficiency bonus is correct at key levels', () => {
    expect(xpTable[0].prof).toBe(2);  // level 1
    expect(xpTable[4].prof).toBe(3);  // level 5
    expect(xpTable[8].prof).toBe(4);  // level 9
    expect(xpTable[12].prof).toBe(5); // level 13
    expect(xpTable[16].prof).toBe(6); // level 17
  });

  it('each entry has required shape', () => {
    xpTable.forEach(row => {
      expect(row).toHaveProperty('lvl');
      expect(row).toHaveProperty('xp');
      expect(row).toHaveProperty('prof');
    });
  });
});

// ── skillsMap ─────────────────────────────────────────────────────────────────
describe('skillsMap', () => {
  it('maps each skill to an ability score key', () => {
    const validAbilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    Object.entries(skillsMap).forEach(([skill, ability]) => {
      expect(validAbilities).toContain(ability);
    });
  });

  it('athletics is STR-based', () => expect(skillsMap.athletics).toBe('str'));
  it('acrobatics is DEX-based', () => expect(skillsMap.acrobatics).toBe('dex'));
  it('stealth is DEX-based', () => expect(skillsMap.stealth).toBe('dex'));
  it('perception is WIS-based', () => expect(skillsMap.perception).toBe('wis'));
  it('persuasion is CHA-based', () => expect(skillsMap.persuasion).toBe('cha'));
  it('arcana is INT-based', () => expect(skillsMap.arcana).toBe('int'));

  it('contains exactly 18 standard 5e skills', () => {
    expect(Object.keys(skillsMap)).toHaveLength(18);
  });

  it('all skill keys are lowercase', () => {
    Object.keys(skillsMap).forEach(key => {
      expect(key).toBe(key.toLowerCase());
    });
  });
});

// ── RESOURCE_FORMULA_OPTS ─────────────────────────────────────────────────────
describe('RESOURCE_FORMULA_OPTS', () => {
  it('includes a fixed option', () => {
    expect(RESOURCE_FORMULA_OPTS.some(o => o.key === 'fixed')).toBe(true);
  });

  it('includes proficiency bonus options', () => {
    expect(RESOURCE_FORMULA_OPTS.some(o => o.key === 'pb')).toBe(true);
    expect(RESOURCE_FORMULA_OPTS.some(o => o.key === 'pb_x2')).toBe(true);
  });

  it('includes level-based options', () => {
    expect(RESOURCE_FORMULA_OPTS.some(o => o.key === 'level')).toBe(true);
    expect(RESOURCE_FORMULA_OPTS.some(o => o.key === 'half_level')).toBe(true);
  });

  it('includes ability modifier options', () => {
    ['str_mod', 'dex_mod', 'con_mod', 'int_mod', 'wis_mod', 'cha_mod'].forEach(key => {
      expect(RESOURCE_FORMULA_OPTS.some(o => o.key === key)).toBe(true);
    });
  });

  it('each option has key and label', () => {
    RESOURCE_FORMULA_OPTS.forEach(opt => {
      expect(opt).toHaveProperty('key');
      expect(opt).toHaveProperty('label');
      expect(typeof opt.label).toBe('string');
    });
  });
});
