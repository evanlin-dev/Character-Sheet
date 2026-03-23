// src/components/DMWidgets.jsx
// Extracted DM Screen sub-components: ShopGuideModal, ShopGenerator, ItemPilesPanel, ManualShopsPanel

import { useState, useEffect } from "react";
import {
  Button, Card, CardBody, CardHeader, Chip, Checkbox, Divider,
  Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Tooltip, useDisclosure,
} from "@heroui/react";
import { processEntries, cleanText } from "src/utils/dndEntries";

// ─── IndexedDB ─────────────────────────────────────────────────────────────────

const DB_NAME = "DndDataDB";
const STORE_NAME = "files";
const DB_VERSION = 7;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onblocked = () => console.warn("IndexedDB blocked.");
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME);
      db.createObjectStore(STORE_NAME);
    };
  });
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const RARITIES = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];
const TYPE_MAP = {
  HA: "Heavy Armor", MA: "Medium Armor", LA: "Light Armor", S: "Shield",
  M: "Melee Weapon", R: "Ranged Weapon", A: "Ammunition", RD: "Rod", ST: "Staff",
  WD: "Wand", RG: "Ring", P: "Potion", SC: "Scroll", W: "Wondrous Item",
  G: "Adventuring Gear", INS: "Instrument", $: "Treasure",
};
const RARITY_COLORS = {
  common: "default", uncommon: "success", rare: "primary",
  "very rare": "secondary", legendary: "warning", artifact: "danger",
};

// ─── ShopGuideModal ────────────────────────────────────────────────────────────

export function ShopGuideModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="font-cinzel" style={{ color: "var(--red-dark)" }}>Shop Guide</ModalHeader>
            <ModalBody>
              <h4 className="font-cinzel text-sm font-bold mb-2">Pricing by Rarity</h4>
              <Table aria-label="Pricing" removeWrapper>
                <TableHeader>
                  <TableColumn className="text-xs font-cinzel">Rarity</TableColumn>
                  <TableColumn className="text-xs font-cinzel text-right">Price Range</TableColumn>
                </TableHeader>
                <TableBody>
                  {[
                    ["Common", "50–100 gp"], ["Uncommon", "101–500 gp"],
                    ["Rare", "501–5,000 gp"], ["Very Rare", "5,001–50,000 gp"],
                    ["Legendary", "50,001+ gp"],
                  ].map(([r, p]) => (
                    <TableRow key={r}>
                      <TableCell className="text-sm">{r}</TableCell>
                      <TableCell className="text-sm text-right" style={{ color: "var(--ink-light)" }}>{p}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider className="my-3" />
              <h4 className="font-cinzel text-sm font-bold mb-2">Common Weights</h4>
              <ul className="text-sm space-y-1 pl-4" style={{ listStyleType: "disc" }}>
                <li><strong>Potion:</strong> 0.5 lb</li>
                <li><strong>Scroll:</strong> Negligible</li>
                <li><strong>Wand / Rod:</strong> 1–2 lbs</li>
                <li><strong>Weapon / Armor:</strong> See PHB</li>
              </ul>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={close}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── ShopGenerator ────────────────────────────────────────────────────────────

export function ShopGenerator({ onCreateManualShop }) {
  const [hasData, setHasData] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState(new Set(["common", "uncommon"]));
  const [itemCount, setItemCount] = useState("10");
  const [magicEnabled, setMagicEnabled] = useState(true);
  const [magicOnly, setMagicOnly] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const { isOpen: guideOpen, onOpen: onGuideOpen, onClose: onGuideClose } = useDisclosure();

  useEffect(() => {
    (async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get("currentData");
        req.onsuccess = () => setHasData(!!req.result);
        req.onerror = () => setHasData(false);
      } catch { setHasData(false); }
    })();
  }, []);

  const toggleRarity = (r) => {
    setSelectedRarities((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
  };

  const generate = async () => {
    setLoading(true);
    try {
      const db = await openDB();
      const data = await new Promise((res, rej) => {
        const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get("currentData");
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      if (!data) { setResults([]); setLoading(false); return; }

      const parsedData = [];
      data.forEach((file) => {
        if (file.name.toLowerCase().endsWith(".json")) {
          try { parsedData.push(JSON.parse(file.content)); } catch {}
        }
      });

      let allItems = [];
      parsedData.forEach((json) => {
        [json.item, json.items, json.baseitem, json.baseitems, json.magicvariant, json.magicvariants, json.variant]
          .forEach((arr) => { if (Array.isArray(arr)) arr.forEach((i) => { if (i.name) allItems.push(i); }); });
      });

      const filtered = allItems.filter((item) => {
        const r = (item.rarity || "None").toLowerCase();
        const isMundane = r === "none" || r === "unknown";
        if (!magicEnabled && !isMundane) return false;
        if (magicOnly && isMundane) return false;
        return selectedRarities.has(isMundane ? "common" : r);
      });

      const unique = Array.from(new Map(filtered.map((i) => [i.name, i])).values());
      if (unique.length === 0) { setResults([]); setLoading(false); return; }

      const picked = [];
      for (let i = 0; i < Math.min(parseInt(itemCount) || 10, 50); i++) {
        const item = unique[Math.floor(Math.random() * unique.length)];
        const rarityRaw = item.rarity || "Common";
        const rarityKey = rarityRaw.toLowerCase();
        const rarity = rarityKey.split(" ").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        const isMundane = rarityKey === "none" || rarityKey === "unknown";
        let itemType = item.wondrous ? "Wondrous Item" : TYPE_MAP[item.type] || item.type || "Item";

        let price = "";
        if (item.value) {
          if (typeof item.value === "number") {
            if (item.value % 100 === 0) price = `${item.value / 100} gp`;
            else if (item.value % 10 === 0) price = `${item.value / 10} sp`;
            else price = `${item.value} cp`;
          } else {
            price = String(item.value);
          }
        } else if (!isMundane) {
          const formatPrice = (num) => new Intl.NumberFormat().format(num);
          if (rarityKey === "common") price = `${formatPrice(Math.floor(Math.random() * 51) + 50)} gp`;
          else if (rarityKey === "uncommon") price = `${formatPrice(Math.floor(Math.random() * 400) + 101)} gp`;
          else if (rarityKey === "rare") price = `${formatPrice(Math.floor(Math.random() * 4500) + 501)} gp`;
          else if (rarityKey === "very rare") price = `${formatPrice(Math.floor(Math.random() * 45000) + 5001)} gp`;
          else if (rarityKey === "legendary" || rarityKey === "artifact") price = `${formatPrice(Math.floor(Math.random() * 50000) + 50001)} gp`;
        }

        let desc = "";
        if (item.entries) desc = processEntries(item.entries);
        if (!desc && item.inherits?.entries) desc = processEntries(item.inherits.entries);
        if (!desc && item.description) desc = item.description;
        if (!desc && item.desc) desc = processEntries(item.desc);
        if (!desc && item.text) desc = item.text;
        picked.push({ id: Math.random().toString(36).slice(2), name: item.name, rarity, itemType, price, desc: cleanText(desc), qty: 1 });
      }
      setResults(picked);
    } catch (e) { console.error(e); setResults([]); }
    setLoading(false);
  };

  if (!hasData) return null;

  return (
    <Card shadow="md" className="mb-8" style={{ border: "2px solid var(--gold)" }}>
      <CardHeader className="flex items-center gap-3" style={{ borderBottom: "1px solid var(--gold)" }}>
        <h2 className="font-cinzel font-bold text-base m-0 flex-1" style={{ color: "var(--ink)" }}>
          🛒 Random Shop Generator
        </h2>
        <Tooltip content="Pricing & weight guide">
          <Button isIconOnly size="sm" variant="bordered" onPress={onGuideOpen}>?</Button>
        </Tooltip>
      </CardHeader>
      <CardBody className="gap-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <p className="font-cinzel text-xs font-bold mb-2" style={{ color: "var(--ink-light)" }}>RARITY</p>
            <div className="flex flex-wrap gap-1.5">
              {RARITIES.map((r) => {
                const key = r.toLowerCase();
                const active = selectedRarities.has(key);
                return (
                  <Chip
                    key={r}
                    variant={active ? "solid" : "bordered"}
                    color={active ? (RARITY_COLORS[key] || "default") : "default"}
                    className="cursor-pointer select-none transition-all"
                    onClick={() => toggleRarity(key)}
                  >
                    {r}
                  </Chip>
                );
              })}
            </div>
          </div>

          <div className="w-24">
            <Input
              size="sm" type="number" label="Count" labelPlacement="outside"
              value={itemCount} onValueChange={(v) => setItemCount(String(Math.min(50, Math.max(1, parseInt(v) || 1))))}
              min={1} max={50}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Checkbox isSelected={magicEnabled} onValueChange={(v) => { setMagicEnabled(v); if (!v) setMagicOnly(false); }} size="sm">
              <span className="font-cinzel text-xs">Include Magic Items</span>
            </Checkbox>
            <Checkbox isSelected={magicOnly} onValueChange={(v) => { setMagicOnly(v); if (v) setMagicEnabled(true); }} size="sm">
              <span className="font-cinzel text-xs">Magic Items Only</span>
            </Checkbox>
          </div>

          <div className="flex gap-2">
            <Button color="primary" onPress={generate} isLoading={loading} size="sm">Generate</Button>
            <Button variant="bordered" onPress={() => setResults([])} size="sm">Clear</Button>
            {results.length > 0 && (
              <Button color="secondary" onPress={() => onCreateManualShop(results)} size="sm">
                Create Manual Shop
              </Button>
            )}
          </div>
        </div>

        {results.length === 0 && !loading
          ? <p className="text-center italic text-sm py-4" style={{ color: "var(--ink-light)" }}>Generate items to see results.</p>
          : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
              {results.map((item) => {
                const rarityKey = item.rarity.toLowerCase();
                const expanded = expandedItems.has(item.id);
                return (
                  <Card key={item.id} shadow="sm" isPressable onPress={() => {
                    const next = new Set(expandedItems);
                    if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                    setExpandedItems(next);
                  }}>
                    <CardBody className="gap-2 p-3">
                      <div>
                        <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{item.name}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Chip size="sm" variant="flat" color={RARITY_COLORS[rarityKey] || "default"}>{item.rarity}</Chip>
                          <span className="text-xs" style={{ color: "var(--ink-light)" }}>{item.itemType}</span>
                        </div>
                      </div>
                      {expanded && item.desc && (
                        <div
                          className="text-xs overflow-y-auto"
                          style={{ maxHeight: 160, lineHeight: 1.4, color: "var(--ink)", borderTop: "1px dashed var(--gold)", paddingTop: 8 }}
                          dangerouslySetInnerHTML={{ __html: item.desc }}
                        />
                      )}
                      <div className="flex justify-between items-center mt-auto pt-1">
                        <span className="font-bold text-sm" style={{ color: "var(--red-dark)" }}>{item.price}</span>
                        <span className="text-xs" style={{ color: "var(--ink-light)" }}>{expanded ? "▲ Hide" : "▼ Details"}</span>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )
        }
      </CardBody>
      <ShopGuideModal isOpen={guideOpen} onClose={onGuideClose} />
    </Card>
  );
}

// ─── ItemPilesPanel ────────────────────────────────────────────────────────────

export function ItemPilesPanel({
  itemPiles,
  isEmbedded,
  socket,
  expandedItems,
  customItemNames,
  onAddPile,
  onRename,
  onToggleShare,
  onClear,
  onRemove,
  onUpdateItemQty,
  onUpdateItemDesc,
  onRemoveItem,
  onSetCustomItemName,
  onAddCustomItem,
  onToggleExpanded,
  onSearchDB,
}) {
  const [collapsed, setCollapsed] = useState(new Set());
  const toggleCollapse = (id) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-cinzel font-bold text-xl m-0" style={{ color: "var(--red-dark)" }}>Loot / Item Piles</h2>
        <Button color="primary" onPress={onAddPile} size="sm" className="font-cinzel font-bold">+ Add Item Pile</Button>
      </div>

      {(itemPiles || []).map((pile) => {
        const isCollapsed = collapsed.has(pile.id);
        return (
        <Card key={pile.id} shadow="sm" className="mb-6" style={{ border: "2px solid var(--gold)" }}>
          <CardHeader
            className="flex justify-between items-center cursor-pointer select-none"
            style={{ borderBottom: isCollapsed ? "none" : "1px solid var(--gold)" }}
            onClick={() => toggleCollapse(pile.id)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <span className="text-default-400 text-xs shrink-0">{isCollapsed ? "▶" : "▼"}</span>
              <Input
                value={pile.name}
                onValueChange={(val) => onRename(pile.id, val)}
                className="font-cinzel font-bold text-base max-w-sm"
                variant="underlined"
                aria-label="Pile Name"
              />
            </div>
            <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
              {isEmbedded && socket && (
                <Button size="sm" variant={pile.shared ? "solid" : "flat"} color={pile.shared ? "success" : "default"} onPress={() => onToggleShare(pile.id)}>
                  {pile.shared ? "Unshow to Players" : "Show to Players"}
                </Button>
              )}
              {(pile.items || []).length > 0 && (
                <Button size="sm" variant="light" color="danger" onPress={() => onClear(pile.id)}>Clear Items</Button>
              )}
              <Button size="sm" variant="light" color="danger" onPress={() => onRemove(pile.id)}>Delete Pile</Button>
            </div>
          </CardHeader>
          {!isCollapsed && <CardBody className="gap-3">
            <div className="flex flex-col gap-2">
              {(pile.items || []).length === 0
                ? <p className="text-sm italic" style={{ color: "var(--ink-light)" }}>No items in pile.</p>
                : (pile.items || []).map((item) => (
                    <div key={item.id} className="flex flex-col bg-default-50 border border-default-200 rounded p-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Input size="sm" type="number" value={String(item.qty)} onValueChange={(v) => onUpdateItemQty(pile.id, item.id, parseInt(v) || 0)} className="w-20" aria-label="Quantity" />
                          <span className="font-bold text-sm cursor-pointer" style={{ color: "var(--ink)" }} onClick={() => onToggleExpanded(item.id)}>{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="flat" onPress={() => onToggleExpanded(item.id)}>
                            {expandedItems.has(item.id) ? "Hide Desc" : "Show Desc"}
                          </Button>
                          <button className="text-danger hover:text-danger-700 ml-2 font-bold text-lg leading-none" onClick={() => onRemoveItem(pile.id, item.id)}>✕</button>
                        </div>
                      </div>
                      {expandedItems.has(item.id) && (
                        <div className="mt-2 text-sm pt-2" style={{ borderTop: "1px dashed var(--gold)", color: "var(--ink)" }}>
                          {item.desc && item.desc.includes("<") ? (
                            <div dangerouslySetInnerHTML={{ __html: item.desc }} style={{ maxHeight: "300px", overflowY: "auto" }} />
                          ) : (
                            <textarea
                              className="w-full bg-transparent outline-none resize-y min-h-[60px]"
                              value={item.desc || ""}
                              onChange={(e) => onUpdateItemDesc(pile.id, item.id, e.target.value)}
                              placeholder="Add a description..."
                              style={{ color: "var(--ink)" }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))
              }
            </div>
            <div className="flex gap-3 items-end mt-2">
              <Input
                size="sm" placeholder="Custom item name"
                value={customItemNames[pile.id] || ""}
                onValueChange={(val) => onSetCustomItemName(pile.id, val)}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && onAddCustomItem(pile.id)}
                aria-label="Custom item name"
              />
              <Button size="sm" color="primary" onPress={() => onAddCustomItem(pile.id)} className="font-cinzel font-bold">Add Custom</Button>
              <Button size="sm" color="secondary" onPress={() => onSearchDB(pile.id)} className="font-cinzel font-bold">Search DB</Button>
            </div>
          </CardBody>}
        </Card>
      );
      })}
    </>
  );
}

// ─── ManualShopsPanel ──────────────────────────────────────────────────────────

export function ManualShopsPanel({
  shops,
  isEmbedded,
  socket,
  expandedItems,
  customShopItemNames,
  onAddShop,
  onRename,
  onToggleShare,
  onClear,
  onRemove,
  onUpdateItemQty,
  onUpdateItemPrice,
  onUpdateItemDesc,
  onRemoveItem,
  onSetCustomItemName,
  onAddCustomItem,
  onToggleExpanded,
  onSearchDB,
  onCreateManualShop,
}) {
  const [collapsed, setCollapsed] = useState(new Set());
  const toggleCollapse = (id) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-cinzel font-bold text-xl m-0" style={{ color: "var(--red-dark)" }}>Manual Shops</h2>
        <Button color="primary" onPress={onAddShop} size="sm" className="font-cinzel font-bold">+ Add Shop</Button>
      </div>

      {(shops || []).map((shop) => {
        const isCollapsed = collapsed.has(shop.id);
        return (
        <Card key={shop.id} shadow="sm" className="mb-6" style={{ border: "2px solid var(--gold)" }}>
          <CardHeader
            className="flex justify-between items-center cursor-pointer select-none"
            style={{ borderBottom: isCollapsed ? "none" : "1px solid var(--gold)" }}
            onClick={() => toggleCollapse(shop.id)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <span className="text-default-400 text-xs shrink-0">{isCollapsed ? "▶" : "▼"}</span>
              <Input
                value={shop.name}
                onValueChange={(val) => onRename(shop.id, val)}
                className="font-cinzel font-bold text-base max-w-sm"
                variant="underlined"
                aria-label="Shop Name"
              />
            </div>
            <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
              {isEmbedded && socket && (
                <Button size="sm" variant={shop.shared ? "solid" : "flat"} color={shop.shared ? "success" : "default"} onPress={() => onToggleShare(shop.id)}>
                  {shop.shared ? "Unshow to Players" : "Show to Players"}
                </Button>
              )}
              {(shop.items || []).length > 0 && (
                <Button size="sm" variant="light" color="danger" onPress={() => onClear(shop.id)}>Clear Items</Button>
              )}
              <Button size="sm" variant="light" color="danger" onPress={() => onRemove(shop.id)}>Delete Shop</Button>
            </div>
          </CardHeader>
          {!isCollapsed && <CardBody className="gap-3">
            <div className="flex flex-col gap-2">
              {(shop.items || []).length === 0
                ? <p className="text-sm italic" style={{ color: "var(--ink-light)" }}>No items in shop.</p>
                : (shop.items || []).map((item) => (
                    <div key={item.id} className="flex flex-col bg-default-50 border border-default-200 rounded p-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Input size="sm" type="number" value={String(item.qty)} onValueChange={(v) => onUpdateItemQty(shop.id, item.id, parseInt(v) || 0)} className="w-16" aria-label="Quantity" />
                          <Input size="sm" value={item.price || ""} onValueChange={(v) => onUpdateItemPrice(shop.id, item.id, v)} className="w-24" aria-label="Price" placeholder="Price" />
                          <span className="font-bold text-sm cursor-pointer" style={{ color: "var(--ink)" }} onClick={() => onToggleExpanded(item.id)}>{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="flat" onPress={() => onToggleExpanded(item.id)}>
                            {expandedItems.has(item.id) ? "Hide Desc" : "Show Desc"}
                          </Button>
                          <button className="text-danger hover:text-danger-700 ml-2 font-bold text-lg leading-none" onClick={() => onRemoveItem(shop.id, item.id)}>✕</button>
                        </div>
                      </div>
                      {expandedItems.has(item.id) && (
                        <div className="mt-2 text-sm pt-2" style={{ borderTop: "1px dashed var(--gold)", color: "var(--ink)" }}>
                          {item.desc && item.desc.includes("<") ? (
                            <div dangerouslySetInnerHTML={{ __html: item.desc }} style={{ maxHeight: "300px", overflowY: "auto" }} />
                          ) : (
                            <textarea
                              className="w-full bg-transparent outline-none resize-y min-h-[60px]"
                              value={item.desc || ""}
                              onChange={(e) => onUpdateItemDesc(shop.id, item.id, e.target.value)}
                              placeholder="Add a description..."
                              style={{ color: "var(--ink)" }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))
              }
            </div>
            <div className="flex gap-3 items-end mt-2">
              <Input
                size="sm" placeholder="Custom item name"
                value={customShopItemNames[shop.id] || ""}
                onValueChange={(val) => onSetCustomItemName(shop.id, val)}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && onAddCustomItem(shop.id)}
                aria-label="Custom item name"
              />
              <Button size="sm" color="primary" onPress={() => onAddCustomItem(shop.id)} className="font-cinzel font-bold">Add Custom</Button>
              <Button size="sm" color="secondary" onPress={() => onSearchDB(shop.id)} className="font-cinzel font-bold">Search DB</Button>
            </div>
          </CardBody>}
        </Card>
        );
      })}

      <ShopGenerator onCreateManualShop={onCreateManualShop} />
    </>
  );
}
