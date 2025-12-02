import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '../../../types';

export const MinimalistPDF = ({ resume }: { resume: Resume }) => {
    // Layout configuration - ATS Optimized: SINGLE COLUMN ONLY
    const marginMap = {
        compact: 20,
        normal: 30,
        relaxed: 40
    };

    const lineSpacingMap = {
        compact: 1.2,
        normal: 1.5,
        relaxed: 1.8
    };

    const sectionSpacingMap = {
        compact: 5,
        normal: 10,
        relaxed: 15
    };

    const fontSizeMap = {
        small: 9,
        medium: 10,
        large: 11
    };

    const layout = resume.layout || { margin: 'normal', spacing: 'normal', fontSize: 'medium' };
    const margin = marginMap[layout.margin || 'normal'];
    const lineHeight = lineSpacingMap[layout.lineSpacing || layout.spacing || 'normal'];
    const sectionGap = sectionSpacingMap[layout.sectionSpacing || layout.spacing || 'normal'];
    const baseFontSize = fontSizeMap[layout.fontSize || 'medium'];

    const styles = StyleSheet.create({
        page: {
            padding: margin,
            fontFamily: 'Helvetica',
            fontSize: baseFontSize,
            color: '#000',
            lineHeight: lineHeight,
        },
        header: {
            marginBottom: sectionGap,
            borderBottom: '1px solid #000',
            paddingBottom: 10,
        },
        name: {
            fontSize: baseFontSize + 10,
            fontWeight: 'normal',
            color: '#000',
            marginBottom: 6,
        },
        contactItem: {
            fontSize: baseFontSize - 1,
            color: '#000',
            marginBottom: 2,
        },
        section: {
            marginBottom: sectionGap,
        },
        sectionTitle: {
            fontSize: baseFontSize + 1,
            fontWeight: 'bold',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
        },
        experienceItem: {
            marginBottom: 10,
        },
        expHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 2,
        },
        expPosition: {
            fontSize: baseFontSize + 1,
            fontWeight: 'bold',
            color: '#000',
        },
        expDate: {
            fontSize: baseFontSize - 1,
            color: '#000',
        },
        expCompany: {
            fontSize: baseFontSize,
            fontWeight: 'bold',
            color: '#000',
            marginBottom: 4,
        },
        bullet: {
            flexDirection: 'row',
            marginBottom: 2,
            paddingLeft: 10,
        },
        bulletPoint: {
            width: 10,
            fontSize: baseFontSize,
            color: '#000',
        },
        bulletText: {
            fontSize: baseFontSize,
            color: '#000',
            flex: 1,
        },
        skillGroup: {
            flexDirection: 'row',
            marginBottom: 3,
        },
        skillCategory: {
            fontWeight: 'bold',
            width: 100,
            fontSize: baseFontSize,
            color: '#000',
        },
        skillList: {
            flex: 1,
            fontSize: baseFontSize,
            color: '#000',
        },
    });

    return (
        <Page size="A4" style={styles.page}>
            {/* Header - ATS Optimized: Single Column */}
            <View style={styles.header}>
                <Text style={styles.name}>{resume.personalInfo.fullName}</Text>
                <View>
                    {resume.personalInfo.email && <Text style={styles.contactItem}>{resume.personalInfo.email}</Text>}
                    {resume.personalInfo.phone && <Text style={styles.contactItem}>{resume.personalInfo.phone}</Text>}
                    {resume.personalInfo.location && <Text style={styles.contactItem}>{resume.personalInfo.location}</Text>}
                    {resume.personalInfo.linkedin && <Text style={styles.contactItem}>{resume.personalInfo.linkedin}</Text>}
                    {resume.personalInfo.website && <Text style={styles.contactItem}>{resume.personalInfo.website}</Text>}
                    {resume.personalInfo.github && <Text style={styles.contactItem}>{resume.personalInfo.github}</Text>}
                </View>
            </View>

            {/* Summary - ATS Optimized */}
            {resume.summary && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
                    <Text>{resume.summary}</Text>
                </View>
            )}

            {/* Experience - ATS Optimized */}
            {resume.experience.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>EXPERIENCE</Text>
                    {resume.experience.map((exp) => (
                        <View key={exp.id} style={styles.experienceItem}>
                            <View style={styles.expHeader}>
                                <Text style={styles.expPosition}>{exp.position}</Text>
                                <Text style={styles.expDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                            </View>
                            <Text style={styles.expCompany}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</Text>
                            {exp.description.map((bullet, i) => (
                                <View key={i} style={styles.bullet}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.bulletText}>{bullet}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}

            {/* Education - ATS Optimized */}
            {resume.education.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>EDUCATION</Text>
                    {resume.education.map((edu) => (
                        <View key={edu.id} style={styles.experienceItem}>
                            <View style={styles.expHeader}>
                                <Text style={styles.expCompany}>{edu.institution}</Text>
                                <Text style={styles.expDate}>{edu.startDate} - {edu.endDate}</Text>
                            </View>
                            <Text style={{ fontSize: baseFontSize }}>
                                {edu.degree} in {edu.fieldOfStudy}
                                {edu.grade ? ` | GPA: ${edu.grade}` : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Skills - ATS Optimized */}
            {resume.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SKILLS</Text>
                    {resume.skills.map((skill) => (
                        <View key={skill.id} style={styles.skillGroup}>
                            <Text style={styles.skillCategory}>{skill.category}:</Text>
                            <Text style={styles.skillList}>{skill.items.join(', ')}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Projects - ATS Optimized */}
            {resume.projects && resume.projects.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROJECTS</Text>
                    {resume.projects.map((project) => (
                        <View key={project.id} style={styles.experienceItem}>
                            <Text style={styles.expPosition}>{project.name}</Text>
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
                            {project.bullets && project.bullets.length > 0 && project.bullets.map((bullet, i) => (
                                <View key={i} style={styles.bullet}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.bulletText}>{bullet}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}

            {/* Certifications - ATS Optimized */}
            {resume.certifications && resume.certifications.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
                    {resume.certifications.map((cert) => (
                        <View key={cert.id} style={styles.experienceItem}>
                            <View style={styles.expHeader}>
                                <Text style={styles.expPosition}>{cert.name}</Text>
                                <Text style={styles.expDate}>{cert.date}</Text>
                            </View>
                            <Text style={styles.expCompany}>{cert.issuer}</Text>
                            {cert.link && <Text style={{ fontSize: baseFontSize - 1 }}>{cert.link}</Text>}
                        </View>
                    ))}
                </View>
            )}
        </Page>
    );
};
