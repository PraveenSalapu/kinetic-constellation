import { useResume } from '../../../context/ResumeContext';

export const MinimalistTemplate = () => {
    const { resume } = useResume();
    const { personalInfo, summary, experience, education, skills, projects, certifications, layout } = resume;

    const defaultLayout = {
        fontSize: 10,
        lineHeight: 1.4,
        sectionSpacing: 5,
        nameSize: 20,
        contactSize: 9,
        margin: { top: 15, right: 15, bottom: 15, left: 15 }
    };

    const currentLayout = layout && typeof layout.fontSize === 'number'
        ? { ...defaultLayout, ...layout }
        : defaultLayout;

    const nameSize = currentLayout.nameSize;
    const contactSize = currentLayout.contactSize;

    const containerStyle = {
        paddingTop: `${currentLayout.margin.top}mm`,
        paddingRight: `${currentLayout.margin.right}mm`,
        paddingBottom: `${currentLayout.margin.bottom}mm`,
        paddingLeft: `${currentLayout.margin.left}mm`,
        fontSize: `${currentLayout.fontSize}pt`,
        lineHeight: currentLayout.lineHeight,
    };

    const sectionStyle = {
        marginBottom: `${currentLayout.sectionSpacing}mm`,
    };

    return (
        <div
            className="bg-white text-black font-sans shadow-lg mx-auto min-h-[297mm]"
            style={{
                width: '210mm',
                ...containerStyle
            }}
        >
            {/* MINIMALIST: Simple name with subtle line */}
            <header style={sectionStyle} className="border-b border-black pb-3">
                <h1 className="font-light text-black mb-2 tracking-wide" style={{ fontSize: `${nameSize}pt`, lineHeight: 1.2 }}>
                    {personalInfo.fullName || 'Your Name'}
                </h1>
                <div className="flex flex-wrap gap-x-6 text-gray-700" style={{ fontSize: `${contactSize}pt` }}>
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                </div>
                {(personalInfo.linkedin || personalInfo.website || personalInfo.github) && (
                    <div className="flex flex-wrap gap-x-6 text-gray-700 mt-1" style={{ fontSize: `${contactSize}pt` }}>
                        {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                        {personalInfo.website && <span>{personalInfo.website}</span>}
                        {personalInfo.github && <span>{personalInfo.github}</span>}
                    </div>
                )}
            </header>

            {/* MINIMALIST: Summary - no header, just text */}
            {summary && (
                <section style={sectionStyle}>
                    <p className="text-black" style={{ fontSize: '1.1em' }}>{summary}</p>
                </section>
            )}

            {/* MINIMALIST: Experience - minimal headers */}
            {experience.length > 0 && (
                <section style={sectionStyle}>
                    <h2 className="font-semibold text-gray-500 uppercase tracking-widest mb-6" style={{ fontSize: '0.85em' }}>
                        Experience
                    </h2>
                    <div className="space-y-6">
                        {experience.map((exp, index) => (
                            <div key={exp.id || index}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-black" style={{ fontSize: '1.1em' }}>{exp.position}</h3>
                                    <span className="text-gray-500 whitespace-nowrap ml-4" style={{ fontSize: '0.85em' }}>
                                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline mb-3">
                                    <span className="text-gray-700">{exp.company}</span>
                                    {exp.location && <span className="text-gray-500" style={{ fontSize: '0.85em' }}>{exp.location}</span>}
                                </div>
                                <ul className="space-y-2">
                                    {exp.description.map((bullet, idx) => (
                                        <li key={idx} className="text-gray-800 pl-0">
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* MINIMALIST: Education */}
            {education.length > 0 && (
                <section style={sectionStyle}>
                    <h2 className="font-semibold text-gray-500 uppercase tracking-widest mb-6" style={{ fontSize: '0.85em' }}>
                        Education
                    </h2>
                    <div className="space-y-4">
                        {education.map((edu, index) => (
                            <div key={edu.id || index}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-black" style={{ fontSize: '1.1em' }}>{edu.institution}</h3>
                                    <span className="text-gray-500 whitespace-nowrap" style={{ fontSize: '0.85em' }}>
                                        {edu.startDate} – {edu.endDate}
                                    </span>
                                </div>
                                <div className="text-gray-700">
                                    {edu.degree} in {edu.fieldOfStudy}
                                    {edu.grade && <span className="text-gray-500"> • {edu.grade}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* MINIMALIST: Skills - clean list */}
            {skills.length > 0 && (
                <section style={sectionStyle}>
                    <h2 className="font-semibold text-gray-500 uppercase tracking-widest mb-6" style={{ fontSize: '0.85em' }}>
                        Skills
                    </h2>
                    <div className="space-y-3">
                        {skills.map((skillGroup, index) => (
                            <div key={skillGroup.id || index}>
                                <div className="font-semibold text-black mb-1">{skillGroup.category}</div>
                                <div className="text-gray-700">{skillGroup.items.join('  •  ')}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* MINIMALIST: Projects */}
            {projects && projects.length > 0 && (
                <section style={sectionStyle}>
                    <h2 className="font-semibold text-gray-500 uppercase tracking-widest mb-6" style={{ fontSize: '0.85em' }}>
                        Projects
                    </h2>
                    <div className="space-y-5">
                        {projects.map((project, index) => (
                            <div key={project.id || index}>
                                <h3 className="font-semibold text-black mb-2" style={{ fontSize: '1.1em' }}>{project.name}</h3>
                                <p className="text-gray-800 mb-2">{project.description}</p>
                                {project.technologies && project.technologies.length > 0 && (
                                    <p className="text-gray-500 mb-2" style={{ fontSize: '0.85em' }}>
                                        {project.technologies.join('  •  ')}
                                    </p>
                                )}
                                {(project.link || project.github) && (
                                    <div className="text-gray-500" style={{ fontSize: '0.85em' }}>
                                        {project.link && <span>{project.link}</span>}
                                        {project.link && project.github && <span>  •  </span>}
                                        {project.github && <span>{project.github}</span>}
                                    </div>
                                )}
                                {project.bullets && project.bullets.length > 0 && (
                                    <ul className="space-y-2 mt-2">
                                        {project.bullets.map((bullet, idx) => (
                                            <li key={idx} className="text-gray-800">
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* MINIMALIST: Certifications */}
            {certifications && certifications.length > 0 && (
                <section style={sectionStyle}>
                    <h2 className="font-semibold text-gray-500 uppercase tracking-widest mb-6" style={{ fontSize: '0.85em' }}>
                        Certifications
                    </h2>
                    <div className="space-y-3">
                        {certifications.map((cert, index) => (
                            <div key={cert.id || index}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-black" style={{ fontSize: '1.1em' }}>{cert.name}</h3>
                                    <span className="text-gray-500 whitespace-nowrap ml-4" style={{ fontSize: '0.85em' }}>{cert.date}</span>
                                </div>
                                <div className="text-gray-700 mt-0.5">
                                    {cert.issuer}
                                    {cert.link && <span className="text-gray-500 ml-2" style={{ fontSize: '0.85em' }}>• {cert.link}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
