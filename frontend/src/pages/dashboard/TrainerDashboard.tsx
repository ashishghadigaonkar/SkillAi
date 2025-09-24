import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  MessageSquare
} from "lucide-react";

const TrainerDashboard = () => {
  const trainerStats = {
    totalLearners: 248,
    activeCourses: 6,
    completionRate: 78,
    avgRating: 4.8
  };

  const activeBatches = [
    {
      id: 1,
      course: "Python Programming Fundamentals",
      learners: 45,
      progress: 65,
      startDate: "Jan 10, 2025",
      endDate: "Mar 15, 2025",
      atRisk: 3
    },
    {
      id: 2,
      course: "Data Analysis with Excel",
      learners: 32,
      progress: 85,
      startDate: "Dec 15, 2024",
      endDate: "Feb 10, 2025",
      atRisk: 1
    }
  ];

  const recentActivity = [
    { type: "assignment", message: "Assignment 3 submitted by Rahul Sharma", time: "2 hours ago" },
    { type: "question", message: "New question posted in Python Basics forum", time: "4 hours ago" },
    { type: "completion", message: "5 learners completed Module 2", time: "6 hours ago" }
  ];

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
                <h1 className="text-xl font-bold">Trainer Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, Dr. Anjali Gupta</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages (3)
              </Button>
              <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Class
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-secondary">{trainerStats.totalLearners}</p>
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
                  <p className="text-2xl font-bold text-primary">{trainerStats.activeCourses}</p>
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
                  <p className="text-2xl font-bold text-success">{trainerStats.completionRate}%</p>
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
                  <p className="text-2xl font-bold text-accent">{trainerStats.avgRating}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
                <Award className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Batches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-secondary" />
              Active Training Batches
            </CardTitle>
            <CardDescription>
              Monitor progress and manage your current training programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeBatches.map((batch) => (
                <Card key={batch.id} className="border-l-4 border-l-secondary">
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
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{batch.progress}%</span>
                      </div>
                      <Progress value={batch.progress} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center mt-4">
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
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
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
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      {activity.type === 'assignment' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                      {activity.type === 'question' && <MessageSquare className="h-3 w-3 text-accent" />}
                      {activity.type === 'completion' && <Award className="h-3 w-3 text-success" />}
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                <BookOpen className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Add Learners to Batch
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Award className="h-4 w-4 mr-2" />
                Generate Certificates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;