import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  User, 
  Eye,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Report {
  id: string;
  user_id: string;
  complaint_id: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

const ReportsManager = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      toast({
        title: "Error loading reports",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: status as 'pending' | 'reviewed' | 'resolved' })
        .eq('id', reportId);

      if (error) throw error;

      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: status as 'pending' | 'reviewed' | 'resolved' } : r
      ));
      
      toast({
        title: "Status updated successfully!",
        description: `Report marked as ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'destructive' as const, icon: AlertTriangle },
      reviewed: { label: 'Reviewed', variant: 'secondary' as const, icon: Clock },
      resolved: { label: 'Resolved', variant: 'default' as const, icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-eco-dark">Manage Reports</h2>
          <p className="text-muted-foreground mt-2">Loading reports...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-eco-dark">Manage Reports</h2>
        <p className="text-muted-foreground mt-2">
          Review and manage worker issue reports from users
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-eco-warning">{pendingCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-eco-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="text-2xl font-bold text-eco-blue">{reviewedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-eco-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-eco-green">{resolvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-eco-green" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alert */}
      {pendingCount > 0 && (
        <Card className="eco-shadow border-eco-warning bg-eco-warning/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-eco-warning" />
              <div>
                <h3 className="font-semibold text-eco-dark">Priority Action Required</h3>
                <p className="text-sm text-eco-dark/80">
                  You have {pendingCount} pending report{pendingCount !== 1 ? 's' : ''} that need{pendingCount === 1 ? 's' : ''} your attention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="eco-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-eco-green" />
                    Report #{report.id.slice(-8)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      User ID: {report.user_id.slice(-8)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(report.created_at)}
                    </span>
                  </CardDescription>
                </div>
                {getStatusBadge(report.status)}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {report.description.substring(0, 150)}
                {report.description.length > 150 && '...'}
              </p>

              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Report Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description:</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Report ID:</strong> {report.id}
                        </div>
                        <div>
                          <strong>Complaint ID:</strong> {report.complaint_id}
                        </div>
                        <div>
                          <strong>Status:</strong> {getStatusBadge(report.status)}
                        </div>
                        <div>
                          <strong>Created:</strong> {formatDate(report.created_at)}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {report.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateReportStatus(report.id, 'reviewed')}
                    >
                      Mark as Reviewed
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => updateReportStatus(report.id, 'resolved')}
                    >
                      Mark as Resolved
                    </Button>
                  </>
                )}

                {report.status === 'reviewed' && (
                  <Button 
                    size="sm"
                    onClick={() => updateReportStatus(report.id, 'resolved')}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card className="eco-shadow">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports</h3>
            <p className="text-muted-foreground">
              There are currently no worker issue reports to review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsManager;