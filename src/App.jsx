import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import LeaderPage from './pages/Leader';
import UnitsBuildingPage from './pages/units'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path='/Leader' element={<LeaderPage />} />
      <Route path='/unitsAndBuilding' element={<UnitsBuildingPage />} />
      

    </Routes>
      
    </>
  )
}

export default App
