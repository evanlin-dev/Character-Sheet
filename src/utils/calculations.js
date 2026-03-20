import { skillsMap, RESOURCE_FORMULA_OPTS } from 'src/data/constants';

export function calcMod(score) {
  return Math.floor(((score || 10) - 10) / 2);
}

export function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProfBonus(level) {
  return Math.ceil((level || 1) / 4) + 1;
}

export function getSkillTotal(char, skillName) {
  const ability = skillsMap[skillName];
  const abilityMod = calcMod(parseInt(char[ability]) || 10);
  const isProf = char.skillProficiency?.[skillName] || false;
  const isExp = char.skillExpertise?.[skillName] || false;
  const pb = parseInt(char.profBonus) || getProfBonus(parseInt(char.level) || 1);
  return abilityMod + (isProf ? pb : 0) + (isProf && isExp ? pb : 0);
}

export function getSaveTotal(char, ability) {
  const abilityMod = calcMod(parseInt(char[ability]) || 10);
  const isProf = char.saveProficiency?.[ability] || false;
  const isExp = char.saveExpertise?.[ability] || false;
  const pb = parseInt(char.profBonus) || getProfBonus(parseInt(char.level) || 1);
  return abilityMod + (isProf ? pb : 0) + (isProf && isExp ? pb : 0);
}

export function getSpellDC(char) {
  const spellAbility = char.spellAbility || 'int';
  const abilityMod = calcMod(parseInt(char[spellAbility]) || 10);
  const pb = parseInt(char.profBonus) || getProfBonus(parseInt(char.level) || 1);
  return 8 + pb + abilityMod;
}

export function getSpellAttackBonus(char) {
  const spellAbility = char.spellAbility || 'int';
  const abilityMod = calcMod(parseInt(char[spellAbility]) || 10);
  const pb = parseInt(char.profBonus) || getProfBonus(parseInt(char.level) || 1);
  return abilityMod + pb;
}

export function getWeightCapacity(char) {
  const str = parseInt(char.str) || 10;
  const size = char.charSize || 'Medium';
  let multiplier = 15;
  if (size === 'Tiny') multiplier = 7.5;
  else if (size === 'Large') multiplier = 30;
  else if (size === 'Huge') multiplier = 60;
  else if (size === 'Gargantuan') multiplier = 120;
  return Math.floor(str * multiplier);
}

export function getTotalWeight(inventory = [], componentPouch = []) {
  let total = 0;
  [...inventory, ...componentPouch].forEach(item => {
    total += (parseFloat(item.qty) || 0) * (parseFloat(item.weight) || 0);
  });
  return total;
}

export function computeResourceMax(res, char) {
  if (!res) return 1;
  const level = parseInt(char?.level) || 1;
  const pb = parseInt(char?.profBonus) || getProfBonus(level);
  const mod = (key) => calcMod(parseInt(char?.[key]) || 10);

  if (!res.formulaKey || res.formulaKey === 'fixed') {
    return parseInt(res.fixedMax ?? res.max) || 1;
  }

  const opt = RESOURCE_FORMULA_OPTS.find(o => o.key === res.formulaKey);
  if (!opt) return parseInt(res.fixedMax ?? res.max) || 1;

  switch (res.formulaKey) {
    case 'pb':         return pb;
    case 'pb_x2':      return pb * 2;
    case 'level':      return level;
    case 'half_level': return Math.max(1, Math.floor(level / 2));
    case 'level_x5':   return level * 5;
    case 'str_mod':    return Math.max(1, mod('str'));
    case 'dex_mod':    return Math.max(1, mod('dex'));
    case 'con_mod':    return Math.max(1, mod('con'));
    case 'int_mod':    return Math.max(1, mod('int'));
    case 'wis_mod':    return Math.max(1, mod('wis'));
    case 'cha_mod':    return Math.max(1, mod('cha'));
    case 'str_mod_pb': return Math.max(1, mod('str') + pb);
    case 'dex_mod_pb': return Math.max(1, mod('dex') + pb);
    case 'con_mod_pb': return Math.max(1, mod('con') + pb);
    case 'int_mod_pb': return Math.max(1, mod('int') + pb);
    case 'wis_mod_pb': return Math.max(1, mod('wis') + pb);
    case 'cha_mod_pb': return Math.max(1, mod('cha') + pb);
    default: return parseInt(res.fixedMax ?? res.max) || 1;
  }
}
