import './App.css';
import React, { useState, useEffect } from 'react';
import { QandA } from './components/QandA';
import { Header } from './components/Header';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
      </header>
      <body className="App-body">
        <QandA />
      </body>
    </div>
  );
}

export default App;
