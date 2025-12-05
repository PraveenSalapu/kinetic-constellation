import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '../../../types';
import { renderPDFSection } from '../SectionRenderer';

export const ClassicPDF = ({ resume }: { resume: Resume }) => {
    console.log('ClassicPDF rendering with layout:', resume.layout);
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

    const baseFontSize = layout.fontSize;
    const lineHeight = layout.lineHeight;
    const sectionGap = (layout.sectionSpacing || 5) * mmToPt;
    const nameSize = layout.nameSize || (baseFontSize + 10);
    const contactSize = layout.contactSize || (baseFontSize * 0.9);

    const styles = StyleSheet.create({
        page: {
            paddingTop: marginTop,
            paddingRight: marginRight,
            paddingBottom: marginBottom,
            paddingLeft: marginLeft,
            fontFamily: 'Times-Roman',
            fontSize: baseFontSize,
            color: '#000',
            lineHeight: lineHeight,
        },
        header: {
            marginBottom: sectionGap,
            borderBottom: '2px solid #000',
            paddingBottom: 10,
            textAlign: 'center',
        },
        name: {
            fontSize: nameSize,
            fontWeight: 'bold',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        contact: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
            fontSize: contactSize,
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
            fontStyle: 'italic',
        },
        position: {
            fontSize: baseFontSize,
            fontStyle: 'italic',
        },
        date: {
            fontSize: baseFontSize - 1,
        },
        bullet: {
            flexDirection: 'row',
            marginBottom: 3,
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

    const pageSize = resume.pageSize || 'A4';

    return (
        <Page size={pageSize} style={styles.page}>
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

            {orderedSections.map((section) => renderPDFSection(section.id, resume, styles))}
        </Page>
    );
};
