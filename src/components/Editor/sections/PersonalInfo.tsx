import { useResume } from '../../../context/ResumeContext';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection';

export const PersonalInfo = () => {
    const { resume, dispatch } = useResume();
    const { personalInfo } = resume;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [name]: value } });
    };

    return (
        <CollapsibleSection
            title="Personal Information"
            icon={<User className="text-primary" size={18} />}
            defaultOpen={true}
        >
            <div className="p-4 space-y-3">
                {/* Full Name */}
                <div>
                    <label className="label-field">
                        Full Name <span className="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={personalInfo.fullName}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="John Doe"
                        required
                    />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-field">
                            <Mail size={14} className="inline mr-1" />
                            Email Address <span className="text-error">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={personalInfo.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="label-field">
                            <Phone size={14} className="inline mr-1" />
                            Phone Number <span className="text-error">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={personalInfo.phone}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="+1 (555) 123-4567"
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="label-field">
                        <MapPin size={14} className="inline mr-1" />
                        Location <span className="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={personalInfo.location}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="San Francisco, CA"
                        required
                    />
                </div>

                <div className="border-t border-border my-3"></div>

                {/* Professional Links */}
                <div>
                    <h3 className="text-sm font-semibold text-text mb-3">
                        Professional Links <span className="label-optional">(Optional)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="label-field">
                                <Linkedin size={14} className="inline mr-1 text-primary" />
                                LinkedIn
                            </label>
                            <input
                                type="text"
                                name="linkedin"
                                value={personalInfo.linkedin || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="linkedin.com/in/johndoe"
                            />
                        </div>
                        <div>
                            <label className="label-field">
                                <Github size={14} className="inline mr-1" />
                                GitHub
                            </label>
                            <input
                                type="text"
                                name="github"
                                value={personalInfo.github || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="github.com/johndoe"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-field">
                                <Globe size={14} className="inline mr-1" />
                                Portfolio / Website
                            </label>
                            <input
                                type="text"
                                name="website"
                                value={personalInfo.website || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="www.johndoe.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
};
