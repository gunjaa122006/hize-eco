import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Gift,
  Target,
  Activity,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalUsers: number;
  totalComplaints: number;
  totalReports: number;
  totalCredits: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  pendingReports: number;
  activeUsers: number;
}

const AdminStats = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalComplaints: 0,
    totalReports: 0,
    totalCredits: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    pendingReports: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [{ data: users, error: usersError }, { data: complaints, error: complaintsError }, { data: reports, error: reportsError }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('complaints').select('*'),
        supabase.from('reports').select('*')
      ]);
      
      if (usersError) throw usersError;
      if (complaintsError) throw complaintsError;
      if (reportsError) throw reportsError;
      
      setStats({
        totalUsers: users?.length || 0,
        totalComplaints: complaints?.length || 0,
        totalReports: reports?.length || 0,
        totalCredits: users?.reduce((sum: number, user: any) => sum + user.credits, 0) || 0,
        pendingComplaints: complaints?.filter((c: any) => c.status === 'pending').length || 0,
        resolvedComplaints: complaints?.filter((c: any) => c.status === 'completed').length || 0,
        pendingReports: reports?.filter((r: any) => r.status === 'pending').length || 0,
        activeUsers: users?.filter((u: any) => u.credits > 0).length || 0
      });
    } catch (error) {
      toast({
        title: "Error loading statistics",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    if (stats.totalComplaints === 0) return 0;
    return Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100);
  };

  const getUserEngagement = () => {
    if (stats.totalUsers === 0) return 0;
    return Math.round((stats.activeUsers / stats.totalUsers) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-eco-dark">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-2">Loading system statistics...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-eco-dark">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">
          Monitor system performance and user activity
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="eco-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-eco-light">
                <Users className="h-6 w-6 text-eco-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-eco-green">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-eco-light">
                <MessageSquare className="h-6 w-6 text-eco-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold text-eco-accent">{stats.totalComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-eco-light">
                <AlertTriangle className="h-6 w-6 text-eco-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reports</p>
                <p className="text-2xl font-bold text-eco-warning">{stats.totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-eco-light">
                <Gift className="h-6 w-6 text-eco-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold text-eco-success">{stats.totalCredits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="eco-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-eco-green" />
              Complaint Resolution Rate
            </CardTitle>
            <CardDescription>
              Percentage of complaints that have been resolved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Progress</span>
                <span>{getCompletionRate()}%</span>
              </div>
              <Progress value={getCompletionRate()} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-eco-light rounded-lg">
                <CheckCircle className="h-5 w-5 text-eco-success mx-auto mb-1" />
                <p className="font-medium">{stats.resolvedComplaints}</p>
                <p className="text-muted-foreground">Resolved</p>
              </div>
              <div className="text-center p-3 bg-eco-light rounded-lg">
                <MessageSquare className="h-5 w-5 text-eco-warning mx-auto mb-1" />
                <p className="font-medium">{stats.pendingComplaints}</p>
                <p className="text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-eco-accent" />
              User Engagement
            </CardTitle>
            <CardDescription>
              Percentage of users actively participating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Users</span>
                <span>{getUserEngagement()}%</span>
              </div>
              <Progress value={getUserEngagement()} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-eco-light rounded-lg">
                <TrendingUp className="h-5 w-5 text-eco-green mx-auto mb-1" />
                <p className="font-medium">{stats.activeUsers}</p>
                <p className="text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-3 bg-eco-light rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="font-medium">{stats.totalUsers - stats.activeUsers}</p>
                <p className="text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-eco-green" />
            System Status
          </CardTitle>
          <CardDescription>
            Current status of key system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Pending Actions</h4>
                <AlertTriangle className="h-5 w-5 text-eco-warning" />
              </div>
              <p className="text-2xl font-bold text-eco-warning">
                {stats.pendingComplaints + stats.pendingReports}
              </p>
              <p className="text-sm text-muted-foreground">
                Items requiring attention
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Avg Credits/User</h4>
                <Gift className="h-5 w-5 text-eco-green" />
              </div>
              <p className="text-2xl font-bold text-eco-green">
                {stats.totalUsers > 0 ? Math.round(stats.totalCredits / stats.totalUsers) : 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Credits per active user
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">System Health</h4>
                <CheckCircle className="h-5 w-5 text-eco-success" />
              </div>
              <p className="text-2xl font-bold text-eco-success">
                {stats.pendingReports === 0 ? '100%' : '95%'}
              </p>
              <p className="text-sm text-muted-foreground">
                Overall system status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-eco-accent" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-eco-light rounded-lg">
              <span className="text-sm font-medium">Total complaints submitted today</span>
              <span className="font-bold text-eco-green">0</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-eco-light rounded-lg">
              <span className="text-sm font-medium">Reports requiring review</span>
              <span className="font-bold text-eco-warning">{stats.pendingReports}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-eco-light rounded-lg">
              <span className="text-sm font-medium">Credits awarded this week</span>
              <span className="font-bold text-eco-success">0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;