import { useCharacter } from '../context/CharacterContext';
import { computeResourceMax } from '../utils/calculations';
import { RESOURCE_FORMULA_OPTS } from '../data/constants';

function ResourceItem({ res, index, char, onUpdate, onDelete }) {
  const effectiveMax = computeResourceMax(res, char);
  const usePips = effectiveMax <= 10;
  const resetLabel = res.reset === 'sr' ? 'Short Rest' : res.reset === 'both' ? 'Both Rests' : 'Long Rest';
  const badgeClass = res.reset === 'sr' ? 'res-badge-sr' : res.reset === 'both' ? 'res-badge-both' : 'res-badge-lr';

  const toggleSlot = (i) => {
    const newUsed = i < res.used ? i : i + 1;
    onUpdate({ ...res, used: newUsed });
  };

  const stepResource = (delta) => {
    const newUsed = Math.max(0, Math.min(effectiveMax, (res.used || 0) + delta));
    onUpdate({ ...res, used: newUsed });
  };

  const formulaKey = res.formulaKey && res.formulaKey !== 'fixed' ? res.formulaKey : null;
  const formulaOpt = formulaKey ? RESOURCE_FORMULA_OPTS.find(o => o.key === formulaKey) : null;

  return (
    <div className="resource-item" style={{ position: 'relative' }}>
      {!res.auto && (
        <button className="delete-feature-btn" onClick={() => onDelete(index)} style={{ position: 'absolute', top: 4, right: 4, margin: 0 }}>&times;</button>
      )}
      <div className="resource-header" style={{ paddingRight: res.auto ? 0 : 22 }}>
        <input
          type="text"
          className="resource-name"
          value={res.name}
          onChange={(e) => onUpdate({ ...res, name: e.target.value })}
          placeholder="Resource Name"
          readOnly={!!res.auto}
          style={res.auto ? { pointerEvents: 'none' } : {}}
        />
        <div className="resource-controls" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {formulaKey && formulaOpt && (
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.72rem', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>
              {formulaOpt.label} = {effectiveMax}
            </span>
          )}
          <span className={`res-badge ${badgeClass}`} style={{ fontSize: '0.6rem' }}>{resetLabel}</span>
        </div>
      </div>
      <div className="resource-slots">
        {usePips ? (
          Array.from({ length: effectiveMax }).map((_, i) => (
            <div
              key={i}
              className={`resource-slot${i < (res.used || 0) ? ' used' : ''}`}
              onClick={() => toggleSlot(i)}
            />
          ))
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="mini-btn" onClick={() => stepResource(-1)}>−</button>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.9rem', minWidth: 24, textAlign: 'center' }}>{res.used || 0}</span>
            <span style={{ color: 'var(--ink-light)' }}>/</span>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.9rem' }}>{effectiveMax}</span>
            <button className="mini-btn" onClick={() => stepResource(1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Resources() {
  const { character, update, openModal } = useCharacter();
  const resources = character.resourcesData || [];

  const updateResource = (index, newRes) => {
    const updated = resources.map((r, i) => i === index ? newRes : r);
    update({ resourcesData: updated });
  };

  const deleteResource = (index) => {
    if (window.confirm('Delete this resource?')) {
      update({ resourcesData: resources.filter((_, i) => i !== index) });
    }
  };

  const addResource = () => {
    update({ resourcesData: [...resources, { name: 'New Resource', max: 3, used: 0, reset: 'lr', formulaKey: 'fixed', fixedMax: 3 }] });
  };

  return (
    <div className="sheet-section">
      <h2 className="section-title">Class Resources</h2>
      <div id="resourcesContainer">
        {resources.map((res, i) => (
          <ResourceItem
            key={i}
            res={res}
            index={i}
            char={character}
            onUpdate={(newRes) => updateResource(i, newRes)}
            onDelete={deleteResource}
          />
        ))}
      </div>
      <button className="add-feature-btn" onClick={addResource}>+ Add Resource</button>
      <div className="res-rest-row" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="rest-btn rest-btn-sr" style={{ flex: 1 }} onClick={() => openModal('shortRest')}>Short Rest</button>
        <button className="rest-btn rest-btn-lr" style={{ flex: 1 }} onClick={() => openModal('longRest')}>Long Rest</button>
      </div>
    </div>
  );
}
