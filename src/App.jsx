import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/Home';
import LeaderPage from './pages/Leaders';
import AllInOne from './pages/AllInOne';
import AdminPage from './pages/Login.jsx'
import DetailViewer from './pages/DetailViewer.jsx';
import FullLeaderPage from './pages/LeaderDetailPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/AdminPage" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/leaders' element={<LeaderPage />} />
        <Route path="/leaders/:id" element={<FullLeaderPage />} />
        <Route path='/aio' element={<AllInOne />} />
        <Route path='/detail-viewer' element={<DetailViewer />} />
        <Route path='/AdminPage' element={<AdminPage />} />
        <Route path='/admin' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export { ProtectedRoute };
export default App
