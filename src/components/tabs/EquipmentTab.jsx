import { useState, useEffect, useMemo } from "react";
import { useCharacter } from "src/context/CharacterContext";
import { getWeightCapacity, getTotalWeight } from "src/utils/calculations";
import { checkDataLoaded, openDB, STORE_NAME } from "src/utils/db";
import { processEntries, cleanText } from "src/utils/dndEntries";
import RichTextModal from "src/components/RichTextModal";

function InventoryItem({ item, index, onUpdate, onDelete, showEquip }) {
  const [showNotes, setShowNotes] = useState(false);
  return (
    <div
      className="inventory-item"
      style={{
        display: "grid",
        gridTemplateColumns: "24px 24px 1fr 60px 60px 24px 24px",
        alignItems: "center",
        gap: 4,
        padding: "4px 8px",
        borderBottom: "1px dashed var(--gold)",
        marginBottom: 2,
      }}
    >
      <span
        style={{
          textAlign: "center",
          cursor: "pointer",
          color: "var(--ink-light)",
          fontSize: "0.9rem",
        }}
        onClick={() => onDelete(index)}
      >
        ✕
      </span>
      {showEquip ? (
        <input
          type="checkbox"
          className="equip-check"
          checked={item.equipped || false}
          onChange={(e) => onUpdate({ ...item, equipped: e.target.checked })}
          style={{ cursor: "pointer" }}
          title="Equipped"
        />
      ) : (
        <span />
      )}
      <input
        type="text"
        className="name-field"
        value={item.name || ""}
        onChange={(e) => onUpdate({ ...item, name: e.target.value })}
        placeholder="Item name"
        style={{ fontSize: "0.9rem", fontWeight: 600 }}
      />
      <input
        type="number"
        className="qty-field"
        value={item.qty ?? 1}
        onChange={(e) => onUpdate({ ...item, qty: e.target.value.replace(/^0+(?=\d)/, "") })}
        min="0"
        style={{ textAlign: "center", fontSize: "0.9rem" }}
        title="Quantity"
      />
      <input
        type="number"
        className="weight-field"
        value={item.weight ?? 0}
        onChange={(e) => onUpdate({ ...item, weight: e.target.value.replace(/^0+(?=\d)/, "") })}
        min="0"
        step="0.1"
        style={{ textAlign: "center", fontSize: "0.9rem" }}
        title="Weight (lbs)"
      />
      <button
        className="skill-info-btn"
        onClick={() => setShowNotes(true)}
        title="View/Edit Description"
        style={{
          textAlign: "center",
          cursor: "pointer",
          fontSize: "0.85rem",
          background: "none",
          border: "none",
          color: item.description ? "var(--ink)" : "var(--ink-light)",
        }}
      >
        📝
      </button>
      <span />

      {showNotes && (
        <RichTextModal
          title={`${item.name || "Item"} Notes`}
          value={item.description || ""}
          onChange={(val) => onUpdate({ ...item, description: val })}
          onClose={() => setShowNotes(false)}
        />
      )}
    </div>
  );
}

const getItemCategory = (name) => {
  const n = (name || "").toLowerCase();
  if (/sword|dagger|bow|axe|mace|staff|spear|crossbow|wand|hammer|lance|pike|trident|rapier|whip|club|flail|sling|javelin|dart|quarterstaff|greatclub|glaive|halberd|maul|morningstar|scimitar|handaxe|shortsword|longsword|greatsword|blowgun|net|kukri|sickle|hatchet|cleaver/.test(n)) return 'Weapons';
  if (/armor|shield|helmet|gauntlet|plate|chainmail|chain mail|leather armor|breastplate|hide armor|padded|studded|ring mail|scale mail|splint|half plate|brigandine|buckler|pauldron|vambrace/.test(n)) return 'Armor & Shields';
  if (/potion|scroll|elixir|tincture|vial|philter|antitoxin|acid flask|alchemist/.test(n)) return 'Potions & Scrolls';
  if (/cloak|robe|hat|cape|ring|amulet|necklace|bracelet|gloves|belt|boots|goggles|glasses|crown|circlet|earring|brooch|pendant|tunic|coat|vestment/.test(n)) return 'Clothing & Accessories';
  if (/tool|kit|instrument|thieves|herbalism|navigator|poisoner|tinker|forgery|disguise|calligrapher|cartographer|cobbler|cook|glassblower|jeweler|leatherworker|mason|painter|potter|smith|weaver|woodcarver/.test(n)) return 'Tools & Kits';
  if (/ration|food|drink|water|meal|provision|bread|meat|cheese|wine|ale|mead|soup|jerky/.test(n)) return 'Food & Drink';
  if (/rope|bag|pack|backpack|bedroll|blanket|lantern|torch|candle|mirror|tent|waterskin|flask|oil|piton|spike|crowbar|grappling|ladder|manacles|lock|ink|paper|parchment|book|chest|barrel|bucket|jug|pot|sack|ball bearing|block|tackle|holy water|signal whistle|soap|string|wire|fishing|shovel|pickaxe|sledge|magnifying|hourglass|compass|map|net|saddlebag|saddle|bit|bridle/.test(n)) return 'Adventuring Gear';
  return 'Miscellaneous';
};

export function EncumbranceChartModal({ allItems, maxWeight, totalWeight, onClose }) {
  const [expandedCats, setExpandedCats] = useState({});

  const COLORS = {
    'Weapons':               '#c0392b',
    'Armor & Shields':       '#2980b9',
    'Potions & Scrolls':     '#8e44ad',
    'Clothing & Accessories':'#e67e22',
    'Tools & Kits':          '#16a085',
    'Food & Drink':          '#f39c12',
    'Adventuring Gear':      '#27ae60',
    'Miscellaneous':         '#7f8c8d',
    'Free Capacity':         '#e8e0d0',
  };

  const groups = {};
  allItems.forEach(item => {
    if (!item.name) return;
    const cat = getItemCategory(item.name);
    if (!groups[cat]) groups[cat] = { weight: 0, items: [] };
    const w = (parseFloat(item.qty) || 0) * (parseFloat(item.weight) || 0);
    groups[cat].weight += w;
    if (w > 0) groups[cat].items.push({...item, totalWt: w});
  });

  const free = Math.max(0, maxWeight - totalWeight);
  const slices = Object.entries(groups)
    .filter(([, g]) => g.weight > 0)
    .sort((a,b) => b[1].weight - a[1].weight)
    .map(([cat, g]) => ({ label: cat, value: g.weight, color: COLORS[cat] || '#95a5a6', items: g.items }));
  
  if (free > 0) slices.push({ label: 'Free Capacity', value: free, color: COLORS['Free Capacity'], items: [] });

  const chartTotal = slices.reduce((s, sl) => s + sl.value, 0);
  
  let cumulativePct = 0;
  const svgSlices = slices.map(slice => {
    const pct = chartTotal > 0 ? slice.value / chartTotal : 0;
    const dasharray = `${pct * 100} ${100 - pct * 100}`;
    const dashoffset = -cumulativePct * 100;
    cumulativePct += pct;
    return { ...slice, dasharray, dashoffset, pct };
  });

  const weightlessItems = allItems.filter(i => {
    const w = (parseFloat(i.qty) || 0) * (parseFloat(i.weight) || 0);
    return w === 0 && i.name && i.name.trim() !== '';
  });

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="info-modal-content" style={{ maxWidth: 460, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Weight Breakdown</h3>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: 12 }}>
          <b>{totalWeight.toFixed(1)}</b> / {maxWeight} lbs carried
          {totalWeight > maxWeight && <span style={{color: 'var(--red-dark)', fontWeight: 'bold'}}> — Encumbered!</span>}
        </div>
        <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 16px', flexShrink: 0 }}>
          <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {svgSlices.map((s, i) => (
              <circle key={i} r="15.915494309189533" cx="21" cy="21" fill="transparent" stroke={s.color} strokeWidth="8" pathLength="100" strokeDasharray={s.dasharray} strokeDashoffset={s.dashoffset} />
            ))}
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#4a3728', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'Cinzel, serif' }}>{totalWeight.toFixed(1)}</div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>lbs carried</div>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '0 2px' }}>
          {svgSlices.map(s => {
            const hasItems = s.items && s.items.length > 0;
            return (
              <div key={s.label} style={{ border: '1px solid var(--gold)', borderRadius: 6, overflow: 'hidden', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: hasItems ? 'pointer' : 'default' }} onClick={() => hasItems && setExpandedCats(p => ({...p, [s.label]: !p[s.label]}))}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: s.color, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }}></span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem' }}>{s.label}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)' }}>{s.value.toFixed(1)} lbs · {(s.pct * 100).toFixed(1)}%</span>
                  {hasItems && <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginLeft: 4 }}>{expandedCats[s.label] ? '▴' : '▾'}</span>}
                </div>
                {hasItems && expandedCats[s.label] && (
                  <div style={{ background: 'var(--parchment)', borderTop: '1px solid var(--gold)', padding: '6px 10px 6px 32px', fontSize: '0.85rem', color: 'var(--ink)' }}>
                    {s.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed var(--gold-light)' }}>
                        <span>{item.name} {item.equipped && <em style={{color:'var(--ink-light)', fontSize: '0.8em'}}>(E)</em>} ×{item.qty}</span>
                        <span style={{ color: 'var(--ink-light)' }}>{item.totalWt.toFixed(1)} lbs</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {weightlessItems.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)', fontStyle: 'italic', marginTop: 8, padding: '6px 8px', borderTop: '1px dashed var(--gold)' }}>
              Weightless items: {weightlessItems.map(i => i.name).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EquipmentTab() {
  const { character, update, openModal } = useCharacter();
  const inventory = character.inventory || [];
  const componentPouch = character.componentPouch || [];
  const [dataLoaded, setDataLoaded] = useState(false);
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [searchTargetList, setSearchTargetList] = useState("backpack");

  useEffect(() => {
    checkDataLoaded().then(setDataLoaded);
  }, []);

  const isSpellcaster = () => {
    const cls = (character.charClass || "").toLowerCase();
    const sub = (character.charSubclass || "").toLowerCase();
    const spellcastingClasses = [
      "artificer",
      "bard",
      "cleric",
      "druid",
      "paladin",
      "ranger",
      "sorcerer",
      "warlock",
      "wizard",
      "blood hunter",
    ];
    if (spellcastingClasses.some((c) => cls.includes(c))) return true;
    if (sub.includes("eldritch knight") || sub.includes("arcane trickster"))
      return true;
    if (character.spellSlotsData && character.spellSlotsData.length > 0)
      return true;
    return false;
  };

  const addItem = (listType = "backpack") => {
    const newItem = {
      name: "",
      qty: 1,
      weight: 0,
      equipped: listType === "equipped",
      description: "",
    };
    update({ inventory: [...inventory, newItem] });
  };

  const addPouchItem = () => {
    update({
      componentPouch: [
        ...componentPouch,
        { name: "", qty: 1, weight: 0, equipped: false, description: "" },
      ],
    });
  };

  const updateItem = (index, newItem) => {
    update({
      inventory: inventory.map((item, i) => (i === index ? newItem : item)),
    });
  };

  const deleteItem = (index) => {
    update({ inventory: inventory.filter((_, i) => i !== index) });
  };

  const updatePouchItem = (index, newItem) => {
    update({
      componentPouch: componentPouch.map((item, i) =>
        i === index ? newItem : item,
      ),
    });
  };

  const deletePouchItem = (index) => {
    update({ componentPouch: componentPouch.filter((_, i) => i !== index) });
  };

  const totalWeight = getTotalWeight(inventory, []);
  const maxWeight = getWeightCapacity(character);
  const isEncumbered = totalWeight > maxWeight;

  const currencies = [
    ["cp", "CP"],
    ["sp", "SP"],
    ["ep", "EP"],
    ["gp", "GP"],
    ["pp", "PP"],
  ];

  const equippedIndices = inventory.reduce((acc, item, i) => {
    if (item.equipped) acc.push(i);
    return acc;
  }, []);
  const backpackIndices = inventory.reduce((acc, item, i) => {
    if (!item.equipped) acc.push(i);
    return acc;
  }, []);

  return (
    <div>
      <div className="inventory-top-bar">
        <div className="currency-container">
          {currencies.map(([field, label]) => (
            <div key={field} className="mini-field">
              <label>{label}</label>
              <input
                type="number"
                value={character[field] || 0}
                onChange={(e) =>
                  update({ [field]: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>
          ))}
        </div>
        <div className="currency-actions">
          <button
            className="btn btn-secondary"
            onClick={() => openModal("currency")}
          >
            Exchange
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => openModal("splitMoney")}
          >
            Split
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => openModal("manageMoney")}
          >
            Manage
          </button>
        </div>
      </div>

      <div className="tab-columns">
        <div className="sheet-section-col">
          <h3 className="section-title">Equipped Gear</h3>
          <div
            className="inventory-header"
            style={{
              display: "grid",
              gridTemplateColumns: "24px 24px 1fr 60px 60px 24px 24px",
              gap: 4,
              padding: "4px 8px",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.7rem",
              color: "var(--ink-light)",
            }}
          >
            <span></span>
            <span style={{ textAlign: "center" }}>Equip</span>
            <span>Item Name</span>
            <span style={{ textAlign: "center" }}>Qty</span>
            <span style={{ textAlign: "center" }}>Lbs</span>
            <span title="Notes / Description" style={{ textAlign: "center" }}>📝</span>
            <span></span>
          </div>
          <div
            id="equippedList"
            className="inventory-list"
            style={{
              minHeight: 60,
              border: "2px dashed var(--gold-dark)",
              borderRadius: 6,
              padding: 8,
              marginBottom: 24,
            }}
          >
            {equippedIndices.map((i) => (
              <InventoryItem
                key={i}
                item={inventory[i]}
                index={i}
                onUpdate={updateItem}
                onDelete={deleteItem}
                showEquip={true}
              />
            ))}
          </div>
        </div>

        <div className="sheet-section-col">
          <h3 className="section-title">Backpack / Inventory</h3>
          <div
            className="inventory-header"
            style={{
              display: "grid",
              gridTemplateColumns: "24px 24px 1fr 60px 60px 24px 24px",
              gap: 4,
              padding: "4px 8px",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.7rem",
              color: "var(--ink-light)",
            }}
          >
            <span></span>
            <span style={{ textAlign: "center" }}>Equip</span>
            <span>Item Name</span>
            <span style={{ textAlign: "center" }}>Qty</span>
            <span style={{ textAlign: "center" }}>Lbs</span>
            <span title="Notes / Description" style={{ textAlign: "center" }}>📝</span>
            <span></span>
          </div>
          <div
            id="inventoryList"
            className="inventory-list"
            style={{ minHeight: 60 }}
          >
            {backpackIndices.map((i) => (
              <InventoryItem
                key={i}
                item={inventory[i]}
                index={i}
                onUpdate={updateItem}
                onDelete={deleteItem}
                showEquip={true}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
          <button
            className="add-feature-btn"
            onClick={() => addItem("backpack")}
          >
            + Add Custom
          </button>
            {dataLoaded && (
              <button
                className="add-feature-btn"
                onClick={() => {
                  setSearchTargetList("backpack");
                  setItemSearchOpen(true);
                }}
              >
                + Search DB
              </button>
            )}
          </div>

          <div
            className="total-weight-box"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "flex-end",
              marginTop: 8,
              color: isEncumbered ? "#8b0000" : "var(--ink)",
              fontWeight: isEncumbered ? 800 : 700,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Carrying Capacity: {totalWeight.toFixed(1)} / {maxWeight} lbs
              <button 
                className="skill-info-btn" 
                onClick={() => setChartOpen(true)}
                title="View Weight Breakdown"
                style={{ position: 'relative', top: 'auto', left: 'auto', margin: 0, width: 20, height: 20, fontSize: '0.8rem' }}
              >
                ?
              </button>
            </div>
            <div
              style={{ fontSize: "0.8rem", fontStyle: "italic", opacity: 0.8 }}
            >
              Max Drag/Lift: {maxWeight * 2} lbs
            </div>
          </div>
        </div>

        {isSpellcaster() && (
          <div className="sheet-section-col">
            <h3 className="section-title">Component Pouch</h3>
            <div
              id="componentPouchList"
              className="inventory-list"
              style={{ minHeight: 40 }}
            >
              {componentPouch.map((item, i) => (
                <InventoryItem
                  key={i}
                  item={item}
                  index={i}
                  onUpdate={updatePouchItem}
                  onDelete={deletePouchItem}
                  showEquip={false}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="add-feature-btn" onClick={addPouchItem}>
                + Add Custom
              </button>
              {dataLoaded && (
                <button
                  className="add-feature-btn"
                  onClick={() => {
                    setSearchTargetList("pouch");
                    setItemSearchOpen(true);
                  }}
                >
                  + Search DB
                </button>
              )}
            </div>
          </div>
        )}

        <div className="attunement-section sheet-section-col">
          <h3 className="section-title">Magical Attunement</h3>
          <div className="attunement-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="attunement-slot">
                <input
                  type="text"
                  value={(character.attunement || ["", "", ""])[i]}
                  onChange={(e) => {
                    const newAtt = [...(character.attunement || ["", "", ""])];
                    newAtt[i] = e.target.value;
                    update({ attunement: newAtt });
                  }}
                  placeholder="Empty Slot"
                  style={{ textAlign: "center", fontWeight: "bold" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {itemSearchOpen && (
        <ItemSearchModal
          onSelect={(item) => {
            if (searchTargetList === "pouch") {
              update({
                componentPouch: [
                  ...componentPouch,
                  { name: item.name, qty: 1, weight: item.weight, equipped: false, description: item.description },
                ],
              });
            } else {
              update({
                inventory: [
                  ...inventory,
                  { name: item.name, qty: 1, weight: item.weight, equipped: false, description: item.description },
                ],
              });
            }
            setItemSearchOpen(false);
          }}
          onClose={() => setItemSearchOpen(false)}
        />
      )}

      {chartOpen && (
        <EncumbranceChartModal
          allItems={[...(character.inventory || [])]}
          maxWeight={maxWeight}
          totalWeight={totalWeight}
          onClose={() => setChartOpen(false)}
        />
      )}
    </div>
  );
}

export function CurrencyModal() {
  const { modals, closeModal } = useCharacter();
  if (!modals.currency) return null;

  return (
    <div
      className="info-modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal("currency");
      }}
    >
      <div className="info-modal-content">
        <button
          className="close-modal-btn"
          onClick={() => closeModal("currency")}
        >
          &times;
        </button>
        <h3 className="info-modal-title">Currency Exchange</h3>
        <div className="info-modal-text">
          <table className="currency-table">
            <thead>
              <tr>
                <th>Currency</th>
                <th>Value (Gold)</th>
                <th>Exchange</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Copper (cp)</strong>
                </td>
                <td>1/100 gp</td>
                <td>10 cp = 1 sp</td>
              </tr>
              <tr>
                <td>
                  <strong>Silver (sp)</strong>
                </td>
                <td>1/10 gp</td>
                <td>10 sp = 1 gp</td>
              </tr>
              <tr>
                <td>
                  <strong>Electrum (ep)</strong>
                </td>
                <td>1/2 gp</td>
                <td>2 ep = 1 gp</td>
              </tr>
              <tr>
                <td>
                  <strong>Gold (gp)</strong>
                </td>
                <td>1 gp</td>
                <td>1 gp = 1 gp</td>
              </tr>
              <tr>
                <td>
                  <strong>Platinum (pp)</strong>
                </td>
                <td>10 gp</td>
                <td>1 pp = 10 gp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SplitMoneyModal() {
  const { modals, closeModal, character, update } = useCharacter();
  const [amounts, setAmounts] = useState({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
  const [size, setSize] = useState(1);

  if (!modals.splitMoney) return null;

  const apply = () => {
    const divBy = Math.max(1, size);
    update({
      cp: (parseInt(character.cp) || 0) + Math.floor((amounts.cp || 0) / divBy),
      sp: (parseInt(character.sp) || 0) + Math.floor((amounts.sp || 0) / divBy),
      ep: (parseInt(character.ep) || 0) + Math.floor((amounts.ep || 0) / divBy),
      gp: (parseInt(character.gp) || 0) + Math.floor((amounts.gp || 0) / divBy),
      pp: (parseInt(character.pp) || 0) + Math.floor((amounts.pp || 0) / divBy),
    });
    closeModal("splitMoney");
  };

  return (
    <div className="info-modal-overlay" style={{ display: "flex" }}>
      <div
        className="info-modal-content"
        style={{ maxWidth: 400, textAlign: "center" }}
      >
        <button
          className="close-modal-btn"
          onClick={() => closeModal("splitMoney")}
        >
          &times;
        </button>
        <h3 className="info-modal-title">Split Loot</h3>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--ink-light)",
            marginBottom: 15,
          }}
        >
          Enter total loot. It will be divided and added to your funds.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
            marginBottom: 15,
          }}
        >
          {["cp", "sp", "ep", "gp", "pp"].map((c) => (
            <div key={c} className="field">
              <label className="field-label">{c.toUpperCase()}</label>
              <input
                type="number"
                value={amounts[c] || 0}
                onChange={(e) =>
                  setAmounts((a) => ({
                    ...a,
                    [c]: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <div className="field" style={{ marginBottom: 20 }}>
          <label className="field-label">Party Size (Divide By)</label>
          <input
            type="number"
            value={size}
            min="1"
            onChange={(e) => setSize(parseInt(e.target.value) || 1)}
            style={{ textAlign: "center", fontWeight: "bold" }}
          />
        </div>
        <button className="btn" onClick={apply}>
          Calculate &amp; Add Share
        </button>
      </div>
    </div>
  );
}

export function ManageMoneyModal() {
  const { modals, closeModal, character, update } = useCharacter();
  const [amounts, setAmounts] = useState({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });

  if (!modals.manageMoney) return null;

  const apply = (sign) => {
    const updates = {};
    ["cp", "sp", "ep", "gp", "pp"].forEach((c) => {
      updates[c] = Math.max(
        0,
        (parseInt(character[c]) || 0) + sign * (amounts[c] || 0),
      );
    });
    update(updates);
    closeModal("manageMoney");
  };

  return (
    <div className="info-modal-overlay" style={{ display: "flex" }}>
      <div
        className="info-modal-content"
        style={{ maxWidth: 400, textAlign: "center" }}
      >
        <button
          className="close-modal-btn"
          onClick={() => closeModal("manageMoney")}
        >
          &times;
        </button>
        <h3 className="info-modal-title">Manage Money</h3>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--ink-light)",
            marginBottom: 15,
          }}
        >
          Enter amount to add or spend.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {["cp", "sp", "ep", "gp", "pp"].map((c) => (
            <div key={c} className="field">
              <label className="field-label">{c.toUpperCase()}</label>
              <input
                type="number"
                value={amounts[c] || 0}
                onChange={(e) =>
                  setAmounts((a) => ({
                    ...a,
                    [c]: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            className="btn"
            onClick={() => apply(1)}
            style={{
              flex: 1,
              background: "linear-gradient(135deg,#27ae60,#145a32)",
            }}
          >
            Gain (+)
          </button>
          <button
            className="btn"
            onClick={() => apply(-1)}
            style={{
              flex: 1,
              background: "linear-gradient(135deg,#c0392b,#922b21)",
            }}
          >
            Spend (-)
          </button>
        </div>
      </div>
    </div>
  );
}

export function ItemSearchModal({ onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve, reject) => {
          const req = store.get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });

        if (!data) {
          setItems([]);
          setLoading(false);
          return;
        }

        const rawItems = [];
        data.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            const arraysToCheck = [
              json.item,
              json.items,
              json.baseitem,
              json.baseitems,
              json.magicvariant,
              json.magicvariants,
              json.variant,
            ];
            arraysToCheck.forEach((arr) => {
              if (Array.isArray(arr)) {
                arr.forEach((i) => {
                  if (i.name && typeof i.name === "string") {
                    rawItems.push(i);
                  }
                });
              }
            });
          } catch (e) {}
        });

        // Deduplicate by name
        const itemMap = new Map();
        rawItems.forEach((i) => {
          if (!itemMap.has(i.name)) {
            itemMap.set(i.name, i);
          }
        });

        // Format descriptions and metadata
        const formattedItems = Array.from(itemMap.values())
          .map((i) => {
            const weight = i.weight ?? i.weight_lbs ?? 0;
            let desc = "";

            if (i.entries) desc = processEntries(i.entries);
            if (!desc && i.inherits && i.inherits.entries)
              desc = processEntries(i.inherits.entries);
            if (!desc && i.description) desc = i.description;
            if (!desc && i.text) desc = i.text;

            desc = cleanText(desc);

            return {
              name: i.name,
              weight: weight,
              description: desc,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setItems(formattedItems);
      } catch (e) {
        console.error("Failed to load items", e);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [search, items]);

  return (
    <div className="info-modal-overlay" style={{ display: "flex" }} onClick={onClose}>
      <div
        className="info-modal-content"
        style={{ maxWidth: "520px", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal-btn" onClick={onClose}>
          &times;
        </button>
        <h3 className="info-modal-title">Search Items</h3>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            marginBottom: 12,
            fontSize: "1rem",
            border: "1px solid var(--gold)",
            borderRadius: "4px",
          }}
          autoFocus
        />
        <div style={{ maxHeight: "60vh", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <em style={{ color: "var(--ink-light)" }}>
              Loading items from database...
            </em>
          ) : filteredItems.length === 0 ? (
            <em style={{ color: "var(--ink-light)" }}>No items found.</em>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.name}
                onClick={() => onSelect(item)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--gold)",
                  background: "rgba(255,255,255,0.5)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>{item.name}</span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--ink-light)",
                      textAlign: "right",
                    }}
                  >
                    {item.weight} lbs
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--ink-light)",
                    marginTop: 4,
                  }}
                >
                  {item.description.replace(/<[^>]*>/g, "").substring(0, 80)}
                  {item.description.length > 80 ? "..." : ""}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
