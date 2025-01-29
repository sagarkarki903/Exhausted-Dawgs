import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './components/Home';
import Test from './components/test';

function App() {

  

  return (
    <Router>
      <Routes>
        <Route path = "/" element={<Home />} />
        <Route path = "/test" element={<Test />} />
      </Routes>
    </Router>
  )
}

export default App
