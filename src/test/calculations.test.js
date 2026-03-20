import { describe, it, expect } from 'vitest';
import {
  calcMod, formatMod, getProfBonus,
  getSkillTotal, getSaveTotal,
  getSpellDC, getSpellAttackBonus,
  getWeightCapacity, getTotalWeight,
  computeResourceMax,
} from '../utils/calculations';

// ── calcMod ──────────────────────────────────────────────────────────────────
describe('calcMod', () => {
  it('returns 0 for score 10', () => expect(calcMod(10)).toBe(0));
  it('returns 0 for score 11', () => expect(calcMod(11)).toBe(0));
  it('returns +1 for score 12', () => expect(calcMod(12)).toBe(1));
  it('returns +5 for score 20', () => expect(calcMod(20)).toBe(5));
  it('returns -1 for score 8', () => expect(calcMod(8)).toBe(-1));
  it('returns -5 for score 1', () => expect(calcMod(1)).toBe(-5));
  it('defaults to 10 when given 0 or falsy', () => expect(calcMod(0)).toBe(0));
});

// ── formatMod ─────────────────────────────────────────────────────────────────
describe('formatMod', () => {
  it('prefixes + for positive', () => expect(formatMod(3)).toBe('+3'));
  it('prefixes + for zero', () => expect(formatMod(0)).toBe('+0'));
  it('preserves - for negative', () => expect(formatMod(-2)).toBe('-2'));
});

// ── getProfBonus ──────────────────────────────────────────────────────────────
describe('getProfBonus', () => {
  it('+2 for levels 1–4', () => {
    expect(getProfBonus(1)).toBe(2);
    expect(getProfBonus(4)).toBe(2);
  });
  it('+3 for levels 5–8', () => {
    expect(getProfBonus(5)).toBe(3);
    expect(getProfBonus(8)).toBe(3);
  });
  it('+4 for levels 9–12', () => expect(getProfBonus(9)).toBe(4));
  it('+5 for levels 13–16', () => expect(getProfBonus(13)).toBe(5));
  it('+6 for levels 17–20', () => expect(getProfBonus(17)).toBe(6));
  it('defaults to level 1 for undefined', () => expect(getProfBonus(undefined)).toBe(2));
});

// ── getSkillTotal ─────────────────────────────────────────────────────────────
describe('getSkillTotal', () => {
  const base = { dex: 14, profBonus: 3, level: 5 };

  it('returns pure ability mod with no proficiency', () => {
    expect(getSkillTotal(base, 'acrobatics')).toBe(2); // dex 14 → +2
  });

  it('adds proficiency bonus when proficient', () => {
    const char = { ...base, skillProficiency: { acrobatics: true } };
    expect(getSkillTotal(char, 'acrobatics')).toBe(5); // +2 + 3
  });

  it('doubles proficiency for expertise', () => {
    const char = {
      ...base,
      skillProficiency: { acrobatics: true },
      skillExpertise: { acrobatics: true },
    };
    expect(getSkillTotal(char, 'acrobatics')).toBe(8); // +2 + 3 + 3
  });

  it('expertise without proficiency does not add double', () => {
    const char = { ...base, skillExpertise: { acrobatics: true } };
    expect(getSkillTotal(char, 'acrobatics')).toBe(2); // expertise alone ignored
  });
});

// ── getSaveTotal ──────────────────────────────────────────────────────────────
describe('getSaveTotal', () => {
  const base = { str: 16, profBonus: 3, level: 5 };

  it('returns ability mod only when not proficient', () => {
    expect(getSaveTotal(base, 'str')).toBe(3); // +3
  });

  it('adds proficiency when proficient', () => {
    const char = { ...base, saveProficiency: { str: true } };
    expect(getSaveTotal(char, 'str')).toBe(6); // +3 + 3
  });

  it('doubles for save expertise', () => {
    const char = {
      ...base,
      saveProficiency: { str: true },
      saveExpertise: { str: true },
    };
    expect(getSaveTotal(char, 'str')).toBe(9); // +3 + 3 + 3
  });
});

// ── getSpellDC / getSpellAttackBonus ──────────────────────────────────────────
describe('Spell stats', () => {
  const char = { int: 18, profBonus: 4, level: 7, spellAbility: 'int' };

  it('spell DC = 8 + pb + ability mod', () => {
    expect(getSpellDC(char)).toBe(8 + 4 + 4); // 16
  });

  it('spell attack bonus = pb + ability mod', () => {
    expect(getSpellAttackBonus(char)).toBe(4 + 4); // 8
  });

  it('defaults to int when spellAbility undefined', () => {
    const c = { int: 14, profBonus: 2 };
    expect(getSpellDC(c)).toBe(8 + 2 + 2); // 12
  });

  it('uses wis when spellAbility is wis', () => {
    const c = { wis: 16, profBonus: 3, spellAbility: 'wis' };
    expect(getSpellDC(c)).toBe(8 + 3 + 3); // 14
  });
});

// ── getWeightCapacity ─────────────────────────────────────────────────────────
describe('getWeightCapacity', () => {
  it('Medium: str × 15', () => {
    expect(getWeightCapacity({ str: 10, charSize: 'Medium' })).toBe(150);
  });
  it('defaults to Medium', () => {
    expect(getWeightCapacity({ str: 10 })).toBe(150);
  });
  it('Large: str × 30', () => {
    expect(getWeightCapacity({ str: 10, charSize: 'Large' })).toBe(300);
  });
  it('Tiny: str × 7.5', () => {
    expect(getWeightCapacity({ str: 10, charSize: 'Tiny' })).toBe(75);
  });
});

// ── getTotalWeight ────────────────────────────────────────────────────────────
describe('getTotalWeight', () => {
  it('sums qty × weight across all items', () => {
    const inv = [
      { qty: 2, weight: 5 },
      { qty: 1, weight: 3 },
    ];
    expect(getTotalWeight(inv)).toBe(13);
  });
  it('handles empty inventory', () => {
    expect(getTotalWeight([])).toBe(0);
  });
  it('combines inventory + componentPouch', () => {
    const inv = [{ qty: 1, weight: 2 }];
    const pouch = [{ qty: 3, weight: 0.5 }];
    expect(getTotalWeight(inv, pouch)).toBe(3.5);
  });
  it('ignores missing qty/weight', () => {
    expect(getTotalWeight([{ name: 'Torch' }])).toBe(0);
  });
});

// ── computeResourceMax ────────────────────────────────────────────────────────
describe('computeResourceMax', () => {
  const char = { level: 5, profBonus: 3, wis: 18 }; // wis mod = +4

  it('fixed max uses fixedMax', () => {
    expect(computeResourceMax({ formulaKey: 'fixed', fixedMax: 6 }, char)).toBe(6);
  });
  it('pb formula returns proficiency bonus', () => {
    expect(computeResourceMax({ formulaKey: 'pb' }, char)).toBe(3);
  });
  it('pb_x2 returns 2× proficiency bonus', () => {
    expect(computeResourceMax({ formulaKey: 'pb_x2' }, char)).toBe(6);
  });
  it('level formula returns character level', () => {
    expect(computeResourceMax({ formulaKey: 'level' }, char)).toBe(5);
  });
  it('half_level floors at 1 minimum', () => {
    expect(computeResourceMax({ formulaKey: 'half_level' }, { level: 1 })).toBe(1);
    expect(computeResourceMax({ formulaKey: 'half_level' }, char)).toBe(2);
  });
  it('wis_mod returns wis modifier', () => {
    expect(computeResourceMax({ formulaKey: 'wis_mod' }, char)).toBe(4);
  });
  it('wis_mod_pb returns wis mod + pb', () => {
    expect(computeResourceMax({ formulaKey: 'wis_mod_pb' }, char)).toBe(7); // 4 + 3
  });
  it('falls back to 1 for null resource', () => {
    expect(computeResourceMax(null, char)).toBe(1);
  });
});
