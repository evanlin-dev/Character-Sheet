import { useState, useMemo } from "react";
import { useCharacter } from "src/context/CharacterContext";
import { openDB, STORE_NAME } from "src/utils/db";
import { processEntries, cleanText } from "src/utils/dndEntries";

function SummonCard({ summon, index, onUpdate, onDelete }) {
  const hp = parseInt(summon.hp) || 0;
  const maxHp = parseInt(summon.maxHp) || 1;
  const hpPct = Math.min(100, Math.max(0, (hp / maxHp) * 100));

  const adjustHp = (delta) => {
    const newHp = Math.max(0, Math.min(maxHp, hp + delta));
    onUpdate({ ...summon, hp: newHp });
  };

  return (
    <div
      style={{
        background: "white",
        border: "2px solid var(--gold)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        position: "relative",
      }}
    >
      <button
        className="delete-feature-btn"
        onClick={() => onDelete(index)}
        style={{ position: "absolute", top: 8, right: 8, margin: 0 }}
      >
        &times;
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div className="field">
          <label className="field-label">Name</label>
          <input
            type="text"
            value={summon.name || ""}
            onChange={(e) => onUpdate({ ...summon, name: e.target.value })}
            placeholder="Creature name"
          />
        </div>
        <div className="field">
          <label className="field-label">Type / CR</label>
          <input
            type="text"
            value={summon.type || ""}
            onChange={(e) => onUpdate({ ...summon, type: e.target.value })}
            placeholder="Beast, CR 1/4"
          />
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: "0.75rem",
              color: "var(--ink-light)",
            }}
          >
            HP
          </span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem" }}>
            {hp} / {maxHp}
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: "var(--parchment-dark)",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              height: "100%",
              background:
                hpPct > 50 ? "var(--red)" : hpPct > 25 ? "#e67e22" : "#c0392b",
              width: `${hpPct}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="hp-btn" onClick={() => adjustHp(-1)}>
            -
          </button>
          <input
            type="number"
            value={summon.hp || 0}
            onChange={(e) =>
              onUpdate({ ...summon, hp: parseInt(e.target.value) || 0 })
            }
            style={{ width: 60, textAlign: "center" }}
          />
          <button className="hp-btn" onClick={() => adjustHp(1)}>
            +
          </button>
          <span style={{ color: "var(--ink-light)" }}>/</span>
          <input
            type="number"
            value={summon.maxHp || 0}
            onChange={(e) =>
              onUpdate({ ...summon, maxHp: parseInt(e.target.value) || 0 })
            }
            style={{ width: 60, textAlign: "center" }}
            title="Max HP"
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div className="field">
          <label className="field-label">AC</label>
          <input
            type="number"
            value={summon.ac || ""}
            onChange={(e) => onUpdate({ ...summon, ac: e.target.value })}
            placeholder="AC"
          />
        </div>
        <div className="field">
          <label className="field-label">Speed</label>
          <input
            type="text"
            value={summon.speed || ""}
            onChange={(e) => onUpdate({ ...summon, speed: e.target.value })}
            placeholder="30 ft"
          />
        </div>
        <div className="field">
          <label className="field-label">Initiative</label>
          <input
            type="text"
            value={summon.initiative || ""}
            onChange={(e) =>
              onUpdate({ ...summon, initiative: e.target.value })
            }
            placeholder="+3"
          />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Notes / Abilities</label>
        <textarea
          value={summon.notes || ""}
          onChange={(e) => onUpdate({ ...summon, notes: e.target.value })}
          placeholder="Special abilities, attacks, etc."
          rows={2}
        />
      </div>
      <button
        className="add-feature-btn"
        style={{ marginTop: 8, background: 'var(--red-dark)', color: '#fff', borderColor: 'var(--red-dark)' }}
        onClick={() => {
          const name = summon.name || 'Creature';
          const existing = JSON.parse(localStorage.getItem('combatTrackerEntries') || '[]');
          existing.push({ name, hp: summon.hp || 0, maxHp: summon.maxHp || 0, ac: summon.ac || 0, initiative: parseInt(summon.initiative) || 0, type: 'summon' });
          localStorage.setItem('combatTrackerEntries', JSON.stringify(existing));
          alert(`${name} added to combat tracker.`);
        }}
      >
        + Add to Combat
      </button>
    </div>
  );
}

export default function SummonsTab() {
  const { character, update } = useCharacter();
  const summons = character.summonsData || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monsters, setMonsters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const updateSummon = (index, newSummon) => {
    update({
      summonsData: summons.map((s, i) => (i === index ? newSummon : s)),
    });
  };

  const openSearch = async () => {
    setIsModalOpen(true);
    if (monsters.length > 0) return;
    setLoading(true);
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const data = await new Promise((resolve) => {
        const req = store.get("currentData");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      if (data) {
        const loadedMonsters = [];
        data.forEach(file => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            if (json.monster) loadedMonsters.push(...json.monster);
          } catch(e) {}
        });

        const monMap = new Map();
        loadedMonsters.forEach(m => {
            if (!m?.name) return;
            const key = m.name.toLowerCase();
            if (!monMap.has(key)) monMap.set(key, m);
            else {
                const ex = monMap.get(key);
                if (m.source === 'MM' && ex.source !== 'MM') monMap.set(key, m);
            }
        });
        const sorted = Array.from(monMap.values()).sort((a,b) => a.name.localeCompare(b.name));
        setMonsters(sorted);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const filteredMonsters = useMemo(() => {
      if (!searchQuery) return monsters.slice(0, 100);
      return monsters.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 100);
  }, [monsters, searchQuery]);

  const deleteSummon = (index) => {
    update({ summonsData: summons.filter((_, i) => i !== index) });
  };

  const handleImportMonster = (m) => {
      let ac = 10;
      if (m.ac) {
          const acEntry = Array.isArray(m.ac) ? m.ac[0] : m.ac;
          ac = typeof acEntry === 'object' ? (acEntry.ac || acEntry.value || 10) : (parseInt(acEntry) || 10);
      }

      let hp = 10;
      if (m.hp) {
          hp = typeof m.hp === 'object' ? (m.hp.average || m.hp.min || 1) : (parseInt(m.hp) || 1);
      }

      let speed = '30 ft';
      if (m.speed) {
          const spd = m.speed.walk || m.speed;
          speed = typeof spd === 'object' ? (spd.number ? `${spd.number} ft` : '') : (spd ? `${spd} ft` : '');
      }

      let typeStr = '';
      if (m.type) {
          typeStr = typeof m.type === 'object' ? m.type.type : m.type;
      }
      let crStr = '';
      if (m.cr) {
          crStr = typeof m.cr === 'object' ? m.cr.cr : m.cr;
      }
      let typeAndCr = [typeStr, crStr ? `CR ${crStr}` : ''].filter(Boolean).join(', ');

      let notes = [];
      const processEntryList = (list, tag) => {
          if (!Array.isArray(list)) return;
          list.forEach(entry => {
              if (!entry?.name) return;
              const rawDesc = processEntries ? processEntries(entry.entries || entry.entry || []) : '';
              const desc = cleanText ? cleanText(rawDesc) : rawDesc;
              notes.push(`${tag ? `[${tag}] ` : ''}${entry.name}: ${desc}`);
          });
      };

      processEntryList(m.trait, '');
      processEntryList(m.action, 'Action');
      processEntryList(m.bonus, 'Bonus Action');
      processEntryList(m.reaction, 'Reaction');
      processEntryList(m.legendary, 'Legendary Action');

      const newSummon = {
          name: m.name || '',
          type: typeAndCr,
          hp: hp,
          maxHp: hp,
          ac: ac,
          speed: speed,
          initiative: m.dex ? (m.dex - 10 >= 0 ? `+${Math.floor((m.dex - 10) / 2)}` : `${Math.floor((m.dex - 10) / 2)}`) : "+0",
          notes: notes.join('\n\n')
      };

      update({ summonsData: [...summons, newSummon] });
      setIsModalOpen(false);
  };

  const addSummon = () => {
    update({
      summonsData: [
        ...summons,
        {
          name: "",
          type: "",
          hp: 10,
          maxHp: 10,
          ac: 12,
          speed: "30 ft",
          initiative: "+0",
          notes: "",
        },
      ],
    });
  };

  return (
    <div>
      {summons.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "var(--ink-light)",
            fontStyle: "italic",
            padding: "16px 0",
          }}
        >
          No creatures tracked. Add one below.
        </div>
      )}
      {summons.map((s, i) => (
        <SummonCard
          key={i}
          summon={s}
          index={i}
          onUpdate={(ns) => updateSummon(i, ns)}
          onDelete={deleteSummon}
        />
      ))}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="add-feature-btn" style={{ flex: 1 }} onClick={addSummon}>
          + Add Blank
        </button>
        <button className="add-feature-btn" style={{ flex: 1 }} onClick={openSearch}>
          🔍 Search Creatures
        </button>
      </div>

      {isModalOpen && (
        <div className="info-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="info-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h3 className="info-modal-title" style={{ textAlign: "center", marginTop: 0 }}>Search Creatures</h3>
            <input
              type="text"
              placeholder="Search monsters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: 10, padding: 8, border: "1px solid var(--gold)", borderRadius: 4 }}
              autoFocus
            />
            <div style={{ overflowY: "auto", flex: 1, border: "1px solid var(--gold)", borderRadius: 4 }}>
              {loading ? (
                <div style={{ padding: 10, textAlign: "center", color: "var(--ink-light)" }}>Loading...</div>
              ) : filteredMonsters.length > 0 ? (
                filteredMonsters.map((m, idx) => {
                  const cr = m.cr ? (typeof m.cr === 'object' ? m.cr.cr : m.cr) : '?';
                  return (
                    <div
                      key={idx}
                      onClick={() => handleImportMonster(m)}
                      style={{ padding: "8px 10px", cursor: "pointer", borderBottom: "1px solid var(--gold-light)" }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--parchment-dark)'}
                      onMouseOut={e => e.currentTarget.style.background = ''}
                    >
                      <strong>{m.name}</strong> <span style={{ color: "var(--ink-light)", fontSize: "0.8rem" }}>[CR {cr}] {m.source || ''}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: 10, textAlign: "center", color: "var(--ink-light)" }}>No results found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
