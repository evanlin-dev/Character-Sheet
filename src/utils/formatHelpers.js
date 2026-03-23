export const getGlobalSourcePriority = (source) => {
  if (!source) return 0;
  const s = source.toUpperCase();
  if (s === "XPHB" || s === "XDMG" || s === "XMM") return 100;
  if (s === "EFA") return 90;
  if (s === "CROOKEDMOON24") return 85;
  if (s === "CROOKEDMOON14") return 80;
  if (s === "PHB" || s === "DMG" || s === "MM") return 50;
  if (s === "TCE") return 40;
  if (s === "XGE") return 30;
  return 10;
};

export const replaceAtkTags = (text) => {
  if (typeof text !== "string") return text;
  return text.replace(/\{@atk(?:r)?\s+([^}]+)\}/gi, (_, p1) => {
    const types = p1.split(",").map((t) => {
      const tLower = t.trim().toLowerCase();
      if (tLower === "mw") return "Melee Weapon Attack:";
      if (tLower === "rw") return "Ranged Weapon Attack:";
      if (tLower === "ms") return "Melee Spell Attack:";
      if (tLower === "rs") return "Ranged Spell Attack:";
      if (tLower === "m") return "Melee Attack Roll:";
      if (tLower === "r") return "Ranged Attack Roll:";
      return "Attack:";
    });
    return `<em>${types.join(" or ")}</em>`;
  });
};