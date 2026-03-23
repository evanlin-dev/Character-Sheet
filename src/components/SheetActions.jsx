import { useEffect, useState, useRef } from 'react';
import { useCharacter } from 'src/context/CharacterContext';
import { THEMES } from 'src/data/constants';
import { openDB, STORE_NAME } from 'src/utils/db';
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from 'src/styles/shared';

const DEFAULT_COLORS = {
  'red': '#8b1a1a',
  'red-dark': '#6b1a1a',
  'gold': '#c8a830',
  'gold-light': '#e8d9a0',
  'gold-dark': '#8b6914',
  'parchment': '#fdf8ed',
  'parchment-dark': '#f4ebd8',
  'ink': '#1a1008',
  'ink-light': '#5a4020'
};

export function ThemeModal() {
  const { modals, closeModal, update, character } = useCharacter();

  useEffect(() => {
    const themes = THEMES.map(t => t.key).filter(Boolean);
    themes.push('custom');
    
    themes.forEach(t => {
        if (t) document.body.classList.remove(t);
    });

    if (character.currentTheme) {
      document.body.classList.add(character.currentTheme);
    }
    
    if (character.currentTheme === 'custom' && character.customTheme) {
      Object.entries(character.customTheme).forEach(([key, value]) => {
        document.body.style.setProperty(`--${key}`, value);
      });
    } else {
      Object.keys(DEFAULT_COLORS).forEach(key => {
        document.body.style.removeProperty(`--${key}`);
      });
    }
  }, [character.currentTheme, character.customTheme]);

  if (!modals.theme) return null;

  const setTheme = (theme) => {
    update({ currentTheme: theme, customTheme: null });
  };

  const handleCustomColor = (key, value) => {
    const newCustom = { ...(character.customTheme || {}), [key]: value };
    update({ currentTheme: 'custom', customTheme: newCustom });
  };

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal('theme'); }}>
      <div className="info-modal-content" style={{ maxWidth: 600 }}>
        <button className="close-modal-btn" onClick={() => closeModal('theme')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Select Theme</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
          {THEMES.map(t => {
            const isSelected = (character.currentTheme || '') === t.key;
            return (
              <button
                key={t.key}
                className="btn btn-secondary"
                onClick={() => setTheme(t.key)}
                style={{
                  background: t.color,
                  color: 'white',
                  border: `2px solid ${isSelected ? 'var(--ink)' : 'transparent'}`,
                  opacity: (character.currentTheme === 'custom' && !isSelected) ? 0.7 : 1
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <h4 style={{ marginBottom: 10, color: 'var(--red-dark)', borderBottom: '1px solid var(--gold)', paddingBottom: 4 }}>Custom Colors</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { key: 'red', label: 'Primary (Red)' },
            { key: 'red-dark', label: 'Primary Dark' },
            { key: 'gold', label: 'Accent (Gold)' },
            { key: 'gold-light', label: 'Accent Light' },
            { key: 'gold-dark', label: 'Accent Dark' },
            { key: 'parchment', label: 'Background' },
            { key: 'parchment-dark', label: 'Background Dark' },
            { key: 'ink', label: 'Text (Ink)' },
            { key: 'ink-light', label: 'Text Light' },
          ].map(color => (
            <div key={color.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.5)', padding: '5px 10px', borderRadius: 4, border: '1px solid var(--gold)' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>{color.label}</label>
              <input 
                type="color" 
                value={character.customTheme?.[color.key] || DEFAULT_COLORS[color.key]} 
                onChange={(e) => handleCustomColor(color.key, e.target.value)}
                style={{ cursor: 'pointer', border: '1px solid var(--gold)', borderRadius: 2, background: 'transparent', height: 24, width: 36, padding: 0 }}
              />
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="btn" onClick={() => closeModal('theme')}>Done</button>
        </div>
      </div>
    </div>
  );
}

export function CustomDataModal() {
  const { modals, closeModal } = useCharacter();
  const [templateType, setTemplateType] = useState('class');
  const [hasData, setHasData] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'browser'
  const fileInputRef = useRef(null);

  const [browserDataCache, setBrowserDataCache] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (modals.customData) {
      checkData();
    }
  }, [modals.customData]);

  useEffect(() => {
    if (activeTab === 'browser') {
      loadBrowserData();
    }
  }, [activeTab]);

  const checkData = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const data = await new Promise((resolve) => {
        const req = store.get('currentData');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      if (data && data.length > 0) {
        setHasData(true);
        setFileList(data.map(f => f.name).sort());
      } else {
        setHasData(false);
        setFileList([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBrowserData = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const data = await new Promise((resolve) => {
        const req = store.get('currentData');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      if (!data) return;

      const categoryMap = {
        'spell': 'Spells', 'spells': 'Spells',
        'item': 'Items', 'items': 'Items', 'baseitem': 'Items', 'magicvariant': 'Items',
        'class': 'Classes', 'subclass': 'Subclasses',
        'classFeature': 'Class Features', 'subclassFeature': 'Subclass Features',
        'race': 'Species/Races', 'feat': 'Feats', 'background': 'Backgrounds',
        'monster': 'Monsters', 'action': 'Actions', 'condition': 'Conditions',
        'language': 'Languages', 'table': 'Tables'
      };

      const aggregated = {};
      data.forEach(file => {
        if (!file.name.toLowerCase().endsWith('.json')) return;
        try {
          const json = JSON.parse(file.content);
          Object.keys(json).forEach(key => {
            if (Array.isArray(json[key]) && json[key].length > 0 && typeof json[key][0] === 'object' && json[key][0].name) {
              let cat = categoryMap[key] || (key.charAt(0).toUpperCase() + key.slice(1));
              if (!aggregated[cat]) aggregated[cat] = [];
              aggregated[cat].push(...json[key]);
            }
          });
        } catch(e) {}
      });

      const finalCache = {};
      Object.keys(aggregated).forEach(cat => {
        const unique = new Map();
        aggregated[cat].forEach(item => {
          if (item.name) unique.set(item.name + "|" + (item.source || ""), item);
        });
        finalCache[cat] = Array.from(unique.values()).sort((a,b) => a.name.localeCompare(b.name));
      });

      setBrowserDataCache(finalCache);
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeleteFile = async (fileName) => {
    if (!window.confirm(`Delete ${fileName}? This cannot be undone.`)) return;
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const data = await new Promise((resolve, reject) => {
        const req = store.get('currentData');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (data) {
        const newData = data.filter(f => f.name !== fileName);
        await new Promise((resolve, reject) => {
          const req = store.put(newData, 'currentData');
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        checkData();
        if (activeTab === 'browser') loadBrowserData();
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting file: " + e.message);
    }
  };

  if (!modals.customData) return null;

  const downloadDataTemplate = () => {
    let data = {};
    let filename = "template.json";

    if (templateType === 'class') {
        filename = "custom-class.json";
        data = {
            "class": [
                {
                    "name": "My Custom Class",
                    "source": "Custom",
                    "hd": { "number": 1, "faces": 8 },
                    "proficiency": ["dex", "int"],
                    "spellcastingAbility": "int",
                    "casterProgression": "1/2",
                    "startingProficiencies": {
                        "armor": ["light", "medium", "shields"],
                        "weapons": ["simple", "martial"],
                        "tools": ["thieves' tools"],
                        "skills": {
                            "choose": {
                                "from": ["acrobatics", "arcana", "history", "investigation", "nature", "religion"],
                                "count": 2
                            }
                        }
                    },
                    "classTableGroups": [
                        {
                            "colLabels": ["{@bold Level}", "{@bold PB}", "{@bold Features}"],
                            "rows": [
                                [1, "+2", "{@classFeature My Feature|My Custom Class|Custom|1}"],
                                [2, "+2", "{@classFeature Another Feature|My Custom Class|Custom|2}"]
                            ]
                        }
                    ]
                }
            ],
            "classFeature": [
                { "name": "My Feature", "source": "Custom", "className": "My Custom Class", "classSource": "Custom", "level": 1, "entries": ["Description of feature 1."] },
                { "name": "Another Feature", "source": "Custom", "className": "My Custom Class", "classSource": "Custom", "level": 2, "entries": ["Description of feature 2."] }
            ]
        };
    } else if (templateType === 'subclass') {
        filename = "custom-subclass.json";
        data = {
            "subclass": [
                {
                    "name": "My Custom Subclass",
                    "shortName": "My Sub",
                    "source": "Custom",
                    "className": "Fighter",
                    "classSource": "PHB",
                    "subclassFeatures": ["My Subclass Feature|Fighter|PHB|My Subclass|Custom|3"]
                }
            ],
            "subclassFeature": [
                { "name": "My Subclass Feature", "source": "Custom", "className": "Fighter", "classSource": "PHB", "subclassShortName": "My Sub", "subclassSource": "Custom", "level": 3, "entries": ["Description of subclass feature."] }
            ]
        };
    } else if (templateType === 'race') {
        filename = "custom-race.json";
        data = { "race": [{ "name": "My Custom Species", "source": "Custom", "size": ["M"], "speed": 30, "entries": [{ "name": "Trait 1", "entries": ["Description."] }] }] };
    } else if (templateType === 'feat') {
        filename = "custom-feat.json";
        data = { "feat": [{ "name": "My Custom Feat", "source": "Custom", "entries": ["Description."], "ability": [{ "str": 1 }] }] };
    } else if (templateType === 'spell') {
        filename = "custom-spell.json";
        data = { "spell": [{ "name": "My Custom Spell", "source": "Custom", "level": 1, "school": "V", "time": [{ "number": 1, "unit": "action" }], "range": { "type": "point", "distance": { "type": "feet", "amount": 60 } }, "components": { "v": true }, "duration": [{ "type": "instant" }], "entries": ["Effect."], "classes": { "fromClassList": [{ "name": "Wizard", "source": "PHB" }] } }] };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
      const file = selectedFile;
      if (!file) return;

      setIsUploading(true);

      if (file.name.toLowerCase().endsWith('.zip') && file.size > 300 * 1024 * 1024) {
          if (!window.confirm(`This ZIP file is very large (${Math.round(file.size / (1024*1024))} MB) and likely contains images or non-data files which may cause the browser to crash.\n\nFor best results, zip only the 'data' folder (or relevant JSON files) and upload that.\n\nAttempt to process anyway?`)) {
              if (fileInputRef.current) fileInputRef.current.value = '';
              setSelectedFile(null);
              setIsUploading(false);
              return;
          }
      }

      try {
          const db = await openDB();
          let currentData = [];
          try {
              const tx = db.transaction(STORE_NAME, 'readonly');
              const store = tx.objectStore(STORE_NAME);
              const data = await new Promise((resolve, reject) => {
                  const req = store.get('currentData');
                  req.onsuccess = () => resolve(req.result);
                  req.onerror = () => reject(req.error);
              });
              if (data) currentData = data;
          } catch (err) {
              console.warn("Could not read current data", err);
          }

          if (!currentData || currentData.length === 0) {
            alert("No database found. Please use Data Viewer to initialize first.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSelectedFile(null);
            setIsUploading(false);
            return;
          }

          if (file.name.toLowerCase().endsWith('.zip')) {
              if (typeof window.JSZip === 'undefined') {
                  try {
                      await new Promise((resolve, reject) => {
                          const script = document.createElement('script');
                          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
                          script.onload = resolve;
                          script.onerror = reject;
                          document.head.appendChild(script);
                      });
                  } catch (err) {
                      alert("Failed to load JSZip. Cannot process ZIP files.");
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      setSelectedFile(null);
                      setIsUploading(false);
                      return;
                  }
              }

              const zip = await window.JSZip.loadAsync(file);
              let addedCount = 0;

              for (const relativePath of Object.keys(zip.files)) {
                  const zipEntry = zip.files[relativePath];
                  const p = relativePath.toLowerCase();
                  
                  if (zipEntry.dir || !p.endsWith('.json')) continue;
                  if (p.includes('package.json') || p.includes('package-lock.json')) continue;

                  const pathParts = relativePath.split('/');
                  const fileName = pathParts.pop();
                  
                  const content = await zipEntry.async("string");
                  try {
                      JSON.parse(content);
                      const newFileEntry = { name: fileName, content: content };
                      
                      const index = currentData.findIndex(f => f.name === fileName);
                      if (index >= 0) {
                          currentData[index] = newFileEntry;
                      } else {
                          currentData.push(newFileEntry);
                      }
                      addedCount++;
                  } catch (err) {
                      console.warn(`Skipping invalid JSON in zip: ${relativePath}`);
                  }
              }

              if (addedCount === 0) {
                  alert(`No valid JSON files found in the ZIP.`);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  setSelectedFile(null);
                  setIsUploading(false);
                  return;
              }
          } else if (file.name.toLowerCase().endsWith('.json')) {
              const content = await file.text();
              JSON.parse(content);
              
              const newFileEntry = { name: file.name, content: content };
              const index = currentData.findIndex(f => f.name === file.name);
              
              if (index >= 0) {
                  if(!window.confirm(`File '${file.name}' already exists. Overwrite?`)) {
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      setSelectedFile(null);
                      setIsUploading(false);
                      return;
                  }
                  currentData[index] = newFileEntry;
              } else {
                  currentData.push(newFileEntry);
              }
          } else {
              alert("Unsupported file type. Please upload a .json or .zip file.");
              if (fileInputRef.current) fileInputRef.current.value = '';
              setSelectedFile(null);
              setIsUploading(false);
              return;
          }
          
          currentData.sort((a, b) => a.name.localeCompare(b.name));
          
          const writeTx = db.transaction(STORE_NAME, 'readwrite');
          const writeStore = writeTx.objectStore(STORE_NAME);
          await new Promise((resolve, reject) => {
              const req = writeStore.put(currentData, 'currentData');
              req.onsuccess = () => resolve();
              req.onerror = () => reject(req.error);
          });
          
          alert("Custom data uploaded successfully.");
          window.location.reload();
      } catch (err) {
          console.error(err);
          if (err.message && err.message.includes("End of data reached")) {
              alert("Error: The ZIP file is too large or corrupted and the browser ran out of memory extracting it.");
          } else {
              alert("Error uploading file: " + err.message);
          }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
      setIsUploading(false);
  };

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) closeModal('customData'); }}>
      <ModalBox $maxWidth="500px" style={{ textAlign: 'center', padding: '15px' }}>
        <CloseBtn onClick={() => closeModal('customData')}>&times;</CloseBtn>
        <ModalTitle>Custom Data & Templates</ModalTitle>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 15, marginTop: 10 }}>
          <button className={`btn ${activeTab !== 'upload' ? 'btn-secondary' : ''}`} style={{ flex: 1, padding: '8px 4px' }} onClick={() => setActiveTab('upload')}>Upload & Files</button>
          <button className={`btn ${activeTab !== 'browser' ? 'btn-secondary' : ''}`} style={{ flex: 1, padding: '8px 4px' }} onClick={() => setActiveTab('browser')}>Data Browser</button>
        </div>

        {activeTab === 'upload' && (
          <>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: 15, lineHeight: 1.4 }}>
                Create custom content by downloading a template below.
                <br/>1. <strong>Download</strong> the JSON template.
                <br/>2. <strong>Edit</strong> the file with your content.
                <br/>3. <strong>Upload</strong> here.
            </p>
            <div style={{ marginBottom: 15, background: 'white', padding: 15, border: '1px solid var(--gold)', borderRadius: 4 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8, color: 'var(--red-dark)' }}>Select Template Type</label>
                <select value={templateType} onChange={(e) => setTemplateType(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 6, border: '1px solid var(--gold)', borderRadius: 4, background: 'var(--parchment)' }}>
                    <option value="class">Class Template</option>
                    <option value="subclass">Subclass Template</option>
                    <option value="race">Species/Race Template</option>
                    <option value="feat">Feat Template</option>
                    <option value="spell">Spell Template</option>
                </select>
                <button className="btn" onClick={downloadDataTemplate} style={{ width: '100%' }}>Download JSON</button>
            </div>
            <div style={{ marginBottom: 15, background: 'white', padding: 15, border: '1px solid var(--gold)', borderRadius: 4 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8, color: 'var(--red-dark)' }}>Upload Custom JSON or ZIP</label>
                <input type="file" ref={fileInputRef} accept=".json,.zip" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ width: '100%', marginBottom: 10, fontSize: '0.9rem' }} />
                <button className="btn" onClick={handleUpload} disabled={!selectedFile || isUploading} style={{ width: '100%' }}>
                  {isUploading ? 'Uploading...' : 'Upload & Refresh'}
                </button>
            </div>
            {hasData && (
              <div style={{ background: 'white', padding: 15, border: '1px solid var(--gold)', borderRadius: 4 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8, color: 'var(--red-dark)' }}>Uploaded Files</label>
                  <div style={{ maxHeight: 150, overflowY: 'auto', textAlign: 'left', border: '1px solid var(--gold-light)', borderRadius: 4, padding: 8 }}>
                      {fileList.length === 0 ? <em style={{ color: 'var(--ink-light)', fontSize: '0.85rem' }}>No files uploaded.</em> : (
                          fileList.map(name => (
                              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--gold-light)', padding: '6px 0' }}>
                                  <span style={{ fontSize: '0.85rem', wordBreak: 'break-all', paddingRight: 10, color: 'var(--ink)' }}>{name}</span>
                                  <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem', color: 'var(--red)', minWidth: 60 }} onClick={() => handleDeleteFile(name)}>Delete</button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'browser' && (
          <div style={{ background: 'white', padding: 15, border: '1px solid var(--gold)', borderRadius: 4, height: '60vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <select className="styled-select" style={{ flex: 1 }} value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">-- Select Category --</option>
                {Object.keys(browserDataCache).sort().map(c => (
                  <option key={c} value={c}>{c} ({browserDataCache[c].length})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <input type="text" className="styled-select" style={{ flex: 1 }} placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--gold-light)', padding: 10, borderRadius: 4, textAlign: 'left' }}>
              {!selectedCategory ? <div style={{ color: 'var(--ink-light)', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>Select a category to view data.</div> : (
                browserDataCache[selectedCategory]
                  ?.filter(i => !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .slice(0, 100)
                  .map((item, idx) => (
                    <div key={idx} style={{ padding: '6px 10px', borderBottom: '1px dashed var(--gold-light)', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--ink)' }}>{item.name}</strong> <span style={{ color: 'var(--ink-light)' }}>{item.source ? `[${item.source}]` : ''}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--ink-light)', marginTop: 15 }}>
            Note: Ensure 'className' and 'source' match exactly when linking features.
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

export function LastSavedModal() {
  const { modals, closeModal, load } = useCharacter();
  if (!modals.lastSaved) return null;

  let raw = localStorage.getItem('dndCharacter') || '{}';
  try {
    raw = JSON.stringify(JSON.parse(raw), null, 2);
  } catch (e) {
    // Fallback to unformatted if parsing fails
  }
  let textareaVal = raw;

  const handleLoad = () => {
    try {
      const data = JSON.parse(textareaVal);
      load(data);
      closeModal('lastSaved');
    } catch {
      alert('Invalid JSON. Please check the data.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(raw).then(() => alert('Copied to clipboard!'));
  };

  return (
    <div className="info-modal-overlay" style={{ display: 'flex' }}>
      <div className="info-modal-content" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <button className="close-modal-btn" onClick={() => closeModal('lastSaved')}>&times;</button>
        <h3 className="info-modal-title" style={{ textAlign: 'center' }}>Last Saved Data</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: 10 }}>
          This is the raw JSON stored in your browser. Copy as backup or paste valid JSON here to restore.
        </p>
        <textarea
          defaultValue={raw}
          onChange={(e) => { textareaVal = e.target.value; }}
          style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', padding: 10, border: '1px solid var(--gold)', borderRadius: 4, resize: 'none', background: 'white', marginBottom: 15, overflowY: 'auto' }}
        />
        <div style={{ textAlign: 'center', display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn" onClick={handleLoad}>Load / Restore</button>
          <button className="btn btn-secondary" onClick={copyToClipboard}>Copy to Clipboard</button>
        </div>
      </div>
    </div>
  );
}
