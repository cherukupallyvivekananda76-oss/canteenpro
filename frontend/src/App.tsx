import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CollegeCodeEntryPage from './pages/CollegeCodeEntryPage';
import CanteenPreorderPage from './pages/CanteenPreorderPage';
import MessPreorderPage from './pages/MessPreorderPage';
import ScannerPage from './pages/ScannerPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminScannersPage from './pages/admin/AdminScannersPage';
import AdminMessPage from './pages/admin/AdminMessPage';
import AdminMessOrdersPage from './pages/admin/AdminMessOrdersPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Student routes */}
        <Route path="/" element={<CollegeCodeEntryPage />} />
        <Route path="/:collegeCode" element={<CanteenPreorderPage />} />
        <Route path="/:collegeCode/mess" element={<MessPreorderPage />} />
        <Route path="/scanner" element={<ScannerPage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/menu" element={<AdminMenuPage />} />
            <Route path="/admin/mess" element={<AdminMessPage />} />
            <Route path="/admin/mess-orders" element={<AdminMessOrdersPage />} />
            <Route path="/admin/scanners" element={<AdminScannersPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
