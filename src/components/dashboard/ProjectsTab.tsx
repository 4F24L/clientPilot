import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Download, ArrowRight, Info, X } from 'lucide-react';
import { ProjectForm } from './forms/ProjectForm';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

interface Project {
  id: string;
  client_name: string;
  contact: string | null;
  requirements: string | null;
  first_payment_date: string | null;
  final_payment_date: string | null;
  features_required: string | null;
  status: string | null;
  delivery_date: string | null;
  created_at: string;
  user_id: string;
}

export const ProjectsTab = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { user } = useAuthStore();
  const [showStatusInfo, setShowStatusInfo] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.filter(project => project.id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("Failed to delete project");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProject(null);
    fetchProjects();
  };

  const handleMoveToSupport = async (project: Project) => {
    if (!user) return;

    try {
      // Create new support client from project data
      const { error: supportError } = await supabase
        .from('support_clients')
        .insert({
        client_name: project.client_name,
        website: `https://${project.client_name.toLowerCase().replace(/\s+/g, '')}.com`,
        support_plan: 'standard',
        start_date: new Date().toISOString().split('T')[0],
        renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        feedback: 'Great project delivery, looking forward to ongoing support',
          user_id: user.id,
        });

      if (supportError) throw supportError;

      // Update project status to completed
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'completed' })
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Refresh projects list
      fetchProjects();

      toast.success(`${project.client_name} moved to support clients successfully!`);
    } catch (error) {
      console.error('Error moving project to support:', error);
      toast.error("Failed to move project to support");
    }
  };

  const exportToCSV = () => {
    const headers = ['Client Name', 'Contact', 'Requirements', 'First Payment', 'Final Payment', 'Status', 'Delivery Date'];
    const csvData = projects.map(project => [
      project.client_name,
      project.contact || '',
      project.requirements || '',
      project.first_payment_date || '',
      project.final_payment_date || '',
      project.status || '',
      project.delivery_date || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'projects.csv';
    link.click();
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;
      
      // Update local state
      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus }
          : project
      ));
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </button>
        </div>
      </div>

      <div className="bg-background rounded-lg border">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Requirements</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">First Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Final Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <button
                        onClick={() => setShowStatusInfo(true)}
                        className="text-blue-500 hover:text-blue-600 focus:outline-none"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
            {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{project.client_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{project.contact || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{project.requirements || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {project.first_payment_date ? new Date(project.first_payment_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {project.final_payment_date ? new Date(project.final_payment_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={project.status || ''}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                        className="px-2 py-1 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Status</option>
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {project.delivery_date ? new Date(project.delivery_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {project.status !== 'completed' && (
                          <button
                        onClick={() => handleMoveToSupport(project)}
                            className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white border border-green-700 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors"
                            title="Move to Support"
                      >
                        <ArrowRight className="h-4 w-4" />
                          </button>
                    )}
                  </div>
                    </td>
                  </tr>
            ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <ProjectForm
          project={editingProject}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Status Info Modal */}
      {showStatusInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl h-[75vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Project Status Information</h3>
              <button
                onClick={() => setShowStatusInfo(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Planning</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Project requirements and scope are being defined</li>
                    <li>Initial discussions and planning phase</li>
                    <li>Timeline and resource allocation being established</li>
                    <li>Budget and deliverables are being finalized</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">In Progress</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Active development is underway</li>
                    <li>Project is being built according to specifications</li>
                    <li>Regular updates and progress tracking</li>
                    <li>Client feedback is being incorporated</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Completed</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Project has been delivered to the client</li>
                    <li>All deliverables have been completed</li>
                    <li>Ready for support or maintenance phase</li>
                    <li>Client sign-off has been obtained</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
