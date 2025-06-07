import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

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
}

interface ProjectFormProps {
  project?: Project | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProjectForm = ({ project, onSuccess, onCancel }: ProjectFormProps) => {
  const [formData, setFormData] = useState({
    client_name: project?.client_name || '',
    contact: project?.contact || '',
    requirements: project?.requirements || '',
    first_payment_date: project?.first_payment_date || '',
    final_payment_date: project?.final_payment_date || '',
    features_required: project?.features_required || '',
    status: project?.status || 'planning',
    delivery_date: project?.delivery_date || '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (project) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id);

        if (error) throw error;
        
        toast.success("Project updated successfully");
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;
        
        toast.success("Project created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error("Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
          {project ? 'Edit Project' : 'Add New Project'}
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
              <label htmlFor="contact" className="block text-sm font-medium text-foreground mb-2">
                Contact
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-foreground mb-2">
                Requirements
              </label>
              <textarea
              id="requirements"
                name="requirements"
              value={formData.requirements}
                onChange={handleChange}
              rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
              <label htmlFor="features_required" className="block text-sm font-medium text-foreground mb-2">
                Features Required
              </label>
              <textarea
              id="features_required"
                name="features_required"
              value={formData.features_required}
                onChange={handleChange}
              rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
            <div>
              <label htmlFor="first_payment_date" className="block text-sm font-medium text-foreground mb-2">
                First Payment Date
              </label>
              <input
                type="date"
                id="first_payment_date"
                name="first_payment_date"
                value={formData.first_payment_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="final_payment_date" className="block text-sm font-medium text-foreground mb-2">
                Final Payment Date
              </label>
              <input
                type="date"
                id="final_payment_date"
                name="final_payment_date"
                value={formData.final_payment_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="delivery_date" className="block text-sm font-medium text-foreground mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                id="delivery_date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
              />
            </div>
          <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
            <select
              id="status"
                name="status"
              value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <option value="">Select Status</option>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
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
              {loading ? 'Saving...' : project ? 'Update Project' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
