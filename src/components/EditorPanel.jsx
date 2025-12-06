import { useState, useRef, useEffect } from 'react';
import './EditorPanel.css';

const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Verdana',
  'Georgia',
  'Courier New'
];

const FONT_SIZES = [16, 20, 24, 28, 32, 40, 48, 60, 72, 80, 96, 120];

function EditorPanel({ content, onContentChange, onFormatChange }) {
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

      editorRef.current.innerHTML = content;

      if (range) {
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          // Range might be invalid after content change
        }
      }
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const insertPause = () => {
    const seconds = prompt('Enter pause duration in seconds:', '3');
    if (seconds && !isNaN(seconds) && parseFloat(seconds) > 0) {
      const pauseMarker = `<span class="pause-marker" contenteditable="false" data-pause="${seconds}">[PAUSE ${seconds}s]</span>&nbsp;`;
      document.execCommand('insertHTML', false, pauseMarker);
      handleInput();
    }
  };

  const handleKeyDown = (e) => {
    // Handle Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      applyFormat('bold');
    }
    // Handle Ctrl+U for underline
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      applyFormat('underline');
    }
  };

  const handleFontFamilyChange = (e) => {
    const family = e.target.value;
    setFontFamily(family);
    applyFormat('fontName', family);
    onFormatChange({ fontFamily: family });
  };

  const handleFontSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setFontSize(size);

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        range.surroundContents(span);
        handleInput();
      }
    }
    onFormatChange({ fontSize: size });
  };

  const handleNewScript = () => {
    if (confirm('Are you sure you want to clear the current script?')) {
      onContentChange('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please select a .txt file');
      return;
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };

    reader.onload = (event) => {
      const text = event.target.result;
      // Convert plain text to HTML with consistent Arial 24px formatting
      // IMPORTANT: Escape HTML to prevent XSS attacks
      const lines = text.split('\n');
      const formattedHTML = lines
        .map(line => `<div style="font-size: 24px; font-family: Arial;">${line ? escapeHtml(line) : '<br>'}</div>`)
        .join('');

      onContentChange(formattedHTML);
      if (editorRef.current) {
        editorRef.current.innerHTML = formattedHTML;
      }
    };

    reader.readAsText(file);

    // Reset file input so the same file can be loaded again
    e.target.value = '';
  };

  const handleSaveFile = () => {
    if (!editorRef.current) return;

    // Create a temporary container
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Remove all pause markers
    const pauseMarkers = tempDiv.querySelectorAll('.pause-marker');
    pauseMarkers.forEach(marker => marker.remove());

    const lines = [];

    // Recursively process all nodes
    const processNode = (node) => {
      // Text node - just return the text
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      // Element node
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        // Block-level elements create new lines
        if (tagName === 'div' || tagName === 'p') {
          let text = '';
          for (const child of node.childNodes) {
            text += processNode(child);
          }
          lines.push(text);
          return '';
        }

        // BR creates an empty line
        if (tagName === 'br') {
          lines.push('');
          return '';
        }

        // Inline elements - just process children
        let text = '';
        for (const child of node.childNodes) {
          text += processNode(child);
        }
        return text;
      }

      return '';
    };

    // Process all top-level children
    for (const child of tempDiv.childNodes) {
      processNode(child);
    }

    // Join with newlines
    let plainText = lines.join('\n');

    // Clean up trailing whitespace on each line
    plainText = plainText.split('\n').map(line => line.trimEnd()).join('\n');

    // Create timestamp for filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    const filename = `teleprompter-script_${timestamp}.txt`;

    // Create blob and download
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearScript = () => {
    if (confirm('Are you sure you want to clear the script?')) {
      onContentChange('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  };

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <div className="toolbar-group file-actions">
          <button onClick={handleNewScript} className="file-btn" title="New Script">
            📄 New
          </button>
          <button onClick={handleOpenFile} className="file-btn" title="Open .txt File">
            📂 Open
          </button>
          <button onClick={handleSaveFile} className="file-btn" title="Save as .txt File">
            💾 Save
          </button>
          <button onClick={handleClearScript} className="file-btn clear-btn" title="Clear Script">
            🗑 Clear
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <label>Font:</label>
          <select value={fontFamily} onChange={handleFontFamilyChange}>
            {FONT_FAMILIES.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <label>Size:</label>
          <select value={fontSize} onChange={handleFontSizeChange}>
            {FONT_SIZES.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => applyFormat('bold')}
            title="Bold (Ctrl+B)"
            className="format-btn"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => applyFormat('underline')}
            title="Underline (Ctrl+U)"
            className="format-btn"
          >
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={insertPause}
            className="pause-btn"
            title="Insert Pause Marker"
          >
            Insert Pause
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
        spellCheck="false"
      />
    </div>
  );
}

export default EditorPanel;
