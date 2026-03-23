import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CharacterProvider } from '../context/CharacterContext';
import CharacterCreatorPage from '../pages/CharacterCreatorPage';

// Mock indexedDB to simulate loaded compendium data
const mockData = [
  {
    name: "phb.json",
    content: JSON.stringify({
      class: [
        { name: "Wizard", source: "PHB", hd: { faces: 6 }, startingProficiencies: { skills: ["arcana", "history"] } }
      ],
      spell: [
        { name: "Fireball", level: 3, source: "PHB", classes: { fromClassList: [{ name: "Wizard", source: "PHB" }] }, entries: ["A bright streak flashes..."] },
        { name: "Fire Bolt", level: 0, source: "PHB", classes: { fromClassList: [{ name: "Wizard", source: "PHB" }] }, entries: ["You hurl a mote of fire..."] }
      ],
      race: [
        { name: "Human", source: "PHB", speed: 30 }
      ],
      background: [
        { name: "Acolyte", source: "PHB", skillProficiencies: [{"insight": true, "religion": true}] }
      ]
    })
  }
];

const mockIDBStore = {
  get: vi.fn(() => {
    const req = { result: mockData };
    setTimeout(() => req.onsuccess && req.onsuccess({ target: req }), 10);
    return req;
  })
};

const mockIDBTransaction = {
  objectStore: vi.fn(() => mockIDBStore)
};

const mockIDBDatabase = {
  objectStoreNames: { contains: vi.fn(() => true) },
  transaction: vi.fn(() => mockIDBTransaction)
};

global.indexedDB = {
  open: vi.fn(() => {
    const req = { result: mockIDBDatabase };
    setTimeout(() => req.onsuccess && req.onsuccess({ target: req }), 10);
    return req;
  })
};

function renderCreator() {
  return render(
    <MemoryRouter>
      <CharacterProvider>
        <CharacterCreatorPage />
      </CharacterProvider>
    </MemoryRouter>
  );
}

describe('Character Creator', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('imports proficiency bonus as a number and maps spells correctly to their corresponding lists', async () => {
    const user = userEvent.setup();
    renderCreator();

    await waitFor(() => {
      expect(screen.queryByText(/Loading character data/i)).not.toBeInTheDocument();
    });

    // Walk through Character Creator wizard steps
    const classDropdowns = screen.getAllByRole('combobox');
    await user.selectOptions(classDropdowns[0], 'Wizard');
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Human'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Standard Array'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Acolyte'));
    await user.click(screen.getByText('Next')); // Bg Extra
    await user.click(screen.getByText('Next')); // Equipment
    await user.click(screen.getByText('Next')); // Spells
    
    // Select Spells
    await user.click(screen.getByText('Fire Bolt'));
    await user.click(screen.getByText('Fireball'));
    await user.click(screen.getByText('Next')); // Feats
    await user.click(screen.getByText('Next')); // Review

    const nameInput = screen.getByPlaceholderText('Enter character name...');
    await user.type(nameInput, 'Gandalf');
    
    await user.click(screen.getByText('Create Character'));

    const savedData = JSON.parse(localStorage.getItem('dndCharacter'));
    expect(savedData).toBeDefined();
    
    // Assertions for issues fixed
    expect(savedData.profBonus).toBe(2); // Should be a clean number, not a string formatted like "+2"

    expect(savedData.cantripsList).toBeDefined();
    expect(savedData.cantripsList.length).toBe(1);
    expect(savedData.cantripsList[0].name).toBe('Fire Bolt');
    expect(savedData.cantripsList[0].level).toBe(0);

    expect(savedData.preparedSpellsList).toBeDefined();
    expect(savedData.preparedSpellsList.length).toBe(1);
    expect(savedData.preparedSpellsList[0].name).toBe('Fireball');
    expect(savedData.preparedSpellsList[0].level).toBe(3);
    
    expect(savedData.charName).toBe('Gandalf');
  });
});