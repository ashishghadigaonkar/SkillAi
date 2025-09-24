import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  FileText,
  BarChart,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { toast } from "@/hooks/use-toast";

const TrainerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [trainerData, setTrainerData] = useState({
    stats: {
      totalLearners: 0,
      activeCourses: 0,
      completionRate: 0,
      avgRating: 0
    },
    activeBatches: [],
    recentActivity: [],
    upcomingClasses: []
  });

  useEffect(() => {
    if (user) {
      loadTrainerData();
    }
  }, [user]);

  const loadTrainerData = async () => {
    try {
      setIsLoading(true);
      
      // For now, using mock data. In production, these would be API calls
      const mockTrainerData = {
        stats: {
          totalLearners: 248,
          activeCourses: 6,
          completionRate: 78,
          avgRating: 4.8
        },
        activeBatches: [
          {
            id: 1,
            course: "Python Programming Fundamentals",
            learners: 45,
            progress: 65,
            startDate: "Jan 10, 2025",
            endDate: "Mar 15, 2025",
            atRisk: 3,
            status: "Active"
          },
          {
            id: 2,
            course: "Data Analysis with Excel",
            learners: 32,
            progress: 85,
            startDate: "Dec 15, 2024",
            endDate: "Feb 10, 2025",
            atRisk: 1,
            status: "Active"
          }
        ],
        recentActivity: [
          { type: "assignment", message: "Assignment 3 submitted by Rahul Sharma", time: "2 hours ago" },
          { type: "question", message: "New question posted in Python Basics forum", time: "4 hours ago" },
          { type: "completion", message: "5 learners completed Module 2", time: "6 hours ago" },
          { type: "enrollment", message: "New learner enrolled in Data Analysis course", time: "8 hours ago" }
        ],
        upcomingClasses: [
          { course: "Python Fundamentals", time: "Today 2:00 PM", attendees: 45 },
          { course: "Data Analysis", time: "Tomorrow 10:00 AM", attendees: 32 },
          { course: "Machine Learning Basics", time: "Jan 26 3:00 PM", attendees: 28 }
        ]
      };

      setTrainerData(mockTrainerData);
    } catch (error) {
      console.error('Failed to load trainer data:', error);
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

  const handleCreateCourse = () => {
    toast({
      title: "Course Creation",
      description: "Course creation feature coming soon!",
    });
  };

  const handleScheduleClass = () => {
    toast({
      title: "Class Scheduled",
      description: "Class scheduling feature coming soon!",
    });
  };

  if (!user) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading trainer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" data-testid="trainer-welcome">Welcome, {user.name}</h1>
                <p className="text-sm text-muted-foreground">Trainer Dashboard • {user.current_level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages (3)
              </Button>
              <Button size="sm" className="bg-secondary hover:bg-secondary/90" onClick={handleScheduleClass}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Class
              </Button>
              {/* Profile Dropdown */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8" data-testid="trainer-avatar">
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
                    data-testid="trainer-profile-button"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    data-testid="trainer-logout-button"
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" data-testid="trainer-overview-tab">Overview</TabsTrigger>
            <TabsTrigger value="batches" data-testid="trainer-batches-tab">My Batches</TabsTrigger>
            <TabsTrigger value="courses" data-testid="trainer-courses-tab">Course Management</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="trainer-analytics-tab">Analytics</TabsTrigger>
            <TabsTrigger value="schedule" data-testid="trainer-schedule-tab">Schedule</TabsTrigger>
            <TabsTrigger value="profile" data-testid="trainer-profile-tab">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-secondary" data-testid="total-learners-stat">
                        {trainerData.stats.totalLearners}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Learners</p>
                    </div>
                    <Users className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary" data-testid="active-courses-stat">
                        {trainerData.stats.activeCourses}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Courses</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-success" data-testid="completion-rate-stat">
                        {trainerData.stats.completionRate}%
                      </p>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-accent" data-testid="avg-rating-stat">
                        {trainerData.stats.avgRating}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                    <Award className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Batches Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-secondary" />
                      Active Batches
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("batches")}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trainerData.activeBatches.slice(0, 2).map((batch) => (
                    <Card key={batch.id} className="border-l-4 border-l-secondary" data-testid={`batch-overview-${batch.id}`}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{batch.course}</h4>
                            <p className="text-sm text-muted-foreground">{batch.learners} learners</p>
                          </div>
                          <Badge className="bg-secondary-light text-secondary-foreground">
                            {batch.progress}%
                          </Badge>
                        </div>
                        <Progress value={batch.progress} className="h-2 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainerData.recentActivity.slice(0, 4).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg" data-testid={`activity-${index}`}>
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                          {activity.type === 'assignment' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                          {activity.type === 'question' && <MessageSquare className="h-3 w-3 text-accent" />}
                          {activity.type === 'completion' && <Award className="h-3 w-3 text-success" />}
                          {activity.type === 'enrollment' && <Users className="h-3 w-3 text-secondary" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  <Button className="w-full justify-start bg-primary hover:bg-primary/90" onClick={handleCreateCourse}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Course
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Add Learners
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    Generate Certificates
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("analytics")}>
                    <BarChart className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-secondary" />
                    Active Training Batches
                  </div>
                  <Button onClick={handleCreateCourse} data-testid="create-new-batch-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Batch
                  </Button>
                </CardTitle>
                <CardDescription>
                  Monitor progress and manage your current training programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trainerData.activeBatches.map((batch) => (
                  <Card key={batch.id} className="border-l-4 border-l-secondary" data-testid={`full-batch-${batch.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{batch.course}</h4>
                          <p className="text-sm text-muted-foreground">
                            {batch.startDate} - {batch.endDate}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-secondary-light text-secondary-foreground">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {batch.learners} learners
                          </Badge>
                          {batch.atRisk > 0 && (
                            <Badge className="bg-warning-light text-warning-foreground">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {batch.atRisk} at risk
                            </Badge>
                          )}
                          <Badge className="bg-success-light text-success-foreground">
                            {batch.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{batch.progress}%</span>
                        </div>
                        <Progress value={batch.progress} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            Send Message
                          </Button>
                        </div>
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                          Manage Batch
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Course Management
                </CardTitle>
                <CardDescription>
                  Create, edit, and manage your training courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Course Management System</h3>
                  <p className="text-muted-foreground mb-6">
                    Advanced course creation and management tools coming soon
                  </p>
                  <Button onClick={handleCreateCourse} data-testid="create-course-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-accent" />
                  Training Analytics
                </CardTitle>
                <CardDescription>
                  Detailed insights into your training effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics Dashboard</h3>
                  <p className="text-muted-foreground mb-6">
                    Detailed learner progress analytics and reporting tools
                  </p>
                  <Button variant="outline">Explore Analytics Features</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-secondary" />
                    Class Schedule
                  </div>
                  <Button onClick={handleScheduleClass} data-testid="schedule-class-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Class
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your upcoming classes and sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trainerData.upcomingClasses.map((classItem, index) => (
                  <Card key={index} className="p-4" data-testid={`scheduled-class-${index}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{classItem.course}</h4>
                        <p className="text-sm text-muted-foreground">{classItem.time}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {classItem.attendees} attendees
                        </Badge>
                        <Button size="sm" variant="outline">
                          Join Class
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrainerDashboard;