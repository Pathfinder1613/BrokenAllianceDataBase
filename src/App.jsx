import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import LeaderPage from './pages/Leaders';
import ConstructsPage from './pages/Constructs';
import AllInOne from './pages/AllInOne';
import AdminPage from './pages/Login.jsx'
import DetailViewer from './pages/DetailViewer.jsx';
import FullLeaderPage from './pages/LeaderDetail.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path='/leaders' element={<LeaderPage/>} />
        <Route path="/leaders/:id" element={<FullLeaderPage />} />

        <Route path='/constructs' element={<ConstructsPage/>} />
        <Route path='/aio' element={<AllInOne/>}/>
        <Route path='/detail-viewer' element={<DetailViewer/>}/>
        <Route path='/AdminPage' element={<AdminPage/>}/>
      </Routes>
    </>
  )
}

export default App
