import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import Wallet from './pages/Wallet.js';
import Redeem from './pages/Redeem.js';
import Admin from './pages/Admin.js';
import VerifyLink from './pages/VerifyLink.js';
import NovaChart from './pages/NovaChart.js';
import DailyReward from './pages/DailyReward.js';
import Leaderboard from './pages/Leaderboard.js';
import CreatorCode from './pages/CreatorCode.js';
import LoginToken from './pages/LoginToken.js';
import Shell from './components/Shell.js';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/vuotlinkthanhcong/:token" element={<VerifyLink />} />
      <Route element={<Shell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/redeem" element={<Redeem />} />
        <Route path="/chart" element={<NovaChart />} />
        <Route path="/daily-reward" element={<DailyReward />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/creator-code" element={<CreatorCode />} />
        <Route path="/login-token" element={<LoginToken />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
