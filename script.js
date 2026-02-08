/* =========================================
   1. CONSTANTS & DATA
   ========================================= */
const abilities = ["str", "dex", "con", "int", "wis", "cha"];

const skillsMap = {
  athletics: "str",
  acrobatics: "dex",
  sleight_of_hand: "dex",
  stealth: "dex",
  arcana: "int",
  history: "int",
  investigation: "int",
  nature: "int",
  religion: "int",
  animal_handling: "wis",
  insight: "wis",
  medicine: "wis",
  perception: "wis",
  survival: "wis",
  deception: "cha",
  intimidation: "cha",
  performance: "cha",
  persuasion: "cha",
};

const skillDescriptions = {
  athletics:
    "Covers difficult situations you encounter while climbing, jumping, or swimming.",
  acrobatics:
    "Covers your attempt to stay on your feet in a tricky situation (ice, tightrope, etc).",
  sleight_of_hand:
    "Checks manual trickery, such as planting something on someone else.",
  stealth: "Covers your ability to conceal yourself from enemies.",
  arcana:
    "Measures your ability to recall lore about spells, magic items, and planes.",
  history: "Measures your ability to recall lore about historical events.",
  investigation: "Looks around for clues and makes deductions based on them.",
  nature:
    "Measures your ability to recall lore about terrain, plants, and animals.",
  religion: "Measures your ability to recall lore about deities and rites.",
  animal_handling: "Checks your ability to calm down a domesticated animal.",
  insight:
    "Decides whether you can determine the true intentions of a creature.",
  medicine:
    "Allows you to try to stabilize a dying companion or diagnose an illness.",
  perception:
    "Lets you spot, hear, or otherwise detect the presence of something.",
  survival: "Allows you to follow tracks, hunt wild game, and predict weather.",
  deception: "Determines whether you can convincingly hide the truth.",
  intimidation: "Allows you to influence others through overt threats.",
  performance: "Determines how well you can delight an audience.",
  persuasion: "Attempts to influence someone with tact and social graces.",
  save_str:
    "Used to resist a force that would physically move or bind you (e.g. gusts of wind, nets, entanglement).",
  save_dex:
    "Used to dodge out of harm's way (e.g. fireballs, lightning bolts, breath weapons, traps).",
  save_con:
    "Used to endure a toxic or physically taxing effect (e.g. poison, disease, concentration checks).",
  save_int:
    "Used to disbelieve certain illusions or resist mental assaults that rely on logic, memory, or psyche.",
  save_wis:
    "Used to resist effects that charm, frighten, or assault your willpower and senses (e.g. domination).",
  save_cha:
    "Used to withstand effects, such as possession or banishment, that would subsume your personality or hurl you to another plane.",
};

const xpTable = [
  { xp: 0, lvl: 1, prof: 2 },
  { xp: 300, lvl: 2, prof: 2 },
  { xp: 900, lvl: 3, prof: 2 },
  { xp: 2700, lvl: 4, prof: 2 },
  { xp: 6500, lvl: 5, prof: 3 },
  { xp: 14000, lvl: 6, prof: 3 },
  { xp: 23000, lvl: 7, prof: 3 },
  { xp: 34000, lvl: 8, prof: 3 },
  { xp: 48000, lvl: 9, prof: 4 },
  { xp: 64000, lvl: 10, prof: 4 },
  { xp: 85000, lvl: 11, prof: 4 },
  { xp: 100000, lvl: 12, prof: 4 },
  { xp: 120000, lvl: 13, prof: 5 },
  { xp: 140000, lvl: 14, prof: 5 },
  { xp: 165000, lvl: 15, prof: 5 },
  { xp: 195000, lvl: 16, prof: 5 },
  { xp: 225000, lvl: 17, prof: 6 },
  { xp: 265000, lvl: 18, prof: 6 },
  { xp: 305000, lvl: 19, prof: 6 },
  { xp: 355000, lvl: 20, prof: 6 },
];

// Weapon Proficiencies Data
const weaponProficiencyOptions = [
  {
    category: "Categories",
    items: ["Simple Weapons", "Martial Weapons", "Firearms", "Shields"],
  },
  {
    category: "Properties/Groups",
    items: [
      "Finesse Weapons",
      "Heavy Weapons",
      "Light Weapons",
      "Reach Weapons",
      "Thrown Weapons",
      "Versatile Weapons",
    ],
  },
];

// Weapon DB
let dndWeaponsDB = {};

const conditionsDB = {
  Blinded:
    "You can't see. Attacks against you have Advantage. Your attacks have Disadvantage.",
  Charmed:
    "You can't attack the charmer. The charmer has Advantage on social checks against you.",
  Deafened: "You can't hear. You fail checks involving hearing.",
  Exhaustion:
    "Suffering from levels of exhaustion. 1: Disadv on checks. 2: Speed halved. 3: Disadv on attacks/saves. 4: HP max halved. 5: Speed 0. 6: Death.",
  Frightened:
    "Disadvantage on checks/attacks while source of fear is visible. Can't move closer to source.",
  Grappled:
    "Speed is 0. Ends if grappler is incapacitated or you are moved away.",
  Incapacitated: "You can't take actions or reactions.",
  Invisible:
    "You can't be seen. You have Advantage on attacks. Attacks against you have Disadvantage.",
  Paralyzed:
    "Incapacitated. Can't move/speak. Auto-fail Str/Dex saves. Attacks against you have Advantage and are crits if within 5ft.",
  Petrified:
    "Transformed to stone. Incapacitated. Resistant to all damage. Immune to poison/disease.",
  Poisoned: "Disadvantage on attack rolls and ability checks.",
  Prone:
    "Move at half speed. Attacks have Disadvantage. Melee attacks against you have Advantage; Ranged have Disadvantage.",
  Restrained:
    "Speed is 0. Attacks against you have Advantage. Your attacks have Disadvantage. Disadvantage on Dex saves.",
  Stunned:
    "Incapacitated. Can't move/speak. Fails Str/Dex saves. Attacks against you have Advantage.",
  Unconscious:
    "Incapacitated. Drop held items. Prone. Auto-fail Str/Dex saves. Attacks against you have Advantage and are crits if within 5ft.",
};

const conditionIcons = {
  Blinded: "🙈",
  Charmed: "❤️",
  Deafened: "🙉",
  Exhaustion: "😫",
  Frightened: "😱",
  Grappled: "🤼",
  Incapacitated: "🤕",
  Invisible: "👻",
  Paralyzed: "⚡",
  Petrified: "🗿",
  Poisoned: "🤢",
  Prone: "🛌",
  Restrained: "⛓️",
  Stunned: "💫",
  Unconscious: "💤",
};

// State Variables
const skillProficiency = {};
const saveProficiency = {};
const deathSaves = {
  successes: [false, false, false],
  failures: [false, false, false],
};
let spellSlotsData = [{ level: 1, total: 1, used: 0 }];
let resourcesData = [];
let pbScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
const pbCosts = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const maxPoints = 27;

window.isInitializing = true;

/* =========================================
      2. FUNCTIONS
      ========================================= */

function calcMod(score) {
  return Math.floor((score - 10) / 2);
}
function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Helper to process entries recursively (Global)
window.processEntries = function (entries) {
  if (!entries) return "";
  if (typeof entries === "string") return entries;
  if (Array.isArray(entries))
    return entries.map((e) => window.processEntries(e)).join("<br><br>");

  if (entries.type === "list") {
    return (
      "<ul>" +
      (entries.items || [])
        .map((i) => `<li>${window.processEntries(i)}</li>`)
        .join("") +
      "</ul>"
    );
  }
  if (entries.type === "table") {
    let html =
      "<div style='overflow-x:auto;'><table class='currency-table' style='width:100%; font-size:0.8rem; margin-top:5px;'>";
    if (entries.colLabels) {
      html +=
        "<thead><tr>" +
        entries.colLabels
          .map((l) => `<th>${window.processEntries(l)}</th>`)
          .join("") +
        "</tr></thead>";
    }
    if (entries.rows) {
      html +=
        "<tbody>" +
        entries.rows
          .map(
            (row) =>
              "<tr>" +
              row
                .map((cell) => `<td>${window.processEntries(cell)}</td>`)
                .join("") +
              "</tr>",
          )
          .join("") +
        "</tbody>";
    }
    html += "</table></div>";
    return html;
  }

  let text = "";
  if (entries.name) text += `<strong>${entries.name}.</strong> `;
  if (entries.entries) text += window.processEntries(entries.entries);
  return text || entries.text || "";
};

// Auto-resize logic
function autoResizeTextarea(element) {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
}
document.addEventListener("input", function (event) {
  if (
    event.target.tagName.toLowerCase() === "textarea" &&
    event.target.id !== "lastSavedTextarea" &&
    !event.target.classList.contains("note-textarea")
  ) {
    autoResizeTextarea(event.target);
  }
});
function resizeAllTextareas() {
  document
    .querySelectorAll("textarea:not(#lastSavedTextarea)")
    .forEach(autoResizeTextarea);
}

// Update Logic
window.updateModifiers = function () {
  const profBonus = parseInt(document.getElementById("profBonus").value) || 0;
  abilities.forEach((ability) => {
    const score = parseInt(document.getElementById(ability).value) || 10;
    const mod = calcMod(score);
    document.getElementById(`${ability}Mod`).value = formatMod(mod);
    const isSaveProf = saveProficiency[ability] || false;
    const saveTotal = mod + (isSaveProf ? profBonus : 0);
    const saveEl = document.getElementById(`saveMod_${ability}`);
    if (saveEl) saveEl.textContent = formatMod(saveTotal);
  });
  Object.keys(skillsMap).forEach((skillName) => {
    const ability = skillsMap[skillName];
    const abilityScore = parseInt(document.getElementById(ability).value) || 10;
    const abilityMod = calcMod(abilityScore);
    const isProf = skillProficiency[skillName] || false;
    const total = abilityMod + (isProf ? profBonus : 0);
    const skillEl = document.getElementById(`skillMod_${skillName}`);
    if (skillEl) skillEl.textContent = formatMod(total);
  });
  updateCombatStats();
  updateSpellDC();
  updateAllWeaponStats();
};

window.updateAllWeaponStats = function () {
  const str = parseInt(document.getElementById("str").value) || 10;
  const dex = parseInt(document.getElementById("dex").value) || 10;
  const strMod = Math.floor((str - 10) / 2);
  const dexMod = Math.floor((dex - 10) / 2);
  const profBonus = parseInt(document.getElementById("profBonus").value) || 2;
  const profString = document.getElementById("weaponProfs").value || "";

  document.querySelectorAll(".weapon-item").forEach((row) => {
    const nameInput = row.querySelector(".weapon-name");
    const weaponName = nameInput.value;
    const weaponData = dndWeaponsDB[weaponName];
    if (!weaponData) return;
    let abilityMod = strMod;
    if (weaponData.props.includes("Finesse")) {
      abilityMod = Math.max(strMod, dexMod);
    } else if (
      weaponData.cat === "Ranged" &&
      !weaponData.props.some((p) => p.includes("Thrown"))
    ) {
      abilityMod = dexMod;
    }

    let isProficient = false;
    if (weaponData.type === "Simple" && profString.includes("Simple Weapons"))
      isProficient = true;
    if (weaponData.type === "Martial" && profString.includes("Martial Weapons"))
      isProficient = true;
    if (profString.includes(weaponName)) isProficient = true;

    const totalAtk = abilityMod + (isProficient ? profBonus : 0);
    const totalDmg = abilityMod;
    const atkString = totalAtk >= 0 ? `+${totalAtk}` : `${totalAtk}`;
    const dmgString = `${weaponData.dmg} ${totalDmg >= 0 ? "+" : ""}${totalDmg} ${weaponData.dtype}`;
    row.querySelector(".weapon-atk").value = atkString;
    row.querySelector(".weapon-damage").value = dmgString;
  });
  saveCharacter();
};

function updateCombatStats() {
  const dexScore = parseInt(document.getElementById("dex").value) || 10;
  document.getElementById("initiative").value = formatMod(calcMod(dexScore));
}

function updateSpellDC() {
  const spellAbilityEl = document.getElementById("spellAbility");
  if (!spellAbilityEl) return;
  const spellAbility = spellAbilityEl.value;
  if (!spellAbility) return;

  const abilityInput = document.getElementById(spellAbility);
  if (!abilityInput) return;

  const abilityScore = parseInt(abilityInput.value) || 10;
  const abilityMod = calcMod(abilityScore);
  const profBonus = parseInt(document.getElementById("profBonus").value) || 0;

  const dcEl = document.getElementById("spellDC");
  if (dcEl) dcEl.value = 8 + profBonus + abilityMod;

  const totalAtk = abilityMod + profBonus;
  const atkEl = document.getElementById("spellAttackBonus");
  if (atkEl) {
    if (atkEl.tagName === "INPUT" || atkEl.tagName === "TEXTAREA") {
      if (atkEl.type === "number") atkEl.value = totalAtk;
      else atkEl.value = totalAtk >= 0 ? `+${totalAtk}` : totalAtk;
    } else {
      atkEl.textContent = totalAtk >= 0 ? `+${totalAtk}` : totalAtk;
    }
  }

  const modEl = document.getElementById("spellAttackMod");
  if (modEl) {
    if (modEl.tagName === "INPUT" || modEl.tagName === "TEXTAREA") {
      if (modEl.type === "number") modEl.value = abilityMod;
      else modEl.value = abilityMod >= 0 ? `+${abilityMod}` : abilityMod;
    } else {
      modEl.textContent = abilityMod >= 0 ? `+${abilityMod}` : abilityMod;
    }
  }

  saveCharacter();
}

window.calculateTotalAC = function () {
  const acInput = document.getElementById("baseAC");
  const shieldBox = document.getElementById("shieldEquipped");
  let currentVal = parseInt(acInput.value) || 10;
  if (shieldBox.checked) {
    acInput.value = currentVal + 2;
  } else {
    acInput.value = currentVal - 2;
  }
  saveCharacter();
};

window.calculateWeight = function () {
  let total = 0;
  document.querySelectorAll(".inventory-item").forEach((row) => {
    const qty = parseFloat(row.querySelector(".qty-field").value) || 0;
    const weight = parseFloat(row.querySelector(".weight-field").value) || 0;
    total += qty * weight;
  });
  const strScore = parseInt(document.getElementById("str").value) || 0;
  const sizeSelect = document.getElementById("charSize");
  const size = sizeSelect ? sizeSelect.value : "Medium";
  let multiplier = 15;
  switch (size) {
    case "Tiny":
      multiplier = 7.5;
      break;
    case "Large":
      multiplier = 30;
      break;
    case "Huge":
      multiplier = 60;
      break;
    case "Gargantuan":
      multiplier = 120;
      break;
  }
  const maxCapacity = Math.floor(strScore * multiplier);
  document.getElementById("totalWeightVal").textContent = total.toFixed(1);
  document.getElementById("maxWeightVal").textContent = maxCapacity;
  const dragSpan = document.getElementById("maxDragVal");
  if (dragSpan) dragSpan.textContent = maxCapacity * 2;

  const weightBox = document.querySelector(".total-weight-box");
  if (total > maxCapacity) {
    weightBox.style.color = "#8b0000";
    weightBox.style.borderColor = "#8b0000";
    weightBox.style.backgroundColor = "#ffdddd";
    weightBox.style.fontWeight = "800";
  } else {
    weightBox.style.color = "var(--ink)";
    weightBox.style.borderColor = "var(--gold)";
    weightBox.style.backgroundColor = "var(--parchment-dark)";
    weightBox.style.fontWeight = "700";
  }
};

// HP & Toggles
window.updateHpBar = function () {
  const current = parseInt(document.getElementById("hp").value) || 0;
  const max = parseInt(document.getElementById("maxHp").value) || 1;
  const temp = parseInt(document.getElementById("tempHp").value) || 0;
  const currentPct = Math.min(100, Math.max(0, (current / max) * 100));
  const tempPct = Math.min(100, (temp / max) * 100);
  const hpBarCurrent = document.getElementById("hpBarCurrent");
  const hpBarTemp = document.getElementById("hpBarTemp");
  if (current >= max) {
    hpBarCurrent.style.width = `${currentPct}%`;
    hpBarTemp.style.width = `${tempPct}%`;
    hpBarTemp.style.left = "0%";
  } else {
    hpBarCurrent.style.width = `${currentPct}%`;
    hpBarTemp.style.width = `${Math.min(tempPct, 100 - currentPct)}%`;
    hpBarTemp.style.left = `${currentPct}%`;
  }
  document.getElementById("hpTextDisplay").textContent =
    current + (temp > 0 ? ` (+${temp})` : "");
  document.getElementById("maxHpTextDisplay").textContent = max;
};

window.adjustHP = function (amount) {
  const hpInput = document.getElementById("hp");
  hpInput.value = (parseInt(hpInput.value) || 0) + amount;
  updateHpBar();
  saveCharacter();
};
window.adjustTempHP = function (amount) {
  const tempInput = document.getElementById("tempHp");
  let val = (parseInt(tempInput.value) || 0) + amount;
  if (val < 0) val = 0;
  tempInput.value = val;
  updateHpBar();
  saveCharacter();
};
window.toggleSkill = function (skillName) {
  skillProficiency[skillName] = !skillProficiency[skillName];
  document
    .getElementById(`skillCheck_${skillName}`)
    ?.classList.toggle("checked", skillProficiency[skillName]);
  updateModifiers();
  saveCharacter();
};
window.toggleSave = function (ability) {
  saveProficiency[ability] = !saveProficiency[ability];
  document
    .getElementById(`saveCheck_${ability}`)
    ?.classList.toggle("checked", saveProficiency[ability]);
  updateModifiers();
  saveCharacter();
};
window.toggleDeathSave = function (type, index) {
  const arr = type === "success" ? deathSaves.successes : deathSaves.failures;
  arr[index] = !arr[index];
  document
    .getElementById(
      type === "success" ? `deathSuccess${index}` : `deathFailure${index}`,
    )
    .classList.toggle("checked", arr[index]);
  saveCharacter();
};
window.switchTab = function (tabName) {
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  const content = document.getElementById(tabName);
  if (content) content.classList.add("active");

  // Find the tab button that controls this tab and activate it
  const tabBtn = document.querySelector(`.tab[onclick*="'${tabName}'"]`);
  if (tabBtn) tabBtn.classList.add("active");
};

window.addFeatureItem = function (containerId, title = "", desc = "") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isCompact = [
    "actionsContainer",
    "bonusActionsContainer",
    "reactionsContainer",
  ].includes(containerId);

  const box = document.createElement("div");
  box.className = "feature-box";

  if (isCompact) {
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "space-between";
    box.style.padding = "8px";
    box.style.gap = "8px";
  }

  // Header with Textarea for Title (allows wrapping)
  const header = document.createElement("div");
  header.className = "feature-header";

  if (isCompact) {
    header.style.borderBottom = "none";
    header.style.marginBottom = "0";
    header.style.paddingBottom = "0";
    header.style.flexGrow = "1";
  }

  const titleInput = document.createElement("textarea");
  titleInput.className = "feature-title-input";
  titleInput.placeholder = "Feature Name";
  titleInput.rows = 1;
  titleInput.value = title;
  titleInput.oninput = function () {
    saveCharacter();
    autoResizeTextarea(this);
  };

  if (isCompact) {
    titleInput.style.width = "100%";
  }

  const delBtn = document.createElement("button");
  delBtn.className = "delete-feature-btn";
  delBtn.innerHTML = "×";
  delBtn.onclick = function () {
    box.remove();
    saveCharacter();
  };

  header.appendChild(titleInput);

  if (!isCompact) {
    header.appendChild(delBtn);
  }

  box.appendChild(header);

  const descContainer = document.createElement("div");
  descContainer.className = "feature-desc-container";

  const display = document.createElement("div");
  display.className = "feature-desc-display";
  display.style.fontSize = "0.9rem";
  display.style.color = "var(--ink)";
  display.style.lineHeight = "1.4";
  // Replace newlines with <br> for display if it's plain text, but trust HTML if present
  display.innerHTML = desc
    ? desc.replace(/\n/g, "<br>")
    : "<em style='color:#999'>Click to edit description...</em>";

  const input = document.createElement("textarea");
  input.className = "feature-desc-input";
  input.style.display = "none";
  input.value = desc;

  descContainer.appendChild(display);
  descContainer.appendChild(input);

  if (isCompact) {
    descContainer.style.display = "none";

    // Add Info Button for Compact Mode
    const infoBtn = document.createElement("button");
    infoBtn.className = "skill-info-btn";
    infoBtn.innerHTML = "?";
    infoBtn.title = "View Description";
    infoBtn.style.marginRight = "4px";
    infoBtn.style.flexShrink = "0";

    infoBtn.onclick = function () {
      const titleVal = titleInput.value;
      openNoteEditor(
        titleVal || "Feature Description",
        input,
        null,
        (newVal) => {
          display.innerHTML = newVal
            ? newVal.replace(/\n/g, "<br>")
            : "<em style='color:#999'>Click to edit description...</em>";
        },
      );
    };

    box.appendChild(infoBtn);
    box.appendChild(delBtn);
  } else {
    descContainer.style.cursor = "pointer";
    descContainer.style.minHeight = "20px";
    descContainer.onclick = function () {
      const titleVal = titleInput.value;
      openNoteEditor(
        titleVal || "Feature Description",
        input,
        null,
        (newVal) => {
          display.innerHTML = newVal
            ? newVal.replace(/\n/g, "<br>")
            : "<em style='color:#999'>Click to edit description...</em>";
        },
      );
    };
    box.appendChild(descContainer);
  }

  container.appendChild(box);
  autoResizeTextarea(titleInput); // Initial resize
  saveCharacter();
};

// Drag & Drop
function setupDragItem(item, containerId) {
  const handle = item.querySelector(".drag-handle");
  const container = document.getElementById(containerId);
  if (!handle || !container) return;
  item.draggable = true;
  item.addEventListener("dragstart", () => item.classList.add("dragging"));
  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
    saveCharacter();
  });
  handle.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      item.classList.add("dragging");
    },
    { passive: false },
  );
  handle.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const afterElement = getDragAfterElement(container, touch.clientY);
      if (afterElement == null) {
        container.appendChild(item);
      } else {
        container.insertBefore(item, afterElement);
      }
    },
    { passive: false },
  );
  handle.addEventListener("touchend", (e) => {
    item.classList.remove("dragging");
    saveCharacter();
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(
      ".inventory-item:not(.dragging), .spell-row:not(.dragging)",
    ),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

/* =========================================
      3. INVENTORY & NOTES
      ========================================= */
window.addInventoryItem = function (
  name = "",
  qty = 1,
  weight = 0,
  isEquipped = false,
  description = "",
  skipSave = false,
) {
  const listId = isEquipped ? "equippedList" : "inventoryList";
  const list = document.getElementById(listId);
  const div = document.createElement("div");
  div.className = "inventory-item";

  // Hidden Input for Description
  const descInput = document.createElement("input");
  descInput.type = "hidden";
  descInput.className = "desc-field";
  descInput.value = description || "";

  // Drag Handle
  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.innerHTML = "☰";

  // Equip Check
  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "equip-check";
  check.checked = isEquipped;
  check.title = "Equip/Unequip";
  check.onchange = function () {
    // Logic to move item between lists
    div.remove();
    addInventoryItem(
      nameInput.value,
      qtyInput.value,
      weightInput.value,
      !isEquipped,
      descInput.value,
    );
    calculateWeight();
    saveCharacter();
  };

  // Fields
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "name-field";
  nameInput.placeholder = "Item Name";
  nameInput.value = name;
  nameInput.oninput = saveCharacter;
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.className = "qty-field";
  qtyInput.placeholder = "Qty";
  qtyInput.value = qty;
  qtyInput.oninput = () => {
    calculateWeight();
    saveCharacter();
  };
  const weightInput = document.createElement("input");
  weightInput.type = "number";
  weightInput.className = "weight-field";
  weightInput.placeholder = "Lbs";
  weightInput.value = weight;
  weightInput.oninput = () => {
    calculateWeight();
    saveCharacter();
  };

  // Note Button
  const noteBtn = document.createElement("button");
  noteBtn.className = "note-btn";
  noteBtn.innerHTML = "📝";
  noteBtn.title = "View/Edit Notes";
  if (description && description.trim().length > 0) {
    noteBtn.classList.add("has-notes");
  }
  noteBtn.onclick = function () {
    openNoteEditor(nameInput.value, descInput, noteBtn);
  };

  // Delete
  const delBtn = document.createElement("button");
  delBtn.innerText = "×";
  delBtn.className = "delete-btn";
  delBtn.onclick = function () {
    if (confirm("Delete item?")) {
      div.remove();
      calculateWeight();
      saveCharacter();
    }
  };

  div.appendChild(dragHandle);
  div.appendChild(check);
  div.appendChild(nameInput);
  div.appendChild(qtyInput);
  div.appendChild(weightInput);
  div.appendChild(noteBtn);
  div.appendChild(delBtn);
  list.appendChild(div);
  setupDragItem(div, listId);
  calculateWeight();
  if (!skipSave) saveCharacter();
};

window.openNoteEditor = function (
  itemName,
  inputElement,
  btnElement,
  callback,
) {
  const existing = document.getElementById("note-modal-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "note-modal-overlay";
  overlay.className = "note-modal-overlay";
  const box = document.createElement("div");
  box.className = "note-modal";
  const header = document.createElement("h3");
  header.style.margin = "0 0 10px 0";
  header.style.borderBottom = "1px solid #8b2e2e";
  header.innerText = itemName || "Item Notes";
  const displayDiv = document.createElement("div");
  displayDiv.className = "note-display";
  displayDiv.innerHTML =
    inputElement.value || "<em style='color:#999'>No notes...</em>";
  const textArea = document.createElement("textarea");
  textArea.className = "note-textarea";
  textArea.value = inputElement.value;
  const controls = document.createElement("div");
  controls.className = "note-controls";

  const editBtn = document.createElement("button");
  editBtn.innerText = "Edit Text";
  editBtn.className = "btn btn-secondary";
  editBtn.style.padding = "5px 10px";
  editBtn.style.fontSize = "0.8rem";
  const saveBtn = document.createElement("button");
  saveBtn.innerText = "Save & Close";
  saveBtn.className = "btn";
  saveBtn.style.padding = "5px 15px";
  saveBtn.style.fontSize = "0.9rem";

  let isEditing = false;
  editBtn.onclick = () => {
    isEditing = !isEditing;
    if (isEditing) {
      displayDiv.style.display = "none";
      textArea.style.display = "block";
      editBtn.innerText = "View Rendered";
      textArea.focus();
    } else {
      displayDiv.innerHTML =
        textArea.value || "<em style='color:#999'>No notes...</em>";
      displayDiv.style.display = "block";
      textArea.style.display = "none";
      editBtn.innerText = "Edit Text";
    }
  };
  saveBtn.onclick = () => {
    inputElement.value = textArea.value;
    if (btnElement) {
      if (textArea.value.trim().length > 0) {
        btnElement.classList.add("has-notes");
      } else {
        btnElement.classList.remove("has-notes");
      }
    }
    if (callback) callback(textArea.value);
    saveCharacter();
    overlay.remove();
  };
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Cancel";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => overlay.remove();

  controls.appendChild(editBtn);
  controls.appendChild(closeBtn);
  controls.appendChild(saveBtn);
  box.appendChild(header);
  box.appendChild(displayDiv);
  box.appendChild(textArea);
  box.appendChild(controls);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

/* =========================================
      ITEM SEARCH (IndexedDB)
      ========================================= */
const DB_NAME = "DndDataDB";
const STORE_NAME = "files";
const DB_VERSION = 7;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      console.error("IndexedDB open error:", request.error);
      reject(request.error);
    };
    request.onsuccess = () => resolve(request.result);
    request.onblocked = (e) => {
      console.warn("IndexedDB blocked. Please close other tabs.");
      alert(
        "Database upgrade blocked. Please close other tabs with this site open and reload.",
      );
    };
    request.onupgradeneeded = (e) => {
      console.log(
        `IndexedDB upgrade needed: ${e.oldVersion} -> ${e.newVersion}`,
      );
      const db = e.target.result;
      if (db.objectStoreNames.contains(STORE_NAME))
        db.deleteObjectStore(STORE_NAME);
      db.createObjectStore(STORE_NAME);
    };
  });
}

function loadWeaponsFromData(parsedData) {
  if (!parsedData) return;
  parsedData.forEach((json) => {
    try {
      if (json.baseitem && Array.isArray(json.baseitem)) {
        json.baseitem.forEach((item) => {
          if (item.weaponCategory) {
            const name = item.name;
            const type =
              item.weaponCategory.toLowerCase() === "martial"
                ? "Martial"
                : "Simple";
            const rawType = (item.type || "").split("|")[0];
            const cat = rawType === "R" || rawType === "F" ? "Ranged" : "Melee";
            const dmg = item.dmg1 || "";
            const dmgTypeMap = {
              S: "slashing",
              P: "piercing",
              B: "bludgeoning",
            };
            const dtype = dmgTypeMap[item.dmgType] || item.dmgType || "";

            const propMap = {
              L: "Light",
              F: "Finesse",
              T: "Thrown",
              "2H": "Two-Handed",
              H: "Heavy",
              R: "Reach",
              V: "Versatile",
              LD: "Loading",
              A: "Ammunition",
            };

            const props = [];
            if (item.property) {
              item.property.forEach((p) => {
                const pStr = typeof p === "string" ? p : p.uid || p.name || "";
                const cleanP = pStr.split("|")[0];
                let propName = propMap[cleanP] || cleanP;
                if (cleanP === "T" || cleanP === "A") {
                  if (item.range) {
                    if (typeof item.range === "string") {
                      propName += ` (${item.range})`;
                    } else if (item.range.normal) {
                      propName += ` (${item.range.normal}/${item.range.long})`;
                    }
                  }
                }
                if (cleanP === "V" && item.dmg2) {
                  propName += ` (${item.dmg2})`;
                }
                props.push(propName);
              });
            }

            let mastery = item.mastery || null;
            if (Array.isArray(mastery)) mastery = mastery[0];
            if (mastery) mastery = mastery.split("|")[0];
            dndWeaponsDB[name] = { type, cat, dmg, dtype, props, mastery };
          }
        });
      }
    } catch (e) {
      console.error("Error parsing weapon data:", e);
    }
  });
}

function loadActionsFromData(parsedData) {
  if (!parsedData) return;
  let actions = [];
  parsedData.forEach((json) => {
    try {
      if (json.action && Array.isArray(json.action)) {
        actions.push(...json.action);
      }
    } catch (e) {}
  });

  if (actions.length > 0) {
    // Deduplicate preferring XPHB
    const uniqueActions = new Map();
    actions.forEach((a) => {
      if (!uniqueActions.has(a.name)) uniqueActions.set(a.name, a);
      else {
        const existing = uniqueActions.get(a.name);
        if (a.source === "XPHB") uniqueActions.set(a.name, a);
      }
    });
    window.injectCombatActions(
      Array.from(uniqueActions.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
  }
}

async function checkDataUploadStatus() {
  console.log(`Checking data upload status (DB v${DB_VERSION})...`);
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get("currentData");
    req.onsuccess = () => {
      if (req.result) {
        const parsedData = [];
        req.result.forEach((file) => {
          if (file.name.toLowerCase().endsWith(".json")) {
            try {
              parsedData.push(JSON.parse(file.content));
            } catch (e) {}
          }
        });
        loadWeaponsFromData(parsedData);
        loadActionsFromData(parsedData);
      }
      const btnItems = document.getElementById("btn-search-items-zip");
      const btnCantrips = document.getElementById("btn-search-cantrips-zip");
      const btnSpells = document.getElementById("btn-search-spells-zip");
      const hasData = !!req.result;

      console.log("DB Query Result:", hasData ? "Data Found" : "Empty");

      // Toggle Buttons
      if (hasData) {
        if (btnItems) btnItems.style.display = "inline-block";
        if (btnCantrips) btnCantrips.style.display = "inline-block";
        if (btnSpells) btnSpells.style.display = "inline-block";
      } else {
        if (btnItems) btnItems.style.display = "none";
        if (btnCantrips) btnCantrips.style.display = "none";
        if (btnSpells) btnSpells.style.display = "none";
      }

      // Toggle Weapon Proficiency Input Mode
      const selectorDiv = document.getElementById("weaponProfsSelector");
      const textInput = document.querySelector(".weapon-profs-text");

      if (selectorDiv && textInput) {
        const hiddenInput = selectorDiv.querySelector('input[type="hidden"]');
        if (hasData) {
          // Show Selector, Hide Text
          selectorDiv.style.display = "block";
          textInput.style.display = "none";
          // Ensure ID 'weaponProfs' is on the hidden input for save/load compatibility
          if (textInput.id === "weaponProfs") {
            textInput.id = "weaponProfsText";
            hiddenInput.id = "weaponProfs";
            hiddenInput.value = textInput.value; // Sync value
            if (window.renderWeaponTags) window.renderWeaponTags();
          }
        } else {
          // Show Text, Hide Selector
          selectorDiv.style.display = "none";
          textInput.style.display = "block";
          // Ensure ID 'weaponProfs' is on the text input
          if (hiddenInput.id === "weaponProfs") {
            hiddenInput.id = "weaponProfsHidden";
            textInput.id = "weaponProfs";
            textInput.value = hiddenInput.value; // Sync value
          }
        }
      }

      // Toggle Weapon Attack Inputs
      window.isDataAvailable = hasData;
      document.querySelectorAll(".weapon-name").forEach((input) => {
        if (hasData) {
          input.setAttribute("readonly", "true");
          input.setAttribute("onclick", "openWeaponPicker(this)");
          input.onclick = function () {
            openWeaponPicker(this);
          };
          input.style.cursor = "pointer";
          input.style.color = "var(--red-dark)";
          input.placeholder = "Click to select...";
        } else {
          input.removeAttribute("readonly");
          input.removeAttribute("onclick");
          input.onclick = null;
          input.style.cursor = "text";
          input.style.color = "var(--ink)";
          input.placeholder = "Enter weapon name";
        }
      });
    };
    req.onerror = (e) => {
      console.error("Error reading from object store:", e);
    };
  } catch (e) {
    console.error("Error checking data status:", e);
  }
}

let allItemsCache = [];
let currentSearchResults = [];
let itemSearchPage = 1;
const ITEMS_PER_PAGE = 50;

window.openItemSearch = async function () {
  document.getElementById("itemSearchModal").style.display = "flex";
  document.getElementById("itemSearchInput").value = "";
  const list = document.getElementById("itemSearchList");
  list.innerHTML =
    '<div style="padding:10px; color:#666; text-align:center;">Loading items library...</div>';
  document.getElementById("itemSearchPagination").style.display = "none";

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
      list.innerHTML =
        '<div style="padding:10px; color:#666; text-align:center;">No data found. Please upload a file in Data Viewer.</div>';
      return;
    }

    const parsedData = [];
    data.forEach((file) => {
      if (file.name.toLowerCase().endsWith(".json")) {
        try {
          parsedData.push(JSON.parse(file.content));
        } catch (e) {}
      }
    });

    const results = [];
    parsedData.forEach((json) => {
      try {
        // Strict filtering: Only look in known item arrays to avoid monsters/spells/adventures
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
            arr.forEach((item) => {
              if (item.name && typeof item.name === "string") {
                results.push(item);
              }
            });
          }
        });
      } catch (e) {}
    });

    // Deduplicate by name
    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.name, item])).values(),
    );
    // Sort
    uniqueResults.sort((a, b) => a.name.localeCompare(b.name));

    allItemsCache = uniqueResults;
    currentSearchResults = allItemsCache;
    itemSearchPage = 1;

    renderItemSearchPage();
    document.getElementById("itemSearchInput").focus();
  } catch (e) {
    console.error(e);
    list.innerHTML =
      '<div style="padding:10px; color:red; text-align:center;">Error loading database.</div>';
  }
};

window.closeItemSearch = function () {
  document.getElementById("itemSearchModal").style.display = "none";
};

window.filterItemSearch = function () {
  const term = document.getElementById("itemSearchInput").value.toLowerCase();
  if (!term) {
    currentSearchResults = allItemsCache;
  } else {
    currentSearchResults = allItemsCache.filter((item) =>
      item.name.toLowerCase().includes(term),
    );
  }
  itemSearchPage = 1;
  renderItemSearchPage();
};

window.changeItemSearchPage = function (delta) {
  const maxPage = Math.ceil(currentSearchResults.length / ITEMS_PER_PAGE);
  const newPage = itemSearchPage + delta;
  if (newPage >= 1 && newPage <= maxPage) {
    itemSearchPage = newPage;
    renderItemSearchPage();
    document.getElementById("itemSearchList").scrollTop = 0;
  }
};

function renderItemSearchPage() {
  const list = document.getElementById("itemSearchList");
  const pagination = document.getElementById("itemSearchPagination");
  const pageInfo = document.getElementById("itemSearchPageInfo");

  if (currentSearchResults.length === 0) {
    list.innerHTML =
      '<div style="padding:10px; color:#666; text-align:center;">No matching items found.</div>';
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";
  const maxPage = Math.ceil(currentSearchResults.length / ITEMS_PER_PAGE);
  pageInfo.textContent = `Page ${itemSearchPage} of ${maxPage}`;

  const startIndex = (itemSearchPage - 1) * ITEMS_PER_PAGE;
  const itemsToShow = currentSearchResults.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  list.innerHTML = "";

  // Helper to clean 5e-tools style tags
  const cleanText = (str) => {
    if (!str) return "";
    return str.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => {
      if (!content) return "";
      return content.split("|")[0];
    });
  };

  itemsToShow.forEach((item) => {
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.style.flexDirection = "column";
    div.style.alignItems = "flex-start";

    const weight = item.weight || item.weight_lbs || 0;
    let desc = "";

    // Recursively extract text from entries array
    const processEntries = (entries) => {
      if (!entries) return "";
      if (typeof entries === "string") return entries;
      if (!Array.isArray(entries)) return "";

      return entries
        .map((e) => {
          if (!e) return "";
          if (typeof e === "string") return e;

          let text = "";
          if (e.name && (e.type === "section" || e.type === "entries"))
            text += `${e.name}. `;

          if (e.entries) text += processEntries(e.entries);
          else if (e.items) text += processEntries(e.items);
          else if (e.entry)
            text +=
              typeof e.entry === "string" ? e.entry : processEntries([e.entry]);
          else if (e.caption) text += e.caption;
          else if (e.text) text += e.text;

          return text;
        })
        .join("\n");
    };

    if (item.entries) desc = processEntries(item.entries);
    if (!desc && item.inherits && item.inherits.entries)
      desc = processEntries(item.inherits.entries);
    if (!desc && item.description) desc = item.description;
    if (!desc && item.text) desc = item.text;

    // Clean the description
    desc = cleanText(desc);

    // Format description for preview
    let previewDesc =
      typeof desc === "string" ? desc.replace(/<[^>]*>/g, "") : "See notes";
    if (previewDesc.length > 80)
      previewDesc = previewDesc.substring(0, 80) + "...";

    div.innerHTML = `
               <div style="font-weight:bold; width:100%; display:flex; justify-content:space-between;">
                   <span>${item.name}</span>
                   <span style="font-size:0.8rem; color:var(--ink-light);">${weight} lbs</span>
               </div>
               <div style="font-size:0.8rem; color:var(--ink-light); margin-top:4px;">${previewDesc}</div>
           `;
    div.onclick = () => {
      addInventoryItem(item.name, 1, weight, false, desc);
      closeItemSearch();
    };
    list.appendChild(div);
  });
}

/* =========================================
      SPELL SEARCH (IndexedDB)
      ========================================= */
let allSpellsCache = [];
let currentSpellResults = [];
let spellSearchPage = 1;
let spellTargetContainer = "";
let spellSearchFilterType = ""; // 'cantrip' or 'leveled'

window.openSpellSearch = async function (containerId, filterType) {
  spellTargetContainer = containerId;
  spellSearchFilterType = filterType;
  document.getElementById("spellSearchModal").style.display = "flex";
  document.getElementById("spellSearchInput").value = "";
  document.getElementById("spellSearchSort").value = "name-asc";

  // Reset and setup filters
  const levelSelect = document.getElementById("spellSearchLevel");
  const classSelect = document.getElementById("spellSearchClass");
  classSelect.innerHTML = '<option value="">All Classes</option>';

  if (filterType === "cantrip") {
    levelSelect.value = "0";
    levelSelect.disabled = true;
    levelSelect.style.opacity = "0.5";
  } else {
    levelSelect.value = "";
    levelSelect.disabled = false;
    levelSelect.style.opacity = "1";
  }

  const list = document.getElementById("spellSearchList");
  list.innerHTML =
    '<div style="padding:10px; color:#666; text-align:center;">Loading spells library...</div>';
  document.getElementById("spellSearchPagination").style.display = "none";

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
      list.innerHTML =
        '<div style="padding:10px; color:#666; text-align:center;">No data found. Please upload a file in Data Viewer.</div>';
      return;
    }

    const parsedData = [];
    data.forEach((file) => {
      if (file.name.toLowerCase().endsWith(".json")) {
        try {
          parsedData.push(JSON.parse(file.content));
        } catch (e) {}
      }
    });

    // Pass 1: Build Spell Class Map from Book Data
    const spellClassMap = {};

    const processBookEntries = (entries, currentClass = null) => {
      if (!entries || !Array.isArray(entries)) return;
      entries.forEach((entry) => {
        if (!entry) return;
        let className = currentClass;
        if (
          entry.name &&
          typeof entry.name === "string" &&
          entry.name.endsWith(" Spells")
        ) {
          className = entry.name.replace(" Spells", "").trim();
        }

        if (className) {
          if (entry.items && Array.isArray(entry.items)) {
            entry.items.forEach((item) => {
              const itemStr = typeof item === "string" ? item : item.name || "";
              const match = /{@spell ([^}|]+)/.exec(itemStr);
              if (match) {
                const spellName = match[1].toLowerCase().trim();
                if (!spellClassMap[spellName])
                  spellClassMap[spellName] = new Set();
                spellClassMap[spellName].add(className);
              }
            });
          }
        }

        if (entry.entries) processBookEntries(entry.entries, className);
      });
    };

    parsedData.forEach((json) => {
      if (json.data && Array.isArray(json.data)) {
        processBookEntries(json.data);
      }
    });

    const results = [];
    parsedData.forEach((json) => {
      try {
        // console.log("Spell Data:", json);
        let arraysToCheck = [json.spell, json.spells, json.data];
        if (Array.isArray(json)) arraysToCheck.push(json);

        arraysToCheck.forEach((arr) => {
          if (Array.isArray(arr)) {
            arr.forEach((spell) => {
              if (spell.name && typeof spell.name === "string") {
                // Enrich with class info from book if available
                const mappedClasses =
                  spellClassMap[spell.name.toLowerCase().trim()];
                if (mappedClasses) {
                  if (!spell.classes) {
                    spell.classes = Array.from(mappedClasses);
                  } else if (Array.isArray(spell.classes)) {
                    mappedClasses.forEach((c) => {
                      if (
                        !spell.classes.some(
                          (existing) =>
                            (typeof existing === "string"
                              ? existing
                              : existing.name) === c,
                        )
                      ) {
                        spell.classes.push(c);
                      }
                    });
                  } else if (typeof spell.classes === "object") {
                    if (!spell.classes.fromClassList)
                      spell.classes.fromClassList = [];
                    mappedClasses.forEach((c) => {
                      if (
                        !spell.classes.fromClassList.some((cl) => cl.name === c)
                      ) {
                        spell.classes.fromClassList.push({
                          name: c,
                          source: "PHB",
                        });
                      }
                    });
                  }
                }

                // Filter based on type
                if (spellSearchFilterType === "cantrip" && spell.level === 0) {
                  results.push(spell);
                } else if (
                  spellSearchFilterType === "leveled" &&
                  spell.level > 0
                ) {
                  results.push(spell);
                }
              }
            });
          }
        });
      } catch (e) {
        console.error(`Error parsing spell file (${file.name}):`, e);
      }
    });

    // Filter out PHB if newer exists
    const spellsByName = new Map();
    results.forEach((s) => {
      if (!spellsByName.has(s.name)) spellsByName.set(s.name, []);
      spellsByName.get(s.name).push(s);
    });

    const filteredResults = [];
    spellsByName.forEach((variants) => {
      const hasNonPHB = variants.some((s) => s.source !== "PHB");
      if (hasNonPHB) {
        variants.forEach((s) => {
          if (s.source !== "PHB") filteredResults.push(s);
        });
      } else {
        variants.forEach((s) => filteredResults.push(s));
      }
    });

    // Deduplicate
    const uniqueResults = Array.from(
      new Map(filteredResults.map((s) => [s.name + s.source, s])).values(),
    );
    uniqueResults.sort((a, b) => a.name.localeCompare(b.name));

    allSpellsCache = uniqueResults;
    currentSpellResults = allSpellsCache;
    spellSearchPage = 1;

    // Populate Class Filter
    const classSet = new Set([
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Sorcerer",
      "Warlock",
      "Wizard",
    ]);
    allSpellsCache.forEach((s) => {
      if (!s.classes) return;

      if (s.classes.fromClassList) {
        s.classes.fromClassList.forEach((c) => {
          if (c.name) classSet.add(c.name);
        });
      }
      if (s.classes.fromClassListVariant) {
        s.classes.fromClassListVariant.forEach((c) => {
          if (c.name) classSet.add(c.name);
        });
      }
      if (s.classes.fromSubclass) {
        s.classes.fromSubclass.forEach((sc) => {
          if (sc.class && sc.class.name) classSet.add(sc.class.name);
        });
      }
      // Fallback for array of strings or objects
      if (Array.isArray(s.classes)) {
        s.classes.forEach((c) => {
          if (typeof c === "string") classSet.add(c);
          else if (c.name) classSet.add(c.name);
        });
      }
    });

    const sortedClasses = Array.from(classSet).sort();
    let optionsHTML = '<option value="">All Classes</option>';
    sortedClasses.forEach((c) => {
      optionsHTML += `<option value="${c}">${c}</option>`;
    });
    classSelect.innerHTML = optionsHTML;

    renderSpellSearchPage();
    document.getElementById("spellSearchInput").focus();
  } catch (e) {
    console.error(e);
    list.innerHTML =
      '<div style="padding:10px; color:red; text-align:center;">Error loading database.</div>';
  }
};

window.closeSpellSearch = function () {
  document.getElementById("spellSearchModal").style.display = "none";
};

window.filterSpellSearch = function () {
  const term = document.getElementById("spellSearchInput").value.toLowerCase();
  const classFilter = document.getElementById("spellSearchClass").value;
  const levelFilter = document.getElementById("spellSearchLevel").value;
  const sortFilter = document.getElementById("spellSearchSort").value;

  let results = allSpellsCache;

  // Filter Name
  if (term) {
    results = results.filter((s) => s.name.toLowerCase().includes(term));
  }
  // Filter Class
  if (classFilter) {
    const target = classFilter.toLowerCase().trim();
    results = results.filter((s) => {
      if (!s.classes) return false;
      let match = false;
      const check = (name) => name && name.toLowerCase().trim() === target;
      if (
        s.classes.fromClassList &&
        s.classes.fromClassList.some((c) => check(c.name))
      )
        match = true;
      if (
        !match &&
        s.classes.fromClassListVariant &&
        s.classes.fromClassListVariant.some((c) => check(c.name))
      )
        match = true;
      if (
        !match &&
        s.classes.fromSubclass &&
        s.classes.fromSubclass.some((sc) => sc.class && check(sc.class.name))
      )
        match = true;
      if (
        !match &&
        Array.isArray(s.classes) &&
        s.classes.some((c) => check(typeof c === "string" ? c : c.name))
      )
        match = true;
      return match;
    });
  }
  // Filter Level
  if (levelFilter !== "") {
    results = results.filter((s) => s.level === parseInt(levelFilter));
  }

  // Sort
  results.sort((a, b) => {
    if (sortFilter === "name-asc") return a.name.localeCompare(b.name);
    if (sortFilter === "name-desc") return b.name.localeCompare(a.name);
    if (sortFilter === "level-asc")
      return a.level - b.level || a.name.localeCompare(b.name);
    if (sortFilter === "level-desc")
      return b.level - a.level || a.name.localeCompare(b.name);
    return 0;
  });

  currentSpellResults = results;
  spellSearchPage = 1;
  renderSpellSearchPage();
};

window.changeSpellSearchPage = function (delta) {
  const maxPage = Math.ceil(currentSpellResults.length / ITEMS_PER_PAGE);
  const newPage = spellSearchPage + delta;
  if (newPage >= 1 && newPage <= maxPage) {
    spellSearchPage = newPage;
    renderSpellSearchPage();
    document.getElementById("spellSearchList").scrollTop = 0;
  }
};

function renderSpellSearchPage() {
  const list = document.getElementById("spellSearchList");
  const pagination = document.getElementById("spellSearchPagination");
  const pageInfo = document.getElementById("spellSearchPageInfo");

  if (currentSpellResults.length === 0) {
    list.innerHTML =
      '<div style="padding:10px; color:#666; text-align:center;">No matching spells found.</div>';
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";
  const maxPage = Math.ceil(currentSpellResults.length / ITEMS_PER_PAGE);
  pageInfo.textContent = `Page ${spellSearchPage} of ${maxPage}`;

  const startIndex = (spellSearchPage - 1) * ITEMS_PER_PAGE;
  const spellsToShow = currentSpellResults.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  list.innerHTML = "";
  spellsToShow.forEach((spell) => {
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.style.flexDirection = "column";
    div.style.alignItems = "flex-start";

    const levelStr = spell.level === 0 ? "Cantrip" : `Level ${spell.level}`;
    const school = spell.school ? spell.school.toUpperCase() : "";

    div.innerHTML = `
               <div style="font-weight:bold; width:100%; display:flex; justify-content:space-between;">
                   <span>${spell.name}</span>
                   <span style="font-size:0.8rem; color:var(--ink-light);">${levelStr} ${school ? "(" + school + ")" : ""}</span>
               </div>
           `;
    div.onclick = () => {
      // Map 5e-tools data to our format
      let time = "";
      let desc = "";

      // Helper to clean 5e-tools style tags
      const cleanText = (str) => {
        if (!str) return "";
        return str.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => {
          if (!content) return "";
          return content.split("|")[0];
        });
      };

      // Recursively extract text from entries array
      const processEntries = (entries) => {
        if (!entries) return "";
        if (typeof entries === "string") return entries;
        if (!Array.isArray(entries)) return "";

        return entries
          .map((e) => {
            if (!e) return "";
            if (typeof e === "string") return e;

            let text = "";
            if (e.name && (e.type === "section" || e.type === "entries"))
              text += `${e.name}. `;

            if (e.entries) text += processEntries(e.entries);
            else if (e.items) text += processEntries(e.items);
            else if (e.entry)
              text +=
                typeof e.entry === "string"
                  ? e.entry
                  : processEntries([e.entry]);
            else if (e.caption) text += e.caption;
            else if (e.text) text += e.text;

            return text;
          })
          .join("\n");
      };

      if (spell.entries) desc = processEntries(spell.entries);
      else if (spell.description) desc = spell.description;
      desc = cleanText(desc);

      if (spell.time && spell.time[0]) {
        const t = spell.time[0];
        time = `${t.number} ${t.unit}`;
      }

      let range = "";
      if (spell.range) {
        if (spell.range.distance) {
          range = `${spell.range.distance.amount ? spell.range.distance.amount + " " : ""}${spell.range.distance.type}`;
        } else {
          range = spell.range.type;
        }
      }

      let concentration = false;
      if (
        spell.duration &&
        spell.duration[0] &&
        spell.duration[0].concentration
      )
        concentration = true;

      let ritual = spell.meta && spell.meta.ritual ? true : false;

      let material = false;
      if (spell.components && (spell.components.m || spell.components.M))
        material = true;

      const spellData = {
        name: spell.name,
        level: spell.level,
        time: time,
        range: range,
        ritual: ritual,
        concentration: concentration,
        material: material,
        description: desc,
      };

      addSpellRow(spellTargetContainer, spell.level, spellData);
      closeSpellSearch();
    };
    list.appendChild(div);
  });
}

/* =========================================
      4. WEAPONS, CONDITIONS, MODALS
      ========================================= */
window.openConditionModal = function () {
  const container = document.getElementById("conditionListContainer");
  container.innerHTML = "";
  const currentVal = document.getElementById("activeConditionsInput").value;
  const activeList = currentVal ? currentVal.split(",") : [];
  Object.keys(conditionsDB).forEach((name) => {
    const desc = conditionsDB[name];
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.style.flexDirection = "column";
    div.style.alignItems = "flex-start";
    div.style.padding = "10px";
    const topRow = document.createElement("div");
    topRow.style.display = "flex";
    topRow.style.alignItems = "center";
    topRow.style.gap = "10px";
    topRow.style.width = "100%";
    topRow.style.marginBottom = "4px";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = name;
    checkbox.checked = activeList.includes(name);
    checkbox.onchange = saveConditionsSelection;
    const label = document.createElement("span");
    label.style.fontWeight = "bold";
    label.style.fontSize = "1rem";
    label.textContent = name;
    topRow.appendChild(checkbox);
    topRow.appendChild(label);
    const descText = document.createElement("div");
    descText.style.fontSize = "0.85rem";
    descText.style.color = "var(--ink-light)";
    descText.style.marginLeft = "26px";
    descText.style.lineHeight = "1.4";
    descText.textContent = desc;
    div.appendChild(topRow);
    div.appendChild(descText);
    div.onclick = (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        saveConditionsSelection();
      }
    };
    container.appendChild(div);
  });
  document.getElementById("conditionModal").style.display = "flex";
};
window.closeConditionModal = () =>
  (document.getElementById("conditionModal").style.display = "none");
function saveConditionsSelection() {
  const checkboxes = document.querySelectorAll(
    "#conditionListContainer input[type='checkbox']:checked",
  );
  const selected = Array.from(checkboxes).map((cb) => cb.value);
  document.getElementById("activeConditionsInput").value = selected.join(",");
  renderConditionTags();
  saveCharacter();
}

window.renderConditionTags = function () {
  const val = document.getElementById("activeConditionsInput").value;
  const display = document.getElementById("conditionsDisplay");
  if (!val) {
    display.textContent = "None";
    display.style.color = "var(--ink-light)";
    return;
  }
  display.textContent = val.split(",").join(", ");
  display.style.color = "var(--red)";
};

window.openWeaponProfModal = function () {
  const currentVal = document.getElementById("weaponProfs").value;
  const currentArray = currentVal
    ? currentVal.split(",").map((s) => s.trim())
    : [];
  const container = document.getElementById("weaponChecklist");
  container.innerHTML = "";
  weaponProficiencyOptions.forEach((group) => {
    const header = document.createElement("div");
    header.className = "modal-section-header";
    header.style.gridColumn = "1 / -1";
    header.textContent = group.category;
    container.appendChild(header);
    group.items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "checklist-item";
      div.onclick = function (e) {
        if (e.target.tagName !== "INPUT") {
          const cb = this.querySelector("input");
          cb.checked = !cb.checked;
        }
      };
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item;
      if (currentArray.includes(item)) checkbox.checked = true;
      const span = document.createElement("span");
      span.textContent = item;
      div.appendChild(checkbox);
      div.appendChild(span);
      container.appendChild(div);
    });
  });
  document.getElementById("weaponProfModal").style.display = "flex";
};
window.closeWeaponProfModal = () =>
  (document.getElementById("weaponProfModal").style.display = "none");
window.saveWeaponProfsSelection = function () {
  const checkboxes = document.querySelectorAll(
    "#weaponChecklist input[type='checkbox']:checked",
  );
  const selected = Array.from(checkboxes).map((cb) => cb.value);
  document.getElementById("weaponProfs").value = selected.join(", ");
  renderWeaponTags();
  updateAllWeaponStats();
  saveCharacter();
  closeWeaponProfModal();
};
window.renderWeaponTags = function () {
  const raw = document.getElementById("weaponProfs").value;
  const display = document.getElementById("weaponProfsDisplay");
  display.innerHTML = "";
  if (!raw) {
    display.innerHTML =
      '<span style="color: var(--ink-light); font-style: italic; font-size: 0.9rem;">Click to select...</span>';
    return;
  }
  raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s)
    .forEach((item) => {
      const tag = document.createElement("div");
      tag.className = "tag-item";
      tag.textContent = item;
      display.appendChild(tag);
    });
};

// Weapon Picker
let currentWeaponInput = null;
window.openWeaponPicker = function (inputElement) {
  currentWeaponInput = inputElement;
  const modal = document.getElementById("weaponPickerModal");
  const list = document.getElementById("weaponPickerList");
  document.getElementById("weaponSearch").value = "";
  list.innerHTML = "";
  Object.keys(dndWeaponsDB)
    .sort()
    .forEach((name) => {
      const w = dndWeaponsDB[name];
      const div = document.createElement("div");
      div.className = "checklist-item";
      div.style.justifyContent = "space-between";
      div.innerHTML = `<span style="font-weight:bold;">${name}</span><span style="font-size:0.8rem; color:var(--ink-light);">${w.dmg} ${w.dtype}</span>`;
      div.onclick = () => selectWeaponFromPicker(name);
      list.appendChild(div);
    });
  modal.style.display = "flex";
  document.getElementById("weaponSearch").focus();
};
window.filterWeaponPicker = function () {
  const term = document.getElementById("weaponSearch").value.toLowerCase();
  document
    .querySelectorAll("#weaponPickerList .checklist-item")
    .forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(term)
        ? "flex"
        : "none";
    });
};
window.closeWeaponPicker = function () {
  document.getElementById("weaponPickerModal").style.display = "none";
  currentWeaponInput = null;
};
window.selectCustomWeapon = function () {
  const term = document.getElementById("weaponSearch").value;
  if (currentWeaponInput) {
    currentWeaponInput.value = term || "Custom Weapon";
    saveCharacter();
  }
  closeWeaponPicker();
};
window.selectWeaponFromPicker = function (weaponName) {
  if (!currentWeaponInput) return;
  const weaponData = dndWeaponsDB[weaponName];
  const row = currentWeaponInput.closest(".weapon-item");
  const str = parseInt(document.getElementById("str").value) || 10;
  const dex = parseInt(document.getElementById("dex").value) || 10;
  const strMod = Math.floor((str - 10) / 2);
  const dexMod = Math.floor((dex - 10) / 2);
  const profBonus = parseInt(document.getElementById("profBonus").value) || 2;
  let abilityMod = strMod;
  if (weaponData.props.includes("Finesse")) {
    abilityMod = Math.max(strMod, dexMod);
  } else if (
    weaponData.cat === "Ranged" &&
    !weaponData.props.some((p) => p.includes("Thrown"))
  ) {
    abilityMod = dexMod;
  }

  const profString = document.getElementById("weaponProfs").value || "";
  let isProficient = false;
  if (weaponData.type === "Simple" && profString.includes("Simple Weapons"))
    isProficient = true;
  if (weaponData.type === "Martial" && profString.includes("Martial Weapons"))
    isProficient = true;
  if (profString.includes(weaponName)) isProficient = true;

  const totalAtk = abilityMod + (isProficient ? profBonus : 0);
  const totalDmg = abilityMod;
  const atkString = totalAtk >= 0 ? `+${totalAtk}` : `${totalAtk}`;
  const dmgString = `${weaponData.dmg} ${totalDmg >= 0 ? "+" : ""}${totalDmg} ${weaponData.dtype}`;
  let finalNotes = [...weaponData.props];
  if (weaponData.mastery) finalNotes.push(`Mastery: ${weaponData.mastery}`);

  currentWeaponInput.value = weaponName;
  row.querySelector(".weapon-atk").value = atkString;
  row.querySelector(".weapon-damage").value = dmgString;
  row.querySelector(".weapon-notes").value = finalNotes.join(", ");
  saveCharacter();
  closeWeaponPicker();
};

window.openMasteryModal = () =>
  (document.getElementById("masteryModal").style.display = "flex");
window.addWeapon = function (data = null) {
  const weaponList = document.getElementById("weapon-list");
  const newWeapon = document.createElement("div");
  newWeapon.className = "feature-box weapon-item";
  newWeapon.style.paddingRight = "40px";
  newWeapon.style.position = "relative";

  const isLocked = window.isDataAvailable;
  const nameField = isLocked
    ? `<input type="text" class="weapon-name" placeholder="Click to select..." onclick="openWeaponPicker(this)" readonly value="${data ? data.name : ""}" style="cursor: pointer; color: var(--red-dark); font-weight: bold;" />`
    : `<input type="text" class="weapon-name" placeholder="Enter weapon name" value="${data ? data.name : ""}" style="cursor: text; color: var(--ink); font-weight: bold;" />`;

  newWeapon.innerHTML = `<button class="delete-feature-btn" style="position: absolute; top: 5px; right: 5px; z-index:10; width: 24px; height: 24px;" onclick="this.closest('.weapon-item').remove(); saveCharacter();">&times;</button><div style="display: flex; flex-direction: column; gap: 10px;"><div class="grid grid-3" style="margin-bottom: 0; gap: 10px;"><div class="field"><span class="field-label">Weapon Name</span>${nameField}</div><div class="field"><span class="field-label">Atk Bonus</span><input type="text" class="weapon-atk" placeholder="+0" value="${data ? data.atk : ""}" /></div><div class="field"><span class="field-label">Damage</span><input type="text" class="weapon-damage" placeholder="1d6+0" value="${data ? data.damage : ""}" /></div></div><div class="field"><span class="field-label">Notes</span><input type="text" class="weapon-notes" placeholder="Properties..." value="${data ? data.notes : ""}" /></div></div>`;
  weaponList.appendChild(newWeapon);
  newWeapon
    .querySelectorAll("input")
    .forEach((input) => input.addEventListener("input", saveCharacter));
  if (!window.isInitializing) saveCharacter();
};

// Resources
window.renderResources = function() {
    const container = document.getElementById('resourcesContainer');
    if (!container) return;
    container.innerHTML = '';
    resourcesData.forEach((res, index) => {
        const box = document.createElement('div');
        box.className = 'resource-item';
        
        let slotsHtml = '';
        for(let i=0; i<res.max; i++) {
            const isUsed = i < res.used ? 'used' : '';
            slotsHtml += `<div class="resource-slot ${isUsed}" onclick="toggleResourceSlot(${index}, ${i})"></div>`;
        }

        box.innerHTML = `
            <div class="resource-header">
                <input type="text" class="resource-name" value="${res.name}" onchange="updateResourceName(${index}, this.value)" placeholder="Resource Name">
                <div class="resource-controls">
                    <input type="number" class="resource-max" value="${res.max}" onchange="updateResourceMax(${index}, this.value)" min="1" style="width:40px;">
                    <button class="delete-feature-btn" onclick="deleteResource(${index})">&times;</button>
                </div>
            </div>
            <div class="resource-slots">${slotsHtml}</div>
        `;
        container.appendChild(box);
    });
};

window.addResource = function() {
    resourcesData.push({ name: "New Resource", max: 3, used: 0 });
    renderResources();
    saveCharacter();
};
window.deleteResource = function(index) {
    if(confirm("Delete this resource?")) {
        resourcesData.splice(index, 1);
        renderResources();
        saveCharacter();
    }
};
window.updateResourceName = function(index, val) { resourcesData[index].name = val; saveCharacter(); };
window.updateResourceMax = function(index, val) { resourcesData[index].max = parseInt(val) || 1; if(resourcesData[index].used > resourcesData[index].max) resourcesData[index].used = resourcesData[index].max; renderResources(); saveCharacter(); };
window.toggleResourceSlot = function(index, slotIndex) {
    if (slotIndex < resourcesData[index].used) resourcesData[index].used = slotIndex;
    else resourcesData[index].used = slotIndex + 1;
    renderResources();
    saveCharacter();
};

// Spells
function renderSpellSlots() {
  const container = document.getElementById("spellSlotsContainer");
  container.innerHTML = "";
  spellSlotsData.forEach((slotData, index) => {
    const slotBox = document.createElement("div");
    slotBox.className = "slot-level-container";
    let html = `<div class="slot-controls"><strong>Level ${slotData.level}</strong><div class="slot-btn-group"><button class="slot-btn-small" onclick="adjustSlotCount(${index}, -1)">-</button><button class="slot-btn-small" onclick="adjustSlotCount(${index}, 1)">+</button><button class="slot-btn-small" style="background:#fee; color:red; margin-left:8px;" onclick="removeSpellLevel(${index})">×</button></div></div><div class="spell-slot-tracker">`;
    for (let i = 0; i < slotData.total; i++) {
      const isUsed = i < slotData.used ? "used" : "";
      html += `<div class="spell-slot ${isUsed}" onclick="toggleSlot(${index}, ${i})"></div>`;
    }
    html += `</div>`;
    slotBox.innerHTML = html;
    container.appendChild(slotBox);
  });
}
window.toggleSlot = function (levelIndex, slotIndex) {
  const data = spellSlotsData[levelIndex];
  if (slotIndex < data.used) {
    data.used = slotIndex;
  } else {
    data.used = slotIndex + 1;
  }
  renderSpellSlots();
  saveCharacter();
};
window.adjustSlotCount = function (index, change) {
  if (spellSlotsData[index].total + change < 0) return;
  spellSlotsData[index].total += change;
  if (spellSlotsData[index].used > spellSlotsData[index].total) {
    spellSlotsData[index].used = spellSlotsData[index].total;
  }
  renderSpellSlots();
  saveCharacter();
};
window.addNewSpellLevel = function () {
  const nextLevel =
    spellSlotsData.length > 0
      ? spellSlotsData[spellSlotsData.length - 1].level + 1
      : 1;
  spellSlotsData.push({ level: nextLevel, total: 1, used: 0 });
  renderSpellSlots();
  saveCharacter();
};
window.removeSpellLevel = function (index) {
  if (confirm("Delete this spell level group?")) {
    spellSlotsData.splice(index, 1);
    renderSpellSlots();
    saveCharacter();
  }
};
window.addSpellRow = function (containerId, defaultLevel = 1, data = null) {
  const container = document.getElementById(containerId);
  const row = document.createElement("div");
  row.className = "spell-row";
  const lvl = data ? data.level : defaultLevel === 0 ? "0" : "1";
  const isPrep = data ? data.prepared : containerId === "preparedSpellsList";
  const isCantrip =
    containerId === "cantripList" || defaultLevel === 0 || lvl === "0";
  if (isCantrip) row.classList.add("cantrip-row");
  const prepVisibility = isCantrip ? "visibility:hidden;" : "";
  const rChecked = data && data.ritual ? "checked" : "";
  const cChecked = data && data.concentration ? "checked" : "";
  const mChecked = data && data.material ? "checked" : "";
  row.innerHTML = `<div class="drag-handle">☰</div><div class="spell-col-prep" style="${prepVisibility}"><span class="mobile-label">Prep</span><input type="checkbox" class="spell-check spell-prep" title="Prepared" ${isPrep ? "checked" : ""}></div><input type="number" class="spell-input spell-lvl" value="${lvl}" placeholder="Lvl" style="text-align:center;"><input type="text" class="spell-input spell-name" value="${data ? data.name : ""}" placeholder="Spell Name"><input type="text" class="spell-input spell-time" value="${data ? data.time : ""}" placeholder="1 Act"><input type="text" class="spell-input spell-range" value="${data ? data.range : ""}" placeholder="60 ft"><div class="spell-col-ritual"><span class="mobile-label">Ritual</span><input type="checkbox" class="spell-check spell-ritual" title="Ritual" ${rChecked}></div><div class="spell-col-conc"><span class="mobile-label">Conc</span><input type="checkbox" class="spell-check spell-conc" title="Concentration" ${cChecked}></div><div class="spell-col-mat"><span class="mobile-label">Mat</span><input type="checkbox" class="spell-check spell-mat" title="Material" ${mChecked}></div><input type="hidden" class="spell-desc" value="${data && data.description ? data.description.replace(/"/g, "&quot;") : ""}"><span class="skill-info-btn" onclick="showSpellInfo(this)" style="cursor:pointer; font-size:0.8rem;">?</span><button class="delete-feature-btn" onclick="this.parentElement.remove(); saveCharacter()">×</button>`;

  const prepBox = row.querySelector(".spell-prep");
  if (!isCantrip) {
    prepBox.addEventListener("change", function () {
      if (this.checked) {
        document.getElementById("preparedSpellsList").appendChild(row);
      } else {
        document.getElementById("spellList").appendChild(row);
      }
      saveCharacter();
    });
  }
  row
    .querySelectorAll("input")
    .forEach((input) => input.addEventListener("input", saveCharacter));
  container.appendChild(row);
  setupDragItem(row, containerId);
  saveCharacter();
};

window.showSpellInfo = function (btn) {
  const row = btn.closest(".spell-row");
  const name = row.querySelector(".spell-name").value;
  const desc = row.querySelector(".spell-desc").value;
  document.getElementById("infoModalTitle").textContent =
    name || "Spell Description";
  document.getElementById("infoModalText").innerHTML = desc
    ? desc.replace(/\n/g, "<br>")
    : "No description available.";
  document.getElementById("infoModal").style.display = "flex";
};

// Modals Generic
window.showSkillInfo = function (skillKey, event) {
  if (event) event.stopPropagation();
  const title = skillKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  document.getElementById("infoModalTitle").textContent = title;
  document.getElementById("infoModalText").textContent =
    skillDescriptions[skillKey] || "No description available.";
  document.getElementById("infoModal").style.display = "flex";
};
window.closeInfoModal = (e) => {
  if (e.target.id === "infoModal")
    document.getElementById("infoModal").style.display = "none";
};
window.openCurrencyModal = () =>
  (document.getElementById("currencyModal").style.display = "flex");
window.closeCurrencyModal = (e) => {
  if (e.target.id === "currencyModal")
    document.getElementById("currencyModal").style.display = "none";
};

// Split Money Logic
window.openSplitMoneyModal = () => {
  ["splitCp", "splitSp", "splitEp", "splitGp", "splitPp"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  document.getElementById("splitMoneyModal").style.display = "flex";
};
window.closeSplitMoneyModal = () =>
  (document.getElementById("splitMoneyModal").style.display = "none");

window.applySplitLoot = function () {
  const partySize =
    parseInt(document.getElementById("splitPartySize").value) || 1;
  if (partySize < 1) return;

  const currencies = ["cp", "sp", "ep", "gp", "pp"];
  currencies.forEach((curr) => {
    const totalFound =
      parseInt(
        document.getElementById(
          "split" + curr.charAt(0).toUpperCase() + curr.slice(1),
        ).value,
      ) || 0;
    const share = Math.floor(totalFound / partySize);
    if (share > 0) {
      const currentVal = parseInt(document.getElementById(curr).value) || 0;
      document.getElementById(curr).value = currentVal + share;
    }
  });
  saveCharacter();
  closeSplitMoneyModal();
};

// Manage Money Logic
window.openManageMoneyModal = () => {
  ["manageCp", "manageSp", "manageEp", "manageGp", "managePp"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  document.getElementById("manageMoneyModal").style.display = "flex";
};
window.closeManageMoneyModal = () =>
  (document.getElementById("manageMoneyModal").style.display = "none");

window.applyMoneyChange = function (multiplier) {
  const currencies = ["cp", "sp", "ep", "gp", "pp"];
  currencies.forEach((curr) => {
    const change =
      parseInt(
        document.getElementById(
          "manage" + curr.charAt(0).toUpperCase() + curr.slice(1),
        ).value,
      ) || 0;
    if (change !== 0) {
      const currentVal = parseInt(document.getElementById(curr).value) || 0;
      // Allow negative values or clamp to 0? Usually D&D sheets allow debt or just 0. Let's allow math to happen.
      let newVal = currentVal + change * multiplier;
      if (newVal < 0) newVal = 0; // Prevent negative currency
      document.getElementById(curr).value = newVal;
    }
  });
  saveCharacter();
  closeManageMoneyModal();
};

window.openXpTableModal = function () {
  const container = document.getElementById("xpTableContent");
  if (!container.innerHTML.trim()) {
    let html =
      '<table class="currency-table"><thead><tr><th>Level</th><th>XP</th><th>Prof</th></tr></thead><tbody>';
    xpTable.forEach((row) => {
      html += `<tr><td>${row.lvl}</td><td>${row.xp.toLocaleString()}</td><td>+${row.prof}</td></tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  }
  document.getElementById("xpTableModal").style.display = "flex";
};
window.closeXpTableModal = (e) => {
  if (e.target.id === "xpTableModal")
    document.getElementById("xpTableModal").style.display = "none";
};

window.openScoreModal = function () {
  document.getElementById("scoreModal").style.display = "flex";
  abilities.forEach((stat) => {
    document.getElementById(`sa_${stat}`).value = "";
  });
  updateStandardArrayOptions();
  resetPointBuy();
};
window.closeScoreModal = () =>
  (document.getElementById("scoreModal").style.display = "none");
window.switchScoreTab = function (mode) {
  document
    .querySelectorAll(".score-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".score-method-container")
    .forEach((c) => c.classList.remove("active"));
  if (mode === "standard") {
    document.querySelector(".score-tab:first-child").classList.add("active");
    document.getElementById("tab-standard").classList.add("active");
  } else {
    document.querySelector(".score-tab:last-child").classList.add("active");
    document.getElementById("tab-pointbuy").classList.add("active");
  }
};
window.updateStandardArrayOptions = function () {
  const selects = abilities.map((s) => document.getElementById(`sa_${s}`));
  const selectedValues = selects.map((s) => s.value).filter((v) => v !== "");
  selects.forEach((select) => {
    const myValue = select.value;
    Array.from(select.options).forEach((opt) => {
      if (opt.value === "") {
        opt.disabled = false;
        return;
      }
      opt.disabled =
        selectedValues.includes(opt.value) && opt.value !== myValue;
    });
  });
};
window.applyStandardArray = function () {
  let allFilled = true;
  abilities.forEach((stat) => {
    if (document.getElementById(`sa_${stat}`).value === "") allFilled = false;
  });
  if (!allFilled) {
    alert("Please assign a score to every ability.");
    return;
  }
  abilities.forEach((stat) => {
    document.getElementById(stat).value = document.getElementById(
      `sa_${stat}`,
    ).value;
  });
  updateModifiers();
  saveCharacter();
  closeScoreModal();
};
function resetPointBuy() {
  pbScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
  renderPointBuy();
}
function getPointCost(score) {
  return pbCosts[score] || 0;
}
function calculateSpentPoints() {
  return Object.values(pbScores).reduce(
    (acc, score) => acc + getPointCost(score),
    0,
  );
}
window.adjustPointBuy = function (stat, delta) {
  const currentScore = pbScores[stat];
  const newScore = currentScore + delta;
  if (newScore < 8 || newScore > 15) return;
  pbScores[stat] = newScore;
  if (calculateSpentPoints() > maxPoints) {
    pbScores[stat] = currentScore;
    alert("Not enough points!");
  }
  renderPointBuy();
};
function renderPointBuy() {
  const container = document.getElementById("pb-rows-container");
  container.innerHTML = "";
  const remaining = maxPoints - calculateSpentPoints();
  const remEl = document.getElementById("pb-remaining");
  remEl.textContent = remaining;
  remEl.style.color = remaining < 0 ? "red" : "var(--ink)";
  Object.keys(pbScores).forEach((stat) => {
    const score = pbScores[stat];
    const canUpgrade =
      score < 15 && remaining >= getPointCost(score + 1) - getPointCost(score);
    const row = document.createElement("div");
    row.className = "pb-row";
    row.innerHTML = `<div class="pb-label" style="text-transform:uppercase; font-weight:bold; width:100px;">${stat}</div><div class="pb-controls"><button class="pb-btn" onclick="adjustPointBuy('${stat}', -1)" ${score <= 8 ? "disabled" : ""}>-</button><span class="pb-val">${score}</span><button class="pb-btn" onclick="adjustPointBuy('${stat}', 1)" ${!canUpgrade ? "disabled" : ""}>+</button></div><div class="pb-cost">Cost: ${getPointCost(score)}</div>`;
    container.appendChild(row);
  });
}
window.applyPointBuy = function () {
  Object.keys(pbScores).forEach((stat) => {
    document.getElementById(stat).value = pbScores[stat];
  });
  updateModifiers();
  saveCharacter();
  closeScoreModal();
};
window.setAlignment = function (val) {
  document.getElementById("alignment").value = val;
  document.getElementById("alignModal").style.display = "none";
  saveCharacter();
};
document
  .getElementById("alignment")
  .addEventListener(
    "click",
    () => (document.getElementById("alignModal").style.display = "flex"),
  );
document.getElementById("cancelAlign").onclick = () =>
  (document.getElementById("alignModal").style.display = "none");
window.openThemeModal = () =>
  (document.getElementById("themeModal").style.display = "flex");
window.closeThemeModal = (e) => {
  if (e.target.id === "themeModal")
    document.getElementById("themeModal").style.display = "none";
};
window.setTheme = function (themeName) {
  document.body.className = themeName;
  document.getElementById("themeModal").style.display = "none";
  saveCharacter();
};

/* =========================================
      5. PERSISTENCE (SAVE / LOAD)
      ========================================= */
function getFeatureData(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return Array.from(container.querySelectorAll(".feature-box")).map((box) => {
    const titleEl = box.querySelector(".feature-title-input");
    const descEl = box.querySelector(".feature-desc-input");
    if (!titleEl || !descEl) return null;
    return { title: titleEl.value, desc: descEl.value };
  }).filter(item => item !== null);
}

window.saveCharacter = function () {
  if (window.isInitializing) return;
  // CRITICAL FIX: Safe element selection for Inventory
  // We filter out any null entries in case a row is half-deleted or malformed
  const safeInventoryMap = (selector) => {
    return Array.from(document.querySelectorAll(selector))
      .map((item) => {
        const nameEl = item.querySelector(".name-field");
        if (!nameEl) return null; // Skip if main field missing
        return {
          name: nameEl.value,
          qty: item.querySelector(".qty-field")?.value || 0,
          weight: item.querySelector(".weight-field")?.value || 0,
          equipped: item.querySelector(".equip-check")?.checked || false,
          description: item.querySelector(".desc-field")?.value || "",
        };
      })
      .filter((item) => item !== null);
  };

  const characterData = {
    charID: document.getElementById("charID")?.value || "",
    charName: document.getElementById("charName").value,
    charClass: document.getElementById("charClass").value,
    charSubclass: document.getElementById("charSubclass").value,
    level: document.getElementById("level").value,
    race: document.getElementById("race").value,
    background: document.getElementById("background").value,
    alignment: document.getElementById("alignment").value,
    xp: document.getElementById("experience").value,
    str: document.getElementById("str").value,
    dex: document.getElementById("dex").value,
    con: document.getElementById("con").value,
    int: document.getElementById("int").value,
    wis: document.getElementById("wis").value,
    cha: document.getElementById("cha").value,
    ac: document.getElementById("baseAC")?.value || "10",
    shield: document.getElementById("shieldEquipped")?.checked || false,
    armorLight: document.getElementById("armorLight").checked,
    armorMedium: document.getElementById("armorMedium").checked,
    armorHeavy: document.getElementById("armorHeavy").checked,
    armorShield: document.getElementById("armorShield").checked,
    weaponProfs: document.getElementById("weaponProfs").value,
    toolProfs: document.getElementById("toolProfs").value,
    speed: document.getElementById("speed").value,
    charSize: document.getElementById("charSize").value,
    sizeFt: document.getElementById("sizeFt").value,
    hp: document.getElementById("hp").value,
    maxHp: document.getElementById("maxHp").value,
    tempHp: document.getElementById("tempHp").value,
    profBonus: document.getElementById("profBonus").value,
    hitDice: document.getElementById("hitDice").value,
    activeConditions: document.getElementById("activeConditionsInput").value,
    heroicInspiration: document.getElementById("heroicInspiration").checked,
    defenses: document.getElementById("defenses").value,
    resourcesData: resourcesData,

    weapons: Array.from(document.querySelectorAll(".weapon-item")).map(
      (item) => ({
        name: item.querySelector(".weapon-name").value,
        atk: item.querySelector(".weapon-atk").value,
        damage: item.querySelector(".weapon-damage").value,
        notes: item.querySelector(".weapon-notes").value,
      }),
    ),

    classFeatures: getFeatureData("classFeaturesContainer"),
    raceFeatures: getFeatureData("raceFeaturesContainer"),
    backgroundFeatures: getFeatureData("backgroundFeaturesContainer"),
    feats: getFeatureData("featsContainer"),
    actions: getFeatureData("actionsContainer"),
    bonusActions: getFeatureData("bonusActionsContainer"),
    reactions: getFeatureData("reactionsContainer"),

    // Using the safe map function here
    inventory: safeInventoryMap(".inventory-item"),

    attunement: [
      document.getElementById("attune1").value,
      document.getElementById("attune2").value,
      document.getElementById("attune3").value,
    ],
    spellSlotsData: spellSlotsData,
    cantripsList: Array.from(
      document.querySelectorAll("#cantripList .spell-row"),
    ).map((row) => ({
      level: row.querySelector(".spell-lvl").value,
      name: row.querySelector(".spell-name").value,
      time: row.querySelector(".spell-time").value,
      range: row.querySelector(".spell-range").value,
      ritual: row.querySelector(".spell-ritual").checked,
      concentration: row.querySelector(".spell-conc").checked,
      material: row.querySelector(".spell-mat").checked,
      description: row.querySelector(".spell-desc").value,
    })),
    preparedSpellsList: Array.from(
      document.querySelectorAll("#preparedSpellsList .spell-row"),
    ).map((row) => ({
      level: row.querySelector(".spell-lvl").value,
      name: row.querySelector(".spell-name").value,
      time: row.querySelector(".spell-time").value,
      range: row.querySelector(".spell-range").value,
      ritual: row.querySelector(".spell-ritual").checked,
      concentration: row.querySelector(".spell-conc").checked,
      material: row.querySelector(".spell-mat").checked,
      description: row.querySelector(".spell-desc").value,
      prepared: true,
    })),
    spellsList: Array.from(
      document.querySelectorAll("#spellList .spell-row"),
    ).map((row) => ({
      level: row.querySelector(".spell-lvl").value,
      name: row.querySelector(".spell-name").value,
      time: row.querySelector(".spell-time").value,
      range: row.querySelector(".spell-range").value,
      ritual: row.querySelector(".spell-ritual").checked,
      concentration: row.querySelector(".spell-conc").checked,
      material: row.querySelector(".spell-mat").checked,
      description: row.querySelector(".spell-desc").value,
      prepared: false,
    })),
    languages: document.getElementById("languages").value,
    personality: document.getElementById("personality").value,
    ideals: document.getElementById("ideals").value,
    bonds: document.getElementById("bonds").value,
    flaws: document.getElementById("flaws").value,
    notes: document.getElementById("notes").value,
    cp: document.getElementById("cp").value,
    sp: document.getElementById("sp").value,
    ep: document.getElementById("ep").value,
    gp: document.getElementById("gp").value,
    pp: document.getElementById("pp").value,
    spellAbility: document.getElementById("spellAbility").value,
    spellAttackMod: document.getElementById("spellAttackMod")?.value || "",
    spellAttackBonus: document.getElementById("spellAttackBonus")?.value || "",
    skillProficiency,
    saveProficiency,
    deathSaves,
    currentTheme: document.body.className,
  };
  localStorage.setItem("dndCharacter", JSON.stringify(characterData));
};

window.downloadJSON = function () {
  saveCharacter();
  const dataStr = localStorage.getItem("dndCharacter");
  const dataObj = JSON.parse(dataStr);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${dataObj.charName || "character"}_sheet.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.loadJSON = function (input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      JSON.parse(e.target.result);
      localStorage.setItem("dndCharacter", e.target.result);
      location.reload();
    } catch (err) {
      alert("Error loading file: " + err);
    }
  };
  reader.readAsText(file);
};

window.openLastSavedModal = function () {
  const saved = localStorage.getItem("dndCharacter");
  const textarea = document.getElementById("lastSavedTextarea");
  if (saved) {
    try {
      textarea.value = JSON.stringify(JSON.parse(saved), null, 2);
    } catch (e) {
      textarea.value = saved;
    }
  } else {
    textarea.value = "";
  }
  document.getElementById("lastSavedModal").style.display = "flex";
};

window.restoreFromModal = function () {
  const val = document.getElementById("lastSavedTextarea").value;
  if (!val) return;
  try {
    JSON.parse(val); // Validate
    localStorage.setItem("dndCharacter", val);
    location.reload();
  } catch (e) {
    alert("Invalid JSON data. Cannot load.");
  }
};

window.copyLastSaved = function () {
  const textarea = document.getElementById("lastSavedTextarea");
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  try {
    document.execCommand("copy");
    alert("Copied to clipboard!");
  } catch (err) {
    alert("Failed to copy.");
  }
};

/* =========================================
      CHARACTER MANAGER (Multi-Character)
      ========================================= */
window.openCharacterManager = function () {
  // Ensure modal exists
  let modal = document.getElementById("charManagerModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "charManagerModal";
    modal.className = "info-modal-overlay";
    modal.innerHTML = `
               <div class="info-modal-content" style="max-width: 500px;">
                   <button class="close-modal-btn" onclick="document.getElementById('charManagerModal').style.display='none'">&times;</button>
                   <h3 class="info-modal-title">Character Library</h3>
                   
                   <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--gold);">
                       <h4 style="margin-bottom: 10px; color: var(--ink);">Current Character</h4>
                       <div style="display: flex; gap: 10px;">
                           <button class="btn" onclick="saveCurrentToLibrary()" style="flex: 1; font-size: 0.9rem;">Save to Library</button>
                           <button class="btn btn-secondary" onclick="createNewCharacter()" style="flex: 1; font-size: 0.9rem;">New Character</button>
                       </div>
                       <div style="margin-top: 8px; font-size: 0.85rem; color: var(--ink-light); font-style: italic;">
                           "Save to Library" stores the current sheet so you can switch back to it later.
                       </div>
                   </div>

                   <h4 style="margin-bottom: 10px; color: var(--ink);">Saved Characters</h4>
                   <div id="charManagerList" class="char-manager-list"></div>
               </div>
           `;
    document.body.appendChild(modal);
  }

  renderCharacterLibrary();
  modal.style.display = "flex";
};

window.renderCharacterLibrary = function () {
  const list = document.getElementById("charManagerList");
  list.innerHTML = "";
  const library = JSON.parse(localStorage.getItem("dndLibrary") || "{}");
  const ids = Object.keys(library);

  if (ids.length === 0) {
    list.innerHTML =
      '<div style="text-align: center; color: var(--ink-light); padding: 10px;">No saved characters.</div>';
    return;
  }

  ids.forEach((id) => {
    const char = library[id];
    const div = document.createElement("div");
    div.className = "char-manager-item";
    div.innerHTML = `
               <div class="char-info">
                   <div class="char-name">${char.charName || "Unnamed"}</div>
                   <div class="char-details">Lvl ${char.level || 1} ${char.charClass || "Adventurer"}</div>
               </div>
               <div class="char-actions">
                   <button class="btn btn-secondary" onclick="loadFromLibrary('${id}')" style="padding: 4px 8px; font-size: 0.8rem;">Load</button>
                   <button class="delete-feature-btn" onclick="deleteFromLibrary('${id}')" title="Delete">&times;</button>
               </div>
           `;
    list.appendChild(div);
  });
};

window.saveCurrentToLibrary = function () {
  let charID = document.getElementById("charID").value;
  if (!charID) {
    charID = crypto.randomUUID();
    document.getElementById("charID").value = charID;
    saveCharacter(); // Save ID to current state
  }

  const currentData = JSON.parse(localStorage.getItem("dndCharacter"));
  const library = JSON.parse(localStorage.getItem("dndLibrary") || "{}");

  library[charID] = currentData;
  localStorage.setItem("dndLibrary", JSON.stringify(library));
  renderCharacterLibrary();
  alert("Character saved to library!");
};

window.loadFromLibrary = function (id) {
  if (
    !confirm(
      "Load this character? Unsaved changes to the current sheet will be lost if not saved to the library.",
    )
  )
    return;

  const library = JSON.parse(localStorage.getItem("dndLibrary") || "{}");
  const data = library[id];
  if (data) {
    localStorage.setItem("dndCharacter", JSON.stringify(data));
    location.reload();
  }
};

window.deleteFromLibrary = function (id) {
  if (!confirm("Permanently delete this character from the library?")) return;
  const library = JSON.parse(localStorage.getItem("dndLibrary") || "{}");
  delete library[id];
  localStorage.setItem("dndLibrary", JSON.stringify(library));
  renderCharacterLibrary();
};

window.createNewCharacter = function () {
  if (
    !confirm(
      "Create new character? Make sure to save your current one to the library first!",
    )
  )
    return;
  localStorage.removeItem("dndCharacter");
  location.reload();
};

window.resetSheet = function () {
  if (confirm("Clear all data? This cannot be undone.")) {
    localStorage.removeItem("dndCharacter");
    location.reload();
  }
};

window.createSidebarMenu = function () {
  if (document.querySelector(".hamburger-btn")) return; // Prevent duplicates

  const hamburger = document.createElement("button");
  hamburger.className = "hamburger-btn";
  hamburger.innerHTML = "☰";
  hamburger.title = "Menu";
  hamburger.onclick = window.toggleSidebar;
  document.body.appendChild(hamburger);

  const gridBtn = document.createElement("button");
  gridBtn.className = "grid-menu-btn";
  gridBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>';
  gridBtn.title = "Apps";
  document.body.appendChild(gridBtn);

  const sidebar = document.createElement("div");
  sidebar.id = "main-sidebar";
  sidebar.className = "sidebar-nav";
  sidebar.innerHTML = `
           <div class="sidebar-header">
               <h3>Menu</h3>
               <button class="close-sidebar-btn" onclick="window.toggleSidebar()">&times;</button>
           </div>
           <div class="sidebar-content" id="sidebar-content"></div>
       `;
  document.body.appendChild(sidebar);

  const overlay = document.createElement("div");
  overlay.id = "sidebar-overlay";
  overlay.className = "sidebar-overlay";
  overlay.onclick = window.toggleSidebar;
  document.body.appendChild(overlay);

  const actionsDiv = document.querySelector(".sheet-actions");
  const sidebarContent = document.getElementById("sidebar-content");

  // Add Characters Button
  const charBtn = document.createElement("button");
  charBtn.className = "sidebar-btn";
  charBtn.innerText = "Characters";
  charBtn.onclick = () => {
    window.openCharacterManager();
    window.toggleSidebar();
  };
  sidebarContent.appendChild(charBtn);

  if (actionsDiv) {
    Array.from(actionsDiv.children).forEach((child) => {
      // Move buttons/labels to sidebar
      child.classList.add("sidebar-btn");
      child.classList.remove("btn", "btn-secondary", "btn-danger");
      sidebarContent.appendChild(child);
    });
    actionsDiv.style.display = "none";
  }
};

window.injectCombatActions = function (actionsData) {
  const actionsContainer = document.getElementById("actionsContainer");
  if (!actionsContainer) return;

  let refDiv = document.getElementById("combat-actions-ref");
  if (!refDiv) {
    refDiv = document.createElement("div");
    refDiv.id = "combat-actions-ref";
    refDiv.className = "feature-box";
    refDiv.style.background = "var(--parchment-dark)";
    refDiv.style.marginBottom = "15px";

    // Insert Logic
    const tabContent = actionsContainer.closest(".tab-content");
    let inserted = false;
    if (tabContent && tabContent.parentElement) {
      const tabs = tabContent.parentElement.querySelector(".tabs");
      if (tabs) {
        tabs.parentNode.insertBefore(refDiv, tabs);
        inserted = true;
      }
    }
    if (
      !inserted &&
      actionsContainer.parentElement &&
      actionsContainer.parentElement.parentElement &&
      actionsContainer.parentElement.parentElement.classList.contains("grid")
    ) {
      const grid = actionsContainer.parentElement.parentElement;
      grid.parentNode.insertBefore(refDiv, grid);
      inserted = true;
    }
    if (!inserted) {
      actionsContainer.parentNode.insertBefore(refDiv, actionsContainer);
    }
  }

  refDiv.innerHTML = `
           <div style="font-family:'Cinzel',serif; font-weight:bold; color:var(--red-dark); border-bottom:1px solid var(--gold); margin-bottom:5px; padding-bottom:2px; font-size:0.9rem;">
               Actions in Combat
           </div>
           <div class="combat-actions-list" style="font-size:0.85rem; color:var(--ink); line-height:1.4; display:flex; flex-wrap:wrap; gap:4px;"></div>
       `;

  const list = refDiv.querySelector(".combat-actions-list");
  actionsData.forEach((action, index) => {
    const span = document.createElement("span");
    span.textContent = action.name;
    span.style.cursor = "help";
    span.style.borderBottom = "1px dotted var(--ink-light)";
    span.title = "Click for details";
    span.onclick = () => {
      document.getElementById("infoModalTitle").textContent = action.name;
      let desc = window.processEntries(action.entries);
      // Clean tags
      desc = desc.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) =>
        c ? c.split("|")[0] : "",
      );
      document.getElementById("infoModalText").innerHTML = desc;
      document.getElementById("infoModal").style.display = "flex";
    };
    list.appendChild(span);
    if (index < actionsData.length - 1) {
      list.appendChild(document.createTextNode(", "));
    }
  });
};

window.toggleSidebar = function () {
  const sidebar = document.getElementById("main-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  } else {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  }
};

window.initQuickNav = function () {
  if (document.getElementById("quick-nav")) return;

  const nav = document.createElement("div");
  nav.className = "quick-nav";
  nav.id = "quick-nav";

  const gridBtn = document.querySelector(".grid-menu-btn");
  if (gridBtn) {
    gridBtn.onclick = (e) => {
      e.stopPropagation();
      nav.classList.toggle("visible");
    };
  }

  document.addEventListener("click", (e) => {
    if (
      nav.classList.contains("visible") &&
      !nav.contains(e.target) &&
      (!gridBtn || !gridBtn.contains(e.target))
    ) {
      nav.classList.remove("visible");
    }
  });

  document.body.appendChild(nav);

  const buildLinks = () => {
    const navItems = [
      {
        id: "stats",
        label: "Abilities",
        icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
      },
      {
        id: "combat",
        label: "Combat",
        icon: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>',
      },
      {
        id: "resources",
        label: "Resources",
        icon: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
      },
      {
        id: "actions",
        label: "Actions",
        icon: '<path d="M6 2l10 10L6 22l-2-2 10-10L4 4z"/>',
      },
      {
        id: "extras",
        label: "Extras",
        icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
      },
      {
        id: "features",
        label: "Features",
        icon: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
      },
      {
        id: "equipment",
        label: "Inventory",
        icon: '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>',
      },
      {
        id: "spells",
        label: "Spells",
        icon: '<path d="M7.5 5.6L10 7 7.5 8.4 6.1 10.9 4.7 8.4 2.2 7l2.5-1.4L6.1 3.1 7.5 5.6zm12 9.8L17 14l2.5-1.4 1.4-2.5 1.4 2.5 2.5 1.4-2.5 1.4-1.4 2.5-1.4-2.5zM22 2l-2.5 1.4L18.1 5.9 16.7 3.4 14.2 2l2.5-1.4L18.1.6 19.5 3.1 22 2z"/>',
      },
      {
        id: "notes",
        label: "Notes",
        icon: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
      },
    ];

    let html = "";
    navItems.forEach((item) => {
      html += `
                <button class="nav-btn-custom" data-target="${item.id}">
                    <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" style="min-width:24px" fill="currentColor">
                        ${item.icon}
                    </svg>
                    <span>${item.label}</span>
                </button>
               `;
    });

    nav.innerHTML = html;

    nav.querySelectorAll(".nav-btn-custom").forEach((btn) => {
      btn.onclick = () => {
        const target = btn.dataset.target;
        nav.classList.remove("visible");

        // Logic to scroll to section or switch tab
        if (target === "stats") {
          document
            .getElementById("section-stats")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "combat") {
          document
            .getElementById("section-combat")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (target === "resources") {
          document
            .getElementById("section-resources")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (target === "actions") {
          document
            .getElementById("section-actions")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (target === "spells") {
          window.switchTab("spells");
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "equipment") {
          window.switchTab("equipment");
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "features") {
          window.switchTab("class-features");
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "notes") {
          window.switchTab("notes");
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "extras") {
          window.switchTab("feats"); // Default extra to feats since spells has its own button
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
    });
  };
  // Build immediately
  buildLinks();
};

/* =========================================
      6. INITIALIZATION
      ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI components (Sidebar, QuickNav)
  if (window.createSidebarMenu) window.createSidebarMenu();
  if (window.initQuickNav) window.initQuickNav();

  // Guard clause: Only run initialization if we are on the character sheet (checking for charName input)
  if (!document.getElementById("charName")) return;

  // Inject Character ID hidden input if missing
  if (!document.getElementById("charID")) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.id = "charID";
    document.body.appendChild(input);
  }

  window.isInitializing = true;

  try {
    // Check for data immediately
    checkDataUploadStatus();

    // Re-check when tab becomes visible (e.g. returning from Data Viewer)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkDataUploadStatus();
    });

    // XP Modal
    const expModal = document.getElementById("expModal");
    document.getElementById("addExpBtn").onclick = () => {
      document.getElementById("expTotalInput").value = "";
      document.getElementById("expPartySize").value = "1";
      expModal.style.display = "flex";
    };
    document.getElementById("cancelExp").onclick = () =>
      (expModal.style.display = "none");
    document.getElementById("confirmExp").onclick = function () {
      const totalXp =
        parseInt(document.getElementById("expTotalInput").value) || 0;
      const partySize =
        parseInt(document.getElementById("expPartySize").value) || 1;
      if (partySize < 1) return;
      const toAdd = Math.floor(totalXp / partySize);

      let currentXp =
        parseInt(document.getElementById("experience").value) || 0;
      let currentLevel = parseInt(document.getElementById("level").value) || 1;
      currentXp += toAdd;
      let checkedLevel = true;
      while (checkedLevel) {
        let nextLevelEntry = xpTable.find((x) => x.lvl === currentLevel + 1);
        let currentLevelEntry = xpTable.find((x) => x.lvl === currentLevel);
        if (!nextLevelEntry) {
          checkedLevel = false;
          break;
        }
        let xpNeeded = nextLevelEntry.xp - currentLevelEntry.xp;
        if (currentXp >= xpNeeded) {
          currentXp -= xpNeeded;
          currentLevel++;
          document.getElementById("profBonus").value = xpTable.find(
            (x) => x.lvl === currentLevel,
          ).prof;
        } else {
          checkedLevel = false;
        }
      }
      document.getElementById("experience").value = currentXp;
      document.getElementById("level").value = currentLevel;
      expModal.style.display = "none";
      updateModifiers();
      saveCharacter();
    };

    // Drag Listeners
    [
      "inventoryList",
      "equippedList",
      "weapon-list",
      "cantripList",
      "spellList",
      "preparedSpellsList",
    ].forEach((id) => {
      const container = document.getElementById(id);
      if (!container) return;
      container.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector(".dragging");
        if (draggable) {
          if (afterElement == null) {
            container.appendChild(draggable);
          } else {
            container.insertBefore(draggable, afterElement);
          }
        }
      });
    });

    // Global Auto-save
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      el.addEventListener("input", saveCharacter);
      el.addEventListener("change", saveCharacter);
    });
    abilities.forEach((a) =>
      document.getElementById(a).addEventListener("input", updateModifiers),
    );
    document.getElementById("profBonus").addEventListener("input", () => {
      updateModifiers();
      updateSpellDC();
    });
    document
      .getElementById("spellAbility")
      .addEventListener("change", updateSpellDC);
    document.getElementById("str").addEventListener("input", calculateWeight);
    ["hp", "maxHp", "tempHp"].forEach((id) =>
      document.getElementById(id).addEventListener("input", updateHpBar),
    );
    document
      .getElementById("charSize")
      ?.addEventListener("change", calculateWeight);

    // Load Data
    const saved = localStorage.getItem("dndCharacter");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.currentTheme) document.body.className = data.currentTheme;
      Object.keys(data).forEach((key) => {
        const el = document.getElementById(key);
        if (
          el &&
          !key.includes("Features") &&
          ![
            "weapons",
            "inventory",
            "attunement",
            "skillProficiency",
            "saveProficiency",
            "deathSaves",
          ].includes(key)
        ) {
          if (el.type === "checkbox") el.checked = data[key];
          else el.value = data[key];
        }
      });
      if (data.skillProficiency) {
        Object.assign(skillProficiency, data.skillProficiency);
        Object.keys(skillProficiency).forEach((k) => {
          if (skillProficiency[k])
            document
              .getElementById(`skillCheck_${k}`)
              ?.classList.add("checked");
        });
      }
      if (data.saveProficiency) {
        Object.assign(saveProficiency, data.saveProficiency);
        Object.keys(saveProficiency).forEach((k) => {
          if (saveProficiency[k])
            document.getElementById(`saveCheck_${k}`)?.classList.add("checked");
        });
      }
      if (data.deathSaves) {
        Object.assign(deathSaves, data.deathSaves);
        deathSaves.successes.forEach((v, i) =>
          document
            .getElementById(`deathSuccess${i}`)
            ?.classList.toggle("checked", v),
        );
        deathSaves.failures.forEach((v, i) =>
          document
            .getElementById(`deathFailure${i}`)
            ?.classList.toggle("checked", v),
        );
      }
      if (data.activeConditions) {
        document.getElementById("activeConditionsInput").value =
          data.activeConditions;
        renderConditionTags();
      }
      (data.classFeatures || []).forEach((f) =>
        addFeatureItem("classFeaturesContainer", f.title, f.desc),
      );
      (data.raceFeatures || []).forEach((f) =>
        addFeatureItem("raceFeaturesContainer", f.title, f.desc),
      );
      (data.backgroundFeatures || []).forEach((f) =>
        addFeatureItem("backgroundFeaturesContainer", f.title, f.desc),
      );
      (data.feats || []).forEach((f) =>
        addFeatureItem("featsContainer", f.title, f.desc),
      );
      (data.actions || []).forEach((f) =>
        addFeatureItem("actionsContainer", f.title, f.desc),
      );
      (data.bonusActions || []).forEach((f) =>
        addFeatureItem("bonusActionsContainer", f.title, f.desc),
      );
      (data.reactions || []).forEach((f) =>
        addFeatureItem("reactionsContainer", f.title, f.desc),
      );
      if (data.charSize)
        document.getElementById("charSize").value = data.charSize;
      if (data.sizeFt) document.getElementById("sizeFt").value = data.sizeFt;

      const weaponList = document.getElementById("weapon-list");
      weaponList.innerHTML = "";
      if (data.weapons && data.weapons.length > 0) {
        data.weapons.forEach((w) => {
          try {
            addWeapon(w);
          } catch (e) {
            console.error("Error adding weapon:", w, e);
          }
        });
      }

      document.getElementById("inventoryList").innerHTML = "";
      document.getElementById("equippedList").innerHTML = "";
      (data.inventory || []).forEach((item) => {
        try {
          addInventoryItem(
            item.name,
            item.qty,
            item.weight,
            item.equipped,
            item.description,
          );
        } catch (e) {
          console.error("Error adding item:", item, e);
        }
      });

      if (data.spellSlotsData) spellSlotsData = data.spellSlotsData;
      if (data.resourcesData) resourcesData = data.resourcesData;
      
      document.getElementById("cantripList").innerHTML = "";
      (data.cantripsList || []).forEach((s) => {
        try {
          addSpellRow("cantripList", 0, s);
        } catch (e) {
          console.error("Error adding cantrip:", s, e);
        }
      });
      document.getElementById("preparedSpellsList").innerHTML = "";
      (data.preparedSpellsList || []).forEach((s) => {
        try {
          s.prepared = true;
          addSpellRow("preparedSpellsList", 1, s);
        } catch (e) {
          console.error("Error adding prepared spell:", s, e);
        }
      });
      document.getElementById("spellList").innerHTML = "";
      (data.spellsList || []).forEach((s) => {
        try {
          s.prepared = false;
          addSpellRow("spellList", 1, s);
        } catch (e) {
          console.error("Error adding spell:", s, e);
        }
      });

      if (data.attunement) {
        data.attunement.forEach(
          (v, i) => (document.getElementById(`attune${i + 1}`).value = v || ""),
        );
      }
      if (data.shield) document.getElementById("shieldEquipped").checked = true;
    } else {
      document.querySelectorAll("input, textarea, select").forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else el.value = "";
      });
      addFeatureItem("classFeaturesContainer");
      addFeatureItem("raceFeaturesContainer");
      addFeatureItem("backgroundFeaturesContainer");
      addFeatureItem("featsContainer");
      addFeatureItem("actionsContainer");
      addFeatureItem("bonusActionsContainer");
      addFeatureItem("reactionsContainer");
    }

    updateModifiers();
    renderSpellSlots();
    renderResources();
    updateHpBar();
    calculateWeight();
    renderWeaponTags();
    resizeAllTextareas();
  } catch (e) {
    console.error("Initialization error:", e);
  } finally {
    // Delay unlocking to allow any pending DOM events to fire without triggering a save
    setTimeout(() => {
      window.isInitializing = false;
    }, 200);
  }
});
