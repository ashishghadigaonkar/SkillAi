import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trophy
} from "lucide-react";
import { RoadmapGenerator } from "@/components/learning/RoadmapGenerator";
import { LearningPathVisualization } from "@/components/learning/LearningPathVisualization";
import { SkillAssessment } from "@/components/learning/SkillAssessment";

const LearnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock learner data
  const learnerProfile = {
    name: "Priya Sharma",
    currentLevel: "NSQF Level 4",
    targetRole: "AI/ML Engineer",
    completedCredits: 65,
    totalCredits: 100,
    streak: 12,
    nextMilestone: "Complete Data Analysis Certification"
  };

  const currentCourses = [
    {
      id: 1,
      title: "Python Programming Fundamentals",
      provider: "TechSkill India",
      progress: 78,
      level: "NSQF Level 4",
      duration: "6 weeks",
      nextDeadline: "Assignment 3 - Due in 2 days"
    },
    {
      id: 2,
      title: "Data Analysis with Excel",
      provider: "Skill India Digital",
      progress: 45,
      level: "NSQF Level 4",
      duration: "4 weeks",
      nextDeadline: "Quiz 2 - Due tomorrow"
    }
  ];

  const recommendations = [
    {
      title: "Machine Learning Basics",
      confidence: 92,
      reasons: ["Aligns with AI/ML career goal", "Builds on Python skills", "High job demand"],
      level: "NSQF Level 5",
      duration: "8 weeks"
    },
    {
      title: "Statistics for Data Science",
      confidence: 89,
      reasons: ["Essential for ML", "Complements current learning", "Industry requirement"],
      level: "NSQF Level 5",
      duration: "6 weeks"
    }
  ];

  const achievements = [
    { title: "Python Basics", date: "2 weeks ago", type: "certification" },
    { title: "7-Day Streak", date: "Yesterday", type: "milestone" },
    { title: "Excel Expert", date: "1 month ago", type: "badge" }
  ];

  const jobInsights = {
    demandTrend: "+23%",
    averageSalary: "₹8-12 LPA",
    topSkills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
    regionDemand: "High in Bangalore, Mumbai, Hyderabad"
  };

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
                <h1 className="text-xl font-bold">Welcome, {learnerProfile.name}</h1>
                <p className="text-sm text-muted-foreground">{learnerProfile.currentLevel} • {learnerProfile.streak} day streak 🔥</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-success-light text-success-foreground">
                <Trophy className="h-3 w-3 mr-1" />
                {learnerProfile.completedCredits} Credits
              </Badge>
              <Button variant="outline" size="sm">
                <BrainCircuit className="h-4 w-4 mr-2" />
                AI Mentor
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roadmap">My Roadmap</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
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
                    Your journey towards {learnerProfile.targetRole}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{learnerProfile.completedCredits}% Complete</span>
                    </div>
                    <Progress value={learnerProfile.completedCredits} className="h-3" />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Next Milestone</span>
                      <Badge variant="outline">{learnerProfile.nextMilestone}</Badge>
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
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center">
                          {achievement.type === 'certification' && <Award className="h-4 w-4 text-accent" />}
                          {achievement.type === 'milestone' && <Star className="h-4 w-4 text-primary" />}
                          {achievement.type === 'badge' && <Trophy className="h-4 w-4 text-success" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
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
                  <Button variant="outline" size="sm">View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentCourses.map((course) => (
                    <Card key={course.id} className="border-l-4 border-l-primary">
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
                          <div className="text-xs text-warning font-medium">
                            ⏰ {course.nextDeadline}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="border border-dashed hover:border-solid transition-all">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{rec.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>{rec.level}</span>
                              <span>•</span>
                              <span>{rec.duration}</span>
                            </div>
                          </div>
                          <Badge className="bg-success-light text-success-foreground">
                            {rec.confidence}% Match
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Why this suggestion?</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.reasons.map((reason, i) => (
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap">
            <RoadmapGenerator />
          </TabsContent>

          <TabsContent value="courses">
            <LearningPathVisualization />
          </TabsContent>

          <TabsContent value="assessment">
            <SkillAssessment />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Job Market Insights: {learnerProfile.targetRole}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-success-light rounded-lg">
                      <span className="font-medium">Demand Trend</span>
                      <span className="text-2xl font-bold text-success">{jobInsights.demandTrend}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-info-light rounded-lg">
                      <span className="font-medium">Average Salary</span>
                      <span className="text-2xl font-bold text-info">{jobInsights.averageSalary}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Top Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {jobInsights.topSkills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Regional Demand
                      </h4>
                      <p className="text-sm text-muted-foreground">{jobInsights.regionDemand}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearnerDashboard;