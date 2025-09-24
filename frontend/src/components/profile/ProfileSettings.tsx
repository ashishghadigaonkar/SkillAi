import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Target, 
  BookOpen,
  Trophy,
  Download,
  Trash2,
  Camera
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";

export const ProfileSettings = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [achievements, setAchievements] = useState<any[]>([]);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    target_role: user?.target_role || '',
    learning_goals: user?.learning_goals?.join(', ') || '',
    skills: user?.skills?.join(', ') || '',
    language: user?.language || 'english',
    state: user?.state || ''
  });

  const [settingsForm, setSettingsForm] = useState({
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    weekly_progress_email: true,
    achievement_notifications: true,
    learning_reminders: true,
    preferred_study_time: '',
    daily_goal_minutes: 60,
    privacy_profile: 'public'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, statsData, achievementsData] = await Promise.all([
        apiService.getProfileSettings(),
        apiService.getProfileStats(),
        apiService.getAchievements()
      ]);
      
      setSettings(settingsData);
      setStats(statsData);
      setAchievements(achievementsData);
      
      // Update settings form with fetched data
      setSettingsForm(prev => ({ ...prev, ...settingsData }));
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        ...profileForm,
        learning_goals: profileForm.learning_goals.split(',').map(g => g.trim()).filter(g => g),
        skills: profileForm.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      
      await updateProfile(updateData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setIsLoading(true);
    try {
      await apiService.updateProfileSettings(settingsForm);
      
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved."
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const userData = await apiService.exportUserData();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillpath-data-${user?.id}.json`;
      a.click();
      
      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully."
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleAccountDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await apiService.deleteAccount();
        
        toast({
          title: "Account deactivated",
          description: "Your account has been deactivated successfully."
        });
        
        await logout();
      } catch (error: any) {
        toast({
          title: "Delete failed",
          description: error.message || "Failed to delete account",
          variant: "destructive"
        });
      }
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="h-20 w-20" data-testid="profile-avatar">
          <AvatarImage src={user.profile_picture} alt={user.name} />
          <AvatarFallback className="text-2xl">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold" data-testid="profile-title">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className="bg-primary-light text-primary-foreground capitalize">
              {user.role}
            </Badge>
            <Badge variant="outline">
              {user.current_level}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Change Photo
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="profile-tab">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="settings-tab">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2" data-testid="achievements-tab">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2" data-testid="stats-tab">
            <BookOpen className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2" data-testid="privacy-tab">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile information and learning preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                    data-testid="email-display"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_role">Target Career Role</Label>
                <Input
                  id="target_role"
                  value={profileForm.target_role}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, target_role: e.target.value }))}
                  placeholder="e.g., AI/ML Engineer, Data Scientist"
                  data-testid="target-role-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learning_goals">Learning Goals</Label>
                <Input
                  id="learning_goals"
                  value={profileForm.learning_goals}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, learning_goals: e.target.value }))}
                  placeholder="Separate multiple goals with commas"
                  data-testid="learning-goals-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Current Skills</Label>
                <Input
                  id="skills"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="Separate multiple skills with commas"
                  data-testid="skills-input"
                />
              </div>

              <Button 
                onClick={handleProfileUpdate} 
                disabled={isLoading}
                data-testid="update-profile-button"
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize how you receive updates and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your learning progress
                  </p>
                </div>
                <Switch
                  checked={settingsForm.notifications_enabled}
                  onCheckedChange={(checked) => 
                    setSettingsForm(prev => ({ ...prev, notifications_enabled: checked }))
                  }
                  data-testid="notifications-switch"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get updates via email
                  </p>
                </div>
                <Switch
                  checked={settingsForm.email_notifications}
                  onCheckedChange={(checked) => 
                    setSettingsForm(prev => ({ ...prev, email_notifications: checked }))
                  }
                  data-testid="email-notifications-switch"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Learning Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily reminders to continue learning
                  </p>
                </div>
                <Switch
                  checked={settingsForm.learning_reminders}
                  onCheckedChange={(checked) => 
                    setSettingsForm(prev => ({ ...prev, learning_reminders: checked }))
                  }
                  data-testid="learning-reminders-switch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_goal">Daily Learning Goal (minutes)</Label>
                <Input
                  id="daily_goal"
                  type="number"
                  min="15"
                  max="480"
                  value={settingsForm.daily_goal_minutes}
                  onChange={(e) => 
                    setSettingsForm(prev => ({ ...prev, daily_goal_minutes: parseInt(e.target.value) }))
                  }
                  data-testid="daily-goal-input"
                />
              </div>

              <Button 
                onClick={handleSettingsUpdate} 
                disabled={isLoading}
                data-testid="update-settings-button"
              >
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                Badges and milestones you've earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg" data-testid={`achievement-${index}`}>
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    </div>
                    <Badge variant={achievement.type === 'badge' ? 'default' : 'secondary'}>
                      {achievement.type}
                    </Badge>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-center text-muted-foreground col-span-2 py-8">
                    Start learning to earn your first achievement!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary" data-testid="total-courses-stat">
                  {stats.total_courses || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total Courses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-success" data-testid="completed-courses-stat">
                  {stats.completed_courses || 0}
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-accent" data-testid="avg-score-stat">
                  {stats.average_score || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-warning" data-testid="learning-streak-stat">
                  {stats.learning_streak || 0}
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Learning Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Completion Rate</Label>
                  <div className="text-2xl font-semibold text-primary">
                    {Math.round(stats.completion_rate || 0)}%
                  </div>
                </div>
                <div>
                  <Label>Credits Earned</Label>
                  <div className="text-2xl font-semibold text-accent">
                    {stats.credits_earned || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>
                Manage your data and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="w-full justify-start"
                  data-testid="export-data-button"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download My Data
                </Button>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-destructive">Danger Zone</Label>
                  <Button 
                    variant="destructive"
                    onClick={handleAccountDelete}
                    className="w-full justify-start"
                    data-testid="delete-account-button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This will permanently delete your account and all associated data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};