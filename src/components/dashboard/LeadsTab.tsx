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
    console.log('Current user:', user);
    fetchLeads();
  }, [user]);

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
    fetchLeads();
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
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-muted">
                <tr>
                  <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Website</th>
                  <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</th>
                  <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                  <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
            {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{lead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{lead.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {lead.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{lead.address || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.call_status || ''}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="px-2 py-1 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Status</option>
                        <option value="not_called">Not Called</option>
                        <option value="called">Called</option>
                        <option value="callback">Callback</option>
                        <option value="not_interested">Not Interested</option>
                        <option value="interested">Interested</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
                          title="Edit Lead"
                        >
                      <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
                              await handleDelete(lead.id);
                            }
                          }}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors"
                          title="Delete Lead"
                        >
                      <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleConvertToProject(lead)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white border border-green-700 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors"
                          title="Convert to Project"
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
      </div>

      {showForm && (
        <LeadForm
          lead={editingLead}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingLead(null);
          }}
        />
      )}

      {/* Status Info Modal */}
      {showStatusInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl h-[75vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Call Status Information</h3>
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
                  <h4 className="font-medium text-blue-500 mb-2">Not Called</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Initial contact has not been made with the lead</li>
                    <li>Lead is in the initial stage of the pipeline</li>
                    <li>Requires first contact to be established</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Called</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Initial contact has been made with the lead</li>
                    <li>Basic information has been exchanged</li>
                    <li>Initial interest level has been assessed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Callback</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Lead has requested a follow-up call at a later time</li>
                    <li>Specific callback time has been scheduled</li>
                    <li>Requires follow-up action at the scheduled time</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Not Interested</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Lead has declined further contact or services</li>
                    <li>No immediate opportunity for conversion</li>
                    <li>May be recontacted after a cooling period</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Interested</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Lead has shown interest and is ready for project discussion</li>
                    <li>Ready to move forward with detailed requirements</li>
                    <li>Potential for conversion to project</li>
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
