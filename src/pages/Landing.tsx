import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Users, Target, Shield } from 'lucide-react';
import { signInWithGoogle } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ClientPilot</h1>
          </div>
          <button
            onClick={handleGoogleSignIn}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Freelance Business
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Manage leads, track projects, and maintain support clients all in one powerful dashboard. 
            Built for freelancers and service providers who value efficiency.
          </p>
          
          <button 
            onClick={handleGoogleSignIn}
            className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Get Started with Google →
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <Target className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Lead Management</h3>
            <p className="text-gray-600">
              Track potential clients, manage contact information, and monitor call status to convert more leads.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <Building2 className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Project Tracking</h3>
            <p className="text-gray-600">
              Organize active website projects, track deliverables, payment schedules, and project status.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <Users className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Support Clients</h3>
            <p className="text-gray-600">
              Maintain ongoing support relationships, track renewal dates, and manage client feedback.
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center mt-16 space-x-2 text-gray-500">
          <Shield className="h-5 w-5" />
          <span>Secured with Google Authentication & Supabase</span>
        </div>
      </main>
    </div>
  );
};

export default Landing;
