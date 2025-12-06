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
            icon={<User className="text-indigo-400" size={18} />}
            defaultOpen={true}
        >
            <div className="p-4 space-y-4 bg-[#111]">
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={personalInfo.fullName}
                        onChange={handleChange}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="John Doe"
                        required
                    />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                            <Mail size={12} className="inline mr-1" />
                            Email Address <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={personalInfo.email}
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                            <Phone size={12} className="inline mr-1" />
                            Phone Number <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={personalInfo.phone}
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="+1 (555) 123-4567"
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        <MapPin size={12} className="inline mr-1" />
                        Location <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={personalInfo.location}
                        onChange={handleChange}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="San Francisco, CA"
                        required
                    />
                </div>

                <div className="border-t border-gray-800 my-3"></div>

                {/* Professional Links */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                        Professional Links <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                <Linkedin size={12} className="inline mr-1 text-indigo-400" />
                                LinkedIn
                            </label>
                            <input
                                type="text"
                                name="linkedin"
                                value={personalInfo.linkedin || ''}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="linkedin.com/in/johndoe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                <Github size={12} className="inline mr-1" />
                                GitHub
                            </label>
                            <input
                                type="text"
                                name="github"
                                value={personalInfo.github || ''}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="github.com/johndoe"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                <Globe size={12} className="inline mr-1" />
                                Portfolio / Website
                            </label>
                            <input
                                type="text"
                                name="website"
                                value={personalInfo.website || ''}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="www.johndoe.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
};
