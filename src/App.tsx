import { useState } from 'react';
import { ResumeProvider } from './context/ResumeContext';
import { Layout } from './components/Layout';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';

function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  return (
    <ResumeProvider>
      {!onboardingComplete ? (
        <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />
      ) : (
        <Layout />
      )}
    </ResumeProvider>
  );
}

export default App;
