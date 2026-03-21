import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { SocketProvider } from './context/SocketContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { AuthProvider } from './context/AuthContext';

// Layout
import DashboardLayout from './components/Layout/DashboardLayout';
import PrivateRoute from './components/Layout/PrivateRoute';

// Pages
import Home from './pages/Home';
import CreateEmergency from './pages/CreateEmergency';
import SOS from './pages/SOS';
import AdminPanel from './pages/AdminPanel';
import Responders from './pages/Responders';
import Alerts from './pages/Alerts';
import MapTracking from './pages/MapTracking';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <EmergencyProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Home />} />
                  <Route path="create" element={<CreateEmergency />} />
                  <Route path="sos" element={<SOS />} />
                  <Route path="admin" element={<AdminPanel />} />
                  <Route path="responders" element={<Responders />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="map" element={<MapTracking />} />
                </Route>
              </Route>
            </Routes>
          </EmergencyProvider>
        </SocketProvider>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        theme="dark"
      />
    </Router>
  );
}

export default App;
