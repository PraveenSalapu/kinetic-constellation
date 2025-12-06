import { useState } from 'react';
import { ResumeProvider } from './context/ResumeContext';
import { Layout } from './components/Layout';
// import { OnboardingFlow } from './components/Onboarding/OnboardingFlow'; // Replaced by Roaster
import { HeroRoaster } from './components/Landing/HeroRoaster';

function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  return (
    <ResumeProvider>
      {!onboardingComplete ? (
        <HeroRoaster onComplete={() => setOnboardingComplete(true)} />
      ) : (
        <Layout />
      )}
    </ResumeProvider>
  );
}

export default App;
