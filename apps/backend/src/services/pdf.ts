// PDF Generation Service
// Generates a professional resume PDF from profile data

import PDFDocument from 'pdfkit';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

interface Experience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

interface Skill {
  name: string;
  category?: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: Array<{ category: string; items: Skill[] | string[] }>;
  projects?: Array<{ id: string; name: string; description: string; technologies: string[]; link?: string }>;
  certifications?: Array<{ id: string; name: string; issuer: string; date: string }>;
}

// Generate PDF buffer from resume data
export async function generateResumePDF(data: ResumeData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { personalInfo, summary, experience, education, skills, projects, certifications } = data;

      // Header - Name
      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .text(personalInfo.fullName || 'Your Name', { align: 'center' });

      // Contact Info
      const contactParts: string[] = [];
      if (personalInfo.email) contactParts.push(personalInfo.email);
      if (personalInfo.phone) contactParts.push(personalInfo.phone);
      if (personalInfo.location) contactParts.push(personalInfo.location);

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#666666')
        .text(contactParts.join(' | '), { align: 'center' });

      // Links
      const links: string[] = [];
      if (personalInfo.linkedin) links.push(`LinkedIn: ${personalInfo.linkedin}`);
      if (personalInfo.github) links.push(`GitHub: ${personalInfo.github}`);
      if (personalInfo.website) links.push(`Website: ${personalInfo.website}`);

      if (links.length > 0) {
        doc.text(links.join(' | '), { align: 'center' });
      }

      doc.moveDown(0.5);

      // Helper function for section headers
      const addSectionHeader = (title: string) => {
        doc.moveDown(0.5);
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor('#000000')
          .text(title.toUpperCase());
        doc
          .moveTo(50, doc.y)
          .lineTo(562, doc.y)
          .strokeColor('#333333')
          .lineWidth(1)
          .stroke();
        doc.moveDown(0.3);
      };

      // Summary
      if (summary && summary.trim()) {
        addSectionHeader('Professional Summary');
        doc.font('Helvetica').fontSize(10).fillColor('#333333').text(summary, {
          align: 'justify',
          lineGap: 2,
        });
      }

      // Experience
      if (experience && experience.length > 0) {
        addSectionHeader('Experience');

        for (const exp of experience) {
          // Company and Title
          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#000000')
            .text(exp.title, { continued: true })
            .font('Helvetica')
            .text(` at ${exp.company}`);

          // Date and Location
          const dateLocation: string[] = [];
          if (exp.startDate || exp.endDate) {
            dateLocation.push(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`);
          }
          if (exp.location) dateLocation.push(exp.location);

          if (dateLocation.length > 0) {
            doc.fontSize(9).fillColor('#666666').text(dateLocation.join(' | '));
          }

          // Description
          if (exp.description) {
            doc.fontSize(10).fillColor('#333333').text(exp.description);
          }

          // Bullets
          if (exp.bullets && exp.bullets.length > 0) {
            doc.moveDown(0.2);
            for (const bullet of exp.bullets) {
              if (bullet.trim()) {
                doc.fontSize(10).fillColor('#333333').text(`• ${bullet}`, {
                  indent: 10,
                  lineGap: 1,
                });
              }
            }
          }

          doc.moveDown(0.5);
        }
      }

      // Education
      if (education && education.length > 0) {
        addSectionHeader('Education');

        for (const edu of education) {
          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#000000')
            .text(edu.institution);

          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#333333')
            .text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`);

          const eduDetails: string[] = [];
          if (edu.graduationDate) eduDetails.push(edu.graduationDate);
          if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);

          if (eduDetails.length > 0) {
            doc.fontSize(9).fillColor('#666666').text(eduDetails.join(' | '));
          }

          doc.moveDown(0.3);
        }
      }

      // Skills
      if (skills && skills.length > 0) {
        addSectionHeader('Skills');

        for (const skillGroup of skills) {
          const skillNames = skillGroup.items.map((s: Skill | string) =>
            typeof s === 'string' ? s : s.name
          ).join(', ');

          if (skillNames) {
            doc
              .font('Helvetica-Bold')
              .fontSize(10)
              .fillColor('#000000')
              .text(`${skillGroup.category}: `, { continued: true })
              .font('Helvetica')
              .fillColor('#333333')
              .text(skillNames);
          }
        }
      }

      // Projects
      if (projects && projects.length > 0) {
        addSectionHeader('Projects');

        for (const project of projects) {
          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#000000')
            .text(project.name);

          if (project.description) {
            doc.font('Helvetica').fontSize(10).fillColor('#333333').text(project.description);
          }

          if (project.technologies && project.technologies.length > 0) {
            doc
              .fontSize(9)
              .fillColor('#666666')
              .text(`Technologies: ${project.technologies.join(', ')}`);
          }

          doc.moveDown(0.3);
        }
      }

      // Certifications
      if (certifications && certifications.length > 0) {
        addSectionHeader('Certifications');

        for (const cert of certifications) {
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#000000')
            .text(cert.name, { continued: true })
            .font('Helvetica')
            .fillColor('#333333')
            .text(` - ${cert.issuer}${cert.date ? `, ${cert.date}` : ''}`);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
