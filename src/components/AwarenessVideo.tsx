import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  SkipForward, 
  CheckCircle, 
  Recycle, 
  Leaf,
  Globe,
  Users
} from 'lucide-react';

interface AwarenessVideoProps {
  onComplete: () => void;
  onSkip: () => void;
}

const AwarenessVideo: React.FC<AwarenessVideoProps> = ({ onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to EcoWaste! 🌍",
      content: "Join thousands of eco-warriors in making our planet cleaner and greener. Together, we can create a sustainable future for generations to come.",
      icon: Globe,
      color: "text-eco-green"
    },
    {
      title: "Report Waste Issues 📸",
      content: "Use your phone to capture and report waste management problems in your community. Every report helps create a cleaner environment and earns you credits!",
      icon: Recycle,
      color: "text-eco-accent"
    },
    {
      title: "Connect with Workers 🤝",
      content: "Find local waste collectors and recycling workers. Compare prices for different materials and choose the best option for your needs.",
      icon: Users,
      color: "text-eco-warning"
    },
    {
      title: "Earn Green Credits 🏆",
      content: "Every action you take earns eco-credits! Report issues, provide feedback, and participate in community events to unlock amazing rewards.",
      icon: Leaf,
      color: "text-eco-success"
    }
  ];

  const progress = ((currentSlide + 1) / slides.length) * 100;

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="min-h-screen flex items-center justify-center eco-gradient p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-white/20">
              <Recycle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to EcoWaste Training
          </h1>
          <p className="text-white/90">
            Learn how to make a positive environmental impact
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>Progress</span>
            <span>{currentSlide + 1} of {slides.length}</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        {/* Main Content Card */}
        <Card className="eco-shadow">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-6 rounded-full bg-eco-light">
                <Icon className={`h-16 w-16 ${currentSlideData.color}`} />
              </div>
            </div>
            <CardTitle className="text-2xl text-eco-dark">
              {currentSlideData.title}
            </CardTitle>
            <CardDescription className="text-lg mt-4">
              {currentSlideData.content}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Educational Videos */}
            <div className="aspect-video bg-eco-light rounded-lg overflow-hidden">
              {currentSlide === 0 && (
                <video 
                  className="w-full h-full object-cover"
                  controls
                  poster="https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=450&fit=crop"
                >
                  <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8">
                      <Globe className="h-16 w-16 text-eco-green mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-eco-dark mb-2">Welcome to EcoWaste</h3>
                      <p className="text-eco-dark/70">Join the environmental movement</p>
                    </div>
                  </div>
                </video>
              )}
              
              {currentSlide === 1 && (
                <video 
                  className="w-full h-full object-cover"
                  controls
                  poster="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=450&fit=crop"
                >
                  <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8">
                      <Recycle className="h-16 w-16 text-eco-accent mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-eco-dark mb-2">Report Waste Issues</h3>
                      <p className="text-eco-dark/70">Make your community cleaner</p>
                    </div>
                  </div>
                </video>
              )}
              
              {currentSlide === 2 && (
                <video 
                  className="w-full h-full object-cover"
                  controls
                  poster="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop"
                >
                  <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8">
                      <Users className="h-16 w-16 text-eco-warning mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-eco-dark mb-2">Connect with Workers</h3>
                      <p className="text-eco-dark/70">Find local waste collectors</p>
                    </div>
                  </div>
                </video>
              )}
              
              {currentSlide === 3 && (
                <video 
                  className="w-full h-full object-cover"
                  controls
                  poster="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=450&fit=crop"
                >
                  <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8">
                      <Leaf className="h-16 w-16 text-eco-success mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-eco-dark mb-2">Earn Green Credits</h3>
                      <p className="text-eco-dark/70">Get rewarded for eco-actions</p>
                    </div>
                  </div>
                </video>
              )}
            </div>

            {/* Key Points */}
            <div className="bg-eco-light p-4 rounded-lg">
              <h4 className="font-semibold text-eco-dark mb-3">Key Points:</h4>
              <div className="space-y-2">
                {currentSlide === 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>Join a community of environmental champions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>Make real impact through collective action</span>
                    </div>
                  </div>
                )}
                {currentSlide === 1 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>Take clear photos of waste issues</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>Provide detailed location information</span>
                    </div>
                  </div>
                )}
                {currentSlide === 2 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>Compare prices from different workers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>Contact workers directly for scheduling</span>
                    </div>
                  </div>
                )}
                {currentSlide === 3 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>Earn credits for every positive action</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>Redeem rewards when you reach 100 credits</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onSkip}
                className="flex-1"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip Training
              </Button>
              
              <Button
                onClick={nextSlide}
                className="flex-1 eco-gradient"
              >
                {currentSlide === slides.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Training
                  </>
                ) : (
                  'Next Slide'
                )}
              </Button>
            </div>

            {/* Note */}
            <p className="text-xs text-muted-foreground text-center">
              💡 You can always access this training later from your dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AwarenessVideo;