import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Users, 
  MessageSquare, 
  Award,
  LogOut,
  BarChart3,
  Shield,
  Gift,
  AlertTriangle
} from 'lucide-react';
import ComplaintsManager from '@/components/ComplaintsManager';
import ReportsManager from '@/components/ReportsManager';
import CreditsManager from '@/components/CreditsManager';
import GreenChampion from '@/components/GreenChampion';
import AdminStats from '@/components/AdminStats';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: t('dashboard', 'Overview'), icon: BarChart3 },
    { id: 'complaints', label: t('complaints', 'Complaints'), icon: MessageSquare },
    { id: 'reports', label: t('reports', 'Reports'), icon: AlertTriangle },
    { id: 'credits', label: t('creditsManager', 'Credits Manager'), icon: Gift },
    { id: 'champion', label: t('greenChampion', 'Green Champion'), icon: Award },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'complaints':
        return <ComplaintsManager />;
      case 'reports':
        return <ReportsManager />;
      case 'credits':
        return <CreditsManager />;
      case 'champion':
        return <GreenChampion />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="eco-gradient text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">{t('adminDashboard', 'Admin Dashboard')}</h1>
                <p className="text-sm opacity-90">{t('adminDashboardDesc', 'Manage the EcoWaste system')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Settings className="h-4 w-4" />
                <span className="font-medium">{user?.name}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-eco-green"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="eco-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{t('adminMenu', 'Admin Menu')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab(item.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;