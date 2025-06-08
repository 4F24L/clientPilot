import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Download, ArrowRight, Info, X } from 'lucide-react';
import { LeadForm } from './forms/LeadForm';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  call_status: string | null;
  created_at: string;
  user_id: string;
}

export const LeadsTab = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { user } = useAuthStore();
  const [showStatusInfo, setShowStatusInfo] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) {
        console.log('No user found, skipping fetch');
        return;
      }
      
      setLoading(true);
      try {
        console.log('Fetching leads for user:', user.id);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Fetched leads:', data);
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error("Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(leads.filter(lead => lead.id !== id));
      toast.success("Lead deleted successfully");
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error("Failed to delete lead");
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLead(null);
  };

  const handleConvertToProject = async (lead: Lead) => {
    if (!user) return;

    try {
      // Create new project from lead data
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
        client_name: lead.name,
          contact: lead.phone,
        requirements: 'Website development project',
        first_payment_date: new Date().toISOString().split('T')[0],
        final_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        features_required: 'Responsive design, CMS integration, SEO optimization',
        status: 'planning',
        delivery_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          user_id: user.id,
        });

      if (projectError) throw projectError;

      // Delete the lead
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (deleteError) throw deleteError;

      setLeads(leads.filter(l => l.id !== lead.id));
      toast.success(`${lead.name} converted to project successfully!`);
    } catch (error) {
      console.error('Error converting lead to project:', error);
      toast.error("Failed to convert lead to project");
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Website', 'Address', 'Call Status', 'Created At'];
    const csvData = leads.map(lead => [
        lead.name,
        lead.phone || '',
        lead.website || '',
        lead.address || '',
        lead.call_status || '',
        new Date(lead.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'leads.csv';
    link.click();
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          call_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, call_status: newStatus }
          : lead
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
        <h2 className="text-2xl font-bold">Leads Management</h2>
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
            Add Lead
          </button>
        </div>
      </div>

      <div className="bg-background rounded-lg border">
        <div className="w-full overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Website</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Call Status</span>
                    <button
                      onClick={() => setShowStatusInfo(true)}
                      className="text-blue-500 hover:text-blue-600 focus:outline-none"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/50">
                  <td className="px-4 py-4 text-sm font-medium text-foreground">{lead.name}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{lead.phone || '-'}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {lead.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <div className="max-w-[200px] truncate" title={lead.address || ''}>
                      {lead.address || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <select
                      value={lead.call_status || ''}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm"
                    >
                      <option value="">Select Status</option>
                      <option value="not_contacted">Not Contacted</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleConvertToProject(lead)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <LeadForm
          onCancel={() => {
            setShowForm(false);
            setEditingLead(null);
          }}
          onSuccess={handleFormSuccess}
          lead={editingLead}
        />
      )}

      {showStatusInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Call Status Information</h3>
              <button
                onClick={() => setShowStatusInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Not Contacted:</span> Initial lead, no contact made yet</p>
              <p><span className="font-medium">Contacted:</span> Initial contact has been made</p>
              <p><span className="font-medium">In Progress:</span> Ongoing discussions or negotiations</p>
              <p><span className="font-medium">Converted:</span> Lead has been converted to a project</p>
              <p><span className="font-medium">Lost:</span> Lead is no longer interested or unresponsive</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
