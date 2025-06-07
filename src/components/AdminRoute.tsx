import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      console.log('Checking admin role for user:', user?.id);
      
      if (!user) {
        console.log('No user found');
        setCheckingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          throw error;
        }

        console.log('Profile data:', data);
        setIsAdmin(data?.role === 'super_admin');
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [user]);

  useEffect(() => {
    console.log('Auth state:', { loading, user: user?.id, isAdmin, checkingRole });
    
    if (!loading && !user) {
      console.log('No user, redirecting to login');
      navigate('/');
    } else if (!checkingRole && !isAdmin) {
      console.log('Not admin, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, loading, isAdmin, checkingRole, navigate]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}; 