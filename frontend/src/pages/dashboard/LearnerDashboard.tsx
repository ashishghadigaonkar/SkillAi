import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  Clock, 
  Users, 
  MapPin,
  Star,
  ChevronRight,
  BrainCircuit,
  Calendar,
  Trophy,
  Settings,
  LogOut,
  Sparkles,
  Save,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { EnhancedAssessment } from "@/components/learning/EnhancedAssessment";
import { EnhancedRoadmapGenerator } from "@/components/learning/EnhancedRoadmapGenerator";
import { SaveToRoadmap } from "@/components/learning/SaveToRoadmap";
import { toast } from "@/hooks/use-toast";

const LearnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    recommendations: [],
    achievements: [],
    stats: {},
    jobInsights: {}
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [courses, recommendations, achievements, stats] = await Promise.all([
        apiService.getMyCourses().catch(() => []),
        apiService.getCourseRecommendations().catch(() => []),
        apiService.getAchievements().catch(() => []),
        apiService.getProfileStats().catch(() => ({}))
      ]);

      setDashboardData({
        courses: courses || [],
        recommendations: recommendations || [],
        achievements: achievements || [],
        stats: stats || {},
        jobInsights: {
          demandTrend: "+23%",
          averageSalary: "₹8-12 LPA",
          topSkills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
          regionDemand: "High in Bangalore, Mumbai, Hyderabad"
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" data-testid="welcome-message">Welcome, {user.name}</h1>
                <p className="text-sm text-muted-foreground">{user.current_level} • {user.streak} day streak 🔥</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-success-light text-success-foreground">
                <Trophy className="h-3 w-3 mr-1" />
                {user.completed_credits} Credits
              </Badge>
              <Button variant="outline" size="sm">
                <BrainCircuit className="h-4 w-4 mr-2" />
                AI Mentor
              </Button>
              {/* Profile Dropdown */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8" data-testid="user-avatar">
                  <AvatarImage src={user.profile_picture} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab("profile")}
                    data-testid="profile-settings-button"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" data-testid="overview-tab">Overview</TabsTrigger>
            <TabsTrigger value="my-roadmap" data-testid="my-roadmap-tab">My Roadmap</TabsTrigger>
            <TabsTrigger value="generate-roadmap" data-testid="generate-roadmap-tab">Generate Roadmap</TabsTrigger>
            <TabsTrigger value="save-to-roadmap" data-testid="save-to-roadmap-tab">Save to My Roadmap</TabsTrigger>
            <TabsTrigger value="courses" data-testid="courses-tab">Courses</TabsTrigger>
            <TabsTrigger value="assessment" data-testid="assessment-tab">Assessment</TabsTrigger>
            <TabsTrigger value="profile" data-testid="profile-tab">Profile Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Learning Progress
                  </CardTitle>
                  <CardDescription>
                    Your journey towards {user.target_role || 'your career goals'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{user.completed_credits}% Complete</span>
                    </div>
                    <Progress value={user.completed_credits} className="h-3" />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Current Level</span>
                      <Badge variant="outline">{user.current_level}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-accent" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3" data-testid={`achievement-${index}`}>
                        <div className="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center">
                          <span className="text-lg">{achievement.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
                    {dashboardData.achievements.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Complete courses to earn achievements!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-secondary" />
                    Current Courses
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("courses")}>View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.courses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {dashboardData.courses.slice(0, 4).map((course, index) => (
                      <Card key={course.id || index} className="border-l-4 border-l-primary" data-testid={`course-${index}`}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <CardDescription>{course.provider}</CardDescription>
                            </div>
                            <Badge variant="outline">{course.level}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {course.duration}
                              </div>
                              <Button size="sm" variant="ghost" className="text-primary">
                                Continue <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses enrolled</h3>
                    <p className="text-muted-foreground mb-4">Start your learning journey today</p>
                    <Button onClick={() => setActiveTab("courses")}>Browse Courses</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2 text-accent" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized suggestions based on your profile and market trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recommendations.slice(0, 2).map((rec, index) => (
                      <Card key={index} className="border border-dashed hover:border-solid transition-all" data-testid={`recommendation-${index}`}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{rec.course?.title || `Recommended Course ${index + 1}`}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <span>{rec.course?.level || 'NSQF Level 4'}</span>
                                <span>•</span>
                                <span>{rec.course?.duration || '6 weeks'}</span>
                              </div>
                            </div>
                            <Badge className="bg-success-light text-success-foreground">
                              {rec.confidence || 85}% Match
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Why this suggestion?</p>
                            <div className="flex flex-wrap gap-2">
                              {(rec.reasons || ['Great for your level', 'Popular choice']).map((reason, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <Button variant="outline" size="sm">Learn More</Button>
                            <Button size="sm" className="bg-primary">
                              Add to Roadmap
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
                    <p className="text-muted-foreground mb-4">Complete your profile to get personalized suggestions</p>
                    <Button onClick={() => setActiveTab("profile")}>Complete Profile</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-roadmap">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="my-roadmaps-header">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  My Learning Roadmaps
                </CardTitle>
                <CardDescription>
                  View and manage your saved learning paths and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedRoadmapGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate-roadmap">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="generate-roadmap-header">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Generate Learning Roadmap
                </CardTitle>
                <CardDescription>
                  Create AI-powered personalized learning paths tailored to your career goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedRoadmapGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="save-to-roadmap">
            <SaveToRoadmap />
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-secondary" />
                  My Courses
                </CardTitle>
                <CardDescription>
                  Track your learning progress and continue your studies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.courses.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.courses.map((course, index) => (
                      <Card key={course.id || index} className="hover:shadow-lg transition-all" data-testid={`full-course-${index}`}>
                        <CardHeader>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{course.provider}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {course.duration}
                            </span>
                            <Badge variant="outline">{course.level}</Badge>
                          </div>

                          <Button className="w-full" data-testid={`continue-course-${index}`}>
                            {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses enrolled yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Explore our course catalog and start your learning journey
                    </p>
                    <Button>Browse Course Catalog</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment">
            <EnhancedAssessment />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearnerDashboard;