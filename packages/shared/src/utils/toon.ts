import { encode, decode } from '@toon-format/toon';
import type { Resume } from '../types/resume';

/**
 * Convert any object to TOON format for LLM input
 * TOON achieves 30-60% token savings on structured data
 */
export function toToon<T>(data: T): string {
  return encode(data);
}

/**
 * Convert TOON string back to JSON object
 */
export function fromToon<T>(toon: string): T {
  return decode(toon) as T;
}

/**
 * Format resume data optimally for TOON encoding
 * Flattens nested structures to maximize token savings
 *
 * TOON is most effective with flat, tabular arrays
 * This function restructures resume data for optimal compression
 */
export function formatResumeForToon(resume: Resume): string {
  // Experience as tabular data (highest savings potential)
  const experienceData = resume.experience.map(e => ({
    id: e.id,
    position: e.position,
    company: e.company,
    location: e.location || '',
    dates: `${e.startDate}-${e.current ? 'Present' : e.endDate}`,
    bullets: e.description.join(' | ')
  }));

  // Skills flattened for tabular encoding
  const skillsData = resume.skills.flatMap(g =>
    g.items.map(skill => ({ category: g.category, skill }))
  );

  // Education as tabular data
  const educationData = resume.education.map(e => ({
    id: e.id,
    institution: e.institution,
    degree: e.degree,
    field: e.fieldOfStudy,
    dates: `${e.startDate}-${e.endDate}`,
    grade: e.grade || ''
  }));

  // Projects as tabular data
  const projectsData = resume.projects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    tech: p.technologies.join(', '),
    bullets: p.bullets?.join(' | ') || ''
  }));

  // Certifications as tabular data
  const certsData = resume.certifications.map(c => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    date: c.date
  }));

  // Construct optimized structure for TOON
  const optimizedResume = {
    personal: {
      name: resume.personalInfo.fullName,
      email: resume.personalInfo.email,
      phone: resume.personalInfo.phone,
      location: resume.personalInfo.location,
      linkedin: resume.personalInfo.linkedin || '',
      github: resume.personalInfo.github || '',
      website: resume.personalInfo.website || ''
    },
    summary: resume.summary,
    experience: experienceData,
    skills: skillsData,
    education: educationData,
    projects: projectsData,
    certifications: certsData
  };

  return encode(optimizedResume);
}

/**
 * Format resume as simple text with TOON-encoded sections
 * Useful for prompts that mix text and structured data
 */
export function formatResumeTextWithToon(resume: Resume): string {
  const parts: string[] = [];

  // Personal info as text (small, no savings from TOON)
  parts.push(`NAME: ${resume.personalInfo.fullName}`);
  parts.push(`EMAIL: ${resume.personalInfo.email}`);
  parts.push(`PHONE: ${resume.personalInfo.phone}`);
  parts.push(`LOCATION: ${resume.personalInfo.location}`);
  if (resume.personalInfo.linkedin) parts.push(`LINKEDIN: ${resume.personalInfo.linkedin}`);
  if (resume.personalInfo.github) parts.push(`GITHUB: ${resume.personalInfo.github}`);

  // Summary as text
  if (resume.summary) {
    parts.push(`\nSUMMARY:\n${resume.summary}`);
  }

  // Experience as TOON (high savings)
  if (resume.experience.length > 0) {
    const expData = resume.experience.map(e => ({
      id: e.id,
      position: e.position,
      company: e.company,
      dates: `${e.startDate}-${e.current ? 'Present' : e.endDate}`,
      location: e.location || '',
      bullets: e.description
    }));
    parts.push(`\nEXPERIENCE (TOON format):\n${encode(expData)}`);
  }

  // Skills as TOON (moderate savings)
  if (resume.skills.length > 0) {
    const skillsData = resume.skills.map(g => ({
      category: g.category,
      skills: g.items.join(', ')
    }));
    parts.push(`\nSKILLS (TOON format):\n${encode(skillsData)}`);
  }

  // Education as TOON
  if (resume.education.length > 0) {
    const eduData = resume.education.map(e => ({
      degree: `${e.degree} in ${e.fieldOfStudy}`,
      institution: e.institution,
      dates: `${e.startDate}-${e.endDate}`,
      grade: e.grade || ''
    }));
    parts.push(`\nEDUCATION (TOON format):\n${encode(eduData)}`);
  }

  // Projects as TOON
  if (resume.projects.length > 0) {
    const projData = resume.projects.map(p => ({
      name: p.name,
      description: p.description,
      technologies: p.technologies.join(', ')
    }));
    parts.push(`\nPROJECTS (TOON format):\n${encode(projData)}`);
  }

  // Certifications as TOON
  if (resume.certifications.length > 0) {
    const certData = resume.certifications.map(c => ({
      name: c.name,
      issuer: c.issuer,
      date: c.date
    }));
    parts.push(`\nCERTIFICATIONS (TOON format):\n${encode(certData)}`);
  }

  return parts.join('\n');
}
