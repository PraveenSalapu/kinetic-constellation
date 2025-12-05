import { Document } from '@react-pdf/renderer';
import type { Resume } from '../../types';
import { ModernPDF } from './templates/ModernPDF';
import { ClassicPDF } from './templates/ClassicPDF';
import { MinimalistPDF } from './templates/MinimalistPDF';

interface ResumePDFProps {
    resume: Resume;
}

export const ResumePDF = ({ resume }: ResumePDFProps) => {
    console.log('ResumePDF rendering with template:', resume.selectedTemplate);

    const renderTemplate = () => {
        switch (resume.selectedTemplate) {
            case 'classic':
                return <ClassicPDF resume={resume} />;
            case 'minimalist':
                return <MinimalistPDF resume={resume} />;
            case 'modern':
            default:
                return <ModernPDF resume={resume} />;
        }
    };

    return (
        <Document>
            {renderTemplate()}
        </Document>
    );
};
