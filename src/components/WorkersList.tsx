import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Phone, 
  MapPin, 
  DollarSign,
  Star,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Worker {
  id: string;
  name: string;
  phone: string;
  price_steel: number;
  price_plastic: number;
  price_paper: number;
  area: string;
}

const WorkersList = () => {
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      toast({
        title: "Error loading workers",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorker = (workerId: string) => {
    setSelectedWorker(workerId);
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      toast({
        title: "Worker selected!",
        description: `You've chosen ${worker.name}. Contact them directly using the phone number provided.`,
      });
    }
  };

  const getMaterialIcon = (material: string) => {
    switch (material) {
      case 'steel':
        return '🔩';
      case 'plastic':
        return '🧴';
      case 'paper':
        return '📄';
      default:
        return '♻️';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-eco-dark">Find Workers</h2>
          <p className="text-muted-foreground mt-2">Loading waste collectors in your area...</p>
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
        <h2 className="text-3xl font-bold text-eco-dark">Find Workers</h2>
        <p className="text-muted-foreground mt-2">
          Connect with local waste collectors and compare prices for different materials
        </p>
      </div>

      <div className="grid gap-6">
        {workers.map((worker) => (
          <Card 
            key={worker.id} 
            className={`eco-shadow hover:shadow-lg eco-transition ${
              selectedWorker === worker.id ? 'ring-2 ring-eco-green' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-eco-light">
                    <Users className="h-6 w-6 text-eco-green" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {worker.name}
                      {selectedWorker === worker.id && (
                        <Badge variant="default" className="bg-eco-green">
                          <Star className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {worker.area}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-eco-green" />
                  <span className="font-medium">{worker.phone}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-eco-light p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getMaterialIcon('steel')}</span>
                    <span className="font-medium">Steel</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-eco-green" />
                    <span className="text-lg font-bold text-eco-green">
                      {worker.price_steel}/kg
                    </span>
                  </div>
                </div>

                <div className="bg-eco-light p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getMaterialIcon('plastic')}</span>
                    <span className="font-medium">Plastic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-eco-green" />
                    <span className="text-lg font-bold text-eco-green">
                      {worker.price_plastic}/kg
                    </span>
                  </div>
                </div>

                <div className="bg-eco-light p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getMaterialIcon('paper')}</span>
                    <span className="font-medium">Paper</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-eco-green" />
                    <span className="text-lg font-bold text-eco-green">
                      {worker.price_paper}/kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSelectWorker(worker.id)}
                  variant={selectedWorker === worker.id ? "default" : "outline"}
                  className={selectedWorker === worker.id ? "eco-gradient" : ""}
                >
                  {selectedWorker === worker.id ? (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Choose Worker
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.open(`tel:${worker.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workers.length === 0 && (
        <Card className="eco-shadow">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workers Available</h3>
            <p className="text-muted-foreground">
              There are currently no waste collectors available in your area. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedWorker && (
        <Card className="eco-shadow border-eco-green bg-eco-light/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-eco-green text-white">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-eco-dark">Worker Selected!</h3>
                <p className="text-sm text-eco-dark/80">
                  Contact your chosen worker directly using the phone number provided above.
                  Make sure to discuss pickup times and exact pricing for your materials.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkersList;