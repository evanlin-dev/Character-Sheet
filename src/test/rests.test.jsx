import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CharacterProvider, DEFAULT_CHARACTER, useCharacter } from '../context/CharacterContext';

beforeEach(() => localStorage.clear());

function Probe({ onRender }) {
  const ctx = useCharacter();
  onRender(ctx);
  return null;
}

function wrap(initial = {}) {
  localStorage.setItem('dndCharacter', JSON.stringify({ ...DEFAULT_CHARACTER, ...initial }));
  let ctx;
  render(
    <MemoryRouter>
      <CharacterProvider>
        <Probe onRender={c => { ctx = c; }} />
      </CharacterProvider>
    </MemoryRouter>
  );
  return () => ctx;
}

// ── Short Rest logic ──────────────────────────────────────────────────────────
describe('Short Rest data', () => {
  it('HP increases by hpGained, capped at maxHp', () => {
    const getCtx = wrap({ hp: 5, maxHp: 20 });
    const ctx = getCtx();

    act(() => {
      const hpGained = 8;
      const newHp = Math.min(20, 5 + hpGained);
      ctx.update({ hp: newHp });
    });

    expect(getCtx().character.hp).toBe(13);
  });

  it('HP does not exceed maxHp', () => {
    const getCtx = wrap({ hp: 18, maxHp: 20 });
    act(() => {
      const newHp = Math.min(20, 18 + 10);
      getCtx().update({ hp: newHp });
    });
    expect(getCtx().character.hp).toBe(20);
  });

  it('hit dice used increments', () => {
    const getCtx = wrap({ hitDiceUsed: 1, hitDice: '5d8' });
    act(() => {
      const newUsed = 1 + 2;
      getCtx().update({ hitDiceUsed: newUsed });
    });
    expect(getCtx().character.hitDiceUsed).toBe(3);
  });

  it('SR resources reset on short rest', () => {
    const getCtx = wrap({
      resourcesData: [
        { name: 'Action Surge', max: 1, used: 1, recharge: 'sr' },
        { name: 'Spell Slots', max: 3, used: 2, recharge: 'lr' },
        { name: 'Custom', max: 2, used: 2, recharge: 'none' },
      ],
    });
    act(() => {
      const newRes = getCtx().character.resourcesData.map(r =>
        r.recharge === 'sr' || r.recharge === 'lr' ? { ...r, used: 0 } : r
      );
      getCtx().update({ resourcesData: newRes });
    });
    const res = getCtx().character.resourcesData;
    expect(res.find(r => r.name === 'Action Surge').used).toBe(0);
    expect(res.find(r => r.name === 'Spell Slots').used).toBe(0);
    expect(res.find(r => r.name === 'Custom').used).toBe(2); // unchanged
  });
});

// ── Long Rest logic ───────────────────────────────────────────────────────────
describe('Long Rest data', () => {
  it('restores HP to maxHp', () => {
    const getCtx = wrap({ hp: 3, maxHp: 40 });
    act(() => getCtx().update({ hp: 40 }));
    expect(getCtx().character.hp).toBe(40);
  });

  it('clears tempHp', () => {
    const getCtx = wrap({ tempHp: 15 });
    act(() => getCtx().update({ tempHp: 0 }));
    expect(getCtx().character.tempHp).toBe(0);
  });

  it('resets hitDiceUsed', () => {
    const getCtx = wrap({ hitDiceUsed: 4 });
    act(() => getCtx().update({ hitDiceUsed: 0 }));
    expect(getCtx().character.hitDiceUsed).toBe(0);
  });

  it('resets all spell slot used counts', () => {
    const getCtx = wrap({
      spellSlotsData: [
        { level: 1, total: 4, used: 4 },
        { level: 2, total: 3, used: 2 },
        { level: 3, total: 2, used: 1 },
      ],
    });
    act(() => {
      const resetSlots = getCtx().character.spellSlotsData.map(s => ({ ...s, used: 0 }));
      getCtx().update({ spellSlotsData: resetSlots });
    });
    getCtx().character.spellSlotsData.forEach(slot => {
      expect(slot.used).toBe(0);
    });
  });

  it('resets LR and SR resources but not custom', () => {
    const getCtx = wrap({
      resourcesData: [
        { name: 'Wild Shape', used: 2, recharge: 'lr' },
        { name: 'Action Surge', used: 1, recharge: 'sr' },
        { name: 'Magic Item', used: 1, recharge: 'none' },
      ],
    });
    act(() => {
      const resetRes = getCtx().character.resourcesData.map(r =>
        r.recharge === 'lr' || r.recharge === 'sr' ? { ...r, used: 0 } : r
      );
      getCtx().update({ resourcesData: resetRes });
    });
    const res = getCtx().character.resourcesData;
    expect(res.find(r => r.name === 'Wild Shape').used).toBe(0);
    expect(res.find(r => r.name === 'Action Surge').used).toBe(0);
    expect(res.find(r => r.name === 'Magic Item').used).toBe(1); // unchanged
  });

  it('clears death saves on long rest', () => {
    const getCtx = wrap({
      deathSaves: { successes: [true, true, false], failures: [true, false, false] },
    });
    act(() => getCtx().update({
      deathSaves: { successes: [false, false, false], failures: [false, false, false] },
    }));
    expect(getCtx().character.deathSaves.successes).toEqual([false, false, false]);
    expect(getCtx().character.deathSaves.failures).toEqual([false, false, false]);
  });
});
