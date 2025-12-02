import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '../../../types';

export const ClassicPDF = ({ resume }: { resume: Resume }) => {
    // Layout configuration - ATS Optimized
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
            fontFamily: 'Times-Roman',
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
            fontWeight: 'bold',
            marginBottom: 6,
        },
        contact: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            fontSize: baseFontSize,
        },
        section: {
            marginBottom: sectionGap,
        },
        sectionTitle: {
            fontSize: baseFontSize + 2,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            marginBottom: 8,
            paddingBottom: 2,
        },
        experienceItem: {
            marginBottom: 10,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 2,
        },
        company: {
            fontSize: baseFontSize + 1,
            fontWeight: 'bold',
        },
        location: {
            fontSize: baseFontSize - 1,
        },
        positionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 2,
        },
        position: {
            fontSize: baseFontSize,
            fontWeight: 'bold',
        },
        date: {
            fontSize: baseFontSize - 1,
        },
        bullet: {
            flexDirection: 'row',
            marginBottom: 1,
            paddingLeft: 10,
        },
        bulletPoint: {
            width: 10,
            fontSize: baseFontSize,
        },
        bulletText: {
            flex: 1,
            fontSize: baseFontSize,
        },
        skillGroup: {
            flexDirection: 'row',
            marginBottom: 3,
        },
        skillCategory: {
            fontWeight: 'bold',
            marginRight: 5,
            width: 100,
        },
    });

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.name}>{resume.personalInfo.fullName}</Text>
                <View style={styles.contact}>
                    {resume.personalInfo.email && <Text>{resume.personalInfo.email}</Text>}
                    {resume.personalInfo.phone && <Text>| {resume.personalInfo.phone}</Text>}
                    {resume.personalInfo.location && <Text>| {resume.personalInfo.location}</Text>}
                    {resume.personalInfo.linkedin && <Text>| {resume.personalInfo.linkedin}</Text>}
                    {resume.personalInfo.website && <Text>| {resume.personalInfo.website}</Text>}
                    {resume.personalInfo.github && <Text>| {resume.personalInfo.github}</Text>}
                </View>
            </View>

            {resume.summary && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
                    <Text>{resume.summary}</Text>
                </View>
            )}

            {resume.experience.length > 0 && (
                <View style={styles.section}>
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
            )}

            {resume.education.length > 0 && (
                <View style={styles.section}>
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
            )}

            {resume.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SKILLS</Text>
                    {resume.skills.map((skill) => (
                        <View key={skill.id} style={styles.skillGroup}>
                            <Text style={styles.skillCategory}>{skill.category}:</Text>
                            <Text style={{ flex: 1 }}>{skill.items.join(', ')}</Text>
                        </View>
                    ))}
                </View>
            )}

            {resume.projects && resume.projects.length > 0 && (
                <View style={styles.section}>
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

            {resume.certifications && resume.certifications.length > 0 && (
                <View style={styles.section}>
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
            )}
        </Page>
    );
};
