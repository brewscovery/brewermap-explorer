
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { TermsAndConditionsDialog } from './TermsAndConditionsDialog';
import { PrivacyPolicyDialog } from './PrivacyPolicyDialog';

type SignupFormProps = {
  onSwitchToLogin: () => void;
};

export const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'regular' | 'business'>('regular');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords don't match");
      }

      if (!acceptedTerms) {
        throw new Error("You must accept the terms and conditions to sign up");
      }

      if (!acceptedPrivacy) {
        throw new Error("You must accept the privacy policy to sign up");
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            first_name: firstName,
            last_name: userType === 'regular' ? lastName : '',
          },
        },
      });
      
      if (error) throw error;
      toast.success('Signup successful! Please check your email for verification.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeChange = (value: 'regular' | 'business') => {
    setUserType(value);
  };

  const handleReturnToMap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/');
  };

  const handleTermsLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTermsDialog(true);
  };

  const handlePrivacyLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPrivacyDialog(true);
  };

  const handleTermsAccept = () => {
    setAcceptedTerms(true);
  };

  const handlePrivacyAccept = () => {
    setAcceptedPrivacy(true);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
           <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>User Type</Label>
          <RadioGroup
            value={userType}
            onValueChange={handleUserTypeChange}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="regular" id="regular" />
              <Label htmlFor="regular">Regular User</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="business" id="business" />
              <Label htmlFor="business">Business User</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed">
            I have read and agree to the{' '}
            <button
              type="button"
              onClick={handleTermsLinkClick}
              className="text-primary hover:underline font-medium"
            >
              terms and conditions
            </button>
            {' '}as set out by the user agreement
          </Label>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={acceptedPrivacy}
            onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
          />
          <Label htmlFor="privacy" className="text-sm leading-relaxed">
            I have read and agree to the{' '}
            <button
              type="button"
              onClick={handlePrivacyLinkClick}
              className="text-primary hover:underline font-medium"
            >
              privacy policy
            </button>
          </Label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !acceptedTerms || !acceptedPrivacy}
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </Button>
        <Button
          variant="link"
          className="w-full"
          onClick={onSwitchToLogin}
        >
          Already have an account? Login
        </Button>
      </form>
      <Button
        variant="link"
        className="w-full"
        onClick={handleReturnToMap}
      >
        Return to map
      </Button>

      <TermsAndConditionsDialog
        open={showTermsDialog}
        onOpenChange={setShowTermsDialog}
        onAccept={handleTermsAccept}
      />
      
      <PrivacyPolicyDialog
        open={showPrivacyDialog}
        onOpenChange={setShowPrivacyDialog}
        onAccept={handlePrivacyAccept}
      />
    </div>
  );
};
