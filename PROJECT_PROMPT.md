# Bissy Teleprompter - Complete Build Prompt

Build a professional React-based teleprompter application with the following specifications:

## Overview
Create a single-page teleprompter application with two main panels: an Editor Panel (left) and a Teleprompter Display Panel (right). The app should provide a complete script management system with rich text editing, smooth auto-scrolling, and file handling capabilities.

## Technology Stack
- React 18+ with Vite
- Pure CSS (no external UI libraries)
- Local storage for persistence
- Modern ES6+ JavaScript

## Core Features

### 1. Editor Panel (Left Side)

#### Rich Text Editor
- Implement a contentEditable-based rich text editor
- Support the following formatting controls in a toolbar:
  - **Font Family Dropdown**: Arial, Times New Roman, Verdana, Georgia, Courier New
  - **Font Size Dropdown**: 16px to 120px (16, 20, 24, 28, 32, 40, 48, 60, 72, 80, 96, 120)
  - **Bold Button**: Apply bold formatting (Ctrl+B keyboard shortcut)
  - **Underline Button**: Apply underline formatting (Ctrl+U keyboard shortcut)
  - **Insert Pause Button**: Insert a `[PAUSE Xs]` marker that prompts user for duration in seconds
- All formatting should apply to selected/highlighted text
- Changes should sync live to the teleprompter display

#### File Management Toolbar
Create a separate section in the toolbar with these buttons:
- **📄 New**: Clear current script (with confirmation dialog)
- **📂 Open**: Upload a .txt file from the user's computer
- **💾 Save**: Download current script as a .txt file
- **🗑 Clear**: Clear the script (with confirmation dialog)

#### File Operations Details
- **Upload (.txt files)**:
  - Accept only .txt files
  - Convert plain text to HTML with consistent Arial 24px formatting
  - Preserve line breaks and blank lines from the source file
  - Each line should be wrapped in a `<div>` with inline styles

- **Save (.txt files)**:
  - Convert HTML content back to plain text
  - Preserve all line breaks and blank lines exactly as displayed
  - Remove pause markers from saved text
  - Generate filename with timestamp: `teleprompter-script_YYYY-MM-DD_HH-MM-SS.txt`
  - Clean up trailing whitespace on each line

### 2. Teleprompter Display Panel (Right Side)

#### Visual Design
- Dark background (#1a1a1a) with light text (#f0f0f0) for high contrast
- Display formatted script with all styling preserved
- Center reading line indicator (horizontal line, yellow/gold color with glow effect)
- Hide scrollbars but maintain scroll functionality
- Generous padding (50vh top/bottom) to center initial text

#### Auto-Scroll Functionality
- Use `requestAnimationFrame` for smooth 60fps scrolling
- Calculate scroll based on time delta, not frame count
- Speed measured in pixels per second (10-200 range, default: 60)
- Maintain scroll position reference for accurate jumping

#### Pause Marker System
- Detect when `[PAUSE Xs]` markers reach the center reading line
- Automatically pause scrolling for the specified duration
- Display countdown overlay showing remaining pause time
- Auto-resume scrolling after pause duration completes
- Track current pause marker to prevent duplicate triggers

#### Transport Controls (Bottom Bar)
- **Play/Pause Button**: Toggle scrolling (shows current state)
- **Speed Slider**: Adjust scroll speed from 10-200 px/s with live label
- **Reset Button**: Stop scrolling and return to beginning

### 3. Keyboard Shortcuts

Implement the following keyboard shortcuts (only when NOT focused in the editor):
- **Spacebar**: Play/Pause scrolling
- **Arrow Up**: Increase scroll speed by 10 px/s (max 200)
- **Arrow Down**: Decrease scroll speed by 10 px/s (min 10)
- **Arrow Left**: Jump backward 5 lines (~120 pixels)
- **Arrow Right**: Jump forward 5 lines (~120 pixels)
- **Escape**: Stop and reset to beginning

Important: Keyboard shortcuts should NOT trigger when the user is typing in the contentEditable editor.

### 4. Data Persistence

- Use `localStorage` to save script content automatically
- Save on every content change
- Load saved content on app initialization
- Provide default welcome text for first-time users

### 5. UI/UX Requirements

#### Layout
- Two-panel split layout (50/50 by default)
- Resizable panels (editor panel can be resized horizontally)
- Responsive design that stacks vertically on smaller screens
- Minimum panel widths to prevent collapse

#### Header
- Gradient purple header with app title
- Display keyboard shortcuts for user reference
- Format: `Shortcuts: Space Play/Pause | ↑↓ Speed | ←→ Jump 5 Lines | Esc Reset`

#### Styling Guidelines
- Clean, minimal interface
- Professional color scheme (purple gradient header, neutral editor, dark teleprompter)
- Smooth transitions and hover effects on buttons
- Clear visual hierarchy in toolbars
- Use emoji icons for file management buttons

## Technical Implementation Details

### State Management
- Manage the following state:
  - `content`: HTML string of the script
  - `isPlaying`: Boolean for play/pause state
  - `isPaused`: Boolean for pause marker pause state
  - `speed`: Number for scroll speed
  - `pauseTimeRemaining`: Number for pause countdown

### Scroll Implementation
- Use refs for scroll position tracking (not state)
- Implement smooth scrolling with `requestAnimationFrame`
- Calculate delta time between frames for consistent speed
- Update `scrollTop` property directly on the display container

### HTML Processing
- Editor generates HTML with inline styles for formatting
- Process block elements (`<div>`, `<p>`) as separate lines when saving
- Handle `<br>` tags as empty lines
- Recursively process nested elements while preserving structure

### Pause Marker Implementation
- Pause markers as non-editable inline spans with class `pause-marker`
- Store duration in `data-pause` attribute
- Visual styling: subtle background color, border, and distinct appearance
- Check marker position relative to reading line during scroll

## File Structure
```
src/
├── App.jsx                          # Main app container
├── App.css                          # App layout and header styles
├── components/
│   ├── EditorPanel.jsx              # Rich text editor component
│   ├── EditorPanel.css              # Editor styling
│   ├── TeleprompterDisplay.jsx      # Display and scroll logic
│   └── TeleprompterDisplay.css      # Display styling
├── index.css                        # Global styles
└── main.jsx                         # React entry point
```

## Key Implementation Considerations

1. **Keyboard Event Handling**: Check if `e.target.getAttribute('contenteditable') === 'true'` to prevent shortcuts in editor

2. **Line Break Preservation**: Process each `<div>` as a line and join with `\n` characters

3. **Animation Frame Management**: Properly cleanup animation frames on unmount and state changes

4. **Pause Marker Detection**: Use `getBoundingClientRect()` to detect when markers cross the reading line

5. **Timestamp Generation**: Format dates as `YYYY-MM-DD_HH-MM-SS` with zero-padding

6. **State Updates in Callbacks**: Use functional updates when setting state from refs or closures

## Testing Checklist

- [ ] Editor formatting applies to selected text
- [ ] Bold and underline keyboard shortcuts work
- [ ] Pause markers can be inserted and display correctly
- [ ] Text file upload loads with proper formatting
- [ ] Saved .txt files preserve line breaks and blank lines
- [ ] Saved files have timestamped filenames
- [ ] Spacebar toggles play/pause
- [ ] Arrow keys adjust speed and jump lines
- [ ] Pause markers trigger automatic pauses
- [ ] Countdown displays during pauses
- [ ] Script persists in localStorage
- [ ] Panels are resizable
- [ ] Responsive design works on smaller screens

## Expected User Experience

1. User opens app and sees welcome message
2. User can type or paste script in editor
3. User can format text with toolbar controls
4. User can insert pause markers at specific points
5. User can save/load scripts as .txt files
6. User clicks Play or presses Spacebar to start scrolling
7. Script scrolls smoothly at adjustable speed
8. Scrolling automatically pauses at markers with countdown
9. User can jump forward/backward with arrow keys
10. User can adjust speed in real-time
11. Script content persists between sessions

## Success Criteria

The application should:
- Provide smooth 60fps scrolling using requestAnimationFrame
- Handle scripts of any length without performance issues
- Accurately preserve formatting when saving/loading
- Respond instantly to all keyboard shortcuts
- Provide clear visual feedback for all actions
- Maintain scroll position accuracy when jumping
- Never lose user content (localStorage backup)
- Work across modern browsers (Chrome, Firefox, Safari, Edge)

This application should feel professional, responsive, and purpose-built for teleprompter use cases such as presentations, video recording, and public speaking.
