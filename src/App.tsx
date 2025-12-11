import { useState } from 'react';
import { ResumeProvider } from './context/ResumeContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
// import { OnboardingFlow } from './components/Onboarding/OnboardingFlow'; // Replaced by Roaster
import { HeroRoaster } from './components/Landing/HeroRoaster';
import { DemographicsStep } from './components/Onboarding/DemographicsStep';
import { ScanResults } from './components/Landing/ScanResults';


function App() {
  const [view, setView] = useState<'roaster' | 'results' | 'demographics' | 'editor'>('roaster');

  return (
    <ToastProvider>
      <ResumeProvider>
        {view === 'roaster' && (
          <HeroRoaster onComplete={() => setView('results')} />
        )}
        {view === 'results' && (
          <ScanResults onComplete={() => setView('demographics')} />
        )}
        {view === 'demographics' && (
          <DemographicsStep onComplete={() => setView('editor')} />
        )}
        {view === 'editor' && (
          <Layout />
        )}
      </ResumeProvider>
    </ToastProvider>
  );
}

export default App;
