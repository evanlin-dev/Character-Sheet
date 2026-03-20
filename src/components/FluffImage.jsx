import { useState, useEffect } from 'react';

export function extractFluffImageUrl(fluff) {
  if (!fluff) return null;
  if (fluff.img) return typeof fluff.img === 'string' ? fluff.img : (fluff.img.url || fluff.img.path || null);
  if (fluff.images && fluff.images.length) {
    const img = fluff.images[0];
    if (img.href && img.href.path) return 'https://5e.tools/img/' + img.href.path;
    if (img.href?.url) return img.href.url;
    if (img.url) return img.url;
    if (img.path) return img.path;
  }
  if (fluff.entries) {
    let found = null;
    const seek = (obj) => {
      if (found || !obj) return;
      if (Array.isArray(obj)) { obj.forEach(seek); return; }
      if (typeof obj === 'object') {
        if (obj.type === 'image' && obj.href && obj.href.path) { found = 'https://5e.tools/img/' + obj.href.path; return; }
        if (obj.entries) seek(obj.entries);
        else if (obj.entry) seek(obj.entry);
      }
    };
    seek(fluff.entries);
    return found;
  }
  return null;
}

export function stdFallbacks(type, source, name) {
  if (!source || !name) return [];
  const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);
  const enc = encodeURIComponent;
  return [
    `https://5e.tools/img/${type}/${enc(source)}/${enc(name)}.webp`,
    `https://raw.githubusercontent.com/TheGiddyLimit/homebrew-img/refs/heads/main/img/${enc(source)}/${typeTitle}/${enc(name)}.webp`,
  ];
}

export function getSubclassFallbacks(className, subclassName, source, shortName) {
  if (!className || !subclassName) return [];
  const enc = encodeURIComponent;
  const src = source || 'XPHB';
  const underscore = s => s.replace(/ /g, '_');
  const hyphen = s => s.replace(/ /g, '-');
  const sName = shortName || subclassName;
  const ghBase = `https://raw.githubusercontent.com/TheGiddyLimit/homebrew-img/refs/heads/main/img/${enc(src)}`;
  return [
    `https://5e.tools/img/subclasses/${enc(src)}/${enc(className)}_${enc(subclassName)}.webp`,
    `https://5e.tools/img/subclasses/${enc(src)}/${enc(subclassName)}.webp`,
    `https://5e.tools/img/subclasses/${enc(src)}/${enc(sName)}.webp`,
    `https://5e.tools/img/classes/${enc(src)}/${enc(`${subclassName} ${className}`)}.webp`,
    `https://5e.tools/img/classes/${enc(src)}/${enc(`${sName} ${className}`)}.webp`,
    `https://5e.tools/img/classes/${enc(src)}/${enc(className)}.webp`,
    `${ghBase}/Subclasses/${enc(underscore(className) + '_' + underscore(subclassName))}.webp`,
    `${ghBase}/Subclasses/${enc(className)}_${enc(subclassName)}.webp`,
    `${ghBase}/Subclass/${enc(className)}/${enc(sName)}.webp`,
    `${ghBase}/Subclasses/${enc(sName)}.webp`,
    `${ghBase}/Subclasses/${enc(hyphen(sName))}.webp`,
    `${ghBase}/Subclasses/${enc(hyphen(subclassName))}.webp`,
    `${ghBase}/Subclasses/${enc(className)}.webp`,
  ];
}

export default function FluffImage({ fluff, baseObj, type, name, source, subclassName, className, subclassShortName }) {
  const [imgState, setImgState] = useState({ src: null, fallbacks: [], index: -1, failed: false });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let primary = extractFluffImageUrl(fluff);
    if (!primary && baseObj?.img) primary = typeof baseObj.img === 'string' ? baseObj.img : (baseObj.img.url || baseObj.img.path || null);
    let fb = [];
    if (type === 'subclasses' && subclassName && className) fb = getSubclassFallbacks(className, subclassName, source, subclassShortName);
    else if (type && name && source) fb = stdFallbacks(type, source, name);
    
    if (!primary && fb.length > 0) { primary = fb[0]; fb = fb.slice(1); }
    
    console.log(`[FluffImage] Initializing ${name || subclassName || className}:`, { primary, fallbacks: fb });
    setImgState({ src: primary, fallbacks: fb, index: -1, failed: !primary });
  }, [fluff, baseObj, type, name, source, subclassName, className, subclassShortName]);

  if (imgState.failed || !imgState.src) return null;

  const handleError = () => {
    const nextIdx = imgState.index + 1;
    if (nextIdx < imgState.fallbacks.length) {
      console.log(`[FluffImage] Image failed. Trying fallback ${nextIdx + 1}:`, imgState.fallbacks[nextIdx]);
      setImgState(prev => ({ ...prev, index: nextIdx, src: prev.fallbacks[nextIdx] }));
    } else {
      console.log(`[FluffImage] All images failed for ${name || subclassName || className}`);
      setImgState(prev => ({ ...prev, failed: true }));
    }
  };

  return (
    <>
      <img src={imgState.src} alt={name || subclassName || className} onError={handleError} onClick={() => setExpanded(true)}
        style={{ maxWidth: '300px', maxHeight: '300px', float: 'right', margin: '0 0 10px 16px', borderRadius: '4px', objectFit: 'cover', cursor: 'zoom-in' }} />
      
      {expanded && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }} onClick={() => setExpanded(false)}>
          <img src={imgState.src} alt={name || subclassName || className} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </>
  );
}