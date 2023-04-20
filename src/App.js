import './App.css';
import React, { useState, useEffect } from 'react';
import { QandA } from './components/QandA';
import { Header } from './components/Header';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
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
  );
}

export default App;
