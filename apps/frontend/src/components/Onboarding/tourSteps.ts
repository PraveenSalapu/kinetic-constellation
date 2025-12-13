// Product Tour Step Configuration
// 7-step guided tour for first-time users

import type { Step } from 'react-joyride';

export const tourSteps: Step[] = [
  {
    target: '[data-tour="sidebar"]',
    content: 'Welcome to CareerFlow! This is your command center. Let\'s take a quick tour of what you can do here.',
    title: 'Welcome to Your Dashboard',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-home"]',
    content: 'You can create multiple resume versions for different job types. Switch between them anytime from here or the Editor.',
    title: 'Your Resume Profiles',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-editor"]',
    content: 'This is where you craft your resume. Edit any section by clicking on it. Your changes save automatically.',
    title: 'The Resume Editor',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-jobs"]',
    content: 'Browse live job listings with AI-calculated match scores. See exactly which skills you\'re missing for each role, then click "Tailor" to optimize your resume.',
    title: 'Job Board with Match Scores',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-track"]',
    content: 'Every time you download a tailored resume, we\'ll ask if you applied. Track all your applications here to see your pipeline and conversion rates.',
    title: 'Track Your Applications',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-analytics"]',
    content: 'See your job search progress: response rates, interview conversions, and insights to improve your strategy.',
    title: 'Analytics Dashboard',
    placement: 'right',
  },
  {
    target: '[data-tour="tailor-button"]',
    content: 'This is your secret weapon! Paste any job description and our AI will suggest specific improvements. You\'re all set! Start by tailoring your resume for your dream job.',
    title: 'AI-Powered Tailoring',
    placement: 'bottom',
    spotlightClicks: false,
  },
];

// Joyride styling to match app theme (dark theme)
export const tourStyles = {
  options: {
    arrowColor: '#1f2937', // gray-800
    backgroundColor: '#1f2937',
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    primaryColor: '#3b82f6', // blue-500
    textColor: '#f3f4f6', // gray-100
    spotlightShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
    zIndex: 10000,
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    padding: '8px 16px',
  },
  buttonBack: {
    color: '#9ca3af', // gray-400
    fontSize: '14px',
  },
  buttonSkip: {
    color: '#6b7280', // gray-500
    fontSize: '13px',
  },
  buttonClose: {
    color: '#9ca3af',
  },
  tooltip: {
    borderRadius: '8px',
    padding: '16px',
  },
  tooltipTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  tooltipContent: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  spotlight: {
    borderRadius: '8px',
  },
};
