import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gift, 
  Plus, 
  Star, 
  User,
  Ticket,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
}

interface RedeemCode {
  id: string;
  code: string;
  user_id: string;
  redeemed: boolean;
  created_at: string;
}

const CreditsManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: profiles, error: profilesError }, { data: codes, error: codesError }] = await Promise.all([
        supabase.from('profiles').select('*').order('name'),
        supabase.from('redeem_codes').select('*').order('created_at', { ascending: false }).limit(10)
      ]);
      
      if (profilesError) throw profilesError;
      if (codesError) throw codesError;
      
      setUsers(profiles?.map(p => ({
        id: p.user_id,
        name: p.name,
        email: p.email,
        credits: p.credits
      })) || []);
      setRedeemCodes(codes || []);
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

  const handleAddCredits = async () => {
    if (!selectedUser || creditsToAdd <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a user and enter a valid amount of credits.",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    
    try {
      const newCreditsTotal = selectedUser.credits + creditsToAdd;
      
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCreditsTotal })
        .eq('user_id', selectedUser.id);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, credits: newCreditsTotal }
          : u
      ));
      
      toast({
        title: "Credits added successfully!",
        description: `Added ${creditsToAdd} credits to ${selectedUser.name}.`,
      });
      
      setSelectedUser(null);
      setCreditsToAdd(0);
    } catch (error) {
      toast({
        title: "Error adding credits",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const getUserLevel = (credits: number) => {
    if (credits >= 200) return { name: 'Eco Champion', color: 'text-yellow-500' };
    if (credits >= 100) return { name: 'Green Hero', color: 'text-eco-green' };
    if (credits >= 50) return { name: 'Eco Warrior', color: 'text-eco-accent' };
    return { name: 'Green Beginner', color: 'text-muted-foreground' };
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
          <h2 className="text-3xl font-bold text-eco-dark">Manage Credits</h2>
          <p className="text-muted-foreground mt-2">Loading credits data...</p>
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

  const totalCredits = users.reduce((sum, user) => sum + user.credits, 0);
  const eligibleUsers = users.filter(user => user.credits >= 100).length;
  const averageCredits = users.length > 0 ? Math.round(totalCredits / users.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-eco-dark">Manage Credits</h2>
          <p className="text-muted-foreground mt-2">
            Manage user credits and view reward redemptions
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="eco-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Credits
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credits to User</DialogTitle>
            </DialogHeader>
            <AddCreditsForm 
              users={users}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              creditsToAdd={creditsToAdd}
              setCreditsToAdd={setCreditsToAdd}
              onSubmit={handleAddCredits}
              isLoading={isAdding}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold text-eco-green">{totalCredits}</p>
              </div>
              <Gift className="h-8 w-8 text-eco-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eligible for Rewards</p>
                <p className="text-2xl font-bold text-eco-blue">{eligibleUsers}</p>
              </div>
              <Star className="h-8 w-8 text-eco-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Generated Codes</p>
                <p className="text-2xl font-bold text-eco-warning">{redeemCodes.length}</p>
              </div>
              <Ticket className="h-8 w-8 text-eco-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Credits</p>
                <p className="text-2xl font-bold text-eco-dark">{averageCredits}</p>
              </div>
              <User className="h-8 w-8 text-eco-dark" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle>User Credits</CardTitle>
          <CardDescription>View and manage user credit balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => {
              const level = getUserLevel(user.credits);
              return (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-eco-light">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-eco-green/10">
                      <User className="h-4 w-4 text-eco-green" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={level.color}>
                      {level.name}
                    </Badge>
                    <div className="text-right">
                      <p className="text-lg font-bold text-eco-green">{user.credits}</p>
                      <p className="text-xs text-muted-foreground">credits</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Redeem Codes */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-eco-green" />
            Recent Redeem Codes
          </CardTitle>
          <CardDescription>Latest reward code redemptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {redeemCodes.slice(0, 5).map((code) => {
              const user = users.find(u => u.id === code.user_id);
              return (
                <div key={code.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-eco-accent/10">
                      <Ticket className="h-4 w-4 text-eco-accent" />
                    </div>
                    <div>
                      <p className="font-mono font-medium">{code.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {user ? user.name : 'Unknown User'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={code.redeemed ? "default" : "secondary"}>
                      {code.redeemed ? "Redeemed" : "Active"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(code.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {redeemCodes.length > 5 && (
            <div className="pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                <History className="h-4 w-4 mr-2" />
                View All Redemptions ({redeemCodes.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface AddCreditsFormProps {
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  creditsToAdd: number;
  setCreditsToAdd: (credits: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const AddCreditsForm: React.FC<AddCreditsFormProps> = ({
  users,
  selectedUser,
  setSelectedUser,
  creditsToAdd,
  setCreditsToAdd,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select User</Label>
        <Select
          value={selectedUser?.id || ''}
          onValueChange={(value) => {
            const user = users.find(u => u.id === value);
            setSelectedUser(user || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a user..." />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} - {user.credits} credits
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Credits to Add</Label>
        <Input
          type="number"
          min="1"
          max="1000"
          value={creditsToAdd || ''}
          onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
          placeholder="Enter amount..."
        />
      </div>
      
      <Button 
        onClick={onSubmit} 
        disabled={!selectedUser || creditsToAdd <= 0 || isLoading}
        className="w-full"
      >
        {isLoading ? 'Adding...' : `Add ${creditsToAdd} Credits`}
      </Button>
    </div>
  );
};

export default CreditsManager;