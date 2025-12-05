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

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
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
