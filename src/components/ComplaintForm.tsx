import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, MapPin, Send, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ComplaintFormProps {
  onSuccess: () => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess }) => {
  const { user, supabaseUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: '',
    description: '',
    photo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabaseUser) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          user_id: supabaseUser.id,
          name: formData.name,
          location: formData.location,
          description: formData.description,
          image_url: formData.photo || null
        });

      if (error) throw error;

      toast({
        title: "Complaint submitted successfully!",
        description: "Your waste management issue has been reported. We'll assign a worker soon.",
      });
      
      // Reset form
      setFormData({
        name: user.name,
        location: '',
        description: '',
        photo: ''
      });
      setPhotoPreview(null);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error submitting complaint",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-eco-dark">Report Waste Issue</h2>
        <p className="text-muted-foreground mt-2">
          Help keep your community clean by reporting waste management issues
        </p>
      </div>

      <Card className="eco-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-eco-green" />
            Submit Complaint
          </CardTitle>
          <CardDescription>
            Provide details about the waste management issue in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-eco-green" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Main Street, Block A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe the waste management issue in detail..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-eco-green" />
                Upload Photo (Optional)
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="cursor-pointer"
              />
              
              {photoPreview && (
                <div className="mt-4">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg border-2 border-eco-green"
                  />
                </div>
              )}
            </div>

            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Include clear photos showing the waste issue. 
                This helps our team understand and resolve the problem faster.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              className="w-full eco-gradient"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Complaint
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintForm;