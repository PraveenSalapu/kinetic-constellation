import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '../../../types';
import { renderPDFSection } from '../SectionRenderer';

export const ModernPDF = ({ resume }: { resume: Resume }) => {
    console.log('ModernPDF rendering with layout:', resume.layout);
    // Default values if layout is missing or legacy
    const defaultLayout = {
        fontSize: 10,
        lineHeight: 1.4,
        sectionSpacing: 5,
        nameSize: 24,
        contactSize: 9,
        margin: { top: 15, right: 15, bottom: 15, left: 15 }
    };

    const layout = resume.layout && typeof resume.layout.fontSize === 'number'
        ? { ...defaultLayout, ...resume.layout }
        : defaultLayout;

    // Get sections in the user's custom order
    const orderedSections = resume.sections
        .filter(s => s.isVisible)
        .sort((a, b) => a.order - b.order);

    // Convert mm to pt for margins (1mm = 2.835pt)
    const mmToPt = 2.835;
    const marginTop = (layout.margin?.top || 15) * mmToPt;
    const marginRight = (layout.margin?.right || 15) * mmToPt;
    const marginBottom = (layout.margin?.bottom || 15) * mmToPt;
    const marginLeft = (layout.margin?.left || 15) * mmToPt;

    // Dynamic styles based on layout
    const nameSize = layout.nameSize;
    const contactSize = layout.contactSize;

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
        borderBottomStyle: 'solid' as const,
        paddingBottom: 10,
    };

    const sectionStyle = {
        marginBottom: (layout.sectionSpacing || 5) * mmToPt,
    };

    const styles = StyleSheet.create({
        name: {
            fontSize: nameSize,
            fontWeight: 'bold',
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 6,
        },
        contact: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            fontSize: contactSize,
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

    const pageSize = resume.pageSize || 'A4';

    return (
        <Page size={pageSize} style={pageStyle}>
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

            {orderedSections.map((section) => renderPDFSection(section.id, resume, styles))}
        </Page>
    );
};
