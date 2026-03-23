import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Divider,
  Input,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import { createClient } from "@supabase/supabase-js";
import DMScreenPage from "./DMScreenPage";
import { processEntries, cleanText } from "src/utils/dndEntries";
import CharacterSheetPage from "./CharacterSheetPage";
import { CharacterProvider, useCharacter } from "src/context/CharacterContext";
import NPCManager from "src/components/NPCManager";
import {
  DeathSaveModal,
  TradeModal,
  ChatAndDicePanel,
  PlayerListPanel,
  InitiativePanel,
  SharedLootPanel,
  SharedShopPanel,
  DMCharactersTab,
  AuditLogTab
} from "src/components/RoomWidgets";

// Toggle this to true to test UI without needing to log in or use Supabase
const BYPASS_AUTH = false;

// Initialize Supabase
// Replace these with your actual Supabase project URL and Anon Key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function RoomViewContent() {
  const { roomId } = useParams();
  const { character, update } = useCharacter();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [initiativeList, setInitiativeList] = useState([]);
  const [activeTurn, setActiveTurn] = useState(0);
  const [roundCount, setRoundCount] = useState(1);
  const [initName, setInitName] = useState("");
  const [initVal, setInitVal] = useState("");
  const [sharedPiles, setSharedPiles] = useState([]);
  const [sharedShops, setSharedShops] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [playerCharacters, setPlayerCharacters] = useState({});
  const [diceCount, setDiceCount] = useState("1");
  const [diceMod, setDiceMod] = useState("0");
  const [advDis, setAdvDis] = useState("normal");
  const [isRolling, setIsRolling] = useState(false);
  const [isDiceExpanded, setIsDiceExpanded] = useState(true);
  const [activeRolls, setActiveRolls] = useState(null);
  const [isPlayersExpanded, setIsPlayersExpanded] = useState(true);
  const [isInitiativeExpanded, setIsInitiativeExpanded] = useState(true);
  const [isLootExpanded, setIsLootExpanded] = useState(true);
  const [isShopExpanded, setIsShopExpanded] = useState(true);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const isRollingRef = useRef(false);
  const [showDeathSaveModal, setShowDeathSaveModal] = useState(false);
  const [deathSaveResult, setDeathSaveResult] = useState("");
  const [lastDeathSaveTurn, setLastDeathSaveTurn] = useState(null);
  const [dmAlerts, setDmAlerts] = useState([]);
  const [tradeTarget, setTradeTarget] = useState(null);
  const [tradeMoney, setTradeMoney] = useState({ cp: '', sp: '', ep: '', gp: '', pp: '' });
  const [tradeItems, setTradeItems] = useState({});
  const [tradeSearch, setTradeSearch] = useState("");

  useEffect(() => {
    if (showDeathSaveModal || tradeTarget) {
      window.__modalCount = (window.__modalCount || 0) + 1;
      document.body.classList.add('modal-open');
      return () => {
        window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
        if (window.__modalCount === 0) document.body.classList.remove('modal-open');
      };
    }
  }, [showDeathSaveModal, tradeTarget]);

  const userRoleRef = useRef(user?.role);
  useEffect(() => {
    userRoleRef.current = user?.role;
  }, [user?.role]);

  const characterRef = useRef(character);
  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  const updateIsRolling = (val) => {
    setIsRolling(val);
    isRollingRef.current = val;
  };

  const isDM = user?.role === "DM";
  const myName = user?.email ? user.email.split("@")[0] : "Unknown";

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      const parent = messagesEndRef.current.parentElement;
      if (parent) {
        parent.scrollTo({ top: parent.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return; // Wait for user to load

    // 1. Setup Supabase Channel & Intercept wrapper
    const channel = supabase.channel(`room_${roomId}`, {
      config: { presence: { key: user.email } },
    });

    // Mock Socket object translates existing socket.emit calls to Supabase API calls seamlessly
    const mockSocket = {
      emit: async (event, payload) => {
        if (event === "send_action") {
          // Route persistent actions directly to the Postgres database
          if (payload.action === "update_initiative") {
            await supabase.from('rooms').update({
              initiative_list: payload.initiativeList,
              active_turn: payload.activeTurn,
              round_count: payload.roundCount
            }).eq('id', payload.room);
          } else if (payload.action === "update_shared_piles") {
            await supabase.from('rooms').update({ shared_piles: payload.sharedPiles }).eq('id', payload.room);
          } else if (payload.action === "update_shared_shops") {
            await supabase.from('rooms').update({ shared_shops: payload.sharedShops }).eq('id', payload.room);
          } else if (payload.action === "update_character") {
            const { data } = await supabase.from('rooms').select('player_characters').eq('id', payload.room).single();
            const currentChars = data?.player_characters || {};
            await supabase.from('rooms').update({ player_characters: { ...currentChars, [payload.email]: payload.character } }).eq('id', payload.room);
          } else {
            // All other actions (chat, rolls, giving items) are ephemeral. Send over fast broadcast.
            channel.send({ type: "broadcast", event: "send_action", payload });
          }
        } else if (event === "update_role") {
          await channel.track({ email: user.email, role: payload.role });
        }
      },
      disconnect: () => supabase.removeChannel(channel)
    };

    setSocket(mockSocket);

    // 2. Fetch Initial State from Postgres
    const fetchInitialState = async () => {
      const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      if (data) {
        if (data.initiative_list) setInitiativeList(data.initiative_list);
        if (data.active_turn !== undefined) setActiveTurn(data.active_turn);
        if (data.round_count !== undefined) setRoundCount(data.round_count);
        if (data.shared_piles) setSharedPiles(data.shared_piles);
        if (data.shared_shops) setSharedShops(data.shared_shops);
        if (data.player_characters) setPlayerCharacters(data.player_characters);
      } else {
        // Room data doesn't exist in Supabase yet, create empty state
        await supabase.from('rooms').insert({ id: roomId });
      }
    };
    fetchInitialState();

    // 3. Setup Presence (Who is online, Joins, Leaves)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.values(state).map(presenceArray => presenceArray[0]);
      setConnectedUsers(users);
    });

    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      const text = `${newPresences[0].email.split('@')[0]} has joined the table.`;
      setMessages(prev => [...prev, { type: "system", text, timestamp: new Date().toLocaleTimeString() }]);
    });

    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      const text = `${leftPresences[0].email.split('@')[0]} has left the table.`;
      setMessages(prev => [...prev, { type: "system", text, timestamp: new Date().toLocaleTimeString() }]);
    });

    // 4. Setup Broadcast (Ephemeral events like Chat and Dice Rolls)
    channel.on('broadcast', { event: 'send_action' }, ({ payload: data }) => {
      if (data.action === "chat") {
        setMessages((prev) => [...prev, { type: "chat", sender: data.sender, text: data.text, timestamp: data.timestamp }]);
      } else if (data.action === "roll") {
        setMessages((prev) => [...prev, { type: "roll", sender: data.sender, dice: data.dice, result: data.result, timestamp: data.timestamp }]);
      } else if (data.action === "secret_dm_message") {
        if (userRoleRef.current === "DM") {
          setDmAlerts((prev) => [...prev, { id: Date.now() + Math.random(), sender: data.sender, text: data.text }]);
        }
      } else if (data.action === "apply_effect" && data.targetName === myName) {
        const currentEffects = characterRef.current.activeEffects || [];
        if (!currentEffects.includes(data.effectName)) {
          update({ activeEffects: [...currentEffects, data.effectName] });
        }
      } else if (data.action === "give_to_player" && user?.email === data.targetEmail) {
        const updates = {};
        if (data.money) {
          updates.cp = (parseInt(characterRef.current.cp) || 0) + (data.money.cp || 0);
          updates.sp = (parseInt(characterRef.current.sp) || 0) + (data.money.sp || 0);
          updates.ep = (parseInt(characterRef.current.ep) || 0) + (data.money.ep || 0);
          updates.gp = (parseInt(characterRef.current.gp) || 0) + (data.money.gp || 0);
          updates.pp = (parseInt(characterRef.current.pp) || 0) + (data.money.pp || 0);
        }
        if (data.items && data.items.length > 0) {
          const currentInv = [...(characterRef.current.inventory || [])];
          data.items.forEach((item) => {
            const existing = currentInv.find((i) => i.name === item.name);
            if (existing) existing.qty = (parseInt(existing.qty) || 1) + (parseInt(item.qty) || 1);
            else currentInv.push({ ...item, equipped: false });
          });
          updates.inventory = currentInv;
        }
        if (Object.keys(updates).length > 0) update(updates);
      } else if (data.action === "player_grabbed_item" || data.action === "player_bought_item") {
        // To prevent UI lag we optimistically receive these even if they are DB events.
        if (data.action === "player_grabbed_item") {
          setSharedPiles(prev => prev.map((p) => p.id === data.pileId ? { ...p, items: p.items.map(i => i.id === data.itemId ? { ...i, qty: Math.max(0, i.qty - data.qty) } : i) } : p));
        } else if (data.action === "player_bought_item") {
          setSharedShops(prev => prev.map((p) => p.id === data.shopId ? { ...p, items: p.items.map(i => i.id === data.itemId ? { ...i, qty: Math.max(0, i.qty - data.qty) } : i) } : p));
        }
      }
    });

    // 5. Setup Postgres Changes (Syncs persistent table state when DM/Players update it)
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
      const newData = payload.new;
      if (newData.initiative_list) setInitiativeList(newData.initiative_list);
      if (newData.active_turn !== undefined) setActiveTurn(newData.active_turn);
      if (newData.round_count !== undefined) setRoundCount(newData.round_count);
      if (newData.shared_piles) setSharedPiles(newData.shared_piles);
      if (newData.shared_shops) setSharedShops(newData.shared_shops);
      if (newData.player_characters) setPlayerCharacters(newData.player_characters);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ email: user.email, role: user.role });
    });

    return () => mockSocket.disconnect();
  }, [roomId, user?.email]);

  // Notify server and local state when role changes
  useEffect(() => {
    if (socket && user) {
      socket.emit("update_role", { roomId, role: user.role });
      setConnectedUsers((prev) =>
        prev.map((u) =>
          u.email === user.email ? { ...u, role: user.role } : u,
        ),
      );
    }
  }, [user?.role]);

  // Continuously sync player character sheets to the room for the DM
  useEffect(() => {
    if (isDM || !socket || !roomId || !user) return;
    let lastCharStr = "";
    const interval = setInterval(() => {
      const charStr = localStorage.getItem("dndCharacter");
      if (charStr && charStr !== lastCharStr) {
        lastCharStr = charStr;
        socket.emit("send_action", {
          room: roomId,
          action: "update_character",
          email: user.email,
          character: JSON.parse(charStr)
        });
      }
    }, 3000); // Check and push sheet changes every 3 seconds
    return () => clearInterval(interval);
  }, [isDM, socket, roomId, user]);

  useEffect(() => {
    if (BYPASS_AUTH) {
      let bypassUser = sessionStorage.getItem("bypassUser");
      if (!bypassUser) {
        bypassUser = `tester_${Math.floor(Math.random() * 1000)}@example.com`;
        sessionStorage.setItem("bypassUser", bypassUser);
      }
      let userRole = sessionStorage.getItem("userRole") || "Player";
      setUser({ email: bypassUser, role: userRole });
      setRoom({
        name: `Mock Campaign Room (${roomId})`,
        createdBy: "dm@example.com",
      });
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        let userRole = sessionStorage.getItem("userRole") || "Player";
        setUser({ email: session.user.email, role: userRole });
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        let userRole = sessionStorage.getItem("userRole") || "Player";
        setUser({ email: session.user.email, role: userRole });
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [navigate, roomId]);

  useEffect(() => {
    if (BYPASS_AUTH || !user) return;

    const fetchRoomMeta = async () => {
      const { data, error } = await supabase.from('rooms').select('name, created_by').eq('id', roomId).single();
      if (data) {
        setRoom({ id: roomId, name: data.name, createdBy: data.created_by });
      } else {
        setRoom(null); // Room deleted or not found
      }
      setLoading(false);
    };
    fetchRoomMeta();

    const channel = supabase.channel(`room_meta_${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        if (payload.new.name) {
          setRoom(prev => ({ ...prev, name: payload.new.name }));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [roomId, user]);

  const activeVal = initiativeList.length > 0 ? initiativeList[activeTurn]?.val : null;
  const isMyTurn = initiativeList.length > 0 && activeVal !== null && initiativeList.some(i => i.val === activeVal && i.name === myName);
  const isHpZero = (parseInt(character.hp) || 0) <= 0;
  useEffect(() => {
    if (!isDM && isMyTurn && isHpZero && lastDeathSaveTurn !== activeTurn) {
      setShowDeathSaveModal(true);
    }
    if (!isMyTurn && lastDeathSaveTurn !== null) {
      setLastDeathSaveTurn(null);
    }
  }, [isMyTurn, isHpZero, activeTurn, isDM, lastDeathSaveTurn]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    sessionStorage.setItem("userRole", newRole);
    setUser((prev) => ({ ...prev, role: newRole }));
  };

  const toggleItemExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const syncInitiative = (newList, newTurn, newRound = roundCount) => {
    setInitiativeList(newList);
    setActiveTurn(newTurn);
    setRoundCount(newRound);
    if (socket) {
      socket.emit("send_action", {
        room: roomId,
        action: "update_initiative",
        initiativeList: newList,
        activeTurn: newTurn,
        roundCount: newRound,
      });
    }
  };

  const handleAddInitiative = () => {
    const resolvedName = isDM ? initName.trim() : myName;
    if (!resolvedName || !initVal) return;

    let newList = [...initiativeList];
    // If it's a player, remove their previous roll to update it
    if (!isDM) {
      newList = newList.filter((item) => item.name !== resolvedName);
    }

    newList.push({
      id: Date.now(),
      name: resolvedName,
      val: parseInt(initVal) || 0,
    });
    newList.sort((a, b) => b.val - a.val);
    syncInitiative(newList, activeTurn, roundCount);
    if (isDM) setInitName("");
    setInitVal("");
  };

  const handleRemoveInitiative = (id) => {
    const newList = initiativeList.filter((item) => item.id !== id);
    syncInitiative(newList, activeTurn >= newList.length ? 0 : activeTurn, roundCount);
  };

  const handleNextTurn = () => {
    if (initiativeList.length === 0) return;
    const currentVal = initiativeList[activeTurn]?.val;
    let newTurn = activeTurn;
    while (newTurn < initiativeList.length && initiativeList[newTurn].val === currentVal) {
      newTurn++;
    }
    const newRound = newTurn >= initiativeList.length ? roundCount + 1 : roundCount;
    if (newTurn >= initiativeList.length) newTurn = 0;
    syncInitiative(initiativeList, newTurn, newRound);
  };

  const handlePrevTurn = () => {
    if (initiativeList.length === 0) return;
    const currentVal = initiativeList[activeTurn]?.val;
    let newTurn = activeTurn;
    while (newTurn >= 0 && initiativeList[newTurn].val === currentVal) {
      newTurn--;
    }
    let newRound = roundCount;
    if (newTurn < 0) {
      newTurn = initiativeList.length - 1;
      newRound = Math.max(1, roundCount - 1);
    }
    const targetVal = initiativeList[newTurn].val;
    while (newTurn > 0 && initiativeList[newTurn - 1].val === targetVal) {
      newTurn--;
    }
    syncInitiative(initiativeList, newTurn, newRound);
  };

  const handleRollDice = (sides) => {
    if (!socket || !user || isRolling) return;
    updateIsRolling(true);

    let actualCount = parseInt(diceCount) || 1;
    let rollCount = actualCount;
    if (advDis !== "normal") {
      rollCount = actualCount === 1 ? 2 : actualCount * 2;
    }

    const rolls = Array.from(
      { length: rollCount },
      () => Math.floor(Math.random() * sides) + 1
    );
    const mod = parseInt(diceMod) || 0;

    setActiveRolls({ sides, rolls, mod, advDis, actualCount, rollCount });
  };

  const finalizeRoll = () => {
    if (!activeRolls) return;
    const { sides, rolls, mod, advDis, actualCount, rollCount } = activeRolls;
    const sender = user.role === "DM" ? "DM" : user.email.split("@")[0];

    let finalResult = 0;
    let rollDetail = "";
    let isNat1 = false;
    let isNat20 = false;

    const processValues = (values) => {
      let keptValues = [];
      if (advDis === "adv") {
        keptValues = [...values].sort((a, b) => b - a).slice(0, actualCount);
      } else if (advDis === "dis") {
        keptValues = [...values].sort((a, b) => a - b).slice(0, actualCount);
      } else {
        keptValues = values;
      }

      if (sides === 20) {
        if (keptValues.includes(20)) isNat20 = true;
        if (keptValues.includes(1)) isNat1 = true;
      }

      const sum = keptValues.reduce((a, b) => a + b, 0);
        finalResult = sum + mod;
      
      if (advDis === "adv") {
        rollDetail = `[${values.join(", ")}] Keep Highest -> ${sum}`;
      } else if (advDis === "dis") {
        rollDetail = `[${values.join(", ")}] Keep Lowest -> ${sum}`;
      } else {
        if (actualCount > 1)
          rollDetail = `[${values.join(", ")}] Sum -> ${sum}`;
        else rollDetail = `${sum}`;
      }
    };

    processValues(rolls);

    const modStr =
      mod !== 0 ? (mod > 0 ? ` + ${mod}` : ` - ${Math.abs(mod)}`) : "";
    const finalStr = `${rollDetail}${modStr} = ${finalResult}`;
    const label = actualCount !== rollCount ? `${actualCount}d${sides}` : `${rollCount}d${sides}`;
    const timestamp = new Date().toLocaleTimeString();

    const msgData = {
      room: roomId,
      action: "roll",
      sender,
      dice: `${label}${modStr}${advDis !== "normal" ? ` (${advDis})` : ""}`,
      result: finalStr,
      isNat1,
      isNat20,
      timestamp
    };

    socket.emit("send_action", msgData);
    setMessages((prev) => [
      ...prev,
      { type: "roll", sender: "You", dice: msgData.dice, result: finalStr, isNat1, isNat20, timestamp },
    ]);
    setActiveRolls(null);
    updateIsRolling(false);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !socket || !user) return;
    const timestamp = new Date().toLocaleTimeString();

    const msgData = {
      room: roomId,
      action: "chat",
      sender: user.role === "DM" ? "DM" : user.email.split("@")[0],
      text: chatInput.trim(),
      timestamp
    };

    socket.emit("send_action", msgData);
    setMessages((prev) => [
      ...prev,
      { type: "chat", sender: "You", text: chatInput.trim(), timestamp },
    ]);
    setChatInput("");
  };

  const handleGive = () => {
    if (!tradeTarget) return;

    let mCp = parseInt(tradeMoney.cp) || 0;
    let mSp = parseInt(tradeMoney.sp) || 0;
    let mEp = parseInt(tradeMoney.ep) || 0;
    let mGp = parseInt(tradeMoney.gp) || 0;
    let mPp = parseInt(tradeMoney.pp) || 0;
    
    if (mCp > (parseInt(character.cp) || 0) || mSp > (parseInt(character.sp) || 0) || mEp > (parseInt(character.ep) || 0) || mGp > (parseInt(character.gp) || 0) || mPp > (parseInt(character.pp) || 0)) {
        alert("You don't have enough money.");
        return;
    }

    const itemsToGive = [];
    const newInv = [...(character.inventory || [])];
    
    for (const [idxStr, qtyStr] of Object.entries(tradeItems)) {
        const idx = parseInt(idxStr);
        const qty = parseInt(qtyStr) || 0;
        if (qty > 0) {
            const item = newInv[idx];
            if (!item) continue;
            if (qty > (parseInt(item.qty) || 1)) {
                alert(`You don't have enough of ${item.name}.`);
                return;
            }
            itemsToGive.push({ ...item, qty });
            item.qty = (parseInt(item.qty) || 1) - qty;
        }
    }

    if (mCp === 0 && mSp === 0 && mEp === 0 && mGp === 0 && mPp === 0 && itemsToGive.length === 0) {
        alert("Please select something to give.");
        return;
    }
    
    const finalInv = newInv.filter(i => (parseInt(i.qty) || 0) > 0);
    
    const updates = {
        inventory: finalInv,
        cp: Math.max(0, (parseInt(character.cp) || 0) - mCp),
        sp: Math.max(0, (parseInt(character.sp) || 0) - mSp),
        ep: Math.max(0, (parseInt(character.ep) || 0) - mEp),
        gp: Math.max(0, (parseInt(character.gp) || 0) - mGp),
        pp: Math.max(0, (parseInt(character.pp) || 0) - mPp),
    };
    
    update(updates);
    
    const targetName = playerCharacters[tradeTarget.email]?.charName || tradeTarget.email.split('@')[0];
    
    const parts = [];
    if (mCp) parts.push(`${mCp} cp`);
    if (mSp) parts.push(`${mSp} sp`);
    if (mEp) parts.push(`${mEp} ep`);
    if (mGp) parts.push(`${mGp} gp`);
    if (mPp) parts.push(`${mPp} pp`);
    itemsToGive.forEach(i => parts.push(`${i.qty}x ${i.name}`));
    
    const text = `${myName} gave ${parts.join(", ")} to ${targetName}.`;
    
    socket.emit("send_action", {
        room: roomId,
        action: "give_to_player",
        sender: myName,
        targetEmail: tradeTarget.email,
        money: { cp: mCp, sp: mSp, ep: mEp, gp: mGp, pp: mPp },
        items: itemsToGive
    });
    
    const timestamp = new Date().toLocaleTimeString();
    socket.emit("send_action", { room: roomId, action: "chat", sender: "System", text, timestamp });
    setMessages(prev => [...prev, { type: "chat", sender: "System", text, timestamp }]);
    
    setTradeTarget(null);
    setTradeMoney({ cp: '', sp: '', ep: '', gp: '', pp: '' });
    setTradeItems({});
    setTradeSearch("");
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return null;
    // Remove commas, dots, and spaces to safely normalize locale-specific formats like "5.000 gp", "5 000 gp", "5,000 gp"
    const cleaned = String(priceStr).toLowerCase().replace(/[,. \s]/g, "");
    const match = cleaned.match(/(\d+)(gp|sp|ep|cp|pp)/);
    if (match) {
      return { amount: parseInt(match[1]), type: match[2] };
    }
    return null;
  };

  const handleSkipDeathSave = () => {
    setShowDeathSaveModal(false);
    setLastDeathSaveTurn(activeTurn);
  };

  const handleSendDeathSave = () => {
    if (!deathSaveResult) return;
    const val = parseInt(deathSaveResult);
    if (socket) {
      socket.emit("send_action", { room: roomId, action: "secret_dm_message", sender: myName, text: `Death Saving Throw: ${val}`, timestamp: new Date().toLocaleTimeString() });
    }
    const saves = character.deathSaves || { successes: [false, false, false], failures: [false, false, false] };
    let newSuccesses = [...saves.successes];
    let newFailures = [...saves.failures];
    let newHp = character.hp;
    if (val === 20) {
      newHp = 1;
    } else if (val >= 10) {
      const idx = newSuccesses.indexOf(false);
      if (idx !== -1) newSuccesses[idx] = true;
    } else if (val === 1) {
      let idx = newFailures.indexOf(false);
      if (idx !== -1) newFailures[idx] = true;
      idx = newFailures.indexOf(false);
      if (idx !== -1) newFailures[idx] = true;
    } else {
      const idx = newFailures.indexOf(false);
      if (idx !== -1) newFailures[idx] = true;
    }
    update({ deathSaves: { successes: newSuccesses, failures: newFailures }, hp: newHp });
    setLastDeathSaveTurn(activeTurn);
    setShowDeathSaveModal(false);
    setDeathSaveResult("");
  };

  const handleGrabItem = (pile, item) => {
    if (isDM) return;
    update({
      inventory: [
        ...(character.inventory || []),
        { name: item.name, qty: 1, weight: 0, equipped: false, description: item.desc || "" }
      ]
    });
    
    const timestamp = new Date().toLocaleTimeString();
    const text = `${myName} grabbed 1x ${item.name} from ${pile.name}.`;
    
    socket.emit("send_action", { room: roomId, action: "player_grabbed_item", pileId: pile.id, itemId: item.id, qty: 1 });
    socket.emit("send_action", { room: roomId, action: "chat", sender: "System", text, timestamp });
    setMessages(prev => [...prev, { type: "chat", sender: "System", text, timestamp }]);
  };

  const handleBuyItem = (shop, item) => {
    if (isDM) return;
    const priceData = parsePrice(item.price);
    if (!priceData) {
      alert("Cannot parse price automatically. Please handle this purchase manually.");
      return;
    }
    
    const currentFunds = parseInt(character[priceData.type]) || 0;
    if (currentFunds < priceData.amount) {
      alert(`Not enough ${priceData.type.toUpperCase()}! You need ${priceData.amount} but have ${currentFunds}.`);
      return;
    }
    
    update({
      [priceData.type]: currentFunds - priceData.amount,
      inventory: [
        ...(character.inventory || []),
        { name: item.name, qty: 1, weight: 0, equipped: false, description: item.desc || "" }
      ]
    });
    
    const timestamp = new Date().toLocaleTimeString();
    const text = `${myName} bought 1x ${item.name} from ${shop.name} for ${priceData.amount} ${priceData.type}.`;
    
    socket.emit("send_action", { room: roomId, action: "player_bought_item", shopId: shop.id, itemId: item.id, qty: 1 });
    socket.emit("send_action", { room: roomId, action: "chat", sender: "System", text, timestamp });
    setMessages(prev => [...prev, { type: "chat", sender: "System", text, timestamp }]);
  };

  if (!user) return null;

  const filteredTradeItems = (character.inventory || [])
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => !tradeSearch || item.name?.toLowerCase().includes(tradeSearch.toLowerCase()));

  // Deduplicate users by email to avoid duplicates on quick disconnects/reconnects
  const uniqueUsers = Array.from(
    new Map(connectedUsers.map((u) => [u.email, u])).values(),
  );

  // Always ensure you see yourself in the list instantly to prevent UI flickering
  if (!uniqueUsers.some((u) => u.email === user.email)) {
    uniqueUsers.push({ email: user.email, role: user.role });
  }

  const displayUsers = uniqueUsers;

  return (
    <>
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {dmAlerts.map(alert => (
          <div key={alert.id} className="pointer-events-auto bg-purple-900 text-white p-3 rounded shadow-lg border border-purple-500 flex justify-between items-center gap-4 min-w-[250px] animate-appearance-in">
            <div>
              <div className="text-xs font-bold text-purple-300">SECRET TO DM: {alert.sender}</div>
              <div className="text-sm font-semibold">{alert.text}</div>
            </div>
            <button onClick={() => setDmAlerts(prev => prev.filter(a => a.id !== alert.id))} className="text-purple-400 hover:text-white font-bold text-lg leading-none pb-1">&times;</button>
          </div>
        ))}
      </div>

      <DeathSaveModal
        isOpen={showDeathSaveModal}
        onClose={() => handleSkipDeathSave()}
        deathSaveResult={deathSaveResult}
        setDeathSaveResult={setDeathSaveResult}
        onSkip={handleSkipDeathSave}
        onSend={handleSendDeathSave}
      />

      <TradeModal
        isOpen={!!tradeTarget}
        onClose={() => { setTradeTarget(null); setTradeSearch(""); }}
        tradeTarget={tradeTarget}
        playerCharacters={playerCharacters}
        tradeMoney={tradeMoney}
        setTradeMoney={setTradeMoney}
        character={character}
        tradeSearch={tradeSearch}
        setTradeSearch={setTradeSearch}
        filteredTradeItems={filteredTradeItems}
        tradeItems={tradeItems}
        setTradeItems={setTradeItems}
        onGive={handleGive}
      />

      <div
        className="min-h-screen p-4 md:p-8"
        style={{ background: "var(--parchment)", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(42,24,16,0.02) 2px, rgba(42,24,16,0.02) 4px)",
            pointerEvents: "none",
            opacity: 0.5,
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6 bg-white/70 p-4 rounded-lg shadow-sm border border-yellow-600/30">
            <div className="flex items-center gap-4">
              <Button
                variant="flat"
                size="sm"
                onPress={() => navigate("/rooms")}
              >
                ← Back
              </Button>
              <h1 className="font-cinzel text-2xl font-bold text-red-800 m-0 border-none">
                {loading ? "Loading..." : room ? room.name : "Room Not Found"}
              </h1>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-default-600">
                {user.email.split('@')[0]}
              </span>
              <select
                value={user.role}
                onChange={handleRoleChange}
                className="text-xs bg-transparent border-none text-primary font-bold cursor-pointer outline-none"
              >
                <option value="Player">Role: Player</option>
                <option value="DM">Role: DM</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center italic text-default-500 mt-8">
              Loading room details...
            </div>
          ) : !room ? (
            <div className="text-center italic text-default-500 mt-8">
              This room does not exist.
            </div>
          ) : (
            <>
              <Tabs
                aria-label="Room Tabs"
                variant="solid"
                classNames={{
                  tabList: "gap-2 w-full relative rounded-lg p-1.5 overflow-x-auto bg-default-200 border border-default-300 shadow-inner",
                  cursor: "w-full bg-white rounded-md shadow border border-default-300 border-b-3 border-b-red-700",
                  tab: "max-w-fit px-4 h-10 data-[hover=true]:bg-default-300/50 transition-colors",
                  tabContent: "group-data-[selected=true]:text-red-800 text-default-500 font-cinzel font-bold text-sm md:text-base tracking-wide transition-colors",
                }}
              >
                <Tab key="room" title="Table / Room">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-start">
                    <ChatAndDicePanel
                      messages={messages}
                      messagesEndRef={messagesEndRef}
                      activeRolls={activeRolls}
                      finalizeRoll={finalizeRoll}
                      isDiceExpanded={isDiceExpanded}
                      setIsDiceExpanded={setIsDiceExpanded}
                      diceCount={diceCount}
                      setDiceCount={setDiceCount}
                      advDis={advDis}
                      setAdvDis={setAdvDis}
                      diceMod={diceMod}
                      setDiceMod={setDiceMod}
                      handleRollDice={handleRollDice}
                      isRolling={isRolling}
                      setMessages={setMessages}
                      chatInput={chatInput}
                      setChatInput={setChatInput}
                      handleSendMessage={handleSendMessage}
                    />

                    <div className="col-span-1 flex flex-col gap-6 h-full pb-2">
                      <PlayerListPanel
                        displayUsers={displayUsers}
                        playerCharacters={playerCharacters}
                        user={user}
                        isDM={isDM}
                        setTradeTarget={setTradeTarget}
                        setTradeMoney={setTradeMoney}
                        setTradeItems={setTradeItems}
                        setTradeSearch={setTradeSearch}
                        isPlayersExpanded={isPlayersExpanded}
                        setIsPlayersExpanded={setIsPlayersExpanded}
                      />
                      <InitiativePanel
                        initiativeList={initiativeList}
                        roundCount={roundCount}
                        isDM={isDM}
                        initName={initName}
                        myName={myName}
                        setInitName={setInitName}
                        initVal={initVal}
                        setInitVal={setInitVal}
                        handleAddInitiative={handleAddInitiative}
                        activeVal={activeVal}
                        handleNextTurn={handleNextTurn}
                        handlePrevTurn={handlePrevTurn}
                        handleRemoveInitiative={handleRemoveInitiative}
                        syncInitiative={syncInitiative}
                        isInitiativeExpanded={isInitiativeExpanded}
                        setIsInitiativeExpanded={setIsInitiativeExpanded}
                      />
                      <SharedLootPanel
                        sharedPiles={sharedPiles}
                        isDM={isDM}
                        handleGrabItem={handleGrabItem}
                        toggleItemExpanded={toggleItemExpanded}
                        expandedItems={expandedItems}
                        isLootExpanded={isLootExpanded}
                        setIsLootExpanded={setIsLootExpanded}
                      />
                      <SharedShopPanel
                        sharedShops={sharedShops}
                        isDM={isDM}
                        handleBuyItem={handleBuyItem}
                        parsePrice={parsePrice}
                        toggleItemExpanded={toggleItemExpanded}
                        expandedItems={expandedItems}
                        isShopExpanded={isShopExpanded}
                        setIsShopExpanded={setIsShopExpanded}
                      />
                    </div>
                  </div>
                </Tab>
                {isDM && (
                  <Tab key="dm-view" title="DM View">
                    <div className="pt-4">
                      <DMScreenPage
                        isEmbedded={true}
                        socket={socket}
                        roomId={roomId}
                        onAddMonstersToInit={(monsters) => {
                          const arr = Array.isArray(monsters) ? monsters : [monsters];
                          const newItems = arr.map((m) => {
                            let dexMod = 0;
                            if (m.rawMonster && m.rawMonster.dex) {
                              dexMod = Math.floor((m.rawMonster.dex - 10) / 2);
                            }
                            return {
                              id: Date.now().toString(36) + Math.random().toString(36).slice(2),
                              name: m.name,
                              val: Math.floor(Math.random() * 20) + 1 + dexMod,
                            };
                          });
                          const newList = [...initiativeList, ...newItems];
                          newList.sort((a, b) => b.val - a.val);
                          syncInitiative(newList, activeTurn);
                        }}
                        onBroadcastChat={(text) => {
                          const msgData = { room: roomId, action: "chat", sender: "DM (System)", text };
                          socket.emit("send_action", msgData);
                          setMessages((prev) => [...prev, { type: "chat", sender: "DM (System)", text }]);
                        }}
                      />
                    </div>
                  </Tab>
                )}
                {isDM && (
                  <Tab key="dm-characters" title="Characters">
                    <DMCharactersTab playerCharacters={playerCharacters} />
                  </Tab>
                )}
                {isDM && (
                  <Tab key="dm-npcs" title="NPCs">
                    <div className="pt-4 h-full pr-2">
                      <NPCManager roomId={roomId} />
                    </div>
                  </Tab>
                )}
                {isDM && (
                  <Tab key="dm-audit" title="Audit Log">
                    <AuditLogTab messages={messages} />
                  </Tab>
                )}
                {!isDM && (
                  <Tab key="character" title="Character Sheet">
                    <div className="pt-4 pb-12">
                      <CharacterSheetPage isEmbedded={true} initiativeList={initiativeList} socket={socket} roomId={roomId} myName={myName} />
                    </div>
                  </Tab>
                )}
              </Tabs>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function RoomViewPage() {
  return (
    <CharacterProvider>
      <RoomViewContent />
    </CharacterProvider>
  );
}
