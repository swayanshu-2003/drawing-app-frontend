// src/App.js
import React from 'react';
import ToolBar from './components/toolbaar/ToolBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Draw from './components/Draw/Draw';
import LandingPage from './components/LandingPage/LandingPage';
import Invite from './components/invite/Invite';

function App() {





  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/:id' element={<Draw />} />
        <Route path='/invite' element={<Invite />} />
      </Routes>
    </Router>
  );
}

export default App;
