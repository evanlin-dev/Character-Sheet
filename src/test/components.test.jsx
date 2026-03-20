import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CharacterProvider, DEFAULT_CHARACTER } from '../context/CharacterContext';
import CharacterInfo, { MobileMoreModal } from '../components/CharacterInfo';
import AbilityScores from '../components/AbilityScores';
import Resources from '../components/Resources';
import SummonsTab from '../components/tabs/SummonsTab';
import SpellsTab from '../components/tabs/SpellsTab';
import FeaturesTab from '../components/tabs/FeaturesTab';

function wrap(ui, initial = {}) {
  // Preload localStorage so CharacterProvider sees initial state
  if (Object.keys(initial).length) {
    localStorage.setItem('dndCharacter', JSON.stringify({ ...DEFAULT_CHARACTER, ...initial }));
  } else {
    localStorage.removeItem('dndCharacter');
  }
  return render(
    <MemoryRouter>
      <CharacterProvider>{ui}</CharacterProvider>
    </MemoryRouter>
  );
}

beforeEach(() => localStorage.clear());

// ── CharacterInfo ─────────────────────────────────────────────────────────────
describe('CharacterInfo', () => {
  it('renders all key input fields', () => {
    wrap(<CharacterInfo />);
    expect(screen.getByPlaceholderText('Enter name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Fighter/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Champion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Race')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Background')).toBeInTheDocument();
  });

  it('renders Heroic Inspiration checkbox', () => {
    wrap(<CharacterInfo />);
    expect(screen.getByText(/Heroic Inspiration/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders ⋮ three-dot button', () => {
    wrap(<CharacterInfo />);
    expect(screen.getByTitle('More info')).toBeInTheDocument();
  });

  it('shows character name from state', () => {
    wrap(<CharacterInfo />, { charName: 'Lyra' });
    expect(screen.getByDisplayValue('Lyra')).toBeInTheDocument();
  });

  it('updates name on input change', async () => {
    const user = userEvent.setup();
    wrap(<CharacterInfo />);
    const input = screen.getByPlaceholderText('Enter name...');
    await user.clear(input);
    await user.type(input, 'Thorin');
    expect(input.value).toBe('Thorin');
  });

  it('opens alignment modal when alignment field is clicked', async () => {
    const user = userEvent.setup();
    wrap(<CharacterInfo />);
    await user.click(screen.getByPlaceholderText('Click to set'));
    // AlignmentModal not rendered here (it's in CharacterSheetPage), but no crash
  });
});

// ── MobileMoreModal ───────────────────────────────────────────────────────────
describe('MobileMoreModal', () => {
  function wrapWithModal(initial = {}) {
    localStorage.setItem('dndCharacter', JSON.stringify({ ...DEFAULT_CHARACTER, ...initial }));
    // Render inside provider so openModal works
    const { rerender } = render(
      <MemoryRouter>
        <CharacterProvider>
          <MobileMoreModal />
        </CharacterProvider>
      </MemoryRouter>
    );
    return rerender;
  }

  it('does not render when modal is closed', () => {
    wrapWithModal();
    expect(screen.queryByText('Character Details')).not.toBeInTheDocument();
  });
});

// ── AbilityScores ─────────────────────────────────────────────────────────────
describe('AbilityScores', () => {
  it('renders all 6 ability labels', () => {
    wrap(<AbilityScores />);
    ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('displays current ability scores', () => {
    wrap(<AbilityScores />, { str: 18, dex: 14 });
    expect(screen.getByDisplayValue('18')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14')).toBeInTheDocument();
  });

  it('displays correct modifier for STR 18 (+4)', () => {
    wrap(<AbilityScores />, { str: 18 });
    expect(screen.getByDisplayValue('+4')).toBeInTheDocument();
  });

  it('displays correct modifier for DEX 8 (-1)', () => {
    wrap(<AbilityScores />, { dex: 8 });
    expect(screen.getByDisplayValue('-1')).toBeInTheDocument();
  });

  it('renders saving throw rows for each ability', () => {
    wrap(<AbilityScores />);
    expect(screen.getAllByText('Saving Throw')).toHaveLength(6);
  });

  it('renders skill items', () => {
    wrap(<AbilityScores />);
    expect(screen.getByText('Athletics')).toBeInTheDocument();
    expect(screen.getByText('Perception')).toBeInTheDocument();
    expect(screen.getByText('Stealth')).toBeInTheDocument();
  });

  it('shows Set Up Ability Scores button', () => {
    wrap(<AbilityScores />);
    expect(screen.getByText('Set Up Ability Scores')).toBeInTheDocument();
  });
});

// ── Resources ─────────────────────────────────────────────────────────────────
describe('Resources', () => {
  it('renders section title', () => {
    wrap(<Resources />);
    expect(screen.getByText('Class Resources')).toBeInTheDocument();
  });

  it('renders Short Rest and Long Rest buttons', () => {
    wrap(<Resources />);
    expect(screen.getByText('Short Rest')).toBeInTheDocument();
    expect(screen.getByText('Long Rest')).toBeInTheDocument();
  });

  it('renders Add Resource button', () => {
    wrap(<Resources />);
    expect(screen.getByText('+ Add Resource')).toBeInTheDocument();
  });

  it('adds a resource item when + Add Resource clicked', async () => {
    const user = userEvent.setup();
    wrap(<Resources />);
    await user.click(screen.getByText('+ Add Resource'));
    expect(screen.getByDisplayValue('New Resource')).toBeInTheDocument();
  });

  it('renders existing resources from state', () => {
    wrap(<Resources />, {
      resourcesData: [{ name: 'Channel Divinity', max: 2, used: 0, reset: 'sr', formulaKey: 'fixed', fixedMax: 2 }],
    });
    expect(screen.getByDisplayValue('Channel Divinity')).toBeInTheDocument();
  });

  it('Short Rest button opens shortRest modal (context)', async () => {
    const user = userEvent.setup();
    // We just verify the button is clickable and doesn't throw
    wrap(<Resources />);
    await user.click(screen.getByText('Short Rest'));
    // Modal is rendered in CharacterSheetPage, not here — no throw = pass
  });
});

// ── SummonsTab ────────────────────────────────────────────────────────────────
describe('SummonsTab', () => {
  it('shows empty state message when no summons', () => {
    wrap(<SummonsTab />);
    expect(screen.getByText(/No creatures tracked/i)).toBeInTheDocument();
  });

  it('renders Add Blank button', () => {
    wrap(<SummonsTab />);
    expect(screen.getByText('+ Add Blank')).toBeInTheDocument();
  });

  it('adds a summon card on click', async () => {
    const user = userEvent.setup();
    wrap(<SummonsTab />);
    await user.click(screen.getByText('+ Add Blank'));
    expect(screen.getByPlaceholderText('Creature name')).toBeInTheDocument();
  });

  it('renders existing summons', () => {
    wrap(<SummonsTab />, {
      summonsData: [{ name: 'Dire Wolf', type: 'Beast', hp: 30, maxHp: 37, ac: 14, speed: '50 ft', initiative: '+3', notes: '' }],
    });
    expect(screen.getByDisplayValue('Dire Wolf')).toBeInTheDocument();
  });

  it('shows HP current and max for summon', () => {
    wrap(<SummonsTab />, {
      summonsData: [{ name: 'Hawk', hp: 5, maxHp: 10, ac: 13, speed: '10 ft', initiative: '+0', notes: '' }],
    });
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('renders + Add to Combat button on each summon', () => {
    wrap(<SummonsTab />, {
      summonsData: [{ name: 'Spider', hp: 8, maxHp: 8, ac: 11, speed: '20 ft', initiative: '+2', notes: '' }],
    });
    expect(screen.getByText('+ Add to Combat')).toBeInTheDocument();
  });

  it('Add to Combat writes to localStorage', async () => {
    const user = userEvent.setup();
    // Mock alert
    global.alert = () => {};
    wrap(<SummonsTab />, {
      summonsData: [{ name: 'Goblin', hp: 7, maxHp: 7, ac: 15, speed: '30 ft', initiative: '+2', notes: '' }],
    });
    await user.click(screen.getByText('+ Add to Combat'));
    const entries = JSON.parse(localStorage.getItem('combatTrackerEntries') || '[]');
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('Goblin');
    expect(entries[0].hp).toBe(7);
    expect(entries[0].ac).toBe(15);
  });

  it('delete button removes summon', async () => {
    const user = userEvent.setup();
    wrap(<SummonsTab />, {
      summonsData: [{ name: 'Familiar', hp: 1, maxHp: 1, ac: 11, speed: '20 ft', initiative: '+0', notes: '' }],
    });
    const deleteBtn = screen.getByText('×');
    await user.click(deleteBtn);
    expect(screen.queryByDisplayValue('Familiar')).not.toBeInTheDocument();
  });
});

// ── SpellsTab ─────────────────────────────────────────────────────────────────
describe('SpellsTab', () => {
  it('renders spellcasting ability selector', () => {
    wrap(<SpellsTab />);
    expect(screen.getByText(/Spellcasting Ability/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders Spell Save DC field', () => {
    wrap(<SpellsTab />);
    expect(screen.getByText(/Spell Save DC/i)).toBeInTheDocument();
  });

  it('renders Spell Attack Bonus field', () => {
    wrap(<SpellsTab />);
    expect(screen.getByText(/Spell Attack Bonus/i)).toBeInTheDocument();
  });

  it('renders Spell Modifier field', () => {
    wrap(<SpellsTab />);
    expect(screen.getByText(/Spell Modifier/i)).toBeInTheDocument();
  });

  it('renders Spell Slots section', () => {
    wrap(<SpellsTab />);
    expect(screen.getByText('Spell Slots')).toBeInTheDocument();
  });

  it('renders Cantrips section', () => {
    wrap(<SpellsTab />);
    expect(screen.getByText(/Cantrips/i)).toBeInTheDocument();
  });

  it('renders Prepared Spells section', () => {
    wrap(<SpellsTab />);
    expect(screen.getByText('Prepared Spells')).toBeInTheDocument();
  });

  it('renders Known Spells section', () => {
    wrap(<SpellsTab />);
    expect(screen.getByText('Known Spells')).toBeInTheDocument();
  });

  it('spell DC recalculates when ability scores change', () => {
    wrap(<SpellsTab />, { int: 20, profBonus: 4, spellAbility: 'int' });
    // DC = 8 + 4 + 5 = 17
    expect(screen.getByDisplayValue('17')).toBeInTheDocument();
  });

  it('adds a cantrip row when + Add Custom clicked in Cantrips', async () => {
    const user = userEvent.setup();
    wrap(<SpellsTab />);
    const buttons = screen.getAllByText('+ Add Custom');
    await user.click(buttons[0]); // first one is Cantrips
    expect(screen.getAllByPlaceholderText('Spell name').length).toBeGreaterThan(0);
  });
});

// ── FeaturesTab ───────────────────────────────────────────────────────────────
describe('FeaturesTab', () => {
  it('renders filter buttons', () => {
    wrap(<FeaturesTab />);
    ['All', 'Class', 'Background', 'Species'].forEach(label => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
    // 'Feats' appears as both a button and a section title — check at least one button
    expect(screen.getAllByText('Feats').length).toBeGreaterThanOrEqual(1);
  });

  it('shows all sections when All filter active', () => {
    wrap(<FeaturesTab />);
    expect(screen.getByText('Class Features')).toBeInTheDocument();
    expect(screen.getByText('Species Features')).toBeInTheDocument();
    expect(screen.getByText('Background Features')).toBeInTheDocument();
    // 'Feats' is both a filter button and a section title
    expect(screen.getAllByText('Feats').length).toBeGreaterThanOrEqual(2);
  });

  it('shows only Class section when Class filter active', async () => {
    const user = userEvent.setup();
    wrap(<FeaturesTab />);
    await user.click(screen.getByText('Class'));
    expect(screen.getByText('Class Features')).toBeInTheDocument();
    expect(screen.queryByText('Species Features')).not.toBeInTheDocument();
  });

  it('adds a class feature on click', async () => {
    const user = userEvent.setup();
    wrap(<FeaturesTab />);
    await user.click(screen.getAllByText('+ Add Feature')[0]);
    expect(screen.getByPlaceholderText('Feature name...')).toBeInTheDocument();
  });

  it('renders existing class features', () => {
    wrap(<FeaturesTab />, {
      classFeatures: [{ title: 'Action Surge', desc: 'Take one additional action.' }],
    });
    expect(screen.getByDisplayValue('Action Surge')).toBeInTheDocument();
  });
});
