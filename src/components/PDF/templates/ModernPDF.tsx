import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '../../../types';

export const ModernPDF = ({ resume }: { resume: Resume }) => {
    console.log('ModernPDF rendering with layout:', resume.layout);
    // Default values if layout is missing or legacy
    const defaultLayout = {
        fontSize: 10,
        lineHeight: 1.4,
        sectionSpacing: 5,
        margin: { top: 15, right: 15, bottom: 15, left: 15 }
    };

    const layout = resume.layout && typeof resume.layout.fontSize === 'number'
        ? resume.layout
        : defaultLayout;

    // Convert mm to pt for margins (1mm = 2.835pt)
    const mmToPt = 2.835;
    const marginTop = (layout.margin?.top || 15) * mmToPt;
    const marginRight = (layout.margin?.right || 15) * mmToPt;
    const marginBottom = (layout.margin?.bottom || 15) * mmToPt;
    const marginLeft = (layout.margin?.left || 15) * mmToPt;

    // Dynamic styles based on layout
    const pageStyle = {
        paddingTop: marginTop,
        paddingRight: marginRight,
        paddingBottom: marginBottom,
        paddingLeft: marginLeft,
        fontSize: layout.fontSize,
        lineHeight: layout.lineHeight,
        fontFamily: 'Helvetica',
        color: '#333',
    };

    const headerStyle = {
        marginBottom: (layout.sectionSpacing || 5) * mmToPt,
        borderBottomWidth: 2,
        borderBottomColor: '#1e293b',
        borderBottomStyle: 'solid',
        paddingBottom: 10,
    };

    const sectionStyle = {
        marginBottom: (layout.sectionSpacing || 5) * mmToPt,
    };

    const styles = StyleSheet.create({
        name: {
            fontSize: layout.fontSize + 14,
            fontWeight: 'bold',
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 4,
        },
        contact: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: layout.fontSize - 1,
            color: '#475569',
        },
        sectionTitle: {
            fontSize: layout.fontSize + 2,
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 1,
            borderBottomWidth: 1,
            borderBottomColor: '#cbd5e1',
            borderBottomStyle: 'solid',
            paddingBottom: 2,
        },
        experienceItem: {
            marginBottom: 10,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 2,
        },
        position: {
            fontSize: layout.fontSize + 1,
            fontWeight: 'bold',
            color: '#1e293b',
        },
        date: {
            fontSize: layout.fontSize - 1,
            color: '#475569',
        },
        company: {
            fontSize: layout.fontSize,
            fontWeight: 'bold',
            color: '#334155',
            marginBottom: 2,
        },
        bullet: {
            flexDirection: 'row',
            marginBottom: 2,
            paddingLeft: 5,
        },
        bulletPoint: {
            width: 10,
            fontSize: layout.fontSize,
            color: '#334155',
        },
        bulletText: {
            flex: 1,
            fontSize: layout.fontSize,
            color: '#334155',
        },
        skillsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
        },
        skillGroup: {
            flexDirection: 'row',
            marginBottom: 4,
            width: '100%',
        },
        skillCategory: {
            fontWeight: 'bold',
            width: 100,
            fontSize: layout.fontSize,
            color: '#1e293b',
        },
        skillList: {
            flex: 1,
            fontSize: layout.fontSize,
            color: '#334155',
        },
    });

    return (
        <Page size="A4" style={pageStyle}>
            <View style={headerStyle}>
                <Text style={styles.name}>{resume.personalInfo.fullName}</Text>
                <View style={styles.contact}>
                    {resume.personalInfo.email && <Text>{resume.personalInfo.email}</Text>}
                    {resume.personalInfo.phone && <Text>| {resume.personalInfo.phone}</Text>}
                    {resume.personalInfo.location && <Text>| {resume.personalInfo.location}</Text>}
                    {resume.personalInfo.linkedin && <Text>| {resume.personalInfo.linkedin}</Text>}
                    {resume.personalInfo.website && <Text>| {resume.personalInfo.website}</Text>}
                </View>
            </View>

            {resume.summary && (
                <View style={sectionStyle}>
                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                    <Text style={{ color: '#334155' }}>{resume.summary}</Text>
                </View>
            )}

            {resume.experience.length > 0 && (
                <View style={sectionStyle}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {resume.experience.map((exp) => (
                        <View key={exp.id} style={styles.experienceItem}>
                            <View style={styles.row}>
                                <Text style={styles.position}>{exp.position}</Text>
                                <Text style={styles.date}>
                                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                </Text>
                            </View>
                            <Text style={styles.company}>{exp.company} {exp.location ? `| ${exp.location}` : ''}</Text>
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
                <View style={sectionStyle}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {resume.education.map((edu) => (
                        <View key={edu.id} style={styles.experienceItem}>
                            <View style={styles.row}>
                                <Text style={styles.company}>{edu.institution}</Text>
                                <Text style={styles.date}>
                                    {edu.startDate} - {edu.endDate}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 10, color: '#334155' }}>
                                {edu.degree} in {edu.fieldOfStudy}
                                {edu.grade ? ` (GPA: ${edu.grade})` : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {resume.skills.length > 0 && (
                <View style={sectionStyle}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View>
                        {resume.skills.map((skill) => (
                            <View key={skill.id} style={styles.skillGroup}>
                                <Text style={styles.skillCategory}>{skill.category}:</Text>
                                <Text style={styles.skillList}>{skill.items.join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {resume.projects && resume.projects.length > 0 && (
                <View style={sectionStyle}>
                    <Text style={styles.sectionTitle}>Projects</Text>
                    {resume.projects.map((project) => (
                        <View key={project.id} style={styles.experienceItem}>
                            <Text style={styles.position}>{project.name}</Text>
                            <Text style={{ fontSize: 10, color: '#334155', marginBottom: 2 }}>
                                {project.description}
                            </Text>
                            {project.technologies && project.technologies.length > 0 && (
                                <Text style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>
                                    Technologies: {project.technologies.join(', ')}
                                </Text>
                            )}
                            {(project.link || project.github) && (
                                <Text style={{ fontSize: 9, color: '#475569' }}>
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
                <View style={sectionStyle}>
                    <Text style={styles.sectionTitle}>Certifications</Text>
                    {resume.certifications.map((cert) => (
                        <View key={cert.id} style={styles.experienceItem}>
                            <View style={styles.row}>
                                <Text style={styles.position}>{cert.name}</Text>
                                <Text style={styles.date}>{cert.date}</Text>
                            </View>
                            <Text style={styles.company}>{cert.issuer}</Text>
                            {cert.link && <Text style={{ fontSize: 9, color: '#475569' }}>{cert.link}</Text>}
                        </View>
                    ))}
                </View>
            )}
        </Page>
    );
};
