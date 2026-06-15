import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import LeaderPage from './pages/Leaders';
import ConstructsPage from './pages/Constructs';
import AllInOne from './pages/AllInOne';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path='/leaders' element={<LeaderPage/>} />
        <Route path='/constructs' element={<ConstructsPage/>} />
        <Route path='/aio' element={<AllInOne/>}/>
      </Routes>
    </>
  )
}

export default App
