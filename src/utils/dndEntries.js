// Port of processEntries and cleanText from utils.js

export function processEntries(entries, depth = 0) {
  if (!entries) return '';
  if (typeof entries === 'string') return entries;
  if (Array.isArray(entries))
    return entries.map(e => processEntries(e, depth)).filter(Boolean).join('<br><br>');

  const entry = entries;
  const type = entry.type || 'entries';
  let result = '';

  switch (type) {
    case 'entries':
    case 'section':
    case 'item':
      if (entry.name) result += `<strong>${entry.name}.</strong> `;
      if (entry.entries) result += processEntries(entry.entries, depth + 1);
      else if (entry.entry) result += processEntries(entry.entry, depth + 1);
      break;

    case 'list':
      if (entry.name) result += `<strong>${entry.name}</strong>`;
      result += "<ul style='padding-left:20px; margin:5px 0;'>";
      if (entry.items) result += entry.items.map(i => `<li>${processEntries(i, depth + 1)}</li>`).join('');
      result += '</ul>';
      break;

    case 'table':
      if (entry.caption) result += `<strong>${entry.caption}</strong>`;
      result += "<div style='overflow-x:auto;'><table class='currency-table' style='width:100%; font-size:0.8rem; margin-top:5px;'>";
      if (entry.colLabels)
        result += '<thead><tr>' + entry.colLabels.map(l => `<th>${processEntries(l, depth)}</th>`).join('') + '</tr></thead>';
      if (entry.rows)
        result += '<tbody>' + entry.rows.map(row =>
          '<tr>' + row.map(cell => {
            const c = (typeof cell === 'object' && cell.roll) ? `${cell.roll.min}-${cell.roll.max}` : cell;
            return `<td>${processEntries(c, depth)}</td>`;
          }).join('') + '</tr>'
        ).join('') + '</tbody>';
      result += '</table></div>';
      break;

    case 'inset':
    case 'insetReadaloud':
    case 'quote':
      result += "<div style='background:rgba(0,0,0,0.05); padding:10px; border-left:3px solid var(--gold); margin:10px 0;'>";
      if (entry.name) result += `<strong>${entry.name}</strong><br>`;
      if (entry.entries) result += processEntries(entry.entries, depth + 1);
      if (entry.by) result += `<div style='text-align:right; font-style:italic;'>— ${entry.by}</div>`;
      result += '</div>';
      break;

    case 'refFeat':           return `<strong>Feat:</strong> ${entry.feat || ''}`;
    case 'refOptionalfeature': return `<strong>Option:</strong> ${entry.optionalfeature || ''}`;
    case 'refClassFeature':    return '';
    case 'refSubclassFeature': return '';
    case 'refSpell':           return `<strong>Spell:</strong> ${entry.spell || ''}`;

    default:
      if (entry.name) result += `<strong>${entry.name}.</strong> `;
      if (entry.entries) result += processEntries(entry.entries, depth + 1);
      else if (entry.entry) result += processEntries(entry.entry, depth + 1);
      else if (entry.text) result += entry.text;
      break;
  }
  return result;
}

export function cleanText(str) {
  if (!str) return '';
  const cleaned = str.replace(/\{@(\w+)\s*([^}]+)?\}/g, (match, tag, content) => {
    if (tag === 'recharge') return content ? `(Recharge ${content}-6)` : '(Recharge 6)';
    if (!content) return '';
    const parts = content.split('|');
    const name = parts[0];

    if (tag === 'h') return 'Hit: ';
    if (tag === 'm') return 'Miss: ';
    if (tag === 'atk') {
      const map = { m: 'Melee Attack: ', r: 'Ranged Attack: ', mw: 'Melee Weapon Attack: ', rw: 'Ranged Weapon Attack: ', ms: 'Melee Spell Attack: ', rs: 'Ranged Spell Attack: ' };
      return map[name] || 'Attack: ';
    }
    if (tag === 'b' || tag === 'bold')   return `<b>${name}</b>`;
    if (tag === 'i' || tag === 'italic') return `<i>${name}</i>`;
    if (tag === 'dc')     return `DC ${name}`;
    if (tag === 'hit')    return `+${name}`;
    if (tag === 'chance') return parts[1] || `${name}%`;
    if (tag === 'note')   return `Note: ${name}`;
    if (tag === 'filter') return name.split(';')[0].trim();
    if (parts.length >= 3 && parts[2]) return parts[2];
    return name;
  });
  return /\{@\w+/.test(cleaned) ? cleanText(cleaned) : cleaned;
}
