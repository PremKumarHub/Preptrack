import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Tracks from './pages/Tracks'
import Questions from './pages/Questions'
import AIInterview from './pages/AIInterview'
import CompanyPrep from './pages/CompanyPrep'
import CompanyDetail from './pages/CompanyDetail'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/ai-interview" element={<AIInterview />} />
            <Route path="/company-prep" element={<CompanyPrep />} />
            <Route path="/company-prep/:companyId" element={<CompanyDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
