import './App.css';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { QandA } from './components/QandA';
import { Othello } from './components/Othello';
import { Header } from './components/Header';
import { Profile } from './components/Profile';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AnonimasAnime } from './components/anonimas/anonimas';
import { Network } from './components/network';
import { Record } from './components/Record';
import { useMediaQuery, useTheme } from '@mui/material';



function App() {
  const [anime, setAnime] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // useEffect(() => {
  //   setTimeout(() => {
  //     setAnime(false);
  //   }, 2000);
  // }, []);

  return (
    <AuthProvider>
      {/* 画面初期時のアニメーション */}
      {/* anime = true かつ isMobile = true の時のみアニメーションを表示 */}
      {/* {anime && !isMobile && <AnonimasAnime />} */}
      {/* メインアプリ */}
      {/* mobile=trueの時か、anime=falseの時に表示  */}
        <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <body className="App-body">
          <Routes>
            <Route path="/" element={<QandA />} />
            <Route path={"/othello"} element={<Othello />} />
            <Route path={`/profile/`} element={<Profile />} />
            <Route path={`/network/`} element={<Network />} />
            <Route path={`/Record/`} element={<Record />} />
          </Routes>
        </body>
      </div>
    </AuthProvider>
  );
}

export default App;
