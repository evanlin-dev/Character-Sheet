import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { openDB, STORE_NAME, DB_NAME } from 'src/utils/db';

function FormatValue({ val }) {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'object') return String(val);

  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
      const keys = Array.from(new Set(val.flatMap(item => item ? Object.keys(item) : [])));
      return (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {keys.map(k => <th key={k}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {val.map((item, i) => (
                <tr key={i}>
                  {keys.map(h => (
                    <td key={h}><FormatValue val={item ? item[h] : undefined} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {val.map((v, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid var(--gold)', padding: '2px 6px', borderRadius: 4 }}>
              <FormatValue val={v} />
            </div>
          ))}
        </div>
      );
    }
  }
  // plain object
  return (
    <table className="data-table kv-table">
      <thead><tr><th>Key</th><th>Value</th></tr></thead>
      <tbody>
        {Object.entries(val).map(([key, value]) => (
          <tr key={key}>
            <td className="json-key">{key}</td>
            <td className="json-val"><FormatValue val={value} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FileSection({ file }) {
  let content;
  try {
    const json = JSON.parse(file.content);
    content = <FormatValue val={json} />;
  } catch {
    content = (
      <pre style={{ background: 'white', padding: 10, border: '1px solid var(--gold)', borderRadius: 4, overflowX: 'auto' }}>
        {file.content}
      </pre>
    );
  }
  return (
    <div className="file-section">
      <div className="file-title">{file.name}</div>
      {content}
    </div>
  );
}

export default function DataViewerPage() {
  const [allFiles, setAllFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');

  const loadFromStorage = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const data = await new Promise((resolve, reject) => {
        const req = store.get('currentData');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (data) {
        setAllFiles(data);
        setCurrentPage(1);
      }
    } catch (e) {
      console.error('IDB Load failed', e);
    }
  }, []);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  const saveToStorage = async (files) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await new Promise((resolve, reject) => {
        const req = store.put(files, 'currentData');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('IDB Save failed', e);
      alert('Failed to save to IndexedDB: ' + e.message);
    }
  };

  const extractZipData = async (zip) => {
    const promises = [];
    let hasDataFolder = false;
    zip.forEach((relativePath) => {
      if (relativePath.includes('/data/') || relativePath.startsWith('data/')) hasDataFolder = true;
    });

    zip.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir || !relativePath.toLowerCase().endsWith('.json')) return;
      if (relativePath.includes('package.json') || relativePath.includes('package-lock.json')) return;
      if (hasDataFolder && !(relativePath.includes('/data/') || relativePath.startsWith('data/'))) return;

      const fileName = relativePath.split('/').pop();
      promises.push(zipEntry.async('string').then(content => ({ name: fileName, content })));
    });
    const files = (await Promise.all(promises)).sort((a, b) => a.name.localeCompare(b.name));
    setAllFiles(files);
    setCurrentPage(1);
    await saveToStorage(files);
  };

  const handleFetchZip = async () => {
    if (!url) return;
    setProcessing(true);
    setError('');
    setAllFiles([]);
    setCurrentPage(1);
    try {
      // Detect GitHub folder URLs and fetch raw JSON files directly
      const githubMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/);
      if (githubMatch) {
        const [, owner, repo, branch, rawFolder] = githubMatch;
        const folder = rawFolder.replace(/\/$/, '');
        setProcessing('Fetching repository tree...');
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        const treeRes = await fetch(apiUrl);
        if (!treeRes.ok) throw new Error(`GitHub API error: ${treeRes.status}`);
        const treeData = await treeRes.json();

        const jsonFiles = treeData.tree.filter(node =>
          node.type === 'blob' &&
          (node.path === folder || node.path.startsWith(folder + '/')) &&
          node.path.toLowerCase().endsWith('.json') &&
          !node.path.includes('package.json') &&
          !node.path.includes('package-lock.json')
        );

        if (jsonFiles.length === 0) throw new Error('No JSON files found in that GitHub folder.');

        const files = [];
        const chunkSize = 20; // Process in chunks to prevent network queue exhaustion
        for (let i = 0; i < jsonFiles.length; i += chunkSize) {
          setProcessing(`Fetching JSON files... ${i} of ${jsonFiles.length}`);
          const chunk = jsonFiles.slice(i, i + chunkSize);
          await Promise.all(chunk.map(async (node) => {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${node.path}`;
            const fileRes = await fetch(rawUrl);
            if (fileRes.ok) {
              const content = await fileRes.text();
              const fileName = node.path.split('/').pop();
              files.push({ name: fileName, content });
            }
          }));
        }

        setProcessing('Saving data...');
        files.sort((a, b) => a.name.localeCompare(b.name));
        setAllFiles(files);
        setCurrentPage(1);
        await saveToStorage(files);
        return;
      }

      let response;
      try {
        response = await fetch(url);
        if (!response.ok) throw new Error('Direct fetch failed');
      } catch (err) {
        console.warn('Direct fetch failed, likely due to CORS. Attempting via proxy...', err);
        try {
          response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
          if (!response.ok) throw new Error('Proxy 1 failed');
        } catch (err2) {
          console.warn('Proxy 1 failed, attempting proxy 2...', err2);
          response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        }
      }

      if (!response.ok) {
        if (response.status === 403 || response.status === 413) {
          throw new Error(`HTTP ${response.status}. The proxy blocked the download (likely too large). Please download the ZIP manually and use 'Upload Local ZIP'.`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();

      const zip = await JSZip.loadAsync(blob).catch(err => {
        if (url.includes('github.com') && !url.endsWith('.zip')) {
          throw new Error("Invalid ZIP file. Make sure you are linking directly to a .zip file (e.g., .../archive/refs/heads/main.zip), not a GitHub repository page.");
        }
        throw err;
      });
      await extractZipData(zip);
    } catch (err) {
      setError('Error fetching or reading zip: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProcessing(true);
    setError('');
    setAllFiles([]);
    setCurrentPage(1);
    try {
      const zip = await JSZip.loadAsync(file);
      await extractZipData(zip);
    } catch (err) {
      setError('Error reading local zip: ' + err.message);
    } finally {
      setProcessing(false);
      e.target.value = '';
    }
  };

  const clearStorage = async () => {
    if (!confirm('Remove saved data from browser?')) return;
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await new Promise((resolve, reject) => {
        const req = store.delete('currentData');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      setAllFiles([]);
      setCurrentPage(1);
      setUrl('');
    } catch (e) {
      console.error('IDB Clear failed', e);
    }
  };

  const deleteDatabase = () => {
    if (!confirm('Completely delete the IndexedDB database? This will refresh the page.')) return;
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => { alert('Database deleted successfully.'); location.reload(); };
    req.onerror = () => alert('Error deleting database.');
    req.onblocked = () => alert('Database deletion blocked. Please close other tabs using this app and try again.');
  };

  const changePage = (delta) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= allFiles.length) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const currentFile = allFiles[currentPage - 1];

  return (
    <>
      <style>{`
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 0.95rem; }
        .data-table th, .data-table td { border: 1px solid var(--gold); padding: 8px; text-align: left; vertical-align: top; }
        .data-table th { background: var(--parchment-dark); color: var(--red-dark); font-family: "Cinzel", serif; white-space: nowrap; }
        .kv-table th:first-child { width: 30%; white-space: normal; }
        .data-table td { background: rgba(255,255,255,0.5); font-family: "Crimson Text", serif; }
        .file-section { margin-bottom: 24px; border: 2px solid var(--gold); padding: 16px; border-radius: 8px; background: rgba(255,255,255,0.3); box-shadow: 0 2px 8px var(--shadow); }
        .file-title { font-family: "Cinzel", serif; color: var(--red); font-size: 1.2rem; margin-bottom: 12px; border-bottom: 1px dashed var(--gold); padding-bottom: 6px; font-weight: bold; }
        .json-key { font-weight: bold; color: var(--ink); }
        .json-val pre { margin: 0; white-space: pre-wrap; font-family: monospace; font-size: 0.85rem; color: var(--ink-light); }
      `}</style>
      <div style={{ width: '100%', minHeight: '100vh', background: 'var(--parchment)', padding: 24, position: 'relative', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(42,24,16,0.02) 2px, rgba(42,24,16,0.02) 4px)', pointerEvents: 'none', opacity: 0.5 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="header">
            <h1>Data Viewer</h1>
            <Link to="/" className="dm-screen-button">Character Sheet</Link>
            <div className="subtitle">Zip File Inspector</div>
          </div>

          <div className="field" style={{ textAlign: 'center', padding: 20, marginBottom: 20 }}>
            <label className="field-label" style={{ fontSize: '1rem', marginBottom: 10, display: 'block' }}>Enter ZIP/GitHub Folder URL or Upload Local File</label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', maxWidth: 700, margin: '0 auto', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/data.zip" style={{ flex: 1, minWidth: 250, padding: 8, border: '1px solid var(--gold)', borderRadius: 4, fontFamily: 'monospace' }} />
              <button className="btn" onClick={handleFetchZip} disabled={processing || !url} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Fetch URL</button>
              <span style={{ color: 'var(--ink-light)', fontWeight: 'bold' }}>OR</span>
              <input type="file" accept=".zip" onChange={handleFileUpload} disabled={processing} style={{ display: 'none' }} id="zip-upload-input" />
              <label htmlFor="zip-upload-input" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer', opacity: processing ? 0.5 : 1, margin: 0 }}>Upload Local ZIP</label>
            </div>
            <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
              {allFiles.length > 0 && (
                <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={clearStorage}>Clear Saved Data</button>
              )}
              <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={deleteDatabase}>Delete DB</button>
            </div>
          </div>

          {processing && (
            <div style={{ textAlign: 'center', fontStyle: 'italic' }}>{typeof processing === 'string' ? processing : 'Processing data...'}</div>
          )}
          {error && (
            <div style={{ color: 'red' }}>{error}</div>
          )}

          {allFiles.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginBottom: 20, alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => changePage(-1)} disabled={currentPage === 1}>Previous</button>
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 'bold', color: 'var(--red-dark)' }}>
                File {currentPage} of {allFiles.length}
              </span>
              <button className="btn btn-secondary" onClick={() => changePage(1)} disabled={currentPage === allFiles.length}>Next</button>
            </div>
          )}

          {currentFile && <FileSection file={currentFile} />}
        </div>
      </div>
    </>
  );
}
