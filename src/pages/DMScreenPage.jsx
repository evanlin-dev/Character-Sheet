import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Tabs, Tab } from "@heroui/react";
import { createClient } from "@supabase/supabase-js";
import Sidebar, { SidebarBtn } from "src/components/Sidebar";
import { ItemSearchModal } from "src/components/tabs/EquipmentTab";
import EncounterGenerator from "src/components/EncounterGenerator";
import NPCManager from "src/components/NPCManager";
import DMTablesTab from "src/components/DMTablesTab";
import DMRulesTab from "src/components/DMRulesTab";
import { ItemPilesPanel, ManualShopsPanel } from "src/components/DMWidgets";

// Supabase schema: see docs/SCHEMAS.md — requires dm_screen_data and npcs columns on the rooms table.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Data hook ─────────────────────────────────────────────────────────────────

const DEFAULT_DM_DATA = {
  itemPiles: [{ id: "default", name: "Loot Pile 1", items: [] }],
  shops: [],
  encounters: [{ id: "default", name: "Encounter 1", creatures: [] }],
};

function normalizeDmData(raw) {
  if (raw.itemPile && !raw.itemPiles) {
    raw.itemPiles = [{ id: "default", name: "Loot Pile 1", items: raw.itemPile }];
    delete raw.itemPile;
  }
  if (!raw.shops) raw.shops = [];
  if (!raw.encounters) raw.encounters = [{ id: "default", name: "Encounter 1", creatures: [] }];
  return { ...DEFAULT_DM_DATA, ...raw };
}

function useDMData(roomId) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("dmScreenData");
      return saved ? normalizeDmData(JSON.parse(saved)) : { ...DEFAULT_DM_DATA };
    } catch { return { ...DEFAULT_DM_DATA }; }
  });
  // Tracks whether the initial load (from Supabase or localStorage) is done
  const [loaded, setLoaded] = useState(!roomId);
  // Ref to current data for realtime comparison (avoids re-applying own writes)
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // Load from Supabase when in a room
  useEffect(() => {
    if (!roomId) return;
    supabase.from("rooms").select("dm_screen_data").eq("id", roomId).single().then(({ data: row }) => {
      if (row?.dm_screen_data && Object.keys(row.dm_screen_data).length > 0) {
        setData(normalizeDmData({ ...row.dm_screen_data }));
      }
      setLoaded(true);
    });
  }, [roomId]);

  // Realtime — sync dm_screen_data changes from other devices/tabs
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`dm_data_rt_${roomId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => {
        const incoming = payload.new?.dm_screen_data;
        if (!incoming) return;
        if (JSON.stringify(incoming) === JSON.stringify(dataRef.current)) return;
        setData(normalizeDmData({ ...incoming }));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [roomId]);

  // Save — debounced to Supabase when in a room, immediate to localStorage otherwise
  useEffect(() => {
    if (!loaded) return;
    if (!roomId) {
      localStorage.setItem("dmScreenData", JSON.stringify(data));
      return;
    }
    const timer = setTimeout(() => {
      supabase.from("rooms").update({ dm_screen_data: data }).eq("id", roomId);
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, roomId, loaded]);

  return [data, setData];
}

// ─── Main DMScreenPage ─────────────────────────────────────────────────────────

export default function DMScreenPage({
  isEmbedded = false,
  socket = null,
  roomId = null,
  onAddMonstersToInit = null,
  onBroadcastChat = null,
}) {
  const [dmData, setDmData] = useDMData(roomId);
  const [activePileId, setActivePileId] = useState(null);
  const [customItemNames, setCustomItemNames] = useState({});
  const [activeShopId, setActiveShopId] = useState(null);
  const [customShopItemNames, setCustomShopItemNames] = useState({});
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Broadcast shared item piles when they change (room context)
  useEffect(() => {
    if (socket && roomId && dmData.itemPiles) {
      const sharedPiles = dmData.itemPiles.filter((p) => p.shared);
      socket.emit("send_action", { room: roomId, action: "update_shared_piles", sharedPiles });
    }
  }, [dmData.itemPiles, socket, roomId]);

  // Broadcast shared shops when they change (room context)
  useEffect(() => {
    if (socket && roomId && dmData.shops) {
      const sharedShops = dmData.shops.filter((p) => p.shared);
      socket.emit("send_action", { room: roomId, action: "update_shared_shops", sharedShops });
    }
  }, [dmData.shops, socket, roomId]);

  // Listen for players grabbing / buying items via Supabase broadcast
  // (mockSocket only has emit/disconnect — no on/off — so subscribe directly)
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room_dm_listen_${roomId}`)
      .on("broadcast", { event: "send_action" }, ({ payload: data }) => {
        if (data.action === "player_grabbed_item") {
          setDmData((d) => ({
            ...d,
            itemPiles: (d.itemPiles || []).map((p) =>
              p.id === data.pileId
                ? { ...p, items: (p.items || []).map((i) => i.id === data.itemId ? { ...i, qty: Math.max(0, i.qty - data.qty) } : i) }
                : p
            ),
          }));
        } else if (data.action === "player_bought_item") {
          setDmData((d) => ({
            ...d,
            shops: (d.shops || []).map((p) =>
              p.id === data.shopId
                ? { ...p, items: (p.items || []).map((i) => i.id === data.itemId ? { ...i, qty: Math.max(0, i.qty - data.qty) } : i) }
                : p
            ),
          }));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [roomId]);

  // ── Item Pile handlers ──────────────────────────────────────────────────────

  const toggleSharePile = (pileId) =>
    setDmData((d) => ({ ...d, itemPiles: (d.itemPiles || []).map((p) => p.id === pileId ? { ...p, shared: !p.shared } : p) }));

  const addNewPile = () =>
    setDmData((d) => ({ ...d, itemPiles: [...(d.itemPiles || []), { id: Date.now().toString(), name: `Loot Pile ${(d.itemPiles?.length || 0) + 1}`, items: [] }] }));

  const removePile = (pileId) => {
    if (window.confirm("Remove this item pile?"))
      setDmData((d) => ({ ...d, itemPiles: (d.itemPiles || []).filter((p) => p.id !== pileId) }));
  };

  const renamePile = (pileId, newName) =>
    setDmData((d) => ({ ...d, itemPiles: (d.itemPiles || []).map((p) => p.id === pileId ? { ...p, name: newName } : p) }));

  const clearPile = (pileId) => {
    if (window.confirm("Clear all items from this pile?"))
      setDmData((d) => ({ ...d, itemPiles: (d.itemPiles || []).map((p) => p.id === pileId ? { ...p, items: [] } : p) }));
  };

  const addItemToPile = (item) => {
    if (!activePileId) return;
    setDmData((d) => ({
      ...d,
      itemPiles: (d.itemPiles || []).map((p) =>
        p.id === activePileId
          ? { ...p, items: [...(p.items || []), { id: Date.now().toString(36) + Math.random().toString(36).slice(2), name: item.name, qty: 1, desc: item.description }] }
          : p
      ),
    }));
    setActivePileId(null);
  };

  const addCustomItem = (pileId) => {
    const name = customItemNames[pileId]?.trim();
    if (!name) return;
    setDmData((d) => ({
      ...d,
      itemPiles: (d.itemPiles || []).map((p) =>
        p.id === pileId
          ? { ...p, items: [...(p.items || []), { id: Date.now().toString(36) + Math.random().toString(36).slice(2), name, qty: 1, desc: "" }] }
          : p
      ),
    }));
    setCustomItemNames((prev) => ({ ...prev, [pileId]: "" }));
  };

  const removeItem = (pileId, itemId) =>
    setDmData((d) => ({ ...d, itemPiles: (d.itemPiles || []).map((p) => p.id === pileId ? { ...p, items: (p.items || []).filter((i) => i.id !== itemId) } : p) }));

  const updateItemQty = (pileId, itemId, newQty) =>
    setDmData((d) => ({ ...d, itemPiles: (d.itemPiles || []).map((p) => p.id === pileId ? { ...p, items: (p.items || []).map((i) => i.id === itemId ? { ...i, qty: newQty } : i) } : p) }));

  const updateItemDesc = (pileId, itemId, newDesc) =>
    setDmData((d) => ({ ...d, itemPiles: (d.itemPiles || []).map((p) => p.id === pileId ? { ...p, items: (p.items || []).map((i) => i.id === itemId ? { ...i, desc: newDesc } : i) } : p) }));

  // ── Shop handlers ───────────────────────────────────────────────────────────

  const toggleShareShop = (shopId) =>
    setDmData((d) => ({ ...d, shops: (d.shops || []).map((p) => p.id === shopId ? { ...p, shared: !p.shared } : p) }));

  const addNewShop = () =>
    setDmData((d) => ({ ...d, shops: [...(d.shops || []), { id: Date.now().toString(), name: `Shop ${(d.shops?.length || 0) + 1}`, items: [] }] }));

  const removeShop = (shopId) => {
    if (window.confirm("Remove this shop?"))
      setDmData((d) => ({ ...d, shops: (d.shops || []).filter((p) => p.id !== shopId) }));
  };

  const renameShop = (shopId, newName) =>
    setDmData((d) => ({ ...d, shops: (d.shops || []).map((p) => p.id === shopId ? { ...p, name: newName } : p) }));

  const clearShop = (shopId) => {
    if (window.confirm("Clear all items from this shop?"))
      setDmData((d) => ({ ...d, shops: (d.shops || []).map((p) => p.id === shopId ? { ...p, items: [] } : p) }));
  };

  const addItemToShop = (item) => {
    if (!activeShopId) return;
    setDmData((d) => ({
      ...d,
      shops: (d.shops || []).map((p) =>
        p.id === activeShopId
          ? { ...p, items: [...(p.items || []), { id: Date.now().toString(36) + Math.random().toString(36).slice(2), name: item.name, qty: 1, price: item.value || "10 gp", desc: item.description }] }
          : p
      ),
    }));
    setActiveShopId(null);
  };

  const addCustomItemToShop = (shopId) => {
    const name = customShopItemNames[shopId]?.trim();
    if (!name) return;
    setDmData((d) => ({
      ...d,
      shops: (d.shops || []).map((p) =>
        p.id === shopId
          ? { ...p, items: [...(p.items || []), { id: Date.now().toString(36) + Math.random().toString(36).slice(2), name, qty: 1, price: "10 gp", desc: "" }] }
          : p
      ),
    }));
    setCustomShopItemNames((prev) => ({ ...prev, [shopId]: "" }));
  };

  const removeShopItem = (shopId, itemId) =>
    setDmData((d) => ({ ...d, shops: (d.shops || []).map((p) => p.id === shopId ? { ...p, items: (p.items || []).filter((i) => i.id !== itemId) } : p) }));

  const updateShopItemQty = (shopId, itemId, newQty) =>
    setDmData((d) => ({ ...d, shops: (d.shops || []).map((p) => p.id === shopId ? { ...p, items: (p.items || []).map((i) => i.id === itemId ? { ...i, qty: newQty } : i) } : p) }));

  const updateShopItemPrice = (shopId, itemId, newPrice) =>
    setDmData((d) => ({ ...d, shops: (d.shops || []).map((p) => p.id === shopId ? { ...p, items: (p.items || []).map((i) => i.id === itemId ? { ...i, price: newPrice } : i) } : p) }));

  const updateShopItemDesc = (shopId, itemId, newDesc) =>
    setDmData((d) => ({ ...d, shops: (d.shops || []).map((p) => p.id === shopId ? { ...p, items: (p.items || []).map((i) => i.id === itemId ? { ...i, desc: newDesc } : i) } : p) }));

  const createManualShopFromResults = (results) => {
    const grouped = [];
    results.forEach((r) => {
      const existing = grouped.find((g) => g.name === r.name && g.price === r.price);
      if (existing) existing.qty += r.qty || 1;
      else grouped.push({ ...r, id: Date.now().toString(36) + Math.random().toString(36).slice(2), qty: r.qty || 1 });
    });
    setDmData((d) => ({
      ...d,
      shops: [...(d.shops || []), { id: Date.now().toString(), name: `Generated Shop ${(d.shops?.length || 0) + 1}`, items: grouped }],
    }));
  };

  // ── Shared ──────────────────────────────────────────────────────────────────

  const toggleItemExpanded = (itemId) =>
    setExpandedItems((prev) => { const next = new Set(prev); if (next.has(itemId)) next.delete(itemId); else next.add(itemId); return next; });

  // ── Import / Export (standalone mode) ──────────────────────────────────────

  const exportData = () => {
    const blob = new Blob([JSON.stringify(dmData, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "dm_screen_data.json" });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setDmData(normalizeDmData(JSON.parse(ev.target.result))); }
      catch { alert("Invalid JSON file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Add body class in standalone mode so CSS expands to full screen
  useEffect(() => {
    if (isEmbedded) return;
    document.body.classList.add("dm-screen-page");
    return () => document.body.classList.remove("dm-screen-page");
  }, [isEmbedded]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {!isEmbedded && (
        <Sidebar>
          {(closeSidebar) => (
            <>
              <SidebarBtn onClick={closeSidebar}>
                <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Character Sheet</Link>
              </SidebarBtn>
              <SidebarBtn onClick={() => { exportData(); closeSidebar(); }}>Export Data</SidebarBtn>
              <SidebarBtn onClick={() => {
                const input = document.createElement("input");
                input.type = "file"; input.accept = ".json"; input.onchange = importData; input.click();
                closeSidebar();
              }}>Import Data</SidebarBtn>
              <SidebarBtn
                onClick={() => { if (window.confirm("Reset all DM data?")) setDmData({ ...DEFAULT_DM_DATA }); closeSidebar(); }}
                style={{ color: "var(--red-dark)", borderColor: "var(--red)" }}
              >
                Reset Data
              </SidebarBtn>
            </>
          )}
        </Sidebar>
      )}

      <div className={isEmbedded ? "dm-mode w-full" : "character-sheet dm-mode"} style={{ margin: isEmbedded ? 0 : "0 auto" }}>
        {!isEmbedded && (
          <div className="header">
            <h1>DM Screen</h1>
            <Link to="/" className="dm-screen-button">Character Sheet</Link>
            <div className="subtitle">Dungeon Master</div>
          </div>
        )}

        <Tabs
          aria-label="DM Screen"
          variant="solid"
          classNames={{
            tabList: "gap-2 w-full relative rounded-lg p-1.5 overflow-x-auto bg-default-200 border border-default-300 shadow-inner mb-6",
            cursor: "w-full bg-white rounded-md shadow border border-default-300 border-b-3 border-b-red-700",
            tab: "max-w-fit px-4 h-10 data-[hover=true]:bg-default-300/50 transition-colors",
            tabContent: "group-data-[selected=true]:text-red-800 text-default-500 font-cinzel font-bold text-sm tracking-wide transition-colors",
          }}
        >
          <Tab key="encounters" title="Encounter Builder">
            <EncounterGenerator
              roomId={roomId}
              encounters={dmData.encounters}
              onEncountersChange={(encounters) => setDmData((d) => ({ ...d, encounters }))}
              onAddMonstersToInit={onAddMonstersToInit ?? (() => {})}
              onBroadcastChat={onBroadcastChat ?? (() => {})}
            />
          </Tab>
          <Tab key="items" title="Loot & Shops">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <ItemPilesPanel
                  itemPiles={dmData.itemPiles}
                  isEmbedded={isEmbedded}
                  socket={socket}
                  expandedItems={expandedItems}
                  customItemNames={customItemNames}
                  onAddPile={addNewPile}
                  onRename={renamePile}
                  onToggleShare={toggleSharePile}
                  onClear={clearPile}
                  onRemove={removePile}
                  onUpdateItemQty={updateItemQty}
                  onUpdateItemDesc={updateItemDesc}
                  onRemoveItem={removeItem}
                  onSetCustomItemName={(pileId, val) => setCustomItemNames((p) => ({ ...p, [pileId]: val }))}
                  onAddCustomItem={addCustomItem}
                  onToggleExpanded={toggleItemExpanded}
                  onSearchDB={setActivePileId}
                />
              </div>
              <div>
                <ManualShopsPanel
                  shops={dmData.shops}
                  isEmbedded={isEmbedded}
                  socket={socket}
                  expandedItems={expandedItems}
                  customShopItemNames={customShopItemNames}
                  onAddShop={addNewShop}
                  onRename={renameShop}
                  onToggleShare={toggleShareShop}
                  onClear={clearShop}
                  onRemove={removeShop}
                  onUpdateItemQty={updateShopItemQty}
                  onUpdateItemPrice={updateShopItemPrice}
                  onUpdateItemDesc={updateShopItemDesc}
                  onRemoveItem={removeShopItem}
                  onSetCustomItemName={(shopId, val) => setCustomShopItemNames((p) => ({ ...p, [shopId]: val }))}
                  onAddCustomItem={addCustomItemToShop}
                  onToggleExpanded={toggleItemExpanded}
                  onSearchDB={setActiveShopId}
                  onCreateManualShop={createManualShopFromResults}
                />
              </div>
            </div>
          </Tab>
          <Tab key="npcs" title="NPCs">
            <NPCManager roomId={roomId} />
          </Tab>
          <Tab key="tables" title="Random Tables">
            <DMTablesTab />
          </Tab>
          <Tab key="rules" title="Rules Reference">
            <DMRulesTab />
          </Tab>
        </Tabs>
      </div>

      {activePileId && <ItemSearchModal onSelect={addItemToPile} onClose={() => setActivePileId(null)} />}
      {activeShopId && <ItemSearchModal onSelect={addItemToShop} onClose={() => setActiveShopId(null)} />}
    </>
  );
}
