import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterProvider, DEFAULT_CHARACTER, useCharacter } from '../context/CharacterContext';

// Helper: renders a component inside the provider
function renderWithProvider(ui) {
  return render(<CharacterProvider>{ui}</CharacterProvider>);
}

// Test component that exposes context values
function Probe({ onRender }) {
  const ctx = useCharacter();
  onRender(ctx);
  return null;
}

describe('DEFAULT_CHARACTER', () => {
  it('has expected ability scores of 10', () => {
    expect(DEFAULT_CHARACTER.str).toBe(10);
    expect(DEFAULT_CHARACTER.dex).toBe(10);
    expect(DEFAULT_CHARACTER.con).toBe(10);
    expect(DEFAULT_CHARACTER.int).toBe(10);
    expect(DEFAULT_CHARACTER.wis).toBe(10);
    expect(DEFAULT_CHARACTER.cha).toBe(10);
  });

  it('starts at level 1 with profBonus 2', () => {
    expect(DEFAULT_CHARACTER.level).toBe(1);
    expect(DEFAULT_CHARACTER.profBonus).toBe(2);
  });

  it('starts with 10 hp / 10 maxHp', () => {
    expect(DEFAULT_CHARACTER.hp).toBe(10);
    expect(DEFAULT_CHARACTER.maxHp).toBe(10);
  });

  it('has empty skill/save proficiency objects', () => {
    expect(DEFAULT_CHARACTER.skillProficiency).toEqual({});
    expect(DEFAULT_CHARACTER.saveProficiency).toEqual({});
  });

  it('has death saves initialized to all false', () => {
    expect(DEFAULT_CHARACTER.deathSaves.successes).toEqual([false, false, false]);
    expect(DEFAULT_CHARACTER.deathSaves.failures).toEqual([false, false, false]);
  });

  it('has empty inventory/spells/features arrays', () => {
    expect(DEFAULT_CHARACTER.inventory).toEqual([]);
    expect(DEFAULT_CHARACTER.cantripsList).toEqual([]);
    expect(DEFAULT_CHARACTER.classFeatures).toEqual([]);
  });
});

describe('CharacterContext update', () => {
  it('update merges fields into state', async () => {
    let ctx;
    const user = userEvent.setup();
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.update({ charName: 'Aria', level: 5 }));

    expect(ctx.character.charName).toBe('Aria');
    expect(ctx.character.level).toBe(5);
  });

  it('update preserves unrelated fields', () => {
    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.update({ charName: 'Aria' }));
    act(() => ctx.update({ level: 3 }));

    expect(ctx.character.charName).toBe('Aria');
    expect(ctx.character.level).toBe(3);
    // default still there
    expect(ctx.character.hp).toBe(10);
  });

  it('load replaces character with defaults merged in', () => {
    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.load({ charName: 'Brom', hp: 42 }));

    expect(ctx.character.charName).toBe('Brom');
    expect(ctx.character.hp).toBe(42);
    // default preserved for missing fields
    expect(ctx.character.maxHp).toBe(10);
  });

  it('reset returns to DEFAULT_CHARACTER', () => {
    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.update({ charName: 'Garrick', hp: 99 }));
    act(() => ctx.reset());

    expect(ctx.character.charName).toBe('');
    expect(ctx.character.hp).toBe(10);
  });
});

describe('CharacterContext modals', () => {
  it('openModal sets modal to true', () => {
    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.openModal('alignment'));
    expect(ctx.modals.alignment).toBe(true);
  });

  it('closeModal sets modal to false', () => {
    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.openModal('xpTable'));
    act(() => ctx.closeModal('xpTable'));
    expect(ctx.modals.xpTable).toBe(false);
  });

  it('opening one modal does not affect others', () => {
    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.openModal('alignment'));
    expect(ctx.modals.score).toBe(false);
    expect(ctx.modals.theme).toBe(false);
  });

  it('can open custom keys like shortRest/longRest', () => {
    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.openModal('shortRest'));
    expect(ctx.modals.shortRest).toBe(true);

    act(() => ctx.closeModal('shortRest'));
    expect(ctx.modals.shortRest).toBe(false);
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => localStorage.clear());

  it('saves character to localStorage on update', () => {
    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    act(() => ctx.update({ charName: 'Persisted' }));

    const saved = JSON.parse(localStorage.getItem('dndCharacter'));
    expect(saved.charName).toBe('Persisted');
  });

  it('loads persisted character on mount', () => {
    localStorage.setItem('dndCharacter', JSON.stringify({ charName: 'FromStorage', hp: 77 }));

    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    expect(ctx.character.charName).toBe('FromStorage');
    expect(ctx.character.hp).toBe(77);
    // defaults still present for unset fields
    expect(ctx.character.str).toBe(10);
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('dndCharacter', 'NOT_JSON{{{{');

    let ctx;
    renderWithProvider(<Probe onRender={c => { ctx = c; }} />);

    expect(ctx.character.charName).toBe('');
    expect(ctx.character.hp).toBe(10);
  });
});
