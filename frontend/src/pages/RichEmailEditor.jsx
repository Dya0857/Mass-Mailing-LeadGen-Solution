import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image, Paperclip,
  Type, Palette, ChevronDown, Minus, RotateCcw, RotateCw, X,
} from "lucide-react";

const FONT_FAMILIES = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS'];
const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const TEXT_COLORS = ['#000000', '#374151', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#FFFFFF'];
const BG_COLORS = ['transparent', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#EDE9FE', '#FEE2E2', '#F3F4F6'];

function ToolbarButton({ onClick, title, active, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '26px', border: 'none', borderRadius: '4px',
        background: active ? '#dbeafe' : 'transparent',
        color: active ? '#2563eb' : '#374151',
        cursor: 'pointer', transition: 'background 0.15s', padding: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.background = active ? '#bfdbfe' : '#f3f4f6'}
      onMouseLeave={e => e.currentTarget.style.background = active ? '#dbeafe' : 'transparent'}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <div style={{ width: '1px', height: '18px', background: '#e5e7eb', margin: '0 2px', flexShrink: 0 }} />;
}

function ColorPicker({ colors, onSelect, title, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button type="button" title={title}
        onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o); }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '2px', height: '26px',
          padding: '0 4px', border: 'none', borderRadius: '4px',
          background: 'transparent', color: '#374151', cursor: 'pointer',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {children}<ChevronDown size={9} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '30px', left: 0, zIndex: 9999,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
          padding: '7px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          display: 'grid', gridTemplateColumns: 'repeat(5, 20px)', gap: '4px',
        }}>
          {colors.map(c => (
            <button key={c} type="button" title={c}
              onMouseDown={(e) => { e.preventDefault(); onSelect(c); setOpen(false); }}
              style={{
                width: '20px', height: '20px', borderRadius: '3px', cursor: 'pointer',
                background: c === 'transparent'
                  ? 'linear-gradient(135deg, #fff 45%, #f00 45%, #f00 55%, #fff 55%)'
                  : c,
                border: '1.5px solid #d1d5db',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AttachmentChip({ name, type, onRemove }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: type === 'image' ? '#eff6ff' : '#fdf4ff',
      border: `1px solid ${type === 'image' ? '#bfdbfe' : '#e9d5ff'}`,
      borderRadius: '20px', padding: '2px 8px 2px 6px', fontSize: '11px',
      color: type === 'image' ? '#1d4ed8' : '#7e22ce',
    }}>
      {type === 'image' ? <Image size={11} /> : <Paperclip size={11} />}
      <span style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <button type="button"
        onMouseDown={e => { e.preventDefault(); onRemove(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}>
        <X size={10} />
      </button>
    </div>
  );
}

export default function RichEmailEditor({ value, onChange, attachments = [], onAddImage, onAddPDF, onRemoveAttachment }) {
  const editorRef = useRef(null);
  const imgInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('14px');
  const [activeFormats, setActiveFormats] = useState({});
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  // Store range as start/end offsets relative to editor, more reliable than Range object
  const savedRangeRef = useRef(null);

  // ── execCommand helper ────────────────────────────────────────────────────
  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    syncContent();
    updateActiveFormats();
  }, []); // eslint-disable-line

  const syncContent = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const updateActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {}
  }, []);

  // ── Save / Restore cursor range ───────────────────────────────────────────
  const saveRange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      // Clone so it stays valid after blur
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);



  // ── Font handlers ─────────────────────────────────────────────────────────
  const handleFontFamily = (family) => { setFontFamily(family); exec('fontName', family); };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      try {
        range.surroundContents(span);
        syncContent();
      } catch {
        exec('fontSize', '3');
      }
    }
  };

  // ── Color handlers ────────────────────────────────────────────────────────
  const handleTextColor = (color) => exec('foreColor', color);
  const handleBgColor = (color) => exec('hiliteColor', color === 'transparent' ? 'transparent' : color);

  // ── Link dialog ───────────────────────────────────────────────────────────
  const handleLink = () => {
    saveRange();
    setLinkText(window.getSelection()?.toString() || '');
    setLinkUrl('');
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const anchor = document.createElement('a');
    anchor.href = linkUrl;
    anchor.target = '_blank';
    anchor.style.color = '#2563eb';
    anchor.textContent = linkText || linkUrl;

    if (savedRangeRef.current) {
      try {
        const range = savedRangeRef.current;
        if (editor.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          range.insertNode(anchor);
          range.setStartAfter(anchor);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          editor.focus();
          syncContent();
          setShowLinkDialog(false);
          return;
        }
      } catch {}
    }
    // Fallback: append link at end
    editor.appendChild(anchor);
    editor.focus();
    syncContent();
    setShowLinkDialog(false);
  };

  // ── Image: read file → base64 → insert <img> directly into DOM ──────────
  // We avoid execCommand/insertHTML entirely because it requires an active
  // focused selection, which is lost the moment the OS file picker opens.
  // Instead we insert a real DOM node at the saved range, or append to end.
  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.createElement('img');
      img.src = ev.target.result;
      img.alt = file.name;
      img.style.cssText = 'max-width:100%;height:auto;border-radius:4px;margin:6px 0;display:block;';

      const editor = editorRef.current;
      if (!editor) return;

      // Try to insert at saved cursor position
      let inserted = false;
      if (savedRangeRef.current) {
        try {
          const range = savedRangeRef.current;
          // Make sure range is still within our editor
          if (editor.contains(range.commonAncestorContainer)) {
            range.deleteContents();
            range.insertNode(img);
            // Move cursor after the image
            range.setStartAfter(img);
            range.collapse(true);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            inserted = true;
          }
        } catch {
          // range is stale, fall through to append
        }
      }

      if (!inserted) {
        // Fallback: append image at end of editor
        editor.appendChild(img);
        // Move cursor after image
        const range = document.createRange();
        range.setStartAfter(img);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }

      editor.focus();
      syncContent();
      onAddImage?.({ name: file.name, type: 'image' });
    };
    reader.onerror = () => console.error('Failed to read image file');
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  // ── PDF: track as attachment chip only (can't embed PDF in email body) ────
  const handlePDFFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onAddPDF?.({ name: file.name, file, type: 'pdf' });
    e.target.value = '';
  };

  // ── Sync external value (e.g. AI fill, template load) ────────────────────
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', background: '#fff', overflow: 'visible' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px',
        padding: '5px 7px', borderBottom: '1px solid #ebebeb',
        background: '#f8f9fa', borderRadius: '8px 8px 0 0',
      }}>
        {/* Font family */}
        <select value={fontFamily}
          onChange={e => handleFontFamily(e.target.value)}
          onMouseDown={e => e.stopPropagation()}
          style={{ height: '26px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', color: '#374151', fontSize: '11px', padding: '0 3px', width: '104px' }}>
          {FONT_FAMILIES.map(f => <option key={f}>{f}</option>)}
        </select>

        {/* Font size */}
        <select value={fontSize}
          onChange={e => handleFontSizeChange(e.target.value)}
          onMouseDown={e => e.stopPropagation()}
          style={{ height: '26px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', color: '#374151', fontSize: '11px', padding: '0 3px', width: '58px' }}>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <ToolbarSep />

        <ToolbarButton title="Bold" onClick={() => exec('bold')} active={activeFormats.bold}><Bold size={12} /></ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => exec('italic')} active={activeFormats.italic}><Italic size={12} /></ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => exec('underline')} active={activeFormats.underline}><Underline size={12} /></ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => exec('strikeThrough')} active={activeFormats.strikeThrough}><Strikethrough size={12} /></ToolbarButton>

        <ToolbarSep />

        <ColorPicker colors={TEXT_COLORS} onSelect={handleTextColor} title="Text Color">
          <Type size={12} />
        </ColorPicker>
        <ColorPicker colors={BG_COLORS} onSelect={handleBgColor} title="Highlight Color">
          <Palette size={12} />
        </ColorPicker>

        <ToolbarSep />

        <ToolbarButton title="Align Left" onClick={() => exec('justifyLeft')} active={activeFormats.justifyLeft}><AlignLeft size={12} /></ToolbarButton>
        <ToolbarButton title="Align Center" onClick={() => exec('justifyCenter')} active={activeFormats.justifyCenter}><AlignCenter size={12} /></ToolbarButton>
        <ToolbarButton title="Align Right" onClick={() => exec('justifyRight')} active={activeFormats.justifyRight}><AlignRight size={12} /></ToolbarButton>
        <ToolbarButton title="Justify" onClick={() => exec('justifyFull')} active={activeFormats.justifyFull}><AlignJustify size={12} /></ToolbarButton>

        <ToolbarSep />

        <ToolbarButton title="Bullet List" onClick={() => exec('insertUnorderedList')} active={activeFormats.insertUnorderedList}><List size={12} /></ToolbarButton>
        <ToolbarButton title="Numbered List" onClick={() => exec('insertOrderedList')} active={activeFormats.insertOrderedList}><ListOrdered size={12} /></ToolbarButton>

        <ToolbarSep />

        <ToolbarButton title="Insert Divider" onClick={() => exec('insertHorizontalRule')}><Minus size={12} /></ToolbarButton>
        <ToolbarButton title="Undo" onClick={() => exec('undo')}><RotateCcw size={12} /></ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => exec('redo')}><RotateCw size={12} /></ToolbarButton>

        <ToolbarSep />

        {/* Link */}
        <ToolbarButton title="Insert Link" onClick={handleLink}><Link2 size={12} /></ToolbarButton>

        {/* Image — onMouseDown saves range synchronously before OS picker opens */}
        <button
          type="button"
          title="Insert Image"
          onMouseDown={(e) => {
            e.preventDefault(); // keeps editor focus & selection alive
            saveRange();        // capture cursor now, synchronously
          }}
          onClick={() => imgInputRef.current?.click()}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '26px', border: 'none', borderRadius: '4px',
            background: 'transparent', color: '#374151', cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Image size={12} />
        </button>

        {/* PDF attachment */}
        <button
          type="button"
          title="Attach PDF File"
          onClick={() => pdfInputRef.current?.click()}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '26px', border: 'none', borderRadius: '4px',
            background: 'transparent', color: '#374151', cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Paperclip size={12} />
        </button>

        {/* Hidden file inputs */}
        <input
          ref={imgInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleImageFile}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={handlePDFFile}
        />
      </div>

      {/* ── Link dialog ── */}
      {showLinkDialog && (
        <div style={{
          background: '#f0f6ff', borderBottom: '1px solid #e0eaff',
          padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Insert Link</span>
          <input
            placeholder="Display text"
            value={linkText}
            onChange={e => setLinkText(e.target.value)}
            style={{ flex: '1', minWidth: '90px', height: '28px', border: '1px solid #d1d5db', borderRadius: '5px', padding: '0 7px', fontSize: '12px' }}
          />
          <input
            placeholder="https://..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertLink()}
            style={{ flex: '2', minWidth: '130px', height: '28px', border: '1px solid #d1d5db', borderRadius: '5px', padding: '0 7px', fontSize: '12px' }}
          />
          <button type="button" onClick={insertLink}
            style={{ height: '28px', padding: '0 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>
            Insert
          </button>
          <button type="button" onClick={() => setShowLinkDialog(false)}
            style={{ height: '28px', padding: '0 8px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      )}

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={updateActiveFormats}
        onBlur={saveRange}   // ← save range when editor loses focus (before file picker)
        data-placeholder="Email body..."
        style={{
          minHeight: '140px',
          padding: '10px 12px',
          outline: 'none',
          fontSize: fontSize,
          fontFamily: fontFamily,
          lineHeight: 1.65,
          color: '#1f2937',
          borderRadius: attachments.length > 0 ? '0' : '0 0 8px 8px',
        }}
      />

      {/* ── Attachment chips ── */}
      {attachments.length > 0 && (
        <div style={{
          borderTop: '1px solid #f3f4f6',
          padding: '6px 10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
          alignItems: 'center',
          background: '#fafafa',
          borderRadius: '0 0 8px 8px',
        }}>
          <span style={{ fontSize: '10px', color: '#9ca3af', marginRight: '2px' }}>Attachments:</span>
          {attachments.map((a, i) => (
            <AttachmentChip
              key={`${a.name}-${i}`}
              name={a.name}
              type={a.type}
              onRemove={() => onRemoveAttachment(i)}
            />
          ))}
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        [contenteditable] img { max-width: 100%; display: block; }
        [contenteditable] a { color: #2563eb; }
        [contenteditable] hr { border: none; border-top: 1px solid #e5e7eb; margin: 10px 0; }
      `}</style>
    </div>
  );
}

 