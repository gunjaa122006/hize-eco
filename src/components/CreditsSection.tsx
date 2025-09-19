import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gift, 
  Star, 
  Trophy, 
  Zap,
  Ticket,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CreditsSection = () => {
  const { user, supabaseUser, updateCredits } = useAuth();
  const { toast } = useToast();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string | null>(null);

  const currentCredits = user?.credits || 0;
  const creditsToNextReward = Math.max(0, 100 - currentCredits);
  const progressPercentage = Math.min(100, (currentCredits / 100) * 100);

  const handleRedeem = async () => {
    if (!user || !supabaseUser || currentCredits < 100) return;

    setIsRedeeming(true);
    
    try {
      // Generate redeem code
      const code = `ECO-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      const { error } = await supabase
        .from('redeem_codes')
        .insert({
          code,
          user_id: supabaseUser.id
        });

      if (error) throw error;

      // Update user credits
      await updateCredits(currentCredits - 100);
      setRedeemCode(code);
      
      toast({
        title: "Reward redeemed successfully!",
        description: `Your redeem code: ${code}`,
      });
    } catch (error) {
      toast({
        title: "Error redeeming reward",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const getEcoLevel = (credits: number) => {
    if (credits >= 200) return { name: 'Eco Champion', icon: Trophy, color: 'text-yellow-500' };
    if (credits >= 100) return { name: 'Green Hero', icon: Star, color: 'text-eco-green' };
    if (credits >= 50) return { name: 'Eco Warrior', icon: Zap, color: 'text-eco-accent' };
    return { name: 'Green Beginner', icon: Sparkles, color: 'text-muted-foreground' };
  };

  const level = getEcoLevel(currentCredits);
  const LevelIcon = level.icon;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-eco-dark">My Credits</h2>
        <p className="text-muted-foreground mt-2">
          Earn credits by reporting waste issues and redeem rewards
        </p>
      </div>

      {/* Current Credits Card */}
      <Card className="eco-shadow eco-gradient-subtle border-eco-green">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-eco-green" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-eco-green">
              {currentCredits}
            </div>
            <div className="flex items-center justify-center gap-2">
              <LevelIcon className={`h-5 w-5 ${level.color}`} />
              <Badge variant="outline" className="text-eco-dark">
                {level.name}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Reward */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-eco-warning" />
            Progress to Reward
          </CardTitle>
          <CardDescription>
            Collect 100 credits to redeem your first reward
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Credits Progress</span>
              <span>{currentCredits}/100</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
          
          {creditsToNextReward > 0 ? (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                You need <strong>{creditsToNextReward} more credits</strong> to unlock your next reward!
                Keep reporting waste issues to earn credits.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-eco-light border-eco-green">
              <Trophy className="h-4 w-4 text-eco-green" />
              <AlertDescription className="text-eco-dark">
                🎉 <strong>Congratulations!</strong> You can redeem a reward now!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Redeem Section */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-eco-accent" />
            Redeem Rewards
          </CardTitle>
          <CardDescription>
            Exchange 100 credits for exclusive rewards and discounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {redeemCode && (
            <Alert className="bg-eco-green/10 border-eco-green">
              <Gift className="h-4 w-4 text-eco-green" />
              <AlertDescription>
                <strong>Your Redeem Code:</strong> {redeemCode}
                <br />
                <span className="text-sm">Save this code to claim your reward!</span>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Eco Reward Voucher</h4>
                <p className="text-sm text-muted-foreground">
                  Get discounts on eco-friendly products
                </p>
              </div>
              <Badge variant="outline">100 Credits</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Green Shopping Discount</h4>
                <p className="text-sm text-muted-foreground">
                  20% off sustainable products
                </p>
              </div>
              <Badge variant="outline">100 Credits</Badge>
            </div>
          </div>

          <Button 
            onClick={handleRedeem}
            disabled={currentCredits < 100 || isRedeeming}
            className="w-full eco-gradient"
          >
            {isRedeeming ? (
              'Redeeming...'
            ) : currentCredits < 100 ? (
              `Need ${creditsToNextReward} more credits`
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Redeem Reward (100 Credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* How to Earn Credits */}
      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-eco-accent" />
            How to Earn Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-eco-light">
                <span className="text-sm font-medium text-eco-green">+10</span>
              </div>
              <span className="text-sm">Report a waste management issue</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-eco-light">
                <span className="text-sm font-medium text-eco-green">+5</span>
              </div>
              <span className="text-sm">Submit feedback on resolved issues</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-eco-light">
                <span className="text-sm font-medium text-eco-green">+15</span>
              </div>
              <span className="text-sm">Participate in community cleanup events</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditsSection;