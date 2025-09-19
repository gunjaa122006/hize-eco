import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Phone,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReportForm from './ReportForm';

interface Complaint {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url?: string;
  status: 'pending' | 'assigned' | 'completed';
  assigned_worker_id?: string;
  assigned_worker_name?: string;
  assigned_worker_phone?: string;
  created_at: string;
  updated_at: string;
}

const MyComplaints = () => {
  const { user, supabaseUser } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [supabaseUser]);

  const fetchComplaints = async () => {
    if (!supabaseUser) return;
    
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      toast({
        title: "Error loading complaints",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      assigned: { label: 'Assigned', variant: 'default' as const, icon: User },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: AlertTriangle }
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
          <h2 className="text-3xl font-bold text-eco-dark">My Reports</h2>
          <p className="text-muted-foreground mt-2">Loading your waste reports...</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-eco-dark">My Reports</h2>
        <p className="text-muted-foreground mt-2">
          Track the status of your submitted waste management reports
        </p>
      </div>

      {complaints.length === 0 ? (
        <Card className="eco-shadow">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground">
              You haven't submitted any waste reports yet. Start by reporting an issue in your area.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="eco-shadow hover:shadow-lg eco-transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-eco-green" />
                      Report #{complaint.id}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {complaint.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(complaint.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(complaint.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {complaint.description.substring(0, 150)}
                  {complaint.description.length > 150 && '...'}
                </p>

                {complaint.assigned_worker_name && (
                  <div className="bg-eco-light p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-eco-dark mb-2">Assigned Worker:</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{complaint.assigned_worker_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Area: {complaint.assigned_worker_phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-eco-green" />
                        <span className="text-sm">{complaint.assigned_worker_phone}</span>
                      </div>
                    </div>
                  </div>
                )}

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
                        <DialogTitle>Report #{complaint.id} - Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description:</h4>
                          <p className="text-sm text-muted-foreground">{complaint.description}</p>
                        </div>
                        
                        {complaint.image_url && (
                          <div>
                            <h4 className="font-medium mb-2">Photo:</h4>
                            <img
                              src={complaint.image_url}
                              alt="Complaint"
                              className="max-w-full h-64 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Reporter:</strong> {complaint.name}
                          </div>
                          <div>
                            <strong>Location:</strong> {complaint.location}
                          </div>
                          <div>
                            <strong>Status:</strong> {getStatusBadge(complaint.status)}
                          </div>
                          <div>
                            <strong>Created:</strong> {formatDate(complaint.created_at)}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {complaint.status === 'assigned' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-eco-warning">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Report Issue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report Worker Issue</DialogTitle>
                        </DialogHeader>
                        <ReportForm 
                          complaintId={complaint.id} 
                          onSuccess={() => {
                            toast({
                              title: "Report submitted",
                              description: "Your worker issue report has been submitted to admin.",
                            });
                          }} 
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;