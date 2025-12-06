import { useState, useEffect } from 'react';
import EditorPanel from './components/EditorPanel';
import TeleprompterDisplay from './components/TeleprompterDisplay';
import './App.css';

const STORAGE_KEY = 'teleprompter-content';

function App() {
  // Initialize state with lazy initialization to avoid setState in useEffect
  const [content, setContent] = useState(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      return savedContent;
    }
    // Default sample content
    return `<div style="font-size: 24px; font-family: Arial;">Welcome to Bissy Teleprompter!</div>
<div style="font-size: 24px; font-family: Arial;"><br></div>
<div style="font-size: 24px; font-family: Arial;">Start typing or paste your script in the editor panel on the left.</div>
<div style="font-size: 24px; font-family: Arial;"><br></div>
<div style="font-size: 24px; font-family: Arial;">Use the formatting tools to customize your text, and insert pause markers where needed.</div>
<div style="font-size: 24px; font-family: Arial;"><br></div>
<div style="font-size: 24px; font-family: Arial;">Press the Play button or Spacebar to start scrolling!</div>`;
  });

  // Save content to localStorage whenever it changes
  useEffect(() => {
    if (content) {
      try {
        localStorage.setItem(STORAGE_KEY, content);
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('Storage quota exceeded');
          alert('Script is too large to save automatically. Please use the Save button to download your script.');
        } else {
          console.error('Error saving to localStorage:', e);
        }
      }
    }
  }, [content]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bissy Teleprompter</h1>
        <div className="shortcuts-info">
          Shortcuts: <kbd>Space</kbd> Play/Pause | <kbd>↑↓</kbd> Speed | <kbd>←→</kbd> Jump 5 Lines | <kbd>Esc</kbd> Reset
        </div>
      </header>
      <div className="app-container">
        <div className="panel editor-side">
          <EditorPanel
            content={content}
            onContentChange={handleContentChange}
          />
        </div>
        <div className="panel display-side">
          <TeleprompterDisplay content={content} />
        </div>
      </div>
    </div>
  );
}

export default App;
