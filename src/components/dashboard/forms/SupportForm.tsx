import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { X, Info } from 'lucide-react';

interface SupportClient {
  id: string;
  client_name: string;
  website: string | null;
  support_plan: string | null;
  start_date: string | null;
  renewal_date: string | null;
  feedback: string | null;
}

interface SupportFormProps {
  client?: SupportClient | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SupportForm = ({ client, onSuccess, onCancel }: SupportFormProps) => {
  const [formData, setFormData] = useState({
    client_name: client?.client_name || '',
    website: client?.website || '',
    support_plan: client?.support_plan || 'basic',
    start_date: client?.start_date || '',
    renewal_date: client?.renewal_date || '',
    feedback: client?.feedback || '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (client) {
        // Update existing client
        const { error } = await supabase
          .from('support_clients')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', client.id);

        if (error) throw error;
        
        toast.success("Support client updated successfully");
      } else {
        // Create new client
        const { error } = await supabase
          .from('support_clients')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;
        
        toast.success("Support client created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving support client:', error);
      toast.error("Failed to save support client");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
          {client ? 'Edit Support Client' : 'Add New Support Client'}
        </h3>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label htmlFor="client_name" className="block text-sm font-medium text-foreground mb-2">
                Client Name
              </label>
              <input
                type="text"
              id="client_name"
                name="client_name"
              value={formData.client_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
              <label htmlFor="website" className="block text-sm font-medium text-foreground mb-2">
                Website
              </label>
              <input
                type="url"
              id="website"
                name="website"
              value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
            />
          </div>
          <div>
              <label htmlFor="support_plan" className="block text-sm font-medium text-foreground mb-2">
                Support Plan
              </label>
            <select
              id="support_plan"
                name="support_plan"
              value={formData.support_plan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
            >
                <option value="">Select Plan</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                required
              />
            </div>
            <div>
              <label htmlFor="renewal_date" className="block text-sm font-medium text-foreground mb-2">
                Renewal Date
              </label>
              <input
                type="date"
                id="renewal_date"
                name="renewal_date"
                value={formData.renewal_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="feedback" className="block text-sm font-medium text-foreground mb-2">
                Remark
              </label>
              <textarea
              id="feedback"
                name="feedback"
              value={formData.feedback}
                onChange={handleChange}
              rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-black bg-white hover:bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
