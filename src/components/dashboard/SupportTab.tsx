import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Download, Info, X } from 'lucide-react';
import { SupportForm } from './forms/SupportForm';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

interface SupportClient {
  id: string;
  client_name: string;
  website: string | null;
  support_plan: string | null;
  start_date: string | null;
  renewal_date: string | null;
  feedback: string | null;
  created_at: string;
  user_id: string;
}

export const SupportTab = () => {
  const [supportClients, setSupportClients] = useState<SupportClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<SupportClient | null>(null);
  const { user } = useAuthStore();
  const [showPlanInfo, setShowPlanInfo] = useState(false);

  useEffect(() => {
    fetchSupportClients();
  }, [user]);

  const fetchSupportClients = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportClients(data || []);
    } catch (error) {
      console.error('Error fetching support clients:', error);
      toast.error('Failed to fetch support clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('support_clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSupportClients(supportClients.filter(client => client.id !== id));
      toast.success('Support client deleted successfully');
    } catch (error) {
      console.error('Error deleting support client:', error);
      toast.error('Failed to delete support client');
    }
  };

  const handleEdit = (client: SupportClient) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingClient(null);
    fetchSupportClients();
  };

  const exportToCSV = () => {
    const headers = ['Client Name', 'Website', 'Support Plan', 'Start Date', 'Renewal Date', 'Remark'];
    const csvData = supportClients.map(client => [
        client.client_name,
        client.website || '',
        client.support_plan || '',
        client.start_date || '',
        client.renewal_date || '',
        client.feedback || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'support_clients.csv';
    link.click();
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
        <h2 className="text-2xl font-bold">Support Clients</h2>
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
            Add Client
          </button>
        </div>
      </div>

      <div className="bg-background rounded-lg border">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-muted">
                <tr>
                  <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Name</th>
                  <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Website</th>
                  <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Support Plan</span>
                      <button
                        onClick={() => setShowPlanInfo(true)}
                        className="text-blue-500 hover:text-blue-600 focus:outline-none"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                  <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</th>
                  <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Renewal Date</th>
                  <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Remark</th>
                  <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
            {supportClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{client.client_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {client.website}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{client.support_plan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {client.start_date ? new Date(client.start_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {client.renewal_date ? new Date(client.renewal_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{client.feedback || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
                          title="Edit Support"
                        >
                      <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors"
                          title="Delete Support"
                        >
                      <Trash2 className="h-4 w-4" />
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
        <SupportForm
          client={editingClient}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}

      {/* Support Plan Info Modal */}
      {showPlanInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl h-[75vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Support Plan Information</h3>
              <button
                onClick={() => setShowPlanInfo(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Basic Plan</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Essential website maintenance and updates</li>
                    <li>Basic technical support</li>
                    <li>Monthly security checks</li>
                    <li>Regular backups</li>
                    <li>Email support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Standard Plan</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>All Basic Plan features</li>
                    <li>Priority technical support</li>
                    <li>Weekly security monitoring</li>
                    <li>Content updates (up to 5 hours/month)</li>
                    <li>Performance optimization</li>
                    <li>Phone and email support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">Premium Plan</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>All Standard Plan features</li>
                    <li>24/7 emergency support</li>
                    <li>Daily security monitoring</li>
                    <li>Unlimited content updates</li>
                    <li>Advanced performance optimization</li>
                    <li>Dedicated support manager</li>
                    <li>Priority response time</li>
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
