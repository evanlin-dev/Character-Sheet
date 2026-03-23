import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LevelUpModal from '../LevelUpModal';
import { useCharacter } from '../../context/CharacterContext';
import { useCreatorData } from '../../utils/useCreatorData';

// Mock the contexts
vi.mock('../../context/CharacterContext', () => ({
  useCharacter: vi.fn(),
}));

vi.mock('../../utils/useCreatorData', () => ({
  useCreatorData: vi.fn(),
}));

// Mock the fluff image / feature choices to keep the DOM simple
vi.mock('../../components/FluffImage', () => ({
  default: () => <div data-testid="mock-fluff-image" />,
}));
vi.mock('../../components/FeatureChoices', () => ({
  default: () => <div data-testid="mock-feature-choices" />,
}));

describe('LevelUpModal', () => {
  let mockUpdate;
  let mockCloseModal;

  const baseMockData = {
    classes: [
      {
        name: 'Wizard',
        source: 'PHB',
        hd: { faces: 6 },
        spellcastingAbility: 'int',
      },
      {
        name: 'Fighter',
        source: 'PHB',
        hd: { faces: 10 },
      }
    ],
    subclasses: [
      { name: 'Evocation', shortName: 'Evocation', className: 'Wizard', source: 'PHB' },
      { name: 'Champion', shortName: 'Champion', className: 'Fighter', source: 'PHB' }
    ],
    classFeatures: [
      { name: 'Arcane Recovery', className: 'Wizard', level: 1, source: 'PHB', entries: ['Recover spell slots.'] },
      { name: 'Ability Score Improvement', className: 'Wizard', level: 4, source: 'PHB', entries: ['Increase stats.'] }
    ],
    subclassFeatures: [
      { name: 'Evocation Savant', className: 'Wizard', subclassShortName: 'Evocation', level: 2, source: 'PHB', entries: ['Cheaper evocation.'] }
    ],
    spells: [
      { name: 'Fireball', level: 3, classes: { fromClassList: [{ name: 'Wizard' }] } },
      { name: 'Fire Bolt', level: 0, classes: { fromClassList: [{ name: 'Wizard' }] } }
    ],
    feats: [
      { name: 'Tough', entries: ['More HP'] }
    ]
  };

  beforeEach(() => {
    mockUpdate = vi.fn();
    mockCloseModal = vi.fn();
    vi.clearAllMocks();
  });

  it('does not render when modal is closed', () => {
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: false } },
      character: {},
    });
    useCreatorData.mockReturnValue({ data: baseMockData, loading: false });

    render(<LevelUpModal />);
    expect(screen.queryByText(/Level .* Features/)).toBeNull();
  });

  it('renders loading state when data is not ready', () => {
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: true, level: 2, oldLevel: 1 } },
      character: { charClass: 'Wizard' },
    });
    useCreatorData.mockReturnValue({ data: {}, loading: true });

    render(<LevelUpModal />);
    expect(screen.getByText('Loading database...')).toBeInTheDocument();
  });

  it('renders features tab and successfully parses class data', () => {
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: true, level: 2, oldLevel: 1 } },
      character: { charClass: 'Wizard', charSubclass: 'Evocation' },
      update: mockUpdate,
      closeModal: mockCloseModal,
    });
    useCreatorData.mockReturnValue({ data: baseMockData, loading: false });

    render(<LevelUpModal />);
    
    // Check header
    expect(screen.getByText('Level 2 Features')).toBeInTheDocument();
    
    // Subclass feature should be listed because the target level is 2
    expect(screen.getByText(/Evocation Savant/i)).toBeInTheDocument();
    expect(screen.getByText(/Cheaper evocation./i)).toBeInTheDocument();
  });

  it('prompts to select a subclass if level >= 3 and none is selected', () => {
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: true, level: 3, oldLevel: 2 } },
      character: { charClass: 'Fighter', charSubclass: '' }, // No subclass yet
      update: mockUpdate,
      closeModal: mockCloseModal,
    });
    useCreatorData.mockReturnValue({ data: baseMockData, loading: false });

    render(<LevelUpModal />);
    
    // Should prompt for subclass selection
    expect(screen.getByText('Select Subclass')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Champion')).toBeInTheDocument();
  });

  it('calculates average HP correctly on the HP tab', () => {
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: true, level: 2, oldLevel: 1 } },
      // Fighter gets a d10. Average is 6. Con is 14 (+2).
      // Gain should be 6 + 2 = 8.
      character: { charClass: 'Fighter', con: 14, maxHp: 12 }, 
      update: mockUpdate,
      closeModal: mockCloseModal,
    });
    useCreatorData.mockReturnValue({ data: baseMockData, loading: false });

    render(<LevelUpModal />);
    
    // Switch to HP tab
    fireEvent.click(screen.getByText('HP'));

    expect(screen.getByText(/Hit Die:/)).toHaveTextContent('d10');
    expect(screen.getByText(/CON mod:/)).toHaveTextContent('2');
    
    // Expected average per level: 6 (d10 avg) + 2 (Con) = 8
    expect(screen.getByText('Average per level:')).toBeInTheDocument();
    // 12 (previous max) + 8 = 20
    expect(screen.getByText('20')).toBeInTheDocument(); 
  });

  it('shows Spells tab only for spellcasters', () => {
    // 1. Test Non-Caster
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: true, level: 2, oldLevel: 1 } },
      character: { charClass: 'Fighter', charSubclass: 'Champion' },
    });
    useCreatorData.mockReturnValue({ data: baseMockData, loading: false });

    const { rerender } = render(<LevelUpModal />);
    expect(screen.queryByText('Spells')).toBeNull(); // No spell tab

    // 2. Test Caster
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: true, level: 2, oldLevel: 1 } },
      character: { charClass: 'Wizard' },
    });
    
    rerender(<LevelUpModal />);
    expect(screen.getByText('Spells')).toBeInTheDocument();
  });

  it('displays ASI/Feat tab when class feature grants Ability Score Improvement', () => {
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: true, level: 4, oldLevel: 3 } }, // Level 4 grants ASI for Wizards
      character: { charClass: 'Wizard' },
      update: mockUpdate,
      closeModal: mockCloseModal,
    });
    useCreatorData.mockReturnValue({ data: baseMockData, loading: false });

    render(<LevelUpModal />);
    
    // Tab should be present
    const asiTab = screen.getByText('ASI / Feat');
    expect(asiTab).toBeInTheDocument();
    
    fireEvent.click(asiTab);

    // Options should be present
    expect(screen.getByText('Ability Score Improvement')).toBeInTheDocument();
    expect(screen.getByText('+2 to One')).toBeInTheDocument();
    expect(screen.getByText('+1 / +1')).toBeInTheDocument();
    expect(screen.getByText('Feat')).toBeInTheDocument();
  });

  it('applies confirmed updates to the character', () => {
    useCharacter.mockReturnValue({
      modals: { levelUp: { open: true, level: 2, oldLevel: 1 } },
      character: { charClass: 'Wizard', con: 10, maxHp: 6, hp: 6, classFeatures: [] },
      update: mockUpdate,
      closeModal: mockCloseModal,
    });
    useCreatorData.mockReturnValue({ data: baseMockData, loading: false });

    render(<LevelUpModal />);
    
    // Confirm
    const confirmBtn = screen.getByText('Confirm Updates');
    fireEvent.click(confirmBtn);

    // Verify update was called
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updateArg = mockUpdate.mock.calls[0][0];
    
    // Wizard d6 hit die avg is 4. Con is 0. Old Max is 6. New Max HP = 10.
    expect(updateArg.maxHp).toBe(10);
    expect(updateArg.hp).toBe(10);
    
    // Should add any new class features, but at level 2 Wizard gets none in our mock except subclass features if they picked one
    expect(mockCloseModal).toHaveBeenCalledWith('levelUp');
  });
});