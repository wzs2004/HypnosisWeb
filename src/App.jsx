import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import EditorScreen from './screens/EditorScreen';
import PlayerScreen from './screens/PlayerScreen';
import SettingsScreen from './screens/SettingsScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [activeSessionId, setActiveSessionId] = useState(null);

  const navigateToEditor = (sessionId) => {
    setActiveSessionId(sessionId);
    setCurrentScreen('EDITOR');
  };

  if (currentScreen === 'PLAYER') {
    return <PlayerScreen sessionId={activeSessionId} onBack={() => setCurrentScreen('EDITOR')} />;
  }

  if (currentScreen === 'EDITOR') {
    return <EditorScreen sessionId={activeSessionId} onBack={() => setCurrentScreen('HOME')} onPlay={() => setCurrentScreen('PLAYER')} />;
  }

  if (currentScreen === 'SETTINGS') {
    return <SettingsScreen onBack={() => setCurrentScreen('HOME')} />;
  }

  return <HomeScreen onSelectSession={navigateToEditor} onSettings={() => setCurrentScreen('SETTINGS')} />;
}

export default App;