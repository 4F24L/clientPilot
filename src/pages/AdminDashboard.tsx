import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Briefcase, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserStats {
  id: string;
  email: string;
  full_name: string;
  total_leads: number;
  total_projects: number;
  total_support_clients: number;
  last_active: string;
}

export const AdminDashboard = () => {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalProjects: 0,
    totalSupportClients: 0,
  });
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is super admin
    const checkAdmin = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        navigate('/dashboard');
        return;
      }

      fetchUserStats();
    };

    checkAdmin();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // Fetch all users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name, last_active');

      if (usersError) throw usersError;

      // Fetch stats for each user
      const statsPromises = users.map(async (user) => {
        const [leads, projects, supportClients] = await Promise.all([
          supabase.from('leads').select('id').eq('user_id', user.id),
          supabase.from('projects').select('id').eq('user_id', user.id),
          supabase.from('support_clients').select('id').eq('user_id', user.id),
        ]);

        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          total_leads: leads.data?.length || 0,
          total_projects: projects.data?.length || 0,
          total_support_clients: supportClients.data?.length || 0,
          last_active: user.last_active,
        };
      });

      const stats = await Promise.all(statsPromises);
      setUserStats(stats);

      // Calculate total stats
      const totals = stats.reduce(
        (acc, curr) => ({
          totalUsers: acc.totalUsers + 1,
          totalLeads: acc.totalLeads + curr.total_leads,
          totalProjects: acc.totalProjects + curr.total_projects,
          totalSupportClients: acc.totalSupportClients + curr.total_support_clients,
        }),
        { totalUsers: 0, totalLeads: 0, totalProjects: 0, totalSupportClients: 0 }
      );

      setTotalStats(totals);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Clients</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalSupportClients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Support Clients</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.full_name || 'N/A'}</TableCell>
                    <TableCell>{stat.email}</TableCell>
                    <TableCell>{stat.total_leads}</TableCell>
                    <TableCell>{stat.total_projects}</TableCell>
                    <TableCell>{stat.total_support_clients}</TableCell>
                    <TableCell>
                      {stat.last_active
                        ? new Date(stat.last_active).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 