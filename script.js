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
     athletics: "Covers difficult situations you encounter while climbing, jumping, or swimming.",
     acrobatics: "Covers your attempt to stay on your feet in a tricky situation (ice, tightrope, etc).",
     sleight_of_hand: "Checks manual trickery, such as planting something on someone else.",
     stealth: "Covers your ability to conceal yourself from enemies.",
     arcana: "Measures your ability to recall lore about spells, magic items, and planes.",
     history: "Measures your ability to recall lore about historical events.",
     investigation: "Looks around for clues and makes deductions based on them.",
     nature: "Measures your ability to recall lore about terrain, plants, and animals.",
     religion: "Measures your ability to recall lore about deities and rites.",
     animal_handling: "Checks your ability to calm down a domesticated animal.",
     insight: "Decides whether you can determine the true intentions of a creature.",
     medicine: "Allows you to try to stabilize a dying companion or diagnose an illness.",
     perception: "Lets you spot, hear, or otherwise detect the presence of something.",
     survival: "Allows you to follow tracks, hunt wild game, and predict weather.",
     deception: "Determines whether you can convincingly hide the truth.",
     intimidation: "Allows you to influence others through overt threats.",
     performance: "Determines how well you can delight an audience.",
     persuasion: "Attempts to influence someone with tact and social graces.",
     save_str: "Used to resist a force that would physically move or bind you (e.g. gusts of wind, nets, entanglement).",
     save_dex: "Used to dodge out of harm's way (e.g. fireballs, lightning bolts, breath weapons, traps).",
     save_con: "Used to endure a toxic or physically taxing effect (e.g. poison, disease, concentration checks).",
     save_int: "Used to disbelieve certain illusions or resist mental assaults that rely on logic, memory, or psyche.",
     save_wis: "Used to resist effects that charm, frighten, or assault your willpower and senses (e.g. domination).",
     save_cha: "Used to withstand effects, such as possession or banishment, that would subsume your personality or hurl you to another plane.",
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
     { category: "Categories", items: ["Simple Weapons", "Martial Weapons", "Firearms", "Shields"] },
     { category: "Properties/Groups", items: ["Finesse Weapons", "Heavy Weapons", "Light Weapons", "Reach Weapons", "Thrown Weapons", "Versatile Weapons"] },
   ];
   
   // Weapon DB
   const dndWeaponsDB = {
     "Club": { type: "Simple", cat: "Melee", dmg: "1d4", dtype: "bludgeoning", props: ["Light"], mastery: "Slow" },
     "Dagger": { type: "Simple", cat: "Melee", dmg: "1d4", dtype: "piercing", props: ["Finesse", "Light", "Thrown (20/60)"], mastery: "Nick" },
     "Greatclub": { type: "Simple", cat: "Melee", dmg: "1d8", dtype: "bludgeoning", props: ["Two-Handed"], mastery: "Push" },
     "Handaxe": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "slashing", props: ["Light", "Thrown (20/60)"], mastery: "Vex" },
     "Javelin": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "piercing", props: ["Thrown (30/120)"], mastery: "Slow" },
     "Light Hammer": { type: "Simple", cat: "Melee", dmg: "1d4", dtype: "bludgeoning", props: ["Light", "Thrown (20/60)"], mastery: "Nick" },
     "Mace": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "bludgeoning", props: [], mastery: "Sap" },
     "Quarterstaff": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "bludgeoning", props: ["Versatile (1d8)"], mastery: "Topple" },
     "Sickle": { type: "Simple", cat: "Melee", dmg: "1d4", dtype: "slashing", props: ["Light"], mastery: "Nick" },
     "Spear": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "piercing", props: ["Thrown (20/60)", "Versatile (1d8)"], mastery: "Sap" },
     "Light Crossbow": { type: "Simple", cat: "Ranged", dmg: "1d8", dtype: "piercing", props: ["Ammunition (80/320)", "Loading", "Two-Handed"], mastery: "Slow" },
     "Dart": { type: "Simple", cat: "Ranged", dmg: "1d4", dtype: "piercing", props: ["Finesse", "Thrown (20/60)"], mastery: "Vex" },
     "Shortbow": { type: "Simple", cat: "Ranged", dmg: "1d6", dtype: "piercing", props: ["Ammunition (80/320)", "Two-Handed"], mastery: "Vex" },
     "Sling": { type: "Simple", cat: "Ranged", dmg: "1d4", dtype: "bludgeoning", props: ["Ammunition (30/120)"], mastery: "Slow" },
     "Battleaxe": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "slashing", props: ["Versatile (1d10)"], mastery: "Topple" },
     "Flail": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "bludgeoning", props: [], mastery: "Sap" },
     "Glaive": { type: "Martial", cat: "Melee", dmg: "1d10", dtype: "slashing", props: ["Heavy", "Reach", "Two-Handed"], mastery: "Graze" },
     "Greataxe": { type: "Martial", cat: "Melee", dmg: "1d12", dtype: "slashing", props: ["Heavy", "Two-Handed"], mastery: "Cleave" },
     "Greatsword": { type: "Martial", cat: "Melee", dmg: "2d6", dtype: "slashing", props: ["Heavy", "Two-Handed"], mastery: "Graze" },
     "Halberd": { type: "Martial", cat: "Melee", dmg: "1d10", dtype: "slashing", props: ["Heavy", "Reach", "Two-Handed"], mastery: "Cleave" },
     "Lance": { type: "Martial", cat: "Melee", dmg: "1d12", dtype: "piercing", props: ["Reach", "Special"], mastery: "Topple" },
     "Longsword": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "slashing", props: ["Versatile (1d10)"], mastery: "Sap" },
     "Maul": { type: "Martial", cat: "Melee", dmg: "2d6", dtype: "bludgeoning", props: ["Heavy", "Two-Handed"], mastery: "Topple" },
     "Morningstar": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "piercing", props: [], mastery: "Sap" },
     "Pike": { type: "Martial", cat: "Melee", dmg: "1d10", dtype: "piercing", props: ["Heavy", "Reach", "Two-Handed"], mastery: "Push" },
     "Rapier": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "piercing", props: ["Finesse"], mastery: "Vex" },
     "Scimitar": { type: "Martial", cat: "Melee", dmg: "1d6", dtype: "slashing", props: ["Finesse", "Light"], mastery: "Nick" },
     "Shortsword": { type: "Martial", cat: "Melee", dmg: "1d6", dtype: "piercing", props: ["Finesse", "Light"], mastery: "Vex" },
     "Trident": { type: "Martial", cat: "Melee", dmg: "1d6", dtype: "piercing", props: ["Thrown (20/60)", "Versatile (1d8)"], mastery: "Topple" },
     "War Pick": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "piercing", props: [], mastery: "Sap" },
     "Warhammer": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "bludgeoning", props: ["Versatile (1d10)"], mastery: "Push" },
     "Whip": { type: "Martial", cat: "Melee", dmg: "1d4", dtype: "slashing", props: ["Finesse", "Reach"], mastery: "Slow" },
     "Blowgun": { type: "Martial", cat: "Ranged", dmg: "1", dtype: "piercing", props: ["Ammunition (25/100)", "Loading"], mastery: "Vex" },
     "Hand Crossbow": { type: "Martial", cat: "Ranged", dmg: "1d6", dtype: "piercing", props: ["Ammunition (30/120)", "Light", "Loading"], mastery: "Vex" },
     "Heavy Crossbow": { type: "Martial", cat: "Ranged", dmg: "1d10", dtype: "piercing", props: ["Ammunition (100/400)", "Heavy", "Loading", "Two-Handed"], mastery: "Push" },
     "Longbow": { type: "Martial", cat: "Ranged", dmg: "1d8", dtype: "piercing", props: ["Ammunition (150/600)", "Heavy", "Two-Handed"], mastery: "Slow" },
     "Net": { type: "Martial", cat: "Ranged", dmg: "0", dtype: "-", props: ["Special", "Thrown (5/15)"], mastery: null },
   };
   
   const conditionsDB = {
     "Blinded": "You can't see. Attacks against you have Advantage. Your attacks have Disadvantage.",
     "Charmed": "You can't attack the charmer. The charmer has Advantage on social checks against you.",
     "Deafened": "You can't hear. You fail checks involving hearing.",
     "Exhaustion": "Suffering from levels of exhaustion. 1: Disadv on checks. 2: Speed halved. 3: Disadv on attacks/saves. 4: HP max halved. 5: Speed 0. 6: Death.",
     "Frightened": "Disadvantage on checks/attacks while source of fear is visible. Can't move closer to source.",
     "Grappled": "Speed is 0. Ends if grappler is incapacitated or you are moved away.",
     "Incapacitated": "You can't take actions or reactions.",
     "Invisible": "You can't be seen. You have Advantage on attacks. Attacks against you have Disadvantage.",
     "Paralyzed": "Incapacitated. Can't move/speak. Auto-fail Str/Dex saves. Attacks against you have Advantage and are crits if within 5ft.",
     "Petrified": "Transformed to stone. Incapacitated. Resistant to all damage. Immune to poison/disease.",
     "Poisoned": "Disadvantage on attack rolls and ability checks.",
     "Prone": "Move at half speed. Attacks have Disadvantage. Melee attacks against you have Advantage; Ranged have Disadvantage.",
     "Restrained": "Speed is 0. Attacks against you have Advantage. Your attacks have Disadvantage. Disadvantage on Dex saves.",
     "Stunned": "Incapacitated. Can't move/speak. Fails Str/Dex saves. Attacks against you have Advantage.",
     "Unconscious": "Incapacitated. Drop held items. Prone. Auto-fail Str/Dex saves. Attacks against you have Advantage and are crits if within 5ft.",
   };
   
   // State Variables
   const skillProficiency = {};
   const saveProficiency = {};
   const deathSaves = { successes: [false, false, false], failures: [false, false, false] };
   let spellSlotsData = [{ level: 1, total: 1, used: 0 }];
   let pbScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
   const pbCosts = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
   const maxPoints = 27;
   
   /* =========================================
      2. FUNCTIONS
      ========================================= */
   
   function calcMod(score) { return Math.floor((score - 10) / 2); }
   function formatMod(mod) { return mod >= 0 ? `+${mod}` : `${mod}`; }
   
   // Auto-resize logic
   function autoResizeTextarea(element) {
     element.style.height = "auto";
     element.style.height = element.scrollHeight + "px";
   }
   document.addEventListener("input", function (event) {
     if (event.target.tagName.toLowerCase() === "textarea") { autoResizeTextarea(event.target); }
   });
   function resizeAllTextareas() { document.querySelectorAll("textarea").forEach(autoResizeTextarea); }
   
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
       if (weaponData.props.includes("Finesse")) { abilityMod = Math.max(strMod, dexMod); }
       else if (weaponData.cat === "Ranged" && !weaponData.props.some((p) => p.includes("Thrown"))) { abilityMod = dexMod; }
       
       let isProficient = false;
       if (weaponData.type === "Simple" && profString.includes("Simple Weapons")) isProficient = true;
       if (weaponData.type === "Martial" && profString.includes("Martial Weapons")) isProficient = true;
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
     const spellAbility = document.getElementById("spellAbility").value;
     const abilityScore = parseInt(document.getElementById(spellAbility).value) || 10;
     const abilityMod = calcMod(abilityScore);
     const profBonus = parseInt(document.getElementById("profBonus").value) || 0;
     document.getElementById("spellDC").value = 8 + profBonus + abilityMod;
   }
   
   window.calculateTotalAC = function () {
     const acInput = document.getElementById("baseAC");
     const shieldBox = document.getElementById("shieldEquipped");
     let currentVal = parseInt(acInput.value) || 10;
     if (shieldBox.checked) { acInput.value = currentVal + 2; } else { acInput.value = currentVal - 2; }
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
       case "Tiny": multiplier = 7.5; break;
       case "Large": multiplier = 30; break;
       case "Huge": multiplier = 60; break;
       case "Gargantuan": multiplier = 120; break;
     }
     const maxCapacity = Math.floor(strScore * multiplier);
     document.getElementById("totalWeightVal").textContent = total.toFixed(1);
     document.getElementById("maxWeightVal").textContent = maxCapacity;
     const dragSpan = document.getElementById("maxDragVal");
     if (dragSpan) dragSpan.textContent = maxCapacity * 2;
     
     const weightBox = document.querySelector(".total-weight-box");
     if (total > maxCapacity) {
       weightBox.style.color = "#8b0000"; weightBox.style.borderColor = "#8b0000"; weightBox.style.backgroundColor = "#ffdddd"; weightBox.style.fontWeight = "800";
     } else {
       weightBox.style.color = "var(--ink)"; weightBox.style.borderColor = "var(--gold)"; weightBox.style.backgroundColor = "var(--parchment-dark)"; weightBox.style.fontWeight = "700";
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
       hpBarCurrent.style.width = `${currentPct}%`; hpBarTemp.style.width = `${tempPct}%`; hpBarTemp.style.left = "0%";
     } else {
       hpBarCurrent.style.width = `${currentPct}%`; hpBarTemp.style.width = `${Math.min(tempPct, 100 - currentPct)}%`; hpBarTemp.style.left = `${currentPct}%`;
     }
     document.getElementById("hpTextDisplay").textContent = current + (temp > 0 ? ` (+${temp})` : "");
     document.getElementById("maxHpTextDisplay").textContent = max;
   };
   
   window.adjustHP = function (amount) { const hpInput = document.getElementById("hp"); hpInput.value = (parseInt(hpInput.value) || 0) + amount; updateHpBar(); saveCharacter(); };
   window.adjustTempHP = function (amount) { const tempInput = document.getElementById("tempHp"); let val = (parseInt(tempInput.value) || 0) + amount; if (val < 0) val = 0; tempInput.value = val; updateHpBar(); saveCharacter(); };
   window.toggleSkill = function (skillName) { skillProficiency[skillName] = !skillProficiency[skillName]; document.getElementById(`skillCheck_${skillName}`)?.classList.toggle("checked", skillProficiency[skillName]); updateModifiers(); saveCharacter(); };
   window.toggleSave = function (ability) { saveProficiency[ability] = !saveProficiency[ability]; document.getElementById(`saveCheck_${ability}`)?.classList.toggle("checked", saveProficiency[ability]); updateModifiers(); saveCharacter(); };
   window.toggleDeathSave = function (type, index) { const arr = type === "success" ? deathSaves.successes : deathSaves.failures; arr[index] = !arr[index]; document.getElementById(type === "success" ? `deathSuccess${index}` : `deathFailure${index}`).classList.toggle("checked", arr[index]); saveCharacter(); };
   window.switchTab = function (tabName) { document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active")); document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active")); document.getElementById(tabName).classList.add("active"); event.target.classList.add("active"); };
   
   window.addFeatureItem = function (containerId, title = "", desc = "") {
     const container = document.getElementById(containerId);
     if (!container) return;
     const box = document.createElement("div");
     box.className = "feature-box";
     box.innerHTML = `<div class="feature-header"><input type="text" class="feature-title-input" placeholder="Feature Name" value="${title}" oninput="saveCharacter()"><button class="delete-feature-btn" onclick="this.parentElement.parentElement.remove(); saveCharacter()">×</button></div><textarea class="feature-desc-input" placeholder="Description..." oninput="saveCharacter()">${desc}</textarea>`;
     container.appendChild(box);
     saveCharacter();
   };
   
   // Drag & Drop
   function setupDragItem(item, containerId) {
     const handle = item.querySelector(".drag-handle");
     const container = document.getElementById(containerId);
     if (!handle || !container) return;
     item.draggable = true;
     item.addEventListener("dragstart", () => item.classList.add("dragging"));
     item.addEventListener("dragend", () => { item.classList.remove("dragging"); saveCharacter(); });
     handle.addEventListener("touchstart", (e) => { e.preventDefault(); item.classList.add("dragging"); }, { passive: false });
     handle.addEventListener("touchmove", (e) => {
       e.preventDefault();
       const touch = e.touches[0];
       const afterElement = getDragAfterElement(container, touch.clientY);
       if (afterElement == null) { container.appendChild(item); } else { container.insertBefore(item, afterElement); }
     }, { passive: false });
     handle.addEventListener("touchend", (e) => { item.classList.remove("dragging"); saveCharacter(); });
   }
   
   function getDragAfterElement(container, y) {
     const draggableElements = [...container.querySelectorAll(".inventory-item:not(.dragging), .spell-row:not(.dragging)")];
     return draggableElements.reduce((closest, child) => {
       const box = child.getBoundingClientRect();
       const offset = y - box.top - box.height / 2;
       if (offset < 0 && offset > closest.offset) { return { offset: offset, element: child }; } else { return closest; }
     }, { offset: Number.NEGATIVE_INFINITY }).element;
   }
   
   /* =========================================
      3. INVENTORY & NOTES
      ========================================= */
   window.addInventoryItem = function (name = "", qty = 1, weight = 0, isEquipped = false, description = "") {
     const listId = isEquipped ? "equippedList" : "inventoryList";
     const list = document.getElementById(listId);
     const div = document.createElement("div");
     div.className = "inventory-item";
     
     // Hidden Input for Description
     const descInput = document.createElement("input");
     descInput.type = "hidden"; descInput.className = "desc-field"; descInput.value = description || "";
     
     // Drag Handle
     const dragHandle = document.createElement("div");
     dragHandle.className = "drag-handle"; dragHandle.innerHTML = "☰";
     
     // Equip Check
     const check = document.createElement("input");
     check.type = "checkbox"; check.className = "equip-check"; check.checked = isEquipped; check.title = "Equip/Unequip";
     check.onchange = function () {
       // Logic to move item between lists
       div.remove();
       addInventoryItem(nameInput.value, qtyInput.value, weightInput.value, !isEquipped, descInput.value);
       calculateWeight();
       saveCharacter();
     };
     
     // Fields
     const nameInput = document.createElement("input"); nameInput.type = "text"; nameInput.className = "name-field"; nameInput.placeholder = "Item Name"; nameInput.value = name; nameInput.oninput = saveCharacter;
     const qtyInput = document.createElement("input"); qtyInput.type = "number"; qtyInput.className = "qty-field"; qtyInput.placeholder = "Qty"; qtyInput.value = qty; qtyInput.oninput = () => { calculateWeight(); saveCharacter(); };
     const weightInput = document.createElement("input"); weightInput.type = "number"; weightInput.className = "weight-field"; weightInput.placeholder = "Lbs"; weightInput.value = weight; weightInput.oninput = () => { calculateWeight(); saveCharacter(); };
     
     // Note Button
     const noteBtn = document.createElement("button");
     noteBtn.className = "note-btn"; noteBtn.innerHTML = "📝"; noteBtn.title = "View/Edit Notes";
     if (description && description.trim().length > 0) { noteBtn.classList.add("has-notes"); }
     noteBtn.onclick = function () { openNoteEditor(nameInput.value, descInput, noteBtn); };
     
     // Delete
     const delBtn = document.createElement("button");
     delBtn.innerText = "×"; delBtn.className = "delete-btn";
     delBtn.onclick = function () { if (confirm("Delete item?")) { div.remove(); calculateWeight(); saveCharacter(); } };
     
     div.appendChild(dragHandle); div.appendChild(check); div.appendChild(nameInput); div.appendChild(qtyInput); div.appendChild(weightInput); div.appendChild(noteBtn); div.appendChild(delBtn);
     list.appendChild(div);
     setupDragItem(div, listId);
     calculateWeight();
   };
   
   window.openNoteEditor = function (itemName, inputElement, btnElement) {
     const existing = document.getElementById("note-modal-overlay"); if (existing) existing.remove();
     const overlay = document.createElement("div"); overlay.id = "note-modal-overlay"; overlay.className = "note-modal-overlay";
     const box = document.createElement("div"); box.className = "note-modal";
     const header = document.createElement("h3"); header.style.margin = "0 0 10px 0"; header.style.borderBottom = "1px solid #8b2e2e"; header.innerText = itemName || "Item Notes";
     const displayDiv = document.createElement("div"); displayDiv.className = "note-display"; displayDiv.innerHTML = inputElement.value || "<em style='color:#999'>No notes...</em>";
     const textArea = document.createElement("textarea"); textArea.className = "note-textarea"; textArea.value = inputElement.value;
     const controls = document.createElement("div"); controls.className = "note-controls";
     
     const editBtn = document.createElement("button"); editBtn.innerText = "Edit Text"; editBtn.className = "btn btn-secondary"; editBtn.style.padding = "5px 10px"; editBtn.style.fontSize = "0.8rem";
     const saveBtn = document.createElement("button"); saveBtn.innerText = "Save & Close"; saveBtn.className = "btn"; saveBtn.style.padding = "5px 15px"; saveBtn.style.fontSize = "0.9rem";
     
     let isEditing = false;
     editBtn.onclick = () => {
       isEditing = !isEditing;
       if (isEditing) { displayDiv.style.display = "none"; textArea.style.display = "block"; editBtn.innerText = "View Rendered"; textArea.focus(); }
       else { displayDiv.innerHTML = textArea.value || "<em style='color:#999'>No notes...</em>"; displayDiv.style.display = "block"; textArea.style.display = "none"; editBtn.innerText = "Edit Text"; }
     };
     saveBtn.onclick = () => { inputElement.value = textArea.value; if (textArea.value.trim().length > 0) { btnElement.classList.add("has-notes"); } else { btnElement.classList.remove("has-notes"); } saveCharacter(); overlay.remove(); };
     const closeBtn = document.createElement("button"); closeBtn.innerText = "Cancel"; closeBtn.style.background = "none"; closeBtn.style.border = "none"; closeBtn.style.cursor = "pointer"; closeBtn.onclick = () => overlay.remove();
     
     controls.appendChild(editBtn); controls.appendChild(closeBtn); controls.appendChild(saveBtn);
     box.appendChild(header); box.appendChild(displayDiv); box.appendChild(textArea); box.appendChild(controls);
     overlay.appendChild(box); document.body.appendChild(overlay);
   };

   /* =========================================
      ITEM SEARCH (IndexedDB)
      ========================================= */
   const DB_NAME = 'DndDataDB';
   const STORE_NAME = 'files';
   const DB_VERSION = 1;

   function openDB() {
       return new Promise((resolve, reject) => {
           const request = indexedDB.open(DB_NAME, DB_VERSION);
           request.onerror = () => {
               console.error("IndexedDB open error:", request.error);
               reject(request.error);
           };
           request.onsuccess = () => resolve(request.result);
           request.onupgradeneeded = (e) => {
               console.log("IndexedDB upgrade needed");
               const db = e.target.result;
               if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
           };
       });
   }

   async function checkDataUploadStatus() {
       console.log("Checking data upload status...");
       try {
           const db = await openDB();
           const tx = db.transaction(STORE_NAME, 'readonly');
           const store = tx.objectStore(STORE_NAME);
           const req = store.get('currentData');
           req.onsuccess = () => {
               const btnItems = document.getElementById('btn-search-items-zip');
               const btnCantrips = document.getElementById('btn-search-cantrips-zip');
               const btnSpells = document.getElementById('btn-search-spells-zip');

               if (req.result) {
                   console.log("Data found in IndexedDB. Showing search buttons.");
                   if (btnItems) btnItems.style.display = 'inline-block';
                   if (btnCantrips) btnCantrips.style.display = 'inline-block';
                   if (btnSpells) btnSpells.style.display = 'inline-block';
               } else {
                   console.log("No data found in IndexedDB. Hiding search buttons.");
                   if (btnItems) btnItems.style.display = 'none';
                   if (btnCantrips) btnCantrips.style.display = 'none';
                   if (btnSpells) btnSpells.style.display = 'none';
               }
           };
           req.onerror = (e) => {
               console.error("Error reading from object store:", e);
           };
       } catch (e) { console.error("Error checking data status:", e); }
   }

   let allItemsCache = [];
   let currentSearchResults = [];
   let itemSearchPage = 1;
   const ITEMS_PER_PAGE = 50;

   window.openItemSearch = async function() {
       document.getElementById('itemSearchModal').style.display = 'flex';
       document.getElementById('itemSearchInput').value = '';
       const list = document.getElementById('itemSearchList');
       list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">Loading items library...</div>';
       document.getElementById('itemSearchPagination').style.display = 'none';
       
       try {
           const db = await openDB();
           const tx = db.transaction(STORE_NAME, 'readonly');
           const store = tx.objectStore(STORE_NAME);
           const data = await new Promise((resolve, reject) => {
               const req = store.get('currentData');
               req.onsuccess = () => resolve(req.result);
               req.onerror = () => reject(req.error);
           });

           if (!data) {
               list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">No data found. Please upload a file in Data Viewer.</div>';
               return;
           }

           const results = [];
           data.forEach(file => {
               try { 
                   const json = JSON.parse(file.content);
                   // Strict filtering: Only look in known item arrays to avoid monsters/spells/adventures
                   const arraysToCheck = [json.item, json.items, json.baseitem, json.baseitems, json.magicvariant, json.magicvariants, json.variant];
                   arraysToCheck.forEach(arr => {
                       if (Array.isArray(arr)) {
                           arr.forEach(item => {
                               if (item.name && typeof item.name === 'string') {
                                   results.push(item);
                               }
                           });
                       }
                   });
               } catch (e) {}
           });

           // Deduplicate by name
           const uniqueResults = Array.from(new Map(results.map(item => [item.name, item])).values());
           // Sort
           uniqueResults.sort((a, b) => a.name.localeCompare(b.name));
           
           allItemsCache = uniqueResults;
           currentSearchResults = allItemsCache;
           itemSearchPage = 1;
           
           renderItemSearchPage();
           document.getElementById('itemSearchInput').focus();

       } catch (e) {
           console.error(e);
           list.innerHTML = '<div style="padding:10px; color:red; text-align:center;">Error loading database.</div>';
       }
   };

   window.closeItemSearch = function() {
       document.getElementById('itemSearchModal').style.display = 'none';
   };

   window.filterItemSearch = function() {
       const term = document.getElementById('itemSearchInput').value.toLowerCase();
       if (!term) {
           currentSearchResults = allItemsCache;
       } else {
           currentSearchResults = allItemsCache.filter(item => item.name.toLowerCase().includes(term));
       }
       itemSearchPage = 1;
       renderItemSearchPage();
   };

   window.changeItemSearchPage = function(delta) {
       const maxPage = Math.ceil(currentSearchResults.length / ITEMS_PER_PAGE);
       const newPage = itemSearchPage + delta;
       if (newPage >= 1 && newPage <= maxPage) {
           itemSearchPage = newPage;
           renderItemSearchPage();
           document.getElementById('itemSearchList').scrollTop = 0;
       }
   };

   function renderItemSearchPage() {
       const list = document.getElementById('itemSearchList');
       const pagination = document.getElementById('itemSearchPagination');
       const pageInfo = document.getElementById('itemSearchPageInfo');
       
       if (currentSearchResults.length === 0) {
           list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">No matching items found.</div>';
           pagination.style.display = 'none';
           return;
       }

       pagination.style.display = 'flex';
       const maxPage = Math.ceil(currentSearchResults.length / ITEMS_PER_PAGE);
       pageInfo.textContent = `Page ${itemSearchPage} of ${maxPage}`;
       
       const startIndex = (itemSearchPage - 1) * ITEMS_PER_PAGE;
       const itemsToShow = currentSearchResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
       
       list.innerHTML = '';
       
       // Helper to clean 5e-tools style tags
       const cleanText = (str) => {
           if (!str) return "";
           return str.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => {
               if (!content) return "";
               return content.split('|')[0];
           });
       };

       itemsToShow.forEach(item => {
           const div = document.createElement('div');
           div.className = 'checklist-item';
           div.style.flexDirection = 'column';
           div.style.alignItems = 'flex-start';
           
           const weight = item.weight || item.weight_lbs || 0;
           let desc = "";
           
           // Recursively extract text from entries array
           const processEntries = (entries) => {
               if (!entries) return "";
               if (typeof entries === 'string') return entries;
               if (!Array.isArray(entries)) return "";
               
               return entries.map(e => {
                   if (!e) return "";
                   if (typeof e === 'string') return e;
                   
                   let text = "";
                   if (e.name && (e.type === 'section' || e.type === 'entries')) text += `${e.name}. `;
                   
                   if (e.entries) text += processEntries(e.entries);
                   else if (e.items) text += processEntries(e.items);
                   else if (e.entry) text += (typeof e.entry === 'string' ? e.entry : processEntries([e.entry]));
                   else if (e.caption) text += e.caption;
                   else if (e.text) text += e.text;
                   
                   return text;
               }).join("\n");
           };

           if (item.entries) desc = processEntries(item.entries);
           if (!desc && item.inherits && item.inherits.entries) desc = processEntries(item.inherits.entries);
           if (!desc && item.description) desc = item.description;
           if (!desc && item.text) desc = item.text;
           
           // Clean the description
           desc = cleanText(desc);

           // Format description for preview
           let previewDesc = typeof desc === 'string' ? desc.replace(/<[^>]*>/g, '') : "See notes";
           if (previewDesc.length > 80) previewDesc = previewDesc.substring(0, 80) + '...';

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

   window.openSpellSearch = async function(containerId, filterType) {
       spellTargetContainer = containerId;
       spellSearchFilterType = filterType;
       document.getElementById('spellSearchModal').style.display = 'flex';
       document.getElementById('spellSearchInput').value = '';
       const list = document.getElementById('spellSearchList');
       list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">Loading spells library...</div>';
       document.getElementById('spellSearchPagination').style.display = 'none';

       try {
           const db = await openDB();
           const tx = db.transaction(STORE_NAME, 'readonly');
           const store = tx.objectStore(STORE_NAME);
           const data = await new Promise((resolve, reject) => {
               const req = store.get('currentData');
               req.onsuccess = () => resolve(req.result);
               req.onerror = () => reject(req.error);
           });

           if (!data) {
               list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">No data found. Please upload a file in Data Viewer.</div>';
               return;
           }

           const results = [];
           data.forEach(file => {
               try { 
                   const json = JSON.parse(file.content);
                   const arraysToCheck = [json.spell, json.spells];
                   arraysToCheck.forEach(arr => {
                       if (Array.isArray(arr)) {
                           arr.forEach(spell => {
                               if (spell.name && typeof spell.name === 'string') {
                                   // Filter based on type
                                   if (spellSearchFilterType === 'cantrip' && spell.level === 0) {
                                       results.push(spell);
                                   } else if (spellSearchFilterType === 'leveled' && spell.level > 0) {
                                       results.push(spell);
                                   }
                               }
                           });
                       }
                   });
               } catch (e) {}
           });

           // Deduplicate
           const uniqueResults = Array.from(new Map(results.map(s => [s.name + s.source, s])).values());
           uniqueResults.sort((a, b) => a.name.localeCompare(b.name));
           
           allSpellsCache = uniqueResults;
           currentSpellResults = allSpellsCache;
           spellSearchPage = 1;
           
           renderSpellSearchPage();
           document.getElementById('spellSearchInput').focus();

       } catch (e) {
           console.error(e);
           list.innerHTML = '<div style="padding:10px; color:red; text-align:center;">Error loading database.</div>';
       }
   };

   window.closeSpellSearch = function() {
       document.getElementById('spellSearchModal').style.display = 'none';
   };

   window.filterSpellSearch = function() {
       const term = document.getElementById('spellSearchInput').value.toLowerCase();
       if (!term) {
           currentSpellResults = allSpellsCache;
       } else {
           currentSpellResults = allSpellsCache.filter(s => s.name.toLowerCase().includes(term));
       }
       spellSearchPage = 1;
       renderSpellSearchPage();
   };

   window.changeSpellSearchPage = function(delta) {
       const maxPage = Math.ceil(currentSpellResults.length / ITEMS_PER_PAGE);
       const newPage = spellSearchPage + delta;
       if (newPage >= 1 && newPage <= maxPage) {
           spellSearchPage = newPage;
           renderSpellSearchPage();
           document.getElementById('spellSearchList').scrollTop = 0;
       }
   };

   function renderSpellSearchPage() {
       const list = document.getElementById('spellSearchList');
       const pagination = document.getElementById('spellSearchPagination');
       const pageInfo = document.getElementById('spellSearchPageInfo');
       
       if (currentSpellResults.length === 0) {
           list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">No matching spells found.</div>';
           pagination.style.display = 'none';
           return;
       }

       pagination.style.display = 'flex';
       const maxPage = Math.ceil(currentSpellResults.length / ITEMS_PER_PAGE);
       pageInfo.textContent = `Page ${spellSearchPage} of ${maxPage}`;
       
       const startIndex = (spellSearchPage - 1) * ITEMS_PER_PAGE;
       const spellsToShow = currentSpellResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
       
       list.innerHTML = '';
       spellsToShow.forEach(spell => {
           const div = document.createElement('div');
           div.className = 'checklist-item';
           div.style.flexDirection = 'column';
           div.style.alignItems = 'flex-start';
           
           const levelStr = spell.level === 0 ? "Cantrip" : `Level ${spell.level}`;
           const school = spell.school ? spell.school.toUpperCase() : "";
           
           div.innerHTML = `
               <div style="font-weight:bold; width:100%; display:flex; justify-content:space-between;">
                   <span>${spell.name}</span>
                   <span style="font-size:0.8rem; color:var(--ink-light);">${levelStr} ${school ? '('+school+')' : ''}</span>
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
                       return content.split('|')[0];
                   });
               };

               // Recursively extract text from entries array
               const processEntries = (entries) => {
                   if (!entries) return "";
                   if (typeof entries === 'string') return entries;
                   if (!Array.isArray(entries)) return "";
                   
                   return entries.map(e => {
                       if (!e) return "";
                       if (typeof e === 'string') return e;
                       
                       let text = "";
                       if (e.name && (e.type === 'section' || e.type === 'entries')) text += `${e.name}. `;
                       
                       if (e.entries) text += processEntries(e.entries);
                       else if (e.items) text += processEntries(e.items);
                       else if (e.entry) text += (typeof e.entry === 'string' ? e.entry : processEntries([e.entry]));
                       else if (e.caption) text += e.caption;
                       else if (e.text) text += e.text;
                       
                       return text;
                   }).join("\n");
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
                        range = `${spell.range.distance.amount ? spell.range.distance.amount + ' ' : ''}${spell.range.distance.type}`;
                   } else {
                       range = spell.range.type;
                   }
               }

               let concentration = false;
               if (spell.duration && spell.duration[0] && spell.duration[0].concentration) concentration = true;

               let ritual = spell.meta && spell.meta.ritual ? true : false;
               
               let material = false;
               if (spell.components && (spell.components.m || spell.components.M)) material = true;

               const spellData = {
                   name: spell.name,
                   level: spell.level,
                   time: time,
                   range: range,
                   ritual: ritual,
                   concentration: concentration,
                   material: material,
                   description: desc
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
     const container = document.getElementById("conditionListContainer"); container.innerHTML = "";
     const currentVal = document.getElementById("activeConditionsInput").value;
     const activeList = currentVal ? currentVal.split(",") : [];
     Object.keys(conditionsDB).forEach((name) => {
       const desc = conditionsDB[name];
       const div = document.createElement("div"); div.className = "checklist-item"; div.style.flexDirection = "column"; div.style.alignItems = "flex-start"; div.style.padding = "10px";
       const topRow = document.createElement("div"); topRow.style.display = "flex"; topRow.style.alignItems = "center"; topRow.style.gap = "10px"; topRow.style.width = "100%"; topRow.style.marginBottom = "4px";
       const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.value = name; checkbox.checked = activeList.includes(name); checkbox.onchange = saveConditionsSelection;
       const label = document.createElement("span"); label.style.fontWeight = "bold"; label.style.fontSize = "1rem"; label.textContent = name;
       topRow.appendChild(checkbox); topRow.appendChild(label);
       const descText = document.createElement("div"); descText.style.fontSize = "0.85rem"; descText.style.color = "var(--ink-light)"; descText.style.marginLeft = "26px"; descText.style.lineHeight = "1.4"; descText.textContent = desc;
       div.appendChild(topRow); div.appendChild(descText);
       div.onclick = (e) => { if (e.target !== checkbox) { checkbox.checked = !checkbox.checked; saveConditionsSelection(); } };
       container.appendChild(div);
     });
     document.getElementById("conditionModal").style.display = "flex";
   };
   window.closeConditionModal = () => document.getElementById("conditionModal").style.display = "none";
   function saveConditionsSelection() {
     const checkboxes = document.querySelectorAll("#conditionListContainer input[type='checkbox']:checked");
     const selected = Array.from(checkboxes).map((cb) => cb.value);
     document.getElementById("activeConditionsInput").value = selected.join(",");
     renderConditionTags();
     saveCharacter();
   }
   window.openWeaponProfModal = function () {
     const currentVal = document.getElementById("weaponProfs").value;
     const currentArray = currentVal ? currentVal.split(",").map((s) => s.trim()) : [];
     const container = document.getElementById("weaponChecklist"); container.innerHTML = "";
     weaponProficiencyOptions.forEach((group) => {
       const header = document.createElement("div"); header.className = "modal-section-header"; header.style.gridColumn = "1 / -1"; header.textContent = group.category; container.appendChild(header);
       group.items.forEach((item) => {
         const div = document.createElement("div"); div.className = "checklist-item"; div.onclick = function (e) { if (e.target.tagName !== "INPUT") { const cb = this.querySelector("input"); cb.checked = !cb.checked; } };
         const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.value = item; if (currentArray.includes(item)) checkbox.checked = true;
         const span = document.createElement("span"); span.textContent = item;
         div.appendChild(checkbox); div.appendChild(span); container.appendChild(div);
       });
     });
     document.getElementById("weaponProfModal").style.display = "flex";
   };
   window.closeWeaponProfModal = () => document.getElementById("weaponProfModal").style.display = "none";
   window.saveWeaponProfsSelection = function () {
     const checkboxes = document.querySelectorAll("#weaponChecklist input[type='checkbox']:checked");
     const selected = Array.from(checkboxes).map((cb) => cb.value);
     document.getElementById("weaponProfs").value = selected.join(", ");
     renderWeaponTags(); updateAllWeaponStats(); saveCharacter(); closeWeaponProfModal();
   };
   window.renderWeaponTags = function () {
     const raw = document.getElementById("weaponProfs").value;
     const display = document.getElementById("weaponProfsDisplay");
     display.innerHTML = "";
     if (!raw) { display.innerHTML = '<span style="color: var(--ink-light); font-style: italic; font-size: 0.9rem;">Click to select...</span>'; return; }
     raw.split(",").map(s => s.trim()).filter(s => s).forEach(item => { const tag = document.createElement("div"); tag.className = "tag-item"; tag.textContent = item; display.appendChild(tag); });
   };
   
   // Weapon Picker
   let currentWeaponInput = null;
   window.openWeaponPicker = function (inputElement) {
     currentWeaponInput = inputElement;
     const modal = document.getElementById("weaponPickerModal");
     const list = document.getElementById("weaponPickerList");
     document.getElementById("weaponSearch").value = ""; list.innerHTML = "";
     Object.keys(dndWeaponsDB).sort().forEach((name) => {
       const w = dndWeaponsDB[name];
       const div = document.createElement("div"); div.className = "checklist-item"; div.style.justifyContent = "space-between";
       div.innerHTML = `<span style="font-weight:bold;">${name}</span><span style="font-size:0.8rem; color:var(--ink-light);">${w.dmg} ${w.dtype}</span>`;
       div.onclick = () => selectWeaponFromPicker(name);
       list.appendChild(div);
     });
     modal.style.display = "flex"; document.getElementById("weaponSearch").focus();
   };
   window.filterWeaponPicker = function () {
     const term = document.getElementById("weaponSearch").value.toLowerCase();
     document.querySelectorAll("#weaponPickerList .checklist-item").forEach((item) => { item.style.display = item.textContent.toLowerCase().includes(term) ? "flex" : "none"; });
   };
   window.closeWeaponPicker = function () { document.getElementById("weaponPickerModal").style.display = "none"; currentWeaponInput = null; };
   window.selectCustomWeapon = function () {
     const term = document.getElementById("weaponSearch").value;
     if (currentWeaponInput) { currentWeaponInput.value = term || "Custom Weapon"; saveCharacter(); }
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
     if (weaponData.props.includes("Finesse")) { abilityMod = Math.max(strMod, dexMod); }
     else if (weaponData.cat === "Ranged" && !weaponData.props.some(p => p.includes("Thrown"))) { abilityMod = dexMod; }
     
     const profString = document.getElementById("weaponProfs").value || "";
     let isProficient = false;
     if (weaponData.type === "Simple" && profString.includes("Simple Weapons")) isProficient = true;
     if (weaponData.type === "Martial" && profString.includes("Martial Weapons")) isProficient = true;
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
     saveCharacter(); closeWeaponPicker();
   };
   
   window.openMasteryModal = () => document.getElementById("masteryModal").style.display = "flex";
   window.addWeapon = function (data = null) {
     const weaponList = document.getElementById("weapon-list");
     const newWeapon = document.createElement("div"); newWeapon.className = "feature-box weapon-item"; newWeapon.style.paddingRight = "40px"; newWeapon.style.position = "relative";
     newWeapon.innerHTML = `<button class="delete-feature-btn" style="position: absolute; top: 5px; right: 5px; z-index:10; width: 24px; height: 24px;" onclick="this.closest('.weapon-item').remove(); saveCharacter();">&times;</button><div style="display: flex; flex-direction: column; gap: 10px;"><div class="grid grid-3" style="margin-bottom: 0; gap: 10px;"><div class="field"><span class="field-label">Weapon Name</span><input type="text" class="weapon-name" placeholder="Click to select..." onclick="openWeaponPicker(this)" readonly value="${data ? data.name : ""}" style="cursor: pointer; color: var(--red-dark); font-weight: bold;" /></div><div class="field"><span class="field-label">Atk Bonus</span><input type="text" class="weapon-atk" placeholder="+0" value="${data ? data.atk : ""}" /></div><div class="field"><span class="field-label">Damage</span><input type="text" class="weapon-damage" placeholder="1d6+0" value="${data ? data.damage : ""}" /></div></div><div class="field"><span class="field-label">Notes</span><input type="text" class="weapon-notes" placeholder="Properties..." value="${data ? data.notes : ""}" /></div></div>`;
     weaponList.appendChild(newWeapon);
     newWeapon.querySelectorAll("input").forEach(input => input.addEventListener("input", saveCharacter));
   };
   
   // Spells
   function renderSpellSlots() {
     const container = document.getElementById("spellSlotsContainer"); container.innerHTML = "";
     spellSlotsData.forEach((slotData, index) => {
       const slotBox = document.createElement("div"); slotBox.className = "slot-level-container";
       let html = `<div class="slot-controls"><strong>Level ${slotData.level}</strong><div class="slot-btn-group"><button class="slot-btn-small" onclick="adjustSlotCount(${index}, -1)">-</button><button class="slot-btn-small" onclick="adjustSlotCount(${index}, 1)">+</button><button class="slot-btn-small" style="background:#fee; color:red; margin-left:8px;" onclick="removeSpellLevel(${index})">×</button></div></div><div class="spell-slot-tracker">`;
       for (let i = 0; i < slotData.total; i++) { const isUsed = i < slotData.used ? "used" : ""; html += `<div class="spell-slot ${isUsed}" onclick="toggleSlot(${index}, ${i})"></div>`; }
       html += `</div>`; slotBox.innerHTML = html; container.appendChild(slotBox);
     });
   }
   window.toggleSlot = function (levelIndex, slotIndex) {
     const data = spellSlotsData[levelIndex];
     if (slotIndex < data.used) { data.used = slotIndex; } else { data.used = slotIndex + 1; }
     renderSpellSlots(); saveCharacter();
   };
   window.adjustSlotCount = function (index, change) {
     if (spellSlotsData[index].total + change < 0) return;
     spellSlotsData[index].total += change;
     if (spellSlotsData[index].used > spellSlotsData[index].total) { spellSlotsData[index].used = spellSlotsData[index].total; }
     renderSpellSlots(); saveCharacter();
   };
   window.addNewSpellLevel = function () {
     const nextLevel = spellSlotsData.length > 0 ? spellSlotsData[spellSlotsData.length - 1].level + 1 : 1;
     spellSlotsData.push({ level: nextLevel, total: 1, used: 0 }); renderSpellSlots(); saveCharacter();
   };
   window.removeSpellLevel = function (index) { if (confirm("Delete this spell level group?")) { spellSlotsData.splice(index, 1); renderSpellSlots(); saveCharacter(); } };
   window.addSpellRow = function (containerId, defaultLevel = 1, data = null) {
     const container = document.getElementById(containerId);
     const row = document.createElement("div"); row.className = "spell-row";
     const lvl = data ? data.level : defaultLevel === 0 ? "0" : "1";
     const isPrep = data ? data.prepared : containerId === "preparedSpellsList";
     const isCantrip = containerId === "cantripList" || defaultLevel === 0 || lvl === "0";
     const prepVisibility = isCantrip ? "visibility:hidden;" : "";
     const rChecked = data && data.ritual ? "checked" : "";
     const cChecked = data && data.concentration ? "checked" : "";
     const mChecked = data && data.material ? "checked" : "";
     row.innerHTML = `<div class="drag-handle">☰</div><div style="display:flex; justify-content:center;"><input type="checkbox" class="spell-check spell-prep" ${isPrep ? "checked" : ""} style="${prepVisibility}"></div><input type="number" class="spell-input spell-lvl" value="${lvl}" placeholder="Lvl" style="text-align:center;"><input type="text" class="spell-input spell-name" value="${data ? data.name : ""}" placeholder="Spell Name"><input type="text" class="spell-input spell-time" value="${data ? data.time : ""}" placeholder="1 Act"><input type="text" class="spell-input spell-range" value="${data ? data.range : ""}" placeholder="60 ft"><input type="checkbox" class="spell-check spell-ritual" title="Ritual" ${rChecked}><input type="checkbox" class="spell-check spell-conc" title="Concentration" ${cChecked}><input type="checkbox" class="spell-check spell-mat" title="Material" ${mChecked}><input type="hidden" class="spell-desc" value="${data && data.description ? data.description.replace(/"/g, '&quot;') : ""}"><span class="skill-info-btn" onclick="showSpellInfo(this)" style="cursor:pointer; font-size:0.8rem;">?</span><button class="delete-feature-btn" onclick="this.parentElement.remove(); saveCharacter()">×</button>`;
     
     const prepBox = row.querySelector(".spell-prep");
     if (!isCantrip) {
       prepBox.addEventListener("change", function () {
         if (this.checked) { document.getElementById("preparedSpellsList").appendChild(row); } else { document.getElementById("spellList").appendChild(row); }
         saveCharacter();
       });
     }
     row.querySelectorAll("input").forEach((input) => input.addEventListener("input", saveCharacter));
     container.appendChild(row);
     setupDragItem(row, containerId); saveCharacter();
   };

   window.showSpellInfo = function(btn) {
       const row = btn.closest('.spell-row');
       const name = row.querySelector('.spell-name').value;
       const desc = row.querySelector('.spell-desc').value;
       document.getElementById("infoModalTitle").textContent = name || "Spell Description";
       document.getElementById("infoModalText").innerHTML = desc ? desc.replace(/\n/g, '<br>') : "No description available.";
       document.getElementById("infoModal").style.display = "flex";
   };
   
   // Modals Generic
   window.showSkillInfo = function (skillKey, event) {
     if (event) event.stopPropagation();
     const title = skillKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
     document.getElementById("infoModalTitle").textContent = title;
     document.getElementById("infoModalText").textContent = skillDescriptions[skillKey] || "No description available.";
     document.getElementById("infoModal").style.display = "flex";
   };
   window.closeInfoModal = (e) => { if (e.target.id === "infoModal") document.getElementById("infoModal").style.display = "none"; };
   window.openCurrencyModal = () => document.getElementById("currencyModal").style.display = "flex";
   window.closeCurrencyModal = (e) => { if (e.target.id === "currencyModal") document.getElementById("currencyModal").style.display = "none"; };
   
   window.openXpTableModal = function () {
     const container = document.getElementById("xpTableContent");
     if (!container.innerHTML.trim()) {
         let html = '<table class="currency-table"><thead><tr><th>Level</th><th>XP</th><th>Prof</th></tr></thead><tbody>';
         xpTable.forEach(row => { html += `<tr><td>${row.lvl}</td><td>${row.xp.toLocaleString()}</td><td>+${row.prof}</td></tr>`; });
         html += '</tbody></table>';
         container.innerHTML = html;
     }
     document.getElementById("xpTableModal").style.display = "flex";
   };
   window.closeXpTableModal = (e) => { if (e.target.id === "xpTableModal") document.getElementById("xpTableModal").style.display = "none"; };
   
   window.openScoreModal = function () {
     document.getElementById("scoreModal").style.display = "flex";
     abilities.forEach((stat) => { document.getElementById(`sa_${stat}`).value = ""; });
     updateStandardArrayOptions(); resetPointBuy();
   };
   window.closeScoreModal = () => document.getElementById("scoreModal").style.display = "none";
   window.switchScoreTab = function (mode) {
     document.querySelectorAll(".score-tab").forEach((t) => t.classList.remove("active"));
     document.querySelectorAll(".score-method-container").forEach((c) => c.classList.remove("active"));
     if (mode === "standard") { document.querySelector(".score-tab:first-child").classList.add("active"); document.getElementById("tab-standard").classList.add("active"); }
     else { document.querySelector(".score-tab:last-child").classList.add("active"); document.getElementById("tab-pointbuy").classList.add("active"); }
   };
   window.updateStandardArrayOptions = function () {
     const selects = abilities.map((s) => document.getElementById(`sa_${s}`));
     const selectedValues = selects.map((s) => s.value).filter((v) => v !== "");
     selects.forEach((select) => {
       const myValue = select.value;
       Array.from(select.options).forEach((opt) => {
         if (opt.value === "") { opt.disabled = false; return; }
         opt.disabled = selectedValues.includes(opt.value) && opt.value !== myValue;
       });
     });
   };
   window.applyStandardArray = function () {
     let allFilled = true;
     abilities.forEach((stat) => { if (document.getElementById(`sa_${stat}`).value === "") allFilled = false; });
     if (!allFilled) { alert("Please assign a score to every ability."); return; }
     abilities.forEach((stat) => { document.getElementById(stat).value = document.getElementById(`sa_${stat}`).value; });
     updateModifiers(); saveCharacter(); closeScoreModal();
   };
   function resetPointBuy() { pbScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }; renderPointBuy(); }
   function getPointCost(score) { return pbCosts[score] || 0; }
   function calculateSpentPoints() { return Object.values(pbScores).reduce((acc, score) => acc + getPointCost(score), 0); }
   window.adjustPointBuy = function (stat, delta) {
     const currentScore = pbScores[stat];
     const newScore = currentScore + delta;
     if (newScore < 8 || newScore > 15) return;
     pbScores[stat] = newScore;
     if (calculateSpentPoints() > maxPoints) { pbScores[stat] = currentScore; alert("Not enough points!"); }
     renderPointBuy();
   };
   function renderPointBuy() {
     const container = document.getElementById("pb-rows-container"); container.innerHTML = "";
     const remaining = maxPoints - calculateSpentPoints();
     const remEl = document.getElementById("pb-remaining");
     remEl.textContent = remaining; remEl.style.color = remaining < 0 ? "red" : "var(--ink)";
     Object.keys(pbScores).forEach((stat) => {
       const score = pbScores[stat];
       const canUpgrade = score < 15 && remaining >= getPointCost(score + 1) - getPointCost(score);
       const row = document.createElement("div"); row.className = "pb-row";
       row.innerHTML = `<div class="pb-label" style="text-transform:uppercase; font-weight:bold; width:100px;">${stat}</div><div class="pb-controls"><button class="pb-btn" onclick="adjustPointBuy('${stat}', -1)" ${score <= 8 ? "disabled" : ""}>-</button><span class="pb-val">${score}</span><button class="pb-btn" onclick="adjustPointBuy('${stat}', 1)" ${!canUpgrade ? "disabled" : ""}>+</button></div><div class="pb-cost">Cost: ${getPointCost(score)}</div>`;
       container.appendChild(row);
     });
   }
   window.applyPointBuy = function () { Object.keys(pbScores).forEach((stat) => { document.getElementById(stat).value = pbScores[stat]; }); updateModifiers(); saveCharacter(); closeScoreModal(); };
   window.setAlignment = function (val) { document.getElementById("alignment").value = val; document.getElementById("alignModal").style.display = "none"; saveCharacter(); };
   document.getElementById("alignment").addEventListener("click", () => document.getElementById("alignModal").style.display = "flex");
   document.getElementById("cancelAlign").onclick = () => document.getElementById("alignModal").style.display = "none";
   window.openThemeModal = () => document.getElementById("themeModal").style.display = "flex";
   window.closeThemeModal = (e) => { if (e.target.id === "themeModal") document.getElementById("themeModal").style.display = "none"; };
   window.setTheme = function (themeName) { document.body.className = themeName; document.getElementById("themeModal").style.display = "none"; saveCharacter(); };
   
   /* =========================================
      5. PERSISTENCE (SAVE / LOAD)
      ========================================= */
   function getFeatureData(containerId) {
     const container = document.getElementById(containerId);
     if (!container) return [];
     return Array.from(container.querySelectorAll(".feature-box")).map((box) => ({
       title: box.querySelector(".feature-title-input").value,
       desc: box.querySelector("textarea").value,
     }));
   }
   
   window.saveCharacter = function () {
     // CRITICAL FIX: Safe element selection for Inventory
     // We filter out any null entries in case a row is half-deleted or malformed
     const safeInventoryMap = (selector) => {
        return Array.from(document.querySelectorAll(selector)).map((item) => {
            const nameEl = item.querySelector(".name-field");
            if (!nameEl) return null; // Skip if main field missing
            return {
                name: nameEl.value,
                qty: item.querySelector(".qty-field")?.value || 0,
                weight: item.querySelector(".weight-field")?.value || 0,
                equipped: item.querySelector(".equip-check")?.checked || false,
                description: item.querySelector(".desc-field")?.value || ""
            };
        }).filter(item => item !== null);
     };

     const characterData = {
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
       
       weapons: Array.from(document.querySelectorAll(".weapon-item")).map((item) => ({
         name: item.querySelector(".weapon-name").value,
         atk: item.querySelector(".weapon-atk").value,
         damage: item.querySelector(".weapon-damage").value,
         notes: item.querySelector(".weapon-notes").value,
       })),
       
       classFeatures: getFeatureData("classFeaturesContainer"),
       raceFeatures: getFeatureData("raceFeaturesContainer"),
       backgroundFeatures: getFeatureData("backgroundFeaturesContainer"),
       feats: getFeatureData("featsContainer"),
       actions: getFeatureData("actionsContainer"),
       bonusActions: getFeatureData("bonusActionsContainer"),
       reactions: getFeatureData("reactionsContainer"),
       
       // Using the safe map function here
       inventory: safeInventoryMap(".inventory-item"),

       attunement: [document.getElementById("attune1").value, document.getElementById("attune2").value, document.getElementById("attune3").value],
       spellSlotsData: spellSlotsData,
       cantripsList: Array.from(document.querySelectorAll("#cantripList .spell-row")).map((row) => ({
         level: row.querySelector(".spell-lvl").value,
         name: row.querySelector(".spell-name").value,
         time: row.querySelector(".spell-time").value,
         range: row.querySelector(".spell-range").value,
         ritual: row.querySelector(".spell-ritual").checked,
         concentration: row.querySelector(".spell-conc").checked,
         material: row.querySelector(".spell-mat").checked,
         description: row.querySelector(".spell-desc").value,
       })),
       preparedSpellsList: Array.from(document.querySelectorAll("#preparedSpellsList .spell-row")).map((row) => ({
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
       spellsList: Array.from(document.querySelectorAll("#spellList .spell-row")).map((row) => ({
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
       spellAttackMod: document.getElementById("spellAttackMod").value,
       spellAttackBonus: document.getElementById("spellAttackBonus").value,
       skillProficiency, saveProficiency, deathSaves, currentTheme: document.body.className,
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
     a.href = url; a.download = `${dataObj.charName || "character"}_sheet.json`;
     document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
   };
   
   window.loadJSON = function (input) {
     const file = input.files[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = function (e) {
       try {
         JSON.parse(e.target.result); localStorage.setItem("dndCharacter", e.target.result); location.reload();
       } catch (err) { alert("Error loading file: " + err); }
     };
     reader.readAsText(file);
   };
   
   window.resetSheet = function () {
     if (confirm("Clear all data? This cannot be undone.")) { localStorage.removeItem("dndCharacter"); location.reload(); }
   };
   
   /* =========================================
      6. INITIALIZATION
      ========================================= */
   document.addEventListener("DOMContentLoaded", () => {
     console.log("Script initialized.");
     // Guard clause: Only run initialization if we are on the character sheet (checking for charName input)
     if (!document.getElementById("charName")) return;
     
     // Check for data immediately
     checkDataUploadStatus();
     
     // Re-check when tab becomes visible (e.g. returning from Data Viewer)
     document.addEventListener("visibilitychange", () => {
         if (document.visibilityState === "visible") checkDataUploadStatus();
     });

     // XP Modal
     const expModal = document.getElementById("expModal");
     document.getElementById("addExpBtn").onclick = () => expModal.style.display = "flex";
     document.getElementById("cancelExp").onclick = () => expModal.style.display = "none";
     document.getElementById("confirmExp").onclick = function () {
       const toAdd = parseInt(document.getElementById("expToAdd").value) || 0;
       let currentXp = parseInt(document.getElementById("experience").value) || 0;
       let currentLevel = parseInt(document.getElementById("level").value) || 1;
       currentXp += toAdd;
       let checkedLevel = true;
       while (checkedLevel) {
         let nextLevelEntry = xpTable.find((x) => x.lvl === currentLevel + 1);
         let currentLevelEntry = xpTable.find((x) => x.lvl === currentLevel);
         if (!nextLevelEntry) { checkedLevel = false; break; }
         let xpNeeded = nextLevelEntry.xp - currentLevelEntry.xp;
         if (currentXp >= xpNeeded) { currentXp -= xpNeeded; currentLevel++; document.getElementById("profBonus").value = xpTable.find((x) => x.lvl === currentLevel).prof; }
         else { checkedLevel = false; }
       }
       document.getElementById("experience").value = currentXp;
       document.getElementById("level").value = currentLevel;
       expModal.style.display = "none"; document.getElementById("expToAdd").value = "";
       updateModifiers(); saveCharacter();
     };
   
     // Drag Listeners
     ["inventoryList", "equippedList", "weapon-list", "cantripList", "spellList", "preparedSpellsList"].forEach((id) => {
       const container = document.getElementById(id);
       if (!container) return;
       container.addEventListener("dragover", (e) => {
         e.preventDefault();
         const afterElement = getDragAfterElement(container, e.clientY);
         const draggable = document.querySelector(".dragging");
         if (draggable) { if (afterElement == null) { container.appendChild(draggable); } else { container.insertBefore(draggable, afterElement); } }
       });
     });
   
     // Global Auto-save
     document.querySelectorAll("input, textarea, select").forEach((el) => {
       el.addEventListener("input", saveCharacter); el.addEventListener("change", saveCharacter);
     });
     abilities.forEach((a) => document.getElementById(a).addEventListener("input", updateModifiers));
     document.getElementById("profBonus").addEventListener("input", () => { updateModifiers(); updateSpellDC(); });
     document.getElementById("spellAbility").addEventListener("change", updateSpellDC);
     document.getElementById("str").addEventListener("input", calculateWeight);
     ["hp", "maxHp", "tempHp"].forEach((id) => document.getElementById(id).addEventListener("input", updateHpBar));
     document.getElementById("charSize")?.addEventListener("change", calculateWeight);
   
     // Load Data
     const saved = localStorage.getItem("dndCharacter");
     if (saved) {
       const data = JSON.parse(saved);
       if (data.currentTheme) document.body.className = data.currentTheme;
       Object.keys(data).forEach((key) => {
         const el = document.getElementById(key);
         if (el && !key.includes("Features") && !["weapons", "inventory", "attunement", "skillProficiency", "saveProficiency", "deathSaves"].includes(key)) {
           if (el.type === "checkbox") el.checked = data[key]; else el.value = data[key];
         }
       });
       if (data.skillProficiency) { Object.assign(skillProficiency, data.skillProficiency); Object.keys(skillProficiency).forEach((k) => { if (skillProficiency[k]) document.getElementById(`skillCheck_${k}`)?.classList.add("checked"); }); }
       if (data.saveProficiency) { Object.assign(saveProficiency, data.saveProficiency); Object.keys(saveProficiency).forEach((k) => { if (saveProficiency[k]) document.getElementById(`saveCheck_${k}`)?.classList.add("checked"); }); }
       if (data.deathSaves) { Object.assign(deathSaves, data.deathSaves); deathSaves.successes.forEach((v, i) => document.getElementById(`deathSuccess${i}`)?.classList.toggle("checked", v)); deathSaves.failures.forEach((v, i) => document.getElementById(`deathFailure${i}`)?.classList.toggle("checked", v)); }
       if (data.activeConditions) { document.getElementById("activeConditionsInput").value = data.activeConditions; renderConditionTags(); }
       (data.classFeatures || []).forEach((f) => addFeatureItem("classFeaturesContainer", f.title, f.desc));
       (data.raceFeatures || []).forEach((f) => addFeatureItem("raceFeaturesContainer", f.title, f.desc));
       (data.backgroundFeatures || []).forEach((f) => addFeatureItem("backgroundFeaturesContainer", f.title, f.desc));
       (data.feats || []).forEach((f) => addFeatureItem("featsContainer", f.title, f.desc));
       (data.actions || []).forEach((f) => addFeatureItem("actionsContainer", f.title, f.desc));
       (data.bonusActions || []).forEach((f) => addFeatureItem("bonusActionsContainer", f.title, f.desc));
       (data.reactions || []).forEach((f) => addFeatureItem("reactionsContainer", f.title, f.desc));
       if (data.charSize) document.getElementById("charSize").value = data.charSize;
       if (data.sizeFt) document.getElementById("sizeFt").value = data.sizeFt;
       
       const weaponList = document.getElementById("weapon-list"); weaponList.innerHTML = "";
       if (data.weapons && data.weapons.length > 0) { data.weapons.forEach((w) => { addWeapon(w); }); }
       
       document.getElementById("inventoryList").innerHTML = ""; document.getElementById("equippedList").innerHTML = "";
       (data.inventory || []).forEach((item) => addInventoryItem(item.name, item.qty, item.weight, item.equipped, item.description));
       
       if (data.spellSlotsData) spellSlotsData = data.spellSlotsData;
       document.getElementById("cantripList").innerHTML = ""; (data.cantripsList || []).forEach((s) => addSpellRow("cantripList", 0, s));
       document.getElementById("preparedSpellsList").innerHTML = ""; (data.preparedSpellsList || []).forEach((s) => { s.prepared = true; addSpellRow("preparedSpellsList", 1, s); });
       document.getElementById("spellList").innerHTML = ""; (data.spellsList || []).forEach((s) => { s.prepared = false; addSpellRow("spellList", 1, s); });
       
       if (data.attunement) { data.attunement.forEach((v, i) => (document.getElementById(`attune${i + 1}`).value = v || "")); }
       if (data.shield) document.getElementById("shieldEquipped").checked = true;
     } else {
       addFeatureItem("classFeaturesContainer"); addFeatureItem("raceFeaturesContainer"); addFeatureItem("backgroundFeaturesContainer"); addFeatureItem("featsContainer");
       addFeatureItem("actionsContainer"); addFeatureItem("bonusActionsContainer"); addFeatureItem("reactionsContainer");
     }
     
     updateModifiers(); renderSpellSlots(); updateHpBar(); calculateWeight(); renderWeaponTags(); resizeAllTextareas();
   });