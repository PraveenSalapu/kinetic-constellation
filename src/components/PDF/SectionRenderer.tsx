import { Text, View } from '@react-pdf/renderer';
import type { Resume } from '../../types';

interface SectionRendererProps {
    sectionId: string;
    resume: Resume;
    styles: any;
}

export const renderPDFSection = (sectionId: string, resume: Resume, styles: any) => {
    const baseFontSize = resume.layout?.fontSize || 10;

    switch (sectionId) {
        case 'experience':
            return resume.experience.length > 0 ? (
                <View key="experience" style={styles.section}>
                    <Text style={styles.sectionTitle}>EXPERIENCE</Text>
                    {resume.experience.map((exp) => (
                        <View key={exp.id} style={styles.experienceItem}>
                            <View style={styles.row}>
                                <Text style={styles.position}>{exp.position}</Text>
                                <Text style={styles.date}>
                                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.company}>{exp.company}</Text>
                                {exp.location && <Text style={styles.location}>{exp.location}</Text>}
                            </View>
                            {exp.description.map((bullet, i) => (
                                <View key={i} style={styles.bullet}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.bulletText}>{bullet}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            ) : null;

        case 'education':
            return resume.education.length > 0 ? (
                <View key="education" style={styles.section}>
                    <Text style={styles.sectionTitle}>EDUCATION</Text>
                    {resume.education.map((edu) => (
                        <View key={edu.id} style={styles.experienceItem}>
                            <View style={styles.row}>
                                <Text style={styles.company}>{edu.institution}</Text>
                                <Text style={styles.date}>
                                    {edu.startDate} - {edu.endDate}
                                </Text>
                            </View>
                            <Text>
                                {edu.degree} in {edu.fieldOfStudy}
                                {edu.grade ? ` | GPA: ${edu.grade}` : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : null;

        case 'skills':
            return resume.skills.length > 0 ? (
                <View key="skills" style={styles.section}>
                    <Text style={styles.sectionTitle}>SKILLS</Text>
                    {resume.skills.map((skill) => (
                        <View key={skill.id} style={styles.skillGroup}>
                            <Text style={styles.skillCategory}>{skill.category}:</Text>
                            <Text style={{ flex: 1 }}>{skill.items.join(', ')}</Text>
                        </View>
                    ))}
                </View>
            ) : null;

        case 'projects':
            return resume.projects && resume.projects.length > 0 ? (
                <View key="projects" style={styles.section}>
                    <Text style={styles.sectionTitle}>PROJECTS</Text>
                    {resume.projects.map((project) => (
                        <View key={project.id} style={styles.experienceItem}>
                            <Text style={styles.position}>{project.name}</Text>
                            <Text style={{ marginBottom: 2 }}>{project.description}</Text>
                            {project.technologies && project.technologies.length > 0 && (
                                <Text style={{ fontSize: baseFontSize - 1, marginBottom: 2 }}>
                                    Technologies: {project.technologies.join(', ')}
                                </Text>
                            )}
                            {(project.link || project.github) && (
                                <Text style={{ fontSize: baseFontSize - 1, marginBottom: 2 }}>
                                    {project.link && `Link: ${project.link}`}
                                    {project.link && project.github && ' | '}
                                    {project.github && `GitHub: ${project.github}`}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            ) : null;

        case 'certifications':
            return resume.certifications && resume.certifications.length > 0 ? (
                <View key="certifications" style={styles.section}>
                    <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
                    {resume.certifications.map((cert) => (
                        <View key={cert.id} style={styles.experienceItem}>
                            <View style={styles.row}>
                                <Text style={styles.position}>{cert.name}</Text>
                                <Text style={styles.date}>{cert.date}</Text>
                            </View>
                            <Text style={styles.company}>{cert.issuer}</Text>
                            {cert.link && <Text style={{ fontSize: baseFontSize - 1 }}>{cert.link}</Text>}
                        </View>
                    ))}
                </View>
            ) : null;

        default:
            return null;
    }
};
