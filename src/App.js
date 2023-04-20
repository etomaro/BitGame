import './App.css';
import React, { useState, useEffect } from 'react';
import { QandA } from './components/QandA';
import { Header } from './components/Header';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <body className="App-body">
          <Routes>
            <Route path="/" element={<QandA />} />
          </Routes>
        </body>
      </div>
    </AuthProvider>
  );
}

export default App;
