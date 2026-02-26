import React, { useState, useEffect, useRef, useCallback } from 'react';
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0a0a0f;
    --surface:  #111118;
    --card:     #16161f;
    --border:   #252535;
    --border-hi:#3a3a55;
    --accent:   #e8ff47;
    --accent2:  #47ffcc;
    --danger:   #ff4757;
    --warn:     #ffaa00;
    --text:     #e8e8f0;
    --muted:    #6b6b8a;
    --glow:     rgba(232,255,71,0.15);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    min-height: 100vh;
  }

  .fc-root {
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .fc-grid-bg {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(232,255,71,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(232,255,71,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .fc-app {
    position: relative; z-index: 1;
    max-width: 740px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  /* HEADER */
  .fc-header { text-align: center; margin-bottom: 52px; }

  .fc-logo-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--card);
    border: 1px solid var(--border-hi);
    border-radius: 100px;
    padding: 6px 16px;
    margin-bottom: 24px;
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--accent);
  }

  .fc-logo-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent);
    animation: fc-pulse 2s ease-in-out infinite;
  }

  @keyframes fc-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.4; transform:scale(.7); }
  }

  .fc-h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    letter-spacing: -2px;
    line-height: 1;
    color: var(--text);
  }
  .fc-h1 span { color: var(--accent); }

  .fc-subtitle {
    margin-top: 12px;
    color: var(--muted);
    font-size: 13px;
    letter-spacing: 0.5px;
  }

  /* CARD */
  .fc-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 16px;
    transition: border-color .2s;
  }
  .fc-card:hover { border-color: var(--border-hi); }

  .fc-card-label {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .fc-card-label::after {
    content: ''; flex: 1; height: 1px;
    background: var(--border);
  }

  /* DROPZONE */
  .fc-dropzone {
    border: 1.5px dashed var(--border-hi);
    border-radius: 12px;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all .25s ease;
    position: relative;
    overflow: hidden;
    user-select: none;
  }
  .fc-dropzone::before {
    content: '';
    position: absolute; inset: 0;
    background: var(--glow);
    opacity: 0;
    transition: opacity .25s;
    pointer-events: none;
  }
  .fc-dropzone.drag-over {
    border-color: var(--accent);
    transform: scale(1.01);
  }
  .fc-dropzone.drag-over::before { opacity: 1; }
  .fc-dropzone.has-file { border-color: var(--accent2); border-style: solid; }

  .fc-drop-icon {
    font-size: 36px; margin-bottom: 12px;
    transition: transform .3s ease;
    display: block;
  }
  .fc-dropzone:hover .fc-drop-icon { transform: translateY(-4px); }

  .fc-drop-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 15px;
    margin-bottom: 6px;
  }
  .fc-drop-sub { color: var(--muted); font-size: 12px; }

  /* FILE INFO */
  .fc-file-info {
    display: flex; align-items: center; gap: 12px;
    background: var(--surface);
    border: 1px solid var(--border-hi);
    border-radius: 10px;
    padding: 12px 16px;
    margin-top: 16px;
    animation: fc-slideIn .3s ease;
  }

  @keyframes fc-slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .fc-fi-icon { font-size: 22px; flex-shrink: 0; }
  .fc-fi-details { flex: 1; min-width: 0; }
  .fc-fi-name {
    font-size: 13px; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .fc-fi-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .fc-fi-remove {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 18px;
    padding: 4px 8px; border-radius: 6px;
    transition: color .2s, background .2s;
    font-family: inherit;
  }
  .fc-fi-remove:hover { color: var(--danger); background: rgba(255,71,87,.1); }

  /* FORMAT GRID */
  .fc-format-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .fc-fmt-btn {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 16px 8px;
    cursor: pointer;
    text-align: center;
    transition: all .2s ease;
    position: relative;
    overflow: hidden;
    color: var(--text);
    font-family: inherit;
  }
  .fc-fmt-btn::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent);
    transform: scaleX(0);
    transition: transform .2s ease;
  }
  .fc-fmt-btn:hover { border-color: var(--border-hi); transform: translateY(-2px); }
  .fc-fmt-btn:hover::after { transform: scaleX(1); }
  .fc-fmt-btn.selected {
    border-color: var(--accent);
    background: rgba(232,255,71,0.06);
  }
  .fc-fmt-btn.selected::after { transform: scaleX(1); }

  .fc-fmt-emoji { font-size: 22px; margin-bottom: 6px; }
  .fc-fmt-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 13px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .fc-fmt-desc { font-size: 10px; color: var(--muted); margin-top: 3px; }

  /* CONVERT BUTTON */
  .fc-convert-btn {
    width: 100%;
    background: var(--accent);
    color: #0a0a0f;
    border: none;
    border-radius: 12px;
    padding: 18px;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all .2s ease;
    position: relative;
    overflow: hidden;
  }
  .fc-convert-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: rgba(255,255,255,0.15);
    transform: translateX(-100%);
    transition: transform .4s ease;
  }
  .fc-convert-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px var(--glow); }
  .fc-convert-btn:hover:not(:disabled)::before { transform: translateX(100%); }
  .fc-convert-btn:active:not(:disabled) { transform: scale(.98); }
  .fc-convert-btn:disabled {
    opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none;
  }
  .fc-convert-btn.loading {
    background: var(--surface);
    color: var(--accent);
    border: 1.5px solid var(--accent);
    animation: fc-borderGlow 1.5s ease-in-out infinite;
  }
  @keyframes fc-borderGlow {
    0%,100% { box-shadow: 0 0 0 0 var(--glow); }
    50%      { box-shadow: 0 0 20px 4px var(--glow); }
  }

  /* PROGRESS */
  .fc-progress-wrap {
    height: 3px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
    margin-top: 12px;
    opacity: 0;
    transition: opacity .3s;
  }
  .fc-progress-wrap.visible { opacity: 1; }
  .fc-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 99px;
    transition: width .4s ease;
  }

  /* QUEUE */
  .fc-queue-list { display: flex; flex-direction: column; gap: 8px; }

  .fc-queue-item {
    display: flex; align-items: center; gap: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    animation: fc-slideIn .3s ease;
  }

  .fc-qi-icon {
    flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    background: rgba(232,255,71,0.08);
  }
  .fc-qi-main { flex: 1; min-width: 0; }
  .fc-qi-name { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fc-qi-sub  { font-size: 10px; color: var(--muted); margin-top: 2px; }

  .fc-qi-status {
    font-size: 10px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; padding: 3px 10px; border-radius: 99px;
    flex-shrink: 0;
  }
  .fc-qi-status.completed { background: rgba(71,255,204,.1); color: var(--accent2); }
  .fc-qi-status.failed    { background: rgba(255,71,87,.1);  color: var(--danger); }
  .fc-qi-status.progress  { background: rgba(255,170,0,.1);  color: var(--warn); }

  /* TOAST */
  .fc-toast-container {
    position: fixed; bottom: 24px; right: 24px;
    display: flex; flex-direction: column; gap: 8px;
    z-index: 999; pointer-events: none;
  }
  .fc-toast {
    background: var(--card);
    border: 1px solid var(--border-hi);
    border-radius: 10px;
    padding: 12px 18px;
    font-size: 13px;
    display: flex; align-items: center; gap: 10px;
    max-width: 300px;
    box-shadow: 0 4px 24px rgba(0,0,0,.6);
    animation: fc-toastIn .3s ease;
    pointer-events: all;
  }
  .fc-toast.success { border-left: 3px solid var(--accent2); }
  .fc-toast.error   { border-left: 3px solid var(--danger); }
  .fc-toast.exiting { animation: fc-toastOut .4s ease forwards; }

  @keyframes fc-toastIn {
    from { opacity:0; transform: translateX(20px); }
    to   { opacity:1; transform: translateX(0); }
  }
  @keyframes fc-toastOut {
    from { opacity:1; transform: translateX(0); }
    to   { opacity:0; transform: translateX(20px); }
  }

  @media (max-width: 480px) {
    .fc-format-grid { grid-template-columns: repeat(2, 1fr); }
    .fc-h1 { font-size: 2rem; }
  }
`;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function stripExtension(name) {
  return name.replace(/\.[^.]+$/, '');
}

function getFileIcon(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  const map = {
    pdf: '📕', docx: '📘', doc: '📘', txt: '📄', html: '🌐',
    htm: '🌐', csv: '📊', json: '🔧', md: '📝', xml: '🔖'
  };
  return map[ext] || '📄';
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function crc32(data) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files) {
  const enc = new TextEncoder();
  const u16 = n => [n & 0xFF, (n >> 8) & 0xFF];
  const u32 = n => [n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF];
  const dosDate = () => {
    const d = new Date();
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    return [...u16(time), ...u16(date)];
  };

  const localHeaders = [];
  const centralDirs = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = enc.encode(name);
    const dataBytes = enc.encode(content);
    const checksum = crc32(dataBytes);
    const size = dataBytes.length;

    const lh = new Uint8Array([
      0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00,
      ...dosDate(), ...u32(checksum), ...u32(size), ...u32(size),
      ...u16(nameBytes.length), 0x00, 0x00, ...nameBytes,
    ]);
    const cd = new Uint8Array([
      0x50, 0x4B, 0x01, 0x02, 0x3F, 0x00, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00,
      ...dosDate(), ...u32(checksum), ...u32(size), ...u32(size),
      ...u16(nameBytes.length), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, ...u32(offset), ...nameBytes,
    ]);

    localHeaders.push({ header: lh, data: dataBytes });
    centralDirs.push(cd);
    offset += lh.length + dataBytes.length;
  }

  const cdOffset = offset;
  const cdSize = centralDirs.reduce((s, c) => s + c.length, 0);
  const n = centralDirs.length;

  const end = new Uint8Array([
    0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
    ...u16(n), ...u16(n), ...u32(cdSize), ...u32(cdOffset), 0x00, 0x00,
  ]);

  const buf = new Uint8Array(offset + cdSize + end.length);
  let pos = 0;
  for (const { header, data } of localHeaders) {
    buf.set(header, pos); pos += header.length;
    buf.set(data, pos); pos += data.length;
  }
  for (const cd of centralDirs) { buf.set(cd, pos); pos += cd.length; }
  buf.set(end, pos);
  return buf;
}

function readText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsText(file);
  });
}

async function convertToPDF(file) {
  const text = await readText(file);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 50;
  const pageH = doc.internal.pageSize.getHeight();
  const usableW = doc.internal.pageSize.getWidth() - margin * 2;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);

  let y = margin + 10;
  for (const rawLine of text.split('\n')) {
    const wrapped = doc.splitTextToSize(rawLine || ' ', usableW);
    for (const line of wrapped) {
      if (y + 14 > pageH - margin) { doc.addPage(); y = margin + 10; }
      doc.text(line, margin, y);
      y += 14;
    }
  }
  doc.save(stripExtension(file.name) + '.pdf');
}

async function convertToDocx(file) {
  const text = await readText(file);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const paragraphs = text.split('\n')
    .map(l => `<w:p><w:r><w:t xml:space="preserve">${esc(l)}</w:t></w:r></w:p>`)
    .join('\n');

  const files = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs}<w:sectPr/></w:body>
</w:document>`,
    'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`,
  };

  const blob = new Blob([buildZip(files)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, stripExtension(file.name) + '.docx');
  URL.revokeObjectURL(url);
}

async function convertToTxt(file) {
  const text = await readText(file);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, stripExtension(file.name) + '.txt');
  URL.revokeObjectURL(url);
}

async function convertToHtml(file) {
  const text = await readText(file);
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${stripExtension(file.name)}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 860px;
           margin: 48px auto; padding: 0 24px; line-height: 1.7; color: #1a1a2e; }
    pre  { white-space: pre-wrap; word-break: break-word; background: #f4f4f8;
           padding: 24px; border-radius: 8px; font-size: 14px; }
  </style>
</head>
<body><pre>${escaped}</pre></body>
</html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, stripExtension(file.name) + '.html');
  URL.revokeObjectURL(url);
}

const CONVERTERS = { pdf: convertToPDF, docx: convertToDocx, txt: convertToTxt, html: convertToHtml };

const FORMATS = [
  { id: 'pdf', emoji: '📕', label: 'PDF', desc: 'Portable doc' },
  { id: 'docx', emoji: '📘', label: 'DOCX', desc: 'Word doc' },
  { id: 'txt', emoji: '📄', label: 'TXT', desc: 'Plain text' },
  { id: 'html', emoji: '🌐', label: 'HTML', desc: 'Web page' },
];

function Toast({ toasts }) {
  return (
    <div className="fc-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`fc-toast ${t.type} ${t.exiting ? 'exiting' : ''}`}>
          <span>{t.type === 'success' ? '✓' : '✗'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function QueueItem({ item }) {
  const statusClass = item.status === 'Completed' ? 'completed' : item.status === 'Failed' ? 'failed' : 'progress';
  return (
    <li className="fc-queue-item">
      <div className="fc-qi-icon">{getFileIcon(item.fileName)}</div>
      <div className="fc-qi-main">
        <div className="fc-qi-name">{stripExtension(item.fileName)} → .{item.format.toUpperCase()}</div>
        <div className="fc-qi-sub">{item.fileName}</div>
      </div>
      <span className={`fc-qi-status ${statusClass}`}>{item.status}</span>
    </li>
  );
}

export default function FileConverter() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [queue, setQueue] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [jspdfReady, setJspdfReady] = useState(false);
  const fileInputRef = useRef(null);
  const styleInjected = useRef(false);

  useEffect(() => {
    if (!styleInjected.current) {
      const style = document.createElement('style');
      style.textContent = STYLES;
      document.head.appendChild(style);
      styleInjected.current = true;
    }

    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => setJspdfReady(true);
      document.head.appendChild(script);
    } else {
      setJspdfReady(true);
    }
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    }, 3200);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3600);
  }, []);

  const handleFile = useCallback((f) => {
    if (f) setFile(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const addToQueue = useCallback((fileName, fmt) => {
    const id = `qi-${Date.now()}`;
    setQueue(prev => [{ id, fileName, format: fmt, status: 'Processing' }, ...prev]);
    return id;
  }, []);

  const updateQueue = useCallback((id, status) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file || !format || loading) return;
    if (format === 'pdf' && !jspdfReady) {
      showToast('PDF engine still loading, try again in a moment.', 'error');
      return;
    }

    const queueId = addToQueue(file.name, format);
    setLoading(true);
    setProgress(30);

    try {
      setProgress(60);
      await CONVERTERS[format](file);
      setProgress(100);
      updateQueue(queueId, 'Completed');
      showToast(`${stripExtension(file.name)}.${format} downloaded ✓`, 'success');
    } catch (err) {
      console.error('Conversion error:', err);
      updateQueue(queueId, 'Failed');
      showToast('Conversion failed. Check the console.', 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }, [file, format, loading, jspdfReady, addToQueue, updateQueue, showToast]);

  const isReady = file && format && !loading;

  return (
    <div className="fc-root">
      <div className="fc-grid-bg" />

      <div className="fc-app">
        <header className="fc-header">
          <div className="fc-logo-pill">
            <span className="fc-logo-dot" />
            FileForge
          </div>
          <h1 className="fc-h1">Convert <span>anything.</span></h1>
          <p className="fc-subtitle">{'// drag, drop, convert — no servers, no uploads, 100% local'}</p>
        </header>

        <div className="fc-card">
          <div className="fc-card-label">01 — Select File</div>
          <div
            className={`fc-dropzone ${isDragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
            />
            <span className="fc-drop-icon">⬆</span>
            <div className="fc-drop-title">Drop your file here</div>
            <div className="fc-drop-sub">or click to browse · TXT, HTML, MD, CSV, JSON and more</div>
          </div>

          {file && (
            <div className="fc-file-info">
              <span className="fc-fi-icon">{getFileIcon(file.name)}</span>
              <div className="fc-fi-details">
                <div className="fc-fi-name">{file.name}</div>
                <div className="fc-fi-meta">{formatBytes(file.size)} · {file.type || 'unknown type'}</div>
              </div>
              <button
                className="fc-fi-remove"
                onClick={e => { e.stopPropagation(); setFile(null); }}
                title="Remove file"
              >✕</button>
            </div>
          )}
        </div>

        <div className="fc-card">
          <div className="fc-card-label">02 — Choose Output Format</div>
          <div className="fc-format-grid">
            {FORMATS.map(f => (
              <button
                key={f.id}
                className={`fc-fmt-btn ${format === f.id ? 'selected' : ''}`}
                onClick={() => setFormat(f.id)}
              >
                <div className="fc-fmt-emoji">{f.emoji}</div>
                <div className="fc-fmt-name">{f.label}</div>
                <div className="fc-fmt-desc">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="fc-card">
          <div className="fc-card-label">03 — Convert</div>
          <button
            className={`fc-convert-btn ${loading ? 'loading' : ''}`}
            disabled={!isReady}
            onClick={handleConvert}
          >
            {loading ? '⟳  Converting…' : '↓   Convert File'}
          </button>
          <div className={`fc-progress-wrap ${progress > 0 && progress < 100 ? 'visible' : ''}`}>
            <div className="fc-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {queue.length > 0 && (
          <div className="fc-card">
            <div className="fc-card-label">Conversion History</div>
            <ul className="fc-queue-list">
              {queue.map(item => <QueueItem key={item.id} item={item} />)}
            </ul>
          </div>
        )}
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
