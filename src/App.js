import './App.css';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { QandA } from './components/QandA';
import { Header } from './components/Header';
import { Profile } from './components/Profile';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AnonimasAnime } from './components/anonimas/anonimas';
import { Network } from './components/network';
import { Record } from './components/Record';

function App() {
  const [anime, setAnime] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAnime(false);
    }, 2000);
  }, []);

  return (
    <AuthProvider>
      {/* 画面初期時のアニメーション */}
      {anime && <AnonimasAnime />}
      {/* メインアプリ */}
      {!anime && 
        <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <body className="App-body">
          <Routes>
            <Route path="/" element={<QandA />} />
            <Route path={`/profile/`} element={<Profile />} />
            <Route path={`/network/`} element={<Network />} />
            <Route path={`/Record/`} element={<Record />} />
          </Routes>
        </body>
      </div>
      }
    </AuthProvider>
  );
}

export default App;
