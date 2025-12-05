import { useState, useEffect } from 'react';
import EditorPanel from './components/EditorPanel';
import TeleprompterDisplay from './components/TeleprompterDisplay';
import './App.css';

const STORAGE_KEY = 'teleprompter-content';

function App() {
  const [content, setContent] = useState('');

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      setContent(savedContent);
    } else {
      // Default sample content
      setContent(`<div style="font-size: 24px; font-family: Arial;">Welcome to Bissy Teleprompter!</div>
<div style="font-size: 24px; font-family: Arial;"><br></div>
<div style="font-size: 24px; font-family: Arial;">Start typing or paste your script in the editor panel on the left.</div>
<div style="font-size: 24px; font-family: Arial;"><br></div>
<div style="font-size: 24px; font-family: Arial;">Use the formatting tools to customize your text, and insert pause markers where needed.</div>
<div style="font-size: 24px; font-family: Arial;"><br></div>
<div style="font-size: 24px; font-family: Arial;">Press the Play button or Spacebar to start scrolling!</div>`);
    }
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    if (content) {
      localStorage.setItem(STORAGE_KEY, content);
    }
  }, [content]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleFormatChange = (format) => {
    // This can be used to apply global formatting if needed
    console.log('Format changed:', format);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bissy Teleprompter</h1>
        <div className="shortcuts-info">
          Shortcuts: <kbd>Space</kbd> Play/Pause | <kbd>↑↓</kbd> Speed | <kbd>Esc</kbd> Reset
        </div>
      </header>
      <div className="app-container">
        <div className="panel editor-side">
          <EditorPanel
            content={content}
            onContentChange={handleContentChange}
            onFormatChange={handleFormatChange}
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
