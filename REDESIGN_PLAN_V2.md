# Plan: "Forensic Minimalist" Redesign (Landing Page & Onboarding)

**Objective:**
Shift the application from a generic "dashboard-first" resume builder to a "value-first" conversion engine. The goal is to prove value via a "Resume Roaster/Scanner" *before* asking for a signup, using a technical, "developer-grade" aesthetic ("Forensic Minimalism").

**Target Audience:** Anxious job seekers who want technical assurance, not marketing fluff.
**Visual Style:** Dark Mode, Monospace fonts, Data-dense, IDE-like, Neon Green/Hazard Yellow accents.

---

## Phase 1: The "Roaster" Hero Section (Acquisition)
**Goal:** Hook the user immediately by letting them scan their resume against a hidden standard (ATS keywords).

### 1.1 Layout & Components
*   **Navigation:** Minimal. Logo (Top Left), "Sign In" (Top Right). No complex menu.
*   **H1 Headline:** "Resume.optimize( )" or "Is Your Resume Invisible?" (A/B Test later).
*   **H2 Subheader:** "The only ATS-compliant builder verified against Greenhouse & Lever algorithms. Parse, score, and fix your profile in seconds."
*   **Interactive Zone (The "Hook"):**
    *   **Drag & Drop Area:** A prominent, technical-looking dashed border zone. "Drop PDF here to scan."
    *   **Or Toggle:** "Paste Job Description URL" + "Drop Resume" (For comparison).
    *   **Micro-interactions:** When a file is dropped, show a "Scanning..." terminal-like animation (text scrambling, progress bars) rather than a simple spinner.

### 1.2 Functionality (`ResumeRoaster` Component)
*   **Input:** File Upload (Generic PDF).
*   **Process:**
    *   Call existing `parseResumeWithAI`.
    *   *Simulation:* Add a 2-3 second "artificial delay" with visual feedback ("Analyzing Header...", "Checking Keywords...", "parsing: experience").
*   **Output:** Transition to "The Tear Down" (Phase 2).

---

## Phase 2: The "Tear Down" & Score (Activation)
**Goal:** Show the problem vividly so the user *needs* the solution.

### 2.1 The Split View (`ResumeScannerResult` Component)
*   **Left Panel (Original):** Use `react-pdf` to show a thumbnail of their uploaded resume. Overlay a red semi-transparent layer on "unreadable" sections.
*   **Right Panel (ATS View):**
    *   **Scorecard:** A large, circular score (e.g., "42/100").
    *   **Critical Errors List:**
        *   "❌ Header unreadable (Graphics detected)"
        *   "❌ Date format inconsistent"
        *   "❌ Missing key skills: Java, Docker"
    *   **Visual Style:** Use "Diff Check" styling (Green background for added lines, Red for deleted/error lines).

### 2.2 The Magic Button (Conversion)
*   **Primary CTA:** "Fix All Issues & Optimize" (Pulsing, Neon Green).
*   **Action:** Clicking this is the "Gate." It triggers the "Create Account to Save Fixes" modal.

---

## Phase 3: The "Golden Path" Onboarding (Retention)
**Goal:** Seamlessly transition from the "Magic Fix" to the Full Editor.

### 3.1 The "Magic Fix" Transition
*   Once logged in (or skipped for demo), do NOT drop them on the empty dashboard.
*   Drop them directly into the **Editor**, but with their data *already pre-filled* from the scan.
*   **Animation:** "Applying Templates..." -> Show the text flowing into your clean, standard resume template.

### 3.2 The First "Value" Dashboard
*   Now that they have a resume, the Dashboard makes sense.
*   **Active Resume Card:** Shows the resume they just optimized.
*   **Job Scroller:** "Jobs matching your NEW optimized skills."

---

## Technical Implementation Steps

### Step 1: Component Scaffolding
- [ ] Create `src/components/Landing/HeroRoaster.tsx` (File Drop + Terminal Animation).
- [ ] Create `src/components/Landing/ScanResults.tsx` (Split View + Score).
- [ ] Update `src/pages/LandingPage.tsx` to use these instead of the current Dashboard components.

### Step 2: Visual System Update (`forensic-theme`)
- [ ] Update `tailwind.config.js` or `index.css`:
    - [ ] Add `font-mono` (JetBrains/Geist) for stats.
    - [ ] Define "Dark Mode" palette (`bg-zinc-950`, `text-neon-green`).
    - [ ] Create "Terminal" utility classes (green cursor, typer effect).

### Step 3: Logic Connection
- [ ] Connect `HeroRoaster` file output to `ResumeContext` (so the data persists).
- [ ] Implement the "Mock Scanner" logic (if real scoring isn't ready, use a heuristic: e.g., text length + keyword count = score).

### Step 4: Routing
- [ ] Ensure non-authenticated users hit `LandingPage`.
- [ ] Ensure authenticated users go to `Dashboard`.

---

## Next Immediate Action
Start **Step 1: Scaffolding the HeroRoaster** to replace the current generic "Welcome" screen.
