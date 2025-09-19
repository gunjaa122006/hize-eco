import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Clock, 
  User, 
  Eye,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Complaint {
  id: string;
  user_id: string;
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

interface Worker {
  id: string;
  name: string;
  phone: string;
  area: string;
}

const ComplaintsManager = () => {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: complaints, error: complaintsError }, { data: workers, error: workersError }] = await Promise.all([
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
        supabase.from('workers').select('*').order('name')
      ]);
      
      if (complaintsError) throw complaintsError;
      if (workersError) throw workersError;
      
      setComplaints(complaints || []);
      setWorkers(workers || []);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async (complaintId: string, workerId: string) => {
    setAssigningTo(complaintId);
    
    try {
      const worker = workers.find(w => w.id === workerId);
      if (!worker) throw new Error('Worker not found');

      const { error } = await supabase
        .from('complaints')
        .update({
          status: 'assigned',
          assigned_worker_id: workerId,
          assigned_worker_name: worker.name,
          assigned_worker_phone: worker.phone
        })
        .eq('id', complaintId);

      if (error) throw error;

      setComplaints(complaints.map(c => 
        c.id === complaintId ? {
          ...c,
          status: 'assigned' as const,
          assigned_worker_id: workerId,
          assigned_worker_name: worker.name,
          assigned_worker_phone: worker.phone
        } : c
      ));
      
      toast({
        title: "Worker assigned successfully!",
        description: "The complaint has been assigned to a worker.",
      });
    } catch (error) {
      toast({
        title: "Error assigning worker",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setAssigningTo(null);
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: status as 'pending' | 'assigned' | 'completed' })
        .eq('id', complaintId);

      if (error) throw error;

      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, status: status as 'pending' | 'assigned' | 'completed' } : c
      ));
      
      toast({
        title: "Status updated successfully!",
        description: `Complaint marked as ${status}.`,
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
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      assigned: { label: 'Assigned', variant: 'default' as const, icon: User },
      completed: { label: 'Completed', variant: 'default' as const, icon: UserCheck }
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
          <h2 className="text-3xl font-bold text-eco-dark">Manage Complaints</h2>
          <p className="text-muted-foreground mt-2">Loading complaints...</p>
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

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const assignedCount = complaints.filter(c => c.status === 'assigned').length;
  const completedCount = complaints.filter(c => c.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-eco-dark">Manage Complaints</h2>
        <p className="text-muted-foreground mt-2">
          View and manage waste management complaints from users
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-eco-warning">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-eco-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold text-eco-blue">{assignedCount}</p>
              </div>
              <User className="h-8 w-8 text-eco-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-eco-green">{completedCount}</p>
              </div>
              <UserCheck className="h-8 w-8 text-eco-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-eco-dark">{complaints.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-eco-dark" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className="eco-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-eco-green" />
                    Complaint #{complaint.id.slice(-8)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {complaint.name}
                    </span>
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
                {complaint.description}
              </p>

              {complaint.assigned_worker_name && (
                <div className="bg-eco-light p-3 rounded-lg mb-4">
                  <h4 className="font-medium text-eco-dark mb-2">Assigned Worker:</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{complaint.assigned_worker_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Phone: {complaint.assigned_worker_phone}
                      </p>
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
                      <DialogTitle>Complaint Details</DialogTitle>
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

                {complaint.status === 'pending' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={assigningTo === complaint.id}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        {assigningTo === complaint.id ? 'Assigning...' : 'Assign Worker'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Worker</DialogTitle>
                      </DialogHeader>
                      <AssignWorkerForm 
                        workers={workers}
                        onAssign={(workerId) => handleAssignWorker(complaint.id, workerId)}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {complaint.status === 'assigned' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateComplaintStatus(complaint.id, 'completed')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {complaints.length === 0 && (
        <Card className="eco-shadow">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Complaints</h3>
            <p className="text-muted-foreground">
              There are currently no waste management complaints to review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface AssignWorkerFormProps {
  workers: Worker[];
  onAssign: (workerId: string) => void;
}

const AssignWorkerForm: React.FC<AssignWorkerFormProps> = ({ workers, onAssign }) => {
  const [selectedWorker, setSelectedWorker] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorker) {
      onAssign(selectedWorker);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Select a worker to assign:</Label>
        <RadioGroup value={selectedWorker} onValueChange={setSelectedWorker} className="mt-2">
          {workers.map((worker) => (
            <div key={worker.id} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-eco-light">
              <RadioGroupItem value={worker.id} id={worker.id} />
              <Label htmlFor={worker.id} className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">{worker.name}</p>
                  <p className="text-sm text-muted-foreground">{worker.area} • {worker.phone}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <Button type="submit" disabled={!selectedWorker} className="w-full">
        Assign Worker
      </Button>
    </form>
  );
};

export default ComplaintsManager;