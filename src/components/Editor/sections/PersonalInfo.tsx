import { useResume } from '../../../context/ResumeContext';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

export const PersonalInfo = () => {
    const { resume, dispatch } = useResume();
    const { personalInfo } = resume;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [name]: value } });
    };

    return (
        <div className="bg-white p-6 rounded-xl space-y-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="text-white" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-500">Your contact details and professional links</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={personalInfo.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="e.g., John Doe"
                        required
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={personalInfo.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="e.g., john@example.com"
                        required
                    />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="e.g., +1 (555) 123-4567"
                        required
                    />
                </div>

                {/* Location */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        Location <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={personalInfo.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="e.g., San Francisco, CA"
                        required
                    />
                </div>

                {/* Professional Links Section */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Professional Links (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* LinkedIn */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Linkedin size={14} className="text-blue-600" />
                                LinkedIn Profile
                            </label>
                            <input
                                type="text"
                                name="linkedin"
                                value={personalInfo.linkedin || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                placeholder="e.g., linkedin.com/in/johndoe"
                            />
                        </div>

                        {/* GitHub */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Github size={14} className="text-gray-900" />
                                GitHub Profile
                            </label>
                            <input
                                type="text"
                                name="github"
                                value={personalInfo.github || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                placeholder="e.g., github.com/johndoe"
                            />
                        </div>

                        {/* Website */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Globe size={14} className="text-purple-600" />
                                Personal Website / Portfolio
                            </label>
                            <input
                                type="text"
                                name="website"
                                value={personalInfo.website || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                placeholder="e.g., www.johndoe.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
