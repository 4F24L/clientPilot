import { useEffect, useState } from "react";
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  email: string | null;
  role: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || profile?.role !== 'super_admin') {
          navigate('/');
          return;
        }

        fetchProfiles();
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/');
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedProfile || !newRole) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      toast.success('Role updated successfully');
      fetchProfiles();
      setSelectedProfile(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{profile.email}</p>
                  <p className="text-sm text-gray-500">Current Role: {profile.role || 'No role'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedProfile?.id === profile.id ? newRole : ''}
                    onValueChange={(value: string) => {
                      setSelectedProfile(profile);
                      setNewRole(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>User Roles</SelectLabel>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {selectedProfile?.id === profile.id && (
                    <Button onClick={handleRoleChange}>
                      Update Role
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;