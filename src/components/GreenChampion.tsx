import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Crown, 
  Star, 
  Medal,
  Sparkles,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
}

const GreenChampion = () => {
  const { toast } = useToast();
  const [champion, setChampion] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, user_id, name, email, credits')
        .order('credits', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (users && users.length > 0) {
        // Convert to expected format
        const formattedUsers: User[] = users.map(user => ({
          id: user.user_id,
          name: user.name,
          email: user.email,
          credits: user.credits || 0
        }));
        
        setChampion(formattedUsers[0]); // User with highest credits
        setAllUsers(formattedUsers);
      } else {
        setChampion(null);
        setAllUsers([]);
      }
    } catch (error) {
      console.error('Error fetching champion data:', error);
      toast({
        title: "Error loading champion data",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getPositionBadge = (position: number) => {
    const configs = {
      1: { label: '1st Place', variant: 'default' as const, className: 'bg-yellow-500 text-white' },
      2: { label: '2nd Place', variant: 'secondary' as const, className: 'bg-gray-400 text-white' },
      3: { label: '3rd Place', variant: 'outline' as const, className: 'bg-amber-600 text-white' },
    };
    
    const config = configs[position as keyof typeof configs] || { 
      label: `${position}th Place`, 
      variant: 'outline' as const, 
      className: '' 
    };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getEcoLevel = (credits: number) => {
    if (credits >= 200) return { name: 'Eco Champion', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (credits >= 100) return { name: 'Green Hero', color: 'text-eco-green', bg: 'bg-eco-light' };
    if (credits >= 50) return { name: 'Eco Warrior', color: 'text-eco-accent', bg: 'bg-eco-accent/10' };
    return { name: 'Green Beginner', color: 'text-muted-foreground', bg: 'bg-gray-50' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-eco-dark">Green Champion</h2>
          <p className="text-muted-foreground mt-2">Loading champion data...</p>
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
        <h2 className="text-3xl font-bold text-eco-dark">Green Champion</h2>
        <p className="text-muted-foreground mt-2">
          Celebrating our top eco-warriors who are making the biggest impact
        </p>
      </div>

      {/* Current Champion */}
      {champion && (
        <Card className="eco-shadow border-yellow-200 bg-gradient-to-r from-yellow-50 to-eco-light">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="p-6 rounded-full bg-yellow-500 text-white shadow-lg">
                  <Trophy className="h-16 w-16" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-lg">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold text-eco-dark">
              🏆 Current Green Champion
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Leading the fight for a cleaner environment
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-eco-dark">{champion.name}</h3>
              <p className="text-eco-dark/80">{champion.email}</p>
            </div>
            
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600">{champion.credits}</div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
              </div>
            </div>
            
            <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
              {getEcoLevel(champion.credits).name}
            </Badge>
            
            <div className="bg-white/50 p-4 rounded-lg mt-4">
              <p className="text-sm text-eco-dark/80">
                🌟 <strong>Champion Achievement:</strong> {champion.name} has earned the most eco-credits 
                by actively participating in waste management activities and helping create a cleaner community!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-eco-accent" />
            Eco-Warriors Leaderboard
          </CardTitle>
          <CardDescription>
            Top performers in our environmental impact program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allUsers.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users with credits yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allUsers.slice(0, 10).map((user, index) => {
                const position = index + 1;
                const level = getEcoLevel(user.credits);
                
                return (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border eco-transition hover:shadow-md ${
                      position === 1 ? 'bg-yellow-50 border-yellow-200' : 
                      position === 2 ? 'bg-gray-50 border-gray-200' :
                      position === 3 ? 'bg-amber-50 border-amber-200' :
                      'bg-background hover:bg-eco-light'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getPositionIcon(position)}
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{position}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-eco-dark">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-eco-green" />
                          <span className="text-xl font-bold text-eco-green">
                            {user.credits}
                          </span>
                        </div>
                        <Badge variant="outline" className={level.color}>
                          {level.name}
                        </Badge>
                      </div>
                      
                      {position <= 3 && getPositionBadge(position)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="eco-shadow">
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-eco-dark mb-1">
              {allUsers.length > 0 ? Math.max(...allUsers.map(u => u.credits)) : 0}
            </div>
            <p className="text-sm text-muted-foreground">Highest Credits</p>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-eco-green mx-auto mb-3" />
            <div className="text-2xl font-bold text-eco-dark mb-1">
              {allUsers.length > 0 ? Math.round(allUsers.reduce((sum, u) => sum + u.credits, 0) / allUsers.length) : 0}
            </div>
            <p className="text-sm text-muted-foreground">Average Credits</p>
          </CardContent>
        </Card>

        <Card className="eco-shadow">
          <CardContent className="p-6 text-center">
            <Medal className="h-8 w-8 text-eco-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-eco-dark mb-1">
              {allUsers.filter(u => u.credits >= 100).length}
            </div>
            <p className="text-sm text-muted-foreground">Elite Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Motivation Message */}
      <Card className="eco-shadow eco-gradient-subtle border-eco-green">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Sparkles className="h-8 w-8 text-eco-green mx-auto" />
            <h3 className="text-xl font-bold text-eco-dark">
              Join the Green Revolution! 🌱
            </h3>
            <p className="text-eco-dark/80">
              Every action counts towards creating a cleaner, more sustainable future. 
              Report waste issues, connect with workers, and earn your way to the top of our leaderboard!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GreenChampion;