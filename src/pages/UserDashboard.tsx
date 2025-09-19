import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Recycle, 
  Gift, 
  Users, 
  MessageSquare, 
  Award,
  LogOut,
  Video,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import ComplaintForm from '@/components/ComplaintForm';
import MyComplaints from '@/components/MyComplaints';
import WorkersList from '@/components/WorkersList';
import ReportForm from '@/components/ReportForm';
import CreditsSection from '@/components/CreditsSection';
import AwarenessVideo from '@/components/AwarenessVideo';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user, logout, updateCredits } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Check if user has seen the awareness video
    const hasSeenVideo = localStorage.getItem('hasSeenVideo');
    if (!hasSeenVideo) {
      setShowVideo(true);
    }
  }, []);

  const handleVideoComplete = () => {
    localStorage.setItem('hasSeenVideo', 'true');
    setShowVideo(false);
    toast({
  title: t('welcome'),
  description: t('awarenessComplete', 'You\'ve completed the awareness training. Start making a difference!'),
    });
  };

  const menuItems = [
    { id: 'overview', label: t('dashboard', 'Overview'), icon: Recycle },
    { id: 'complaint', label: t('reportIssue'), icon: Camera },
    { id: 'my-complaints', label: t('myReports'), icon: MessageSquare },
    { id: 'workers', label: t('findWorkers'), icon: Users },
    { id: 'credits', label: t('myCredits'), icon: Gift },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'complaint':
        return <ComplaintForm onSuccess={() => setActiveTab('my-complaints')} />;
      case 'my-complaints':
        return <MyComplaints />;
      case 'workers':
        return <WorkersList />;
      case 'credits':
        return <CreditsSection />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  if (showVideo) {
    return (
      <AwarenessVideo 
        onComplete={handleVideoComplete}
        onSkip={handleVideoComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="eco-gradient text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Recycle className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">EcoWaste</h1>
                <p className="text-sm opacity-90">{t('welcome')}, {user?.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Star className="h-4 w-4" />
                <span className="font-medium">{user?.credits} {t('credits')}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVideo(true)}
                className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-eco-green"
              >
                <Video className="h-4 w-4 mr-2" />
                {t('watchVideo', 'Watch Video')}
              </Button>
              
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
                <CardTitle className="text-lg">{t('dashboard', 'Navigation')}</CardTitle>
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

// Dashboard Overview Component
const DashboardOverview = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-eco-dark">{t('dashboardOverview', 'Dashboard Overview')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('dashboardDesc', 'Track your environmental impact and manage waste reports')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="eco-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-eco-light">
                <Gift className="h-6 w-6 text-eco-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('totalCredits')}</p>
                <p className="text-2xl font-bold text-eco-green">{user?.credits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-eco-light">
                <MessageSquare className="h-6 w-6 text-eco-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('reportsSubmitted', 'Reports Submitted')}</p>
                <p className="text-2xl font-bold text-eco-green">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-eco-light">
                <Award className="h-6 w-6 text-eco-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('ecoLevel', 'Eco Level')}</p>
                <p className="text-2xl font-bold text-eco-green">
                  {user?.credits && user.credits >= 100 ? t('champion', 'Champion') : 
                   user?.credits && user.credits >= 50 ? t('hero', 'Hero') : t('beginner', 'Beginner')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle>{t('quickActions')}</CardTitle>
          <CardDescription>
            {t('getStarted')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="border-2 border-dashed border-eco-green hover:bg-eco-light eco-transition cursor-pointer"
              onClick={() => setActiveTab('complaint')}
            >
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-eco-green mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('reportWasteIssue', 'Report Waste Issue')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('reportWasteDesc', 'Take a photo and report waste management problems in your area')}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 border-dashed border-eco-accent hover:bg-eco-light eco-transition cursor-pointer"
              onClick={() => setActiveTab('workers')}
            >
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-eco-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('findWorkers')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('findWorkersDesc', 'Connect with local waste collectors and compare prices')}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Tip */}
      <Card className="eco-shadow eco-gradient-subtle border-eco-green">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-eco-green/20">
              <Recycle className="h-6 w-6 text-eco-green" />
            </div>
            <div>
              <h3 className="font-semibold text-eco-dark mb-2">💡 {t('ecoTipTitle', 'Eco Tip of the Day')}</h3>
              <p className="text-sm text-eco-dark/80">
                {t('ecoTipDesc', 'Did you know? Recycling one aluminum can saves enough energy to power a TV for 3 hours! Start segregating your waste today and earn credits while helping the environment.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;