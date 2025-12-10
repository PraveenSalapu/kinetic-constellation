// Job Page Detection Module
// Detects if the current page is a job application page

export interface DetectionResult {
  isJobPage: boolean;
  confidence: number; // 0-100
  platform: string | null;
  signals: string[];
}

// Platform-specific URL patterns
const URL_PATTERNS: { pattern: RegExp; platform: string; weight: number }[] = [
  { pattern: /linkedin\.com\/jobs\/view/i, platform: 'linkedin', weight: 40 },
  { pattern: /linkedin\.com\/jobs\/.*apply/i, platform: 'linkedin', weight: 50 },
  { pattern: /indeed\.com\/viewjob/i, platform: 'indeed', weight: 40 },
  { pattern: /indeed\.com\/.*apply/i, platform: 'indeed', weight: 50 },
  { pattern: /greenhouse\.io\/.*\/jobs/i, platform: 'greenhouse', weight: 40 },
  { pattern: /boards\.greenhouse\.io/i, platform: 'greenhouse', weight: 45 },
  { pattern: /lever\.co\/.*\/apply/i, platform: 'lever', weight: 50 },
  { pattern: /jobs\.lever\.co/i, platform: 'lever', weight: 40 },
  { pattern: /workday\.com\/.*\/job/i, platform: 'workday', weight: 40 },
  { pattern: /myworkdayjobs\.com/i, platform: 'workday', weight: 45 },
  { pattern: /icims\.com\/jobs/i, platform: 'icims', weight: 40 },
  { pattern: /jobvite\.com\/.*\/job/i, platform: 'jobvite', weight: 40 },
  { pattern: /smartrecruiters\.com\/.*\/job/i, platform: 'smartrecruiters', weight: 40 },
  { pattern: /breezy\.hr\/p\//i, platform: 'breezy', weight: 40 },
  { pattern: /ashbyhq\.com\/.*\/application/i, platform: 'ashby', weight: 45 },
  // Generic patterns
  { pattern: /\/careers?\//i, platform: 'generic', weight: 15 },
  { pattern: /\/jobs?\//i, platform: 'generic', weight: 15 },
  { pattern: /\/apply/i, platform: 'generic', weight: 20 },
  { pattern: /\/position/i, platform: 'generic', weight: 15 },
  { pattern: /\/opening/i, platform: 'generic', weight: 15 },
];

// Keywords to look for in page content
const PAGE_KEYWORDS = [
  { term: 'apply now', weight: 15 },
  { term: 'apply for this job', weight: 20 },
  { term: 'submit application', weight: 20 },
  { term: 'job description', weight: 10 },
  { term: 'responsibilities', weight: 8 },
  { term: 'qualifications', weight: 8 },
  { term: 'requirements', weight: 8 },
  { term: 'experience required', weight: 10 },
  { term: 'years of experience', weight: 8 },
  { term: 'upload resume', weight: 25 },
  { term: 'upload cv', weight: 25 },
  { term: 'attach resume', weight: 25 },
];

// Form element patterns that suggest job application
const FORM_SELECTORS = [
  { selector: 'input[name*="name" i]', weight: 5 },
  { selector: 'input[name*="email" i]', weight: 5 },
  { selector: 'input[name*="phone" i]', weight: 5 },
  { selector: 'input[type="file"][accept*="pdf"]', weight: 20 },
  { selector: 'input[type="file"][accept*=".doc"]', weight: 20 },
  { selector: 'textarea[name*="cover" i]', weight: 15 },
  { selector: 'input[name*="linkedin" i]', weight: 10 },
  { selector: 'input[name*="resume" i]', weight: 15 },
  { selector: 'button:contains("Apply")', weight: 15 },
  { selector: 'button:contains("Submit")', weight: 10 },
  { selector: 'form[action*="apply" i]', weight: 20 },
  { selector: 'form[id*="application" i]', weight: 20 },
];

export function detectJobPage(): DetectionResult {
  const signals: string[] = [];
  let confidence = 0;
  let detectedPlatform: string | null = null;

  const url = window.location.href;
  const pageText = document.body?.innerText?.toLowerCase() || '';

  // 1. Check URL patterns
  for (const { pattern, platform, weight } of URL_PATTERNS) {
    if (pattern.test(url)) {
      confidence += weight;
      signals.push(`URL matches ${platform} pattern`);
      if (!detectedPlatform || platform !== 'generic') {
        detectedPlatform = platform;
      }
    }
  }

  // 2. Check page keywords
  for (const { term, weight } of PAGE_KEYWORDS) {
    if (pageText.includes(term.toLowerCase())) {
      confidence += weight;
      signals.push(`Found keyword: "${term}"`);
    }
  }

  // 3. Check form elements
  for (const { selector, weight } of FORM_SELECTORS) {
    try {
      // Handle :contains pseudo-selector manually
      if (selector.includes(':contains')) {
        const [baseSelector, containsText] = selector.split(':contains');
        const text = containsText.replace(/[()\"]/g, '');
        const elements = document.querySelectorAll(baseSelector || 'button, input[type="submit"]');
        for (const el of elements) {
          if (el.textContent?.toLowerCase().includes(text.toLowerCase())) {
            confidence += weight;
            signals.push(`Found form element: ${selector}`);
            break;
          }
        }
      } else {
        if (document.querySelector(selector)) {
          confidence += weight;
          signals.push(`Found form element: ${selector}`);
        }
      }
    } catch {
      // Invalid selector, skip
    }
  }

  // 4. Check for application form structure
  const forms = document.querySelectorAll('form');
  for (const form of forms) {
    const inputs = form.querySelectorAll('input, textarea, select');
    if (inputs.length >= 3) {
      const hasNameField = form.querySelector('input[name*="name" i], input[placeholder*="name" i]');
      const hasEmailField = form.querySelector('input[type="email"], input[name*="email" i]');
      const hasFileUpload = form.querySelector('input[type="file"]');

      if (hasNameField && hasEmailField) {
        confidence += 15;
        signals.push('Form has name and email fields');
      }
      if (hasFileUpload) {
        confidence += 20;
        signals.push('Form has file upload field');
      }
    }
  }

  // Cap confidence at 100
  confidence = Math.min(100, confidence);

  return {
    isJobPage: confidence >= 40,
    confidence,
    platform: detectedPlatform,
    signals,
  };
}

// Check if we're on a specific platform's application page
export function getPlatformInfo(): { platform: string; isApplicationForm: boolean } | null {
  const detection = detectJobPage();

  if (!detection.isJobPage) return null;

  // Check if we're on the actual application form vs just viewing the job
  const hasApplicationForm =
    document.querySelector('form[action*="apply" i]') !== null ||
    document.querySelector('input[type="file"]') !== null ||
    document.querySelector('button:not([type="button"])') !== null;

  return {
    platform: detection.platform || 'generic',
    isApplicationForm: hasApplicationForm,
  };
}
