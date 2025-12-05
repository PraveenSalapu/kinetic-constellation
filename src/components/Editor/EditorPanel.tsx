import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { PersonalInfo } from './sections/PersonalInfo';
import { Summary } from './sections/Summary';
import { Experience } from './sections/Experience';
import { Education } from './sections/Education';
import { Skills } from './sections/Skills';
import { Projects } from './sections/Projects';
import { Certifications } from './sections/Certifications';
import { CustomSection } from './sections/CustomSection';
import { TailorModal } from './TailorModal';
import { ATSScore } from './ATSScore';
import { CoverLetterModal } from './CoverLetterModal';
import { ProfileManager } from '../Profile/ProfileManager';
import { UndoRedoButtons } from './UndoRedoButtons';
import { Download, FileText, Users, Wand2, LayoutTemplate, XCircle } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from '../PDF/ResumePDF';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSection } from './SortableSection';

import { LayoutSettings } from './LayoutSettings';

export const EditorPanel = () => {
    const { resume, dispatch } = useResume();
    const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
    const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
    const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
    const [showATSScore, setShowATSScore] = useState(false);

    const handleAutoAdjust = () => {
        dispatch({
            type: 'APPLY_LAYOUT',
            payload: {
                fontSize: 9,
                lineHeight: 1.2,
                sectionSpacing: 3,
                margin: { top: 10, right: 10, bottom: 10, left: 10 }
            }
        });
    };

    const handleStartTailoring = () => {
        if (!resume.isTailoring) {
            dispatch({ type: 'START_TAILORING' });
        }
        setShowATSScore(true);
    };

    const handleDiscardTailoring = () => {
        if (confirm('Are you sure you want to discard all tailoring changes?')) {
            dispatch({ type: 'DISCARD_TAILORING' });
            setShowATSScore(false);
        }
    };

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const handleDownload = async () => {
        try {
            console.log('Downloading PDF with resume state:', {
                template: resume.selectedTemplate,
                layout: resume.layout,
                id: resume.id
            });
            setIsGeneratingPDF(true);
            const blob = await pdf(<ResumePDF resume={resume} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = resume.sections.findIndex((section) => section.id === active.id);
            const newIndex = resume.sections.findIndex((section) => section.id === over.id);

            const newSections = arrayMove(resume.sections, oldIndex, newIndex);
            dispatch({ type: 'REORDER_SECTIONS', payload: newSections });
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Editor
                    </h2>
                    <button
                        onClick={() => setIsProfileManagerOpen(true)}
                        className="ml-4 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1 border border-indigo-200"
                    >
                        <Users size={14} />
                        Profiles
                    </button>
                    {resume.isTailoring && (
                        <div className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200 flex items-center gap-1">
                            <span>Tailoring Mode</span>
                            <button onClick={handleDiscardTailoring} className="ml-1 hover:text-red-600" title="Discard Changes">
                                <XCircle size={14} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <UndoRedoButtons />

                    <button
                        onClick={handleAutoAdjust}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-1"
                        title="Auto-Adjust Layout (Single Page)"
                    >
                        <LayoutTemplate size={20} />
                        <span className="text-sm font-medium hidden md:inline">Auto-Adjust</span>
                    </button>

                    <LayoutSettings />

                    <button
                        onClick={handleStartTailoring}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1 ${resume.isTailoring ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        title="Tailor Resume"
                    >
                        <Wand2 size={20} />
                        <span className="text-sm font-medium hidden md:inline">Tailor</span>
                    </button>
                    <button
                        onClick={() => setIsCoverLetterModalOpen(true)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Generate Cover Letter"
                    >
                        <FileText size={20} />
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isGeneratingPDF}
                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium text-sm ${isGeneratingPDF ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        <Download size={16} />
                        {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto p-4 space-y-3 pb-12">
                    <PersonalInfo />

                    {showATSScore && (
                        <div className="mb-3 relative">
                            <button
                                onClick={() => setShowATSScore(false)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={20} />
                            </button>
                            <ATSScore />
                        </div>
                    )}

                    <Summary />

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={resume.sections.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {resume.sections
                                    .filter((section) => section.isVisible)
                                    .map((section) => (
                                        <SortableSection key={section.id} id={section.id}>
                                            {section.id === 'experience' && <Experience />}
                                            {section.id === 'education' && <Education />}
                                            {section.id === 'skills' && <Skills />}
                                            {section.id === 'projects' && <Projects />}
                                            {section.id === 'certifications' && <Certifications />}
                                            {section.id === 'custom' && <CustomSection />}
                                        </SortableSection>
                                    ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <TailorModal
                isOpen={isTailorModalOpen}
                onClose={() => setIsTailorModalOpen(false)}
            />

            <CoverLetterModal
                isOpen={isCoverLetterModalOpen}
                onClose={() => setIsCoverLetterModalOpen(false)}
            />

            <ProfileManager
                isOpen={isProfileManagerOpen}
                onClose={() => setIsProfileManagerOpen(false)}
            />
        </div>
    );
};
