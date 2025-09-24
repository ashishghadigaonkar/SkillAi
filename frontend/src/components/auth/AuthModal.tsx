import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, BarChart3, ArrowRight, Phone, Mail, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: 'learner' | 'trainer' | 'policymaker' | null;
}

export const AuthModal = ({ isOpen, onClose, selectedRole }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    language: "english",
    state: "",
    role: selectedRole || "learner"
  });

  const { login, register, sendOTP, loginWithOTP, user } = useAuth();
  const navigate = useNavigate();

  const roleIcons = {
    learner: BookOpen,
    trainer: Users,
    policymaker: BarChart3
  };

  const languages = [
    { value: "english", label: "English" },
    { value: "hindi", label: "हिंदी (Hindi)" },
    { value: "tamil", label: "தமிழ் (Tamil)" },
    { value: "bengali", label: "বাংলা (Bengali)" },
    { value: "telugu", label: "తెలుగు (Telugu)" },
    { value: "marathi", label: "मराठी (Marathi)" }
  ];

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Function to navigate based on user's actual role from database
  const navigateToUserDashboard = (userRole: string) => {
    switch (userRole) {
      case 'learner':
        navigate('/dashboard/learner');
        break;
      case 'trainer':
        navigate('/dashboard/trainer');
        break;
      case 'policymaker':
        navigate('/dashboard/policy');
        break;
      default:
        navigate('/dashboard/learner');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let authenticatedUser;
      
      if (isLogin) {
        authenticatedUser = await login(formData.email, formData.password);
      } else {
        authenticatedUser = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          role: formData.role,
          language: formData.language,
          state: formData.state || undefined
        });
      }
      
      toast({
        title: isLogin ? "Welcome back!" : "Account created successfully!",
        description: `Redirecting to your ${authenticatedUser.role} dashboard...`,
      });

      // Close modal first
      onClose();
      
      // Navigate based on the authenticated user's actual role from database
      setTimeout(() => {
        navigateToUserDashboard(authenticatedUser.role);
      }, 100);

    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendOTP(formData.phone);
      setSentOtp(response.otp || ''); // For development - remove in production
      setOtpStep('verify');
      
      toast({
        title: "OTP sent successfully",
        description: `OTP sent to ${formData.phone}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      toast({
        title: "OTP required",
        description: "Please enter the OTP",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOTP(
        formData.phone, 
        formData.otp, 
        formData.name || 'User',
        formData.role
      );
      
      toast({
        title: "Authentication successful!",
        description: "Welcome to your dashboard",
      });

      // Close modal first
      onClose();
      
      // Wait a moment for the auth context to update, then navigate based on actual user role
      setTimeout(() => {
        const currentUser = user; // This should be updated after OTP verification
        if (currentUser) {
          navigateToUserDashboard(currentUser.role);
        } else {
          // Fallback: use form data role for new OTP registrations
          navigateToUserDashboard(formData.role);
        }
      }, 100);

    } catch (error: any) {
      toast({
        title: "OTP verification failed",
        description: error.message || "Invalid OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const RoleIcon = selectedRole ? roleIcons[selectedRole] : BookOpen;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <RoleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            {isLogin ? "Welcome Back" : "Join SkillPath AI"}
          </DialogTitle>
          <DialogDescription>
            {isLogin 
              ? "Sign in to continue your learning journey" 
              : "Create your account and start your personalized learning path"
            }
          </DialogDescription>
        </DialogHeader>

        {selectedRole && (
          <Badge className="self-center mb-4 capitalize bg-primary-light text-primary-foreground" data-testid="role-badge">
            {selectedRole} Dashboard
          </Badge>
        )}

        <Tabs value={authMethod} onValueChange={(value: 'email' | 'otp') => setAuthMethod(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2" data-testid="email-auth-tab">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="otp" className="flex items-center gap-2" data-testid="otp-auth-tab">
              <Phone className="h-4 w-4" />
              Phone OTP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                      data-testid="name-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                        <SelectTrigger data-testid="language-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/UT</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                        <SelectTrigger data-testid="state-select">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, '-')}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      data-testid="phone-input"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  data-testid="email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  required
                  data-testid="password-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isLoading}
                data-testid="email-auth-submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="otp" className="space-y-4">
            {otpStep === 'phone' ? (
              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="otp-name">Full Name</Label>
                    <Input
                      id="otp-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                      data-testid="otp-name-input"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp-phone">Mobile Number</Label>
                  <Input
                    id="otp-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                    data-testid="otp-phone-input"
                  />
                </div>

                <Button 
                  onClick={handleSendOtp}
                  className="w-full bg-secondary hover:bg-secondary/90"
                  disabled={isLoading}
                  data-testid="send-otp-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Enter the OTP sent to {formData.phone}
                  </p>
                  {sentOtp && (
                    <p className="text-xs text-green-600 mt-1">
                      Development OTP: {sentOtp}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    data-testid="otp-input"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setOtpStep('phone')}
                    className="flex-1"
                    data-testid="back-to-phone-button"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleVerifyOtp}
                    className="flex-1 bg-secondary hover:bg-secondary/90"
                    disabled={isLoading}
                    data-testid="verify-otp-button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary"
            data-testid="toggle-auth-mode"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};