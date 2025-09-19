import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportFormProps {
  complaintId: string;
  onSuccess: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ complaintId, onSuccess }) => {
  const { user, supabaseUser } = useAuth();
  const { toast } = useToast();
  
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabaseUser || !description.trim()) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: supabaseUser.id,
          complaint_id: complaintId,
          description: description.trim()
        });

      if (error) throw error;

      toast({
        title: "Report submitted successfully!",
        description: "Admin has been notified about the worker issue.",
      });
      
      setDescription('');
      onSuccess();
    } catch (error) {
      toast({
        title: "Error submitting report",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Use this form to report issues with the assigned worker, such as:
          not showing up, incomplete work, or unprofessional behavior.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="description">Describe the issue with the worker</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Please describe what happened with the assigned worker..."
          rows={4}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !description.trim()}
      >
        {isSubmitting ? (
          'Submitting...'
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Report
          </>
        )}
      </Button>
    </form>
  );
};

export default ReportForm;