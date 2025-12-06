import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, Calendar, Briefcase, MapPin, Link as LinkIcon } from 'lucide-react';
import { getDatabase, type ApplicationRecord } from '../../services/database/mongodb';
import { v4 as uuidv4 } from 'uuid';

interface ApplicationTrackerProps {
  userId: string;
}

export function ApplicationTracker({ userId }: ApplicationTrackerProps) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ApplicationRecord> & { salaryText?: string; notes?: string }>({
    userId,
    company: '',
    jobTitle: '',
    jobUrl: '',
    location: '',
    salaryText: '',
    status: 'saved',
    appliedDate: new Date(),
    notes: '',
  });

  const db = getDatabase();

  useEffect(() => {
    loadApplications();
  }, [userId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      await db.initialize();
      const apps = await db.getAllApplications(userId);
      setApplications(apps.sort((a, b) => {
        const dateA = a.appliedDate ? new Date(a.appliedDate).getTime() : 0;
        const dateB = b.appliedDate ? new Date(b.appliedDate).getTime() : 0;
        return dateB - dateA;
      }));
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { salaryText, notes, ...appData } = formData;
      const updatedData = {
        ...appData,
        // Store salary as plain text in a separate notes field for now
        // In production, you'd parse this into the proper salary object
      };

      if (editingId) {
        await db.updateApplication(editingId, updatedData);
      } else {
        const newApp: ApplicationRecord = {
          id: uuidv4(),
          userId,
          company: appData.company || '',
          jobTitle: appData.jobTitle || '',
          jobUrl: appData.jobUrl,
          location: appData.location,
          status: appData.status || 'saved',
          appliedDate: appData.appliedDate || new Date(),
          source: 'Manual Entry',
          timeline: [{
            date: new Date(),
            status: 'created',
          }],
          tags: [],
          notes: notes || '',
          lastUpdated: new Date(),
        };
        await db.createApplication(newApp);
      }

      await loadApplications();
      resetForm();
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const handleEdit = (app: ApplicationRecord) => {
    setEditingId(app.id);
    setFormData(app);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await db.deleteApplication(id);
        await loadApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      userId,
      company: '',
      jobTitle: '',
      jobUrl: '',
      location: '',
      salaryText: '',
      status: 'saved',
      appliedDate: new Date(),
      notes: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-200">Application Tracker</h2>
          <p className="text-gray-400 mt-1">Track all your job applications in one place</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Application'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#111] border border-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            {editingId ? 'Edit Application' : 'Add New Application'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Company *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-600"
                placeholder="Google, Microsoft, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-600"
                placeholder="Software Engineer, Product Manager, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Job URL
              </label>
              <input
                type="url"
                value={formData.jobUrl || ''}
                onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-600"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-600"
                placeholder="San Francisco, Remote, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Salary Range (Optional)
              </label>
              <input
                type="text"
                value={formData.salaryText || ''}
                onChange={(e) => setFormData({ ...formData, salaryText: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-600"
                placeholder="$100k - $150k"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationRecord['status'] })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Applied Date
              </label>
              <input
                type="date"
                value={formData.appliedDate && formData.appliedDate instanceof Date ? formData.appliedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, appliedDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors shadow-none"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Save'} Application
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-[#111] border border-gray-800 rounded-lg shadow">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-200 mb-2">No applications yet</h3>
          <p className="text-gray-400 mb-4">Start tracking your job applications to get insights</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Add Your First Application
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-[#111] border border-gray-800 rounded-lg shadow-sm p-6 hover:border-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">{app.jobTitle}</h3>
                      <p className="text-gray-400">{app.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 ml-8">
                    {app.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {app.location}
                      </div>
                    )}
                    {app.appliedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </div>
                    )}
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 hover:underline"
                      >
                        <LinkIcon className="w-4 h-4" />
                        View Job
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${app.status === 'saved' ? 'bg-gray-900/50 text-gray-400 border-gray-800' :
                    app.status === 'applied' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                      app.status === 'screening' ? 'bg-purple-900/20 text-purple-400 border-purple-900/30' :
                        app.status === 'interviewing' ? 'bg-orange-900/20 text-orange-400 border-orange-900/30' :
                          app.status === 'offer' ? 'bg-green-900/20 text-green-400 border-green-900/30' :
                            app.status === 'rejected' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                              app.status === 'accepted' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                                'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                  <button
                    onClick={() => handleEdit(app)}
                    className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
