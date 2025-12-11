import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { AuthPage } from './components/Auth/AuthPage';
import { HeroRoaster } from './components/Landing/HeroRoaster';
import { ScanResults } from './components/Landing/ScanResults';
import { DemographicsStep } from './components/Onboarding/DemographicsStep';
import { useState } from 'react';

// Protected route wrapper
// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Main app content after auth
function AppContent() {
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });
  const [view, setView] = useState<'roaster' | 'results' | 'demographics' | 'editor'>('roaster');

  const handleFinalComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setOnboardingComplete(true);
  };

  const handleSkipToEditor = () => {
    handleFinalComplete();
  };

  if (onboardingComplete) {
    return <Layout />;
  }

  return (
    <>
      {view === 'roaster' && (
        <HeroRoaster
          onScanComplete={() => setView('results')}
          onProfileSelect={handleSkipToEditor}
        />
      )}
      {view === 'results' && (
        <ScanResults onComplete={() => setView('demographics')} />
      )}
      {view === 'demographics' && (
        <DemographicsStep onComplete={handleFinalComplete} />
      )}
    </>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <AuthPage initialMode="login" />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <AuthPage initialMode="register" />
        }
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ResumeProvider>
              <AppContent />
            </ResumeProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
