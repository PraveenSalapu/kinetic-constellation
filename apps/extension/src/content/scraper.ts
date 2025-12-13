// Job Description Scraper Module
// Extracts job information from various job posting platforms

import type { ScrapedJobData } from '@careerflow/shared';

// Platform-specific selectors for job data extraction
const PLATFORM_SELECTORS: Record<string, {
  title: string[];
  company: string[];
  description: string[];
  location: string[];
  salary: string[];
}> = {
  linkedin: {
    title: [
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      'h1.t-24',
      '.topcard__title',
    ],
    company: [
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name',
      '.topcard__org-name-link',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
    ],
    description: [
      '.jobs-description__content',
      '.jobs-description-content__text',
      '.description__text',
      '#job-details',
    ],
    location: [
      '.job-details-jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__bullet',
      '.topcard__flavor--bullet',
    ],
    salary: [
      '.job-details-jobs-unified-top-card__job-insight',
      '.salary-main-rail__salary-range',
    ],
  },
  indeed: {
    title: [
      '.jobsearch-JobInfoHeader-title',
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1.jobsearch-JobInfoHeader-title',
    ],
    company: [
      '[data-testid="inlineHeader-companyName"]',
      '.jobsearch-InlineCompanyRating-companyHeader',
      'div[data-company-name="true"]',
    ],
    description: [
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',
      '[data-testid="job-description"]',
    ],
    location: [
      '[data-testid="job-location"]',
      '.jobsearch-JobInfoHeader-subtitle > div:last-child',
    ],
    salary: [
      '[data-testid="attribute_snippet_testid"]',
      '.jobsearch-JobMetadataHeader-item',
    ],
  },
  greenhouse: {
    title: [
      '.app-title',
      'h1.posting-headline',
      'h1', // Generic H1 often works for modern boards
      '.job-title',
    ],
    company: [
      '.company-name',
      '.company',
      '[class*="company"]',
      'span.company',
    ],
    description: [
      '#content .content',
      '#content', // Sometimes just #content
      '#main',
      '.job-description',
      '.content-intro',
      '[class*="description"]',
    ],
    location: [
      '.location',
      '[class*="location"]',
    ],
    salary: [],
  },
  lever: {
    title: [
      '.posting-headline h2',
      '.posting-title',
    ],
    company: [
      '.posting-company',
      '.main-header-logo img[alt]',
    ],
    description: [
      '.posting-page .content',
      '[data-qa="job-description"]',
    ],
    location: [
      '.posting-categories .location',
      '.sort-by-time.posting-category',
    ],
    salary: [],
  },
  workday: {
    title: [
      '[data-automation-id="jobPostingHeader"]',
      '.css-1wt8oh6',
      'h1[data-automation-id="header"]',
    ],
    company: [
      '[data-automation-id="companyName"]',
      '.css-1x0wth4',
    ],
    description: [
      '[data-automation-id="jobPostingDescription"]',
      '.css-pxzk9z',
    ],
    location: [
      '[data-automation-id="locations"]',
      '.css-129m7dg',
    ],
    salary: [],
  },
  generic: {
    title: [
      'h1',
      '[class*="job-title"]',
      '[class*="jobTitle"]',
      '[class*="position-title"]',
      '[data-testid*="title"]',
    ],
    company: [
      '[class*="company"]',
      '[class*="employer"]',
      '[data-testid*="company"]',
      '[itemprop="hiringOrganization"]',
    ],
    description: [
      '[class*="description"]',
      '[class*="job-content"]',
      '[class*="jobContent"]',
      'article',
      'main',
      '[role="main"]',
    ],
    location: [
      '[class*="location"]',
      '[itemprop="jobLocation"]',
      '[data-testid*="location"]',
    ],
    salary: [
      '[class*="salary"]',
      '[class*="compensation"]',
      '[itemprop="baseSalary"]',
    ],
  },
};

function getTextContent(selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && text.length > 0) {
          return text;
        }
      }
    } catch {
      // Invalid selector, continue to next
    }
  }
  return '';
}

function getDescription(selectors: string[]): string {
  // First, try to get the main description container
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        // Get inner text to preserve some formatting
        const text = element.innerText?.trim();
        if (text && text.length > 50) {
          // Don't truncate - we want full requirements and qualifications
          return text.length > 50000 ? text.substring(0, 50000) + '...' : text;
        }
      }
    } catch {
      // Invalid selector, continue to next
    }
  }

  // If no main description found, try to collect all job-related sections
  return collectFullJobDescription();
}

// Collect full job description including all sections
function collectFullJobDescription(): string {
  const sections: string[] = [];

  // Selectors for various job description sections
  const sectionSelectors = [
    // Common section patterns
    '[class*="description"]',
    '[class*="qualifications"]',
    '[class*="requirements"]',
    '[class*="responsibilities"]',
    '[class*="preferred"]',
    '[class*="what-you"]',
    '[class*="about-the-job"]',
    '[class*="job-details"]',
    '[class*="job-content"]',
    '[data-testid*="description"]',
    '[data-testid*="requirements"]',
    '[data-testid*="qualifications"]',
    // Section headers and their siblings
    'h2, h3, h4',
  ];

  // Keywords that indicate relevant sections
  const relevantKeywords = [
    'description', 'responsibilities', 'qualifications',
    'requirements', 'skills', 'what you', 'who you',
    'preferred', 'nice to have', 'bonus', 'minimum',
    'basic', 'experience', 'education', 'knowledge'
  ];

  // Try to find sections with relevant content
  for (const selector of sectionSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.innerText?.trim();
        if (text && text.length > 30) {
          // Check if this section is relevant
          const lowerText = text.toLowerCase();
          const isRelevant = relevantKeywords.some(kw => lowerText.includes(kw)) ||
            (selector.includes('description') ||
              selector.includes('requirements') ||
              selector.includes('qualifications'));

          if (isRelevant && !sections.some(s => s.includes(text) || text.includes(s))) {
            sections.push(text);
          }
        }
      });
    } catch {
      // Invalid selector, continue
    }
  }

  // If we found sections, join them
  if (sections.length > 0) {
    const fullDescription = sections.join('\n\n---\n\n');
    return fullDescription.length > 50000 ? fullDescription.substring(0, 50000) + '...' : fullDescription;
  }

  // Last resort: get main content area
  const mainContent = document.querySelector('main, article, [role="main"]');
  if (mainContent) {
    const text = mainContent.innerText?.trim();
    if (text && text.length > 100) {
      return text.length > 50000 ? text.substring(0, 50000) + '...' : text;
    }
  }

  return '';
}

export function scrapeJobData(platform: string): ScrapedJobData {
  const selectors = PLATFORM_SELECTORS[platform] || PLATFORM_SELECTORS.generic;

  // Try platform-specific first, then fallback to generic
  let title = getTextContent(selectors.title);
  let company = getTextContent(selectors.company);
  let description = getDescription(selectors.description);
  let location = getTextContent(selectors.location);
  let salary = getTextContent(selectors.salary);

  // Fallback to generic if platform-specific failed
  if (!title && platform !== 'generic') {
    title = getTextContent(PLATFORM_SELECTORS.generic.title);
  }
  if (!company && platform !== 'generic') {
    company = getTextContent(PLATFORM_SELECTORS.generic.company);
  }
  if (!description && platform !== 'generic') {
    description = getDescription(PLATFORM_SELECTORS.generic.description);
  }
  if (!location && platform !== 'generic') {
    location = getTextContent(PLATFORM_SELECTORS.generic.location);
  }

  // Try to extract company from page title if not found
  if (!company) {
    const pageTitle = document.title;
    // Common patterns: "Job Title at Company" or "Job Title - Company"
    const atMatch = pageTitle.match(/at\s+([^|–-]+)/i);
    const dashMatch = pageTitle.match(/[-–]\s*([^|–-]+?)(?:\s*[-–|]|$)/);
    if (atMatch) company = atMatch[1].trim();
    else if (dashMatch) company = dashMatch[1].trim();
  }

  // Clean up extracted data
  title = title.replace(/\s+/g, ' ').trim();
  company = company.replace(/\s+/g, ' ').trim();
  location = location.replace(/\s+/g, ' ').trim();

  return {
    title: title || 'Unknown Position',
    company: company || 'Unknown Company',
    description: description || 'No description available',
    location: location || undefined,
    salary: salary || undefined,
    url: window.location.href,
    platform,
  };
}

// Quick extraction for display purposes
export function quickScrape(): { title: string; company: string } {
  const data = scrapeJobData('generic');
  return {
    title: data.title,
    company: data.company,
  };
}
