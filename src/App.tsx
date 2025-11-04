import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import HallsPage from './pages/venues/HallsPage';
import NightclubPage from './pages/venues/NightclubPage';
import LoungePage from './pages/venues/LoungePage';
import OfficesPage from './pages/venues/OfficesPage';
import FieldsPage from './pages/venues/FieldsPage';
import HallBooking from './pages/booking/hall/HallBooking';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfilePage from './pages/user/ProfilePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthProvider from './contexts/AuthContext';
import ThemeProvider from './contexts/ThemeContext';
import PaymentCallback from './pages/payment/hall/paymentCallBack';
import PaymentSuccess from './pages/payment/hall/PaymentSuccess';
import PaymentFailure from './pages/payment/hall/PaymentFailure';
import AuthModal from './components/ui/AuthModal';

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              {/* Auth routes without navbar/footer */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Payment routes without navbar/footer */}
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailure />} />

              {/* Login + Signup routes */}
              <Route
                path="/login"
                element={
                  <>
                    <Navbar />
                    <main><HomePage /></main>
                    <Footer />
                    <AuthModal
                      isOpen={true}
                      onClose={() => setAuthOpen(false)}
                      mode="login"
                      onModeChange={setAuthMode}
                    />
                  </>
                }
              />
              <Route
                path="/signup"
                element={
                  <>
                    <Navbar />
                    <main><HomePage /></main>
                    <Footer />
                    <AuthModal
                      isOpen={true}
                      onClose={() => setAuthOpen(false)}
                      mode="signup"
                      onModeChange={setAuthMode}
                    />
                  </>
                }
              />

              {/* Main routes with navbar/footer */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <main><HomePage /></main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/halls"
                element={
                  <>
                    <Navbar />
                    <main><HallsPage /></main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/nightclub"
                element={
                  <>
                    <Navbar />
                    <main><NightclubPage /></main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/lounge"
                element={
                  <>
                    <Navbar />
                    <main><LoungePage /></main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/offices"
                element={
                  <>
                    <Navbar />
                    <main><OfficesPage /></main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/fields"
                element={
                  <>
                    <Navbar />
                    <main><FieldsPage /></main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/book/halls/:hallId"
                element={
                  <>
                    <Navbar />
                    <main><HallBooking /></main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/profile"
                element={
                  <>
                    <Navbar />
                    <main><ProfilePage /></main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <>
                    <Navbar />
                    <main><AdminDashboard /></main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;