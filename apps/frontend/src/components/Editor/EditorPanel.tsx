import { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../../context/ToastContext';
import { PersonalInfo } from './sections/PersonalInfo';
import { Summary } from './sections/Summary';
import { Experience } from './sections/Experience';
import { Education } from './sections/Education';
import { Skills } from './sections/Skills';
import { Projects } from './sections/Projects';
import { Certifications } from './sections/Certifications';
import { CustomSection } from './sections/CustomSection';
import { TailorModal } from './TailorModal';
import { TrackApplicationModal } from './TrackApplicationModal';
import { ATSScore } from './ATSScore';
import { CoverLetterModal } from './CoverLetterModal';
import { ProfileManager } from '../Profile/ProfileManager';
import { UndoRedoButtons } from './UndoRedoButtons';
import { ConfirmModal } from '../UI/ConfirmModal';
import { Download, FileText, Users, Wand2, XCircle, Save } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from '../PDF/ResumePDF';
import { getDatabase } from '../../services/database/mongodb';
import { v4 } from 'uuid';
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

import ErrorBoundary from '../ErrorBoundary';



export const EditorPanel = () => {

    const { resume, dispatch } = useResume();
    const { addToast } = useToast();
    const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
    const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
    const [showATSScore, setShowATSScore] = useState(false);
    const [showTailorModal, setShowTailorModal] = useState(false);

    // Auto-open modal if we arrive at the editor in tailoring mode (e.g. from Jobs page)
    useEffect(() => {
        if (resume.isTailoring) {
            setShowTailorModal(true);
        }
    }, []); // Run only on mount
    const [showTrackModal, setShowTrackModal] = useState(false);
    const handleSaveApplication = async () => {
        if (!resume.tailoringJob) return;

        try {
            const db = getDatabase();
            await db.initialize();

            await db.createApplication({
                id: v4(),
                userId: 'user123',
                company: resume.tailoringJob.company,
                jobTitle: resume.tailoringJob.title,
                jobUrl: resume.tailoringJob.link,
                location: 'United States',
                status: 'applied',
                appliedDate: new Date(),
                source: 'Kinetic Job Board',
                timeline: [{ status: 'applied', date: new Date() }],
                tags: ['Tailored'],
                notes: `Tailored Resume Version based on AI optimization.`,
                lastUpdated: new Date()
            });
            addToast('success', 'Application saved to tracker!');
            if (resume.isTailoring) {
                setShowTrackModal(true);
            }
        } catch (err) {
            console.error(err);
            addToast('error', 'Failed to save to tracker');
        }
    };

    const handleStartTailoring = () => {
        if (!resume.isTailoring) {
            dispatch({ type: 'START_TAILORING' });
        }
        setShowTailorModal(true);
        setShowATSScore(true);
    };

    const [confirmModal, setConfirmModal] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText?: string;
        cancelText?: string;
        variant?: 'danger' | 'warning' | 'info';
    } | null>(null);

    const handleDiscardTailoring = () => {
        setConfirmModal({
            title: 'Discard Tailoring?',
            message: 'Are you sure you want to discard all tailoring changes? This action cannot be undone.',
            confirmText: 'Discard Changes',
            variant: 'danger',
            onConfirm: () => {
                dispatch({ type: 'DISCARD_TAILORING' });
                setShowATSScore(false);
            }
        });
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
            addToast('success', 'PDF Downloaded successfully');

            // Show track modal if in tailoring mode
            if (resume.isTailoring) {
                setShowTrackModal(true);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            addToast('error', 'Failed to generate PDF. Please try again.');
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
    const handleTrackApplication = async () => {
        console.log('handleTrackApplication called!');
        console.log('resume.tailoringJob:', resume.tailoringJob);
        if (!resume.tailoringJob) {
            console.log('No tailoringJob found, exiting...');
            return;
        }

        try {
            const db = getDatabase();
            await db.initialize();

            await db.createApplication({
                id: v4(),
                userId: 'user123',
                company: resume.tailoringJob.company || 'Unknown Company',
                jobTitle: resume.tailoringJob.title || 'Unknown Position',
                jobDescription: resume.tailoringJob.description || '',
                jobUrl: resume.tailoringJob.link,
                status: 'applied',
                appliedDate: new Date(),
                lastUpdated: new Date(),
                source: 'AI Tailor',
                timeline: [{
                    date: new Date(),
                    status: 'applied',
                    notes: 'Application tracked after tailoring'
                }],
                resumeSnapshot: resume,
                tags: [],
                notes: ''
            });

            console.log('Application saved successfully!');
            addToast('success', `Tracked: ${resume.tailoringJob.title} at ${resume.tailoringJob.company}`);

            console.log('Discarding tailoring...');
            // Reset to base version
            dispatch({ type: 'DISCARD_TAILORING' });
            setShowTrackModal(false);

            // TODO: Navigate to tracking/jobs page
            addToast('info', 'Navigating to jobs tracker...');
        } catch (error) {
            console.error('Error tracking application:', error);
            addToast('error', 'Failed to track application');
        }
    };
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = resume.sections.findIndex((section) => section.id === active.id);
            const newIndex = resume.sections.findIndex((section) => section.id === over.id);

            const newSections = arrayMove(resume.sections, oldIndex, newIndex).map((section, index) => ({
                ...section,
                order: index
            }));

            dispatch({ type: 'REORDER_SECTIONS', payload: newSections });
        }
    };

    // Safety Check: If resume data is missing (e.g. during load or failed parse), show loading state
    if (!resume || !resume.sections || !resume.personalInfo) {
        return (
            <div className="h-full flex items-center justify-center bg-[#111] text-gray-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Loading resume editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#111] border-r border-gray-800 text-gray-200">
            <div className="p-4 border-b border-gray-800 bg-[#111] flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Editor
                    </h2>
                    <button
                        onClick={() => {
                            console.log("Opening Profile Manager...");
                            setIsProfileManagerOpen(true);
                        }}
                        className="ml-4 px-3 py-1.5 text-xs font-medium bg-indigo-900/30 text-indigo-300 rounded-full hover:bg-indigo-900/50 transition-colors flex items-center gap-1 border border-indigo-800"
                    >
                        <Users size={14} />
                        Profiles
                    </button>
                    {resume.isTailoring && (
                        <div className="flex items-center gap-2 ml-4">
                            <div className="px-3 py-1 bg-yellow-900/30 text-yellow-500 text-xs font-medium rounded-full border border-yellow-800 flex items-center gap-1">
                                <span>Tailoring Mode</span>
                                <button onClick={handleDiscardTailoring} className="ml-1 hover:text-red-400" title="Discard Changes">
                                    <XCircle size={14} />
                                </button>
                            </div>
                            {resume.tailoringJob && (
                                <button
                                    onClick={handleSaveApplication}
                                    className="px-3 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded-full border border-green-800 flex items-center gap-1 hover:bg-green-900/50 transition-colors"
                                    title="Save Application to Tracker"
                                >
                                    <Save size={14} />
                                    Save App
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <UndoRedoButtons />



                    <LayoutSettings />

                    <button
                        onClick={handleStartTailoring}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1 ${resume.isTailoring ? 'text-indigo-400 bg-indigo-900/20' : 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20'}`}
                        title="Tailor Resume"
                    >
                        <Wand2 size={20} />
                        <span className="text-sm font-medium hidden md:inline">Tailor</span>
                    </button>
                    <button
                        onClick={() => setIsCoverLetterModalOpen(true)}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20 rounded-lg transition-all"
                        title="Generate Cover Letter"
                    >
                        <FileText size={20} />
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isGeneratingPDF}
                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium text-sm ${isGeneratingPDF ? 'bg-indigo-800 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                    >
                        <Download size={16} />
                        {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111]">
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
                            <ErrorBoundary> {/* Wrap ATSScore component with ErrorBoundary */}
                                <ATSScore />
                            </ErrorBoundary>
                        </div>
                    )}

                    <Summary />

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={(resume.sections || []).map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {(resume.sections || [])
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
                isOpen={showTailorModal}
                onClose={() => {
                    setShowTailorModal(false);
                    setShowATSScore(false);
                }}
                jobDescription={resume.tailoringJob?.description || ''}
            />

            <CoverLetterModal
                isOpen={isCoverLetterModalOpen}
                onClose={() => setIsCoverLetterModalOpen(false)}
            />

            <ProfileManager
                isOpen={isProfileManagerOpen}
                onClose={() => setIsProfileManagerOpen(false)}
            />
            <TrackApplicationModal
                isOpen={showTrackModal}
                onClose={() => {
                    // User clicked "Skip"
                    setConfirmModal({
                        title: 'Skip Tracking?',
                        message: 'Are you sure you don\'t want to track this application? You won\'t be able to see it in your dashboard later.',
                        confirmText: 'Skip Tracking',
                        variant: 'warning',
                        onConfirm: () => {
                            dispatch({ type: 'DISCARD_TAILORING' });
                            setShowTrackModal(false);
                            addToast('info', 'Navigating to jobs page...');
                        }
                    });
                }}
                onTrack={handleTrackApplication}
                jobTitle={resume.tailoringJob?.title}
                company={resume.tailoringJob?.company}
            />
            <ConfirmModal
                isOpen={!!confirmModal}
                onClose={() => setConfirmModal(null)}
                onConfirm={confirmModal?.onConfirm || (() => { })}
                title={confirmModal?.title || ''}
                message={confirmModal?.message || ''}
                confirmText={confirmModal?.confirmText}
                cancelText={confirmModal?.cancelText}
                variant={confirmModal?.variant}
            />
        </div>
    );
};
