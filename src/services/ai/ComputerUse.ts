import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });
const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';

export interface ScreenshotAnalysis {
  description: string;
  detectedElements: {
    type: string;
    description: string;
    location: string;
  }[];
  suggestedActions: {
    action: string;
    target: string;
    reasoning: string;
  }[];
  accessibility: {
    score: number;
    issues: string[];
  };
}

export interface UIInteractionPlan {
  goal: string;
  steps: {
    stepNumber: number;
    action: 'click' | 'type' | 'scroll' | 'wait' | 'verify';
    target: string;
    value?: string;
    description: string;
  }[];
  preconditions: string[];
  expectedOutcome: string;
}

export interface DOMAnalysis {
  structure: string;
  interactiveElements: {
    type: string;
    id?: string;
    class?: string;
    text?: string;
    accessible: boolean;
  }[];
  formFields: {
    name: string;
    type: string;
    required: boolean;
    label?: string;
  }[];
  navigationElements: {
    type: string;
    text: string;
    destination?: string;
  }[];
}

/**
 * Computer Use Agent - Simulates computer interaction capabilities
 * Includes screenshot analysis, UI interaction planning, and accessibility checking
 */
export class ComputerUseAgent {
  /**
   * Analyze a screenshot or visual representation
   * In production, this would work with actual image data
   */
  async analyzeScreenshot(_imageData: string | HTMLCanvasElement): Promise<ScreenshotAnalysis> {
    // For now, we'll simulate screenshot analysis
    // In production, you would:
    // 1. Convert screenshot to base64
    // 2. Send to Gemini with vision capabilities
    // 3. Get detailed analysis

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        detectedElements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              location: { type: Type.STRING }
            },
            required: ['type', 'description', 'location']
          }
        },
        suggestedActions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              target: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            },
            required: ['action', 'target', 'reasoning']
          }
        },
        accessibility: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['score', 'issues']
        }
      },
      required: ['description', 'detectedElements', 'suggestedActions', 'accessibility']
    };

    const prompt = `
Analyze this UI screenshot and provide:
1. Overall description of what's shown
2. Detected interactive elements (buttons, forms, links, etc.)
3. Suggested actions a user might take
4. Accessibility assessment

Screenshot context: Resume builder application interface

Provide detailed, actionable insights.
`;

    try {
      // Simulated analysis for now
      // In production, include actual image data in the request
      const result = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      return JSON.parse(result.text || '{}');
    } catch (error) {
      console.error('Error analyzing screenshot:', error);
      throw error;
    }
  }

  /**
   * Analyze the current DOM structure
   */
  async analyzeDOMStructure(htmlContent?: string): Promise<DOMAnalysis> {
    const actualHtml = htmlContent || document.body.innerHTML;

    // Parse interactive elements from DOM
    const interactiveElements = this.extractInteractiveElements();
    const formFields = this.extractFormFields();
    const navigationElements = this.extractNavigationElements();

    return {
      structure: this.summarizeStructure(actualHtml),
      interactiveElements,
      formFields,
      navigationElements
    };
  }

  private extractInteractiveElements() {
    const elements = document.querySelectorAll('button, a, input, select, textarea');
    return Array.from(elements).map(el => ({
      type: el.tagName.toLowerCase(),
      id: el.id || undefined,
      class: el.className || undefined,
      text: el.textContent?.trim().substring(0, 50) || undefined,
      accessible: this.checkAccessibility(el)
    }));
  }

  private extractFormFields() {
    const inputs = document.querySelectorAll('input, select, textarea');
    return Array.from(inputs).map(el => {
      const input = el as HTMLInputElement;
      const label = this.findLabelForInput(input);
      return {
        name: input.name || input.id || 'unnamed',
        type: input.type || input.tagName.toLowerCase(),
        required: input.required,
        label: label?.textContent?.trim()
      };
    });
  }

  private extractNavigationElements() {
    const navElements = document.querySelectorAll('nav a, [role="navigation"] a, header a');
    return Array.from(navElements).map(el => {
      const link = el as HTMLAnchorElement;
      return {
        type: 'link',
        text: link.textContent?.trim() || '',
        destination: link.href
      };
    });
  }

  private checkAccessibility(element: Element): boolean {
    // Basic accessibility checks
    if (element.hasAttribute('aria-label')) return true;
    if (element.hasAttribute('aria-labelledby')) return true;
    if (element.tagName === 'BUTTON' && element.textContent?.trim()) return true;
    if (element.tagName === 'A' && element.textContent?.trim()) return true;
    return false;
  }

  private findLabelForInput(input: HTMLInputElement): HTMLLabelElement | null {
    if (input.id) {
      return document.querySelector(`label[for="${input.id}"]`);
    }
    return input.closest('label');
  }

  private summarizeStructure(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;

    const structure = {
      totalElements: div.querySelectorAll('*').length,
      forms: div.querySelectorAll('form').length,
      buttons: div.querySelectorAll('button').length,
      inputs: div.querySelectorAll('input').length,
      links: div.querySelectorAll('a').length,
      headings: div.querySelectorAll('h1, h2, h3, h4, h5, h6').length
    };

    return JSON.stringify(structure);
  }

  /**
   * Plan UI interactions to achieve a goal
   */
  async planUIInteractions(goal: string, context?: any): Promise<UIInteractionPlan> {
    const domAnalysis = await this.analyzeDOMStructure();

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        goal: { type: Type.STRING },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              action: {
                type: Type.STRING,
                enum: ['click', 'type', 'scroll', 'wait', 'verify']
              },
              target: { type: Type.STRING },
              value: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['stepNumber', 'action', 'target', 'description']
          }
        },
        preconditions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        expectedOutcome: { type: Type.STRING }
      },
      required: ['goal', 'steps', 'preconditions', 'expectedOutcome']
    };

    const prompt = `
You are a UI automation expert planning how to interact with a web interface.

Goal: ${goal}

Current page context: ${JSON.stringify(context || {})}

Available interactive elements:
${JSON.stringify(domAnalysis.interactiveElements, null, 2)}

Available form fields:
${JSON.stringify(domAnalysis.formFields, null, 2)}

Task: Create a step-by-step plan to achieve the goal through UI interactions.
Each step should be:
1. Specific about which element to interact with
2. Clear about the action to take
3. Include any values to input
4. Explain why this step is necessary

Consider:
- Element accessibility and availability
- Proper sequencing of actions
- Validation and error handling
- Wait times for dynamic content
`;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    return JSON.parse(result.text || '{}');
  }

  /**
   * Execute a UI interaction plan (simulation - doesn't actually click)
   */
  async simulateInteractionPlan(plan: UIInteractionPlan): Promise<{
    success: boolean;
    executedSteps: number;
    results: any[];
    errors: string[];
  }> {
    const results: any[] = [];
    const errors: string[] = [];
    let executedSteps = 0;

    for (const step of plan.steps) {
      try {
        console.log(`[Simulation] Step ${step.stepNumber}: ${step.description}`);

        // Simulate the action
        switch (step.action) {
          case 'click':
            console.log(`  → Clicking: ${step.target}`);
            break;
          case 'type':
            console.log(`  → Typing "${step.value}" into: ${step.target}`);
            break;
          case 'scroll':
            console.log(`  → Scrolling to: ${step.target}`);
            break;
          case 'wait':
            console.log(`  → Waiting for: ${step.target}`);
            break;
          case 'verify':
            console.log(`  → Verifying: ${step.target}`);
            break;
        }

        results.push({
          step: step.stepNumber,
          action: step.action,
          success: true
        });
        executedSteps++;

      } catch (error) {
        errors.push(`Step ${step.stepNumber} failed: ${error}`);
        results.push({
          step: step.stepNumber,
          action: step.action,
          success: false,
          error: String(error)
        });
      }
    }

    return {
      success: errors.length === 0,
      executedSteps,
      results,
      errors
    };
  }

  /**
   * Capture current page screenshot (browser only)
   */
  async captureScreenshot(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Use html2canvas if available, or return placeholder
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // This is a simplified version
        // In production, use html2canvas or similar library
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Test accessibility of current page
   */
  async testAccessibility(): Promise<{
    score: number;
    issues: Array<{
      severity: 'critical' | 'serious' | 'moderate' | 'minor';
      element: string;
      issue: string;
      recommendation: string;
    }>;
  }> {
    const issues: any[] = [];

    // Check for missing alt text on images
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(() => {
      issues.push({
        severity: 'serious',
        element: 'img',
        issue: 'Image missing alt text',
        recommendation: 'Add descriptive alt text to image'
      });
    });

    // Check for buttons without accessible labels
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(btn => {
      if (!btn.textContent?.trim()) {
        issues.push({
          severity: 'critical',
          element: 'button',
          issue: 'Button has no accessible label',
          recommendation: 'Add aria-label or text content'
        });
      }
    });

    // Check for form inputs without labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const hasLabel = this.findLabelForInput(input as HTMLInputElement);
      if (!hasLabel) {
        issues.push({
          severity: 'serious',
          element: 'input',
          issue: 'Form input without associated label',
          recommendation: 'Add a <label> element or aria-label'
        });
      }
    });

    // Calculate score (100 - 10 points per critical, 5 per serious, etc.)
    const score = Math.max(0, 100 -
      issues.filter(i => i.severity === 'critical').length * 10 -
      issues.filter(i => i.severity === 'serious').length * 5 -
      issues.filter(i => i.severity === 'moderate').length * 3 -
      issues.filter(i => i.severity === 'minor').length * 1
    );

    return { score, issues };
  }
}

// Singleton instance
let computerUseAgentInstance: ComputerUseAgent | null = null;

export function getComputerUseAgent(): ComputerUseAgent {
  if (!computerUseAgentInstance) {
    computerUseAgentInstance = new ComputerUseAgent();
  }
  return computerUseAgentInstance;
}
