// Product Tour Component
// Interactive guided tour for first-time users using react-joyride

import { useState, useEffect, useCallback } from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import type { CallBackProps } from 'react-joyride';
import { tourSteps, tourStyles } from './tourSteps';

interface ProductTourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onNavigateToEditor?: () => void;
}

export function ProductTour({ run, onComplete, onSkip, onNavigateToEditor }: ProductTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Start the tour when run prop changes
  useEffect(() => {
    if (run && !isRunning) {
      // Small delay to let UI settle
      setTimeout(() => setIsRunning(true), 300);
    }
  }, [run, isRunning]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;

    // Handle tour completion
    if (status === STATUS.FINISHED) {
      setIsRunning(false);
      onComplete();
      return;
    }

    // Handle skip
    if (status === STATUS.SKIPPED || action === ACTIONS.SKIP) {
      setIsRunning(false);
      onSkip();
      return;
    }

    // Handle close button
    if (action === ACTIONS.CLOSE) {
      setIsRunning(false);
      onSkip();
      return;
    }

    // Handle step navigation
    if (type === EVENTS.STEP_AFTER) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      // Step 6 (last step) is the tailor button - need to be on editor page
      // Steps 0-5 are sidebar items - visible from any page
      if (nextIndex === 6 && onNavigateToEditor) {
        // Navigate to editor first, then continue tour
        onNavigateToEditor();
        // Small delay to let editor render
        setTimeout(() => setStepIndex(nextIndex), 100);
      } else {
        setStepIndex(nextIndex);
      }
    }
  }, [onComplete, onSkip, onNavigateToEditor]);

  if (!isRunning) return null;

  return (
    <Joyride
      steps={tourSteps}
      stepIndex={stepIndex}
      run={isRunning}
      continuous
      showProgress
      showSkipButton
      hideCloseButton={false}
      scrollToFirstStep
      spotlightClicks={false}
      disableOverlayClose
      callback={handleJoyrideCallback}
      styles={tourStyles}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Got it!',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}

export default ProductTour;
