import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  credits: number;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string, selectedRole?: 'user' | 'admin') => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateCredits: (credits: number) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Store selected role temporarily for profile updates
  const [tempSelectedRole, setTempSelectedRole] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    // Helper to load or create profile outside of onAuthStateChange to avoid deadlocks
    const loadOrCreateProfile = async (sbUser: SupabaseUser, selectedRole?: 'user' | 'admin') => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', sbUser.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          setIsLoading(false);
          return;
        }
        
        if (!profile && sbUser.email) {
          // Use selectedRole if provided, otherwise default to 'user'
          const roleToUse = selectedRole || 'user';
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: sbUser.id,
              name: sbUser.user_metadata?.name || sbUser.email.split('@')[0],
              email: sbUser.email,
              role: roleToUse,
              credits: 100
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            setIsLoading(false);
            return;
          }
          
          setUser({
            id: sbUser.id,
            name: newProfile.name,
            email: newProfile.email,
            role: newProfile.role as 'user' | 'admin',
            credits: newProfile.credits
          });
        } else if (profile) {
          // Update role if selectedRole is provided
          if (selectedRole && selectedRole !== profile.role) {
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({ role: selectedRole })
              .eq('user_id', sbUser.id)
              .select()
              .single();
              
            if (updateError) {
              console.error('Error updating profile role:', updateError);
            } else {
              setUser({
                id: sbUser.id,
                name: updatedProfile.name,
                email: updatedProfile.email,
                role: updatedProfile.role as 'user' | 'admin',
                credits: updatedProfile.credits
              });
              setIsLoading(false);
              return;
            }
          }
          
          setUser({
            id: sbUser.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as 'user' | 'admin',
            credits: profile.credits
          });
        }
      } finally {
        setIsLoading(false);
        setTempSelectedRole(null);
      }
    };

    // Set up auth state listener (sync only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer supabase calls to avoid deadlocks, use tempSelectedRole if available
        setTimeout(() => loadOrCreateProfile(session.user as SupabaseUser, tempSelectedRole || undefined), 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Initialize from existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadOrCreateProfile(session.user as SupabaseUser);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, selectedRole?: 'user' | 'admin'): Promise<boolean> => {
    try {
      // Store the selected role temporarily
      if (selectedRole) {
        setTempSelectedRole(selectedRole);
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        }
        
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account."
      });
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    localStorage.removeItem('hasSeenVideo');
  };

  const updateCredits = async (credits: number) => {
    if (user && supabaseUser) {
      const { error } = await supabase
        .from('profiles')
        .update({ credits })
        .eq('user_id', supabaseUser.id);
      
      if (!error) {
        setUser({ ...user, credits });
      }
    }
  };

  const value = {
    user,
    supabaseUser,
    login,
    signup,
    logout,
    updateCredits,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};