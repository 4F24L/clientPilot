import { useThemeStore } from '@/stores/themeStore';
import { Sun, Moon } from 'lucide-react';
import { LeadsTab } from '@/components/dashboard/LeadsTab';
import { ProjectsTab } from '@/components/dashboard/ProjectsTab';
import { SupportTab } from '@/components/dashboard/SupportTab';
import { useDashboardStore } from '@/stores/dashboardStore';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { useEffect } from 'react';

type TabId = 'leads' | 'projects' | 'support';

const Dashboard = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { activeTab, setActiveTab } = useDashboardStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const tabs = [
    { id: 'leads' as TabId, label: 'Leads' },
    { id: 'projects' as TabId, label: 'Projects' },
    { id: 'support' as TabId, label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">ClientPilot</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-muted"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </button>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'support' && <SupportTab />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
