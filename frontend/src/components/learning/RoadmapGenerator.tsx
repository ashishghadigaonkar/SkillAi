import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Target, 
  Clock, 
  Brain, 
  TrendingUp, 
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Calendar,
  BookOpen,
  Award,
  Briefcase
} from "lucide-react";

export const RoadmapGenerator = () => {
  const [currentGoal, setCurrentGoal] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [experience, setExperience] = useState("");
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Mock roadmap data
  const roadmapPhases = [
    {
      phase: 1,
      title: "Foundation Building",
      duration: "3 months",
      level: "NSQF Level 4",
      status: "completed",
      courses: [
        { name: "Python Programming Basics", status: "completed", duration: "6 weeks" },
        { name: "Introduction to Data Science", status: "completed", duration: "4 weeks" },
        { name: "Excel for Data Analysis", status: "completed", duration: "2 weeks" }
      ]
    },
    {
      phase: 2,
      title: "Core Skills Development",
      duration: "4 months",
      level: "NSQF Level 5",
      status: "in-progress",
      courses: [
        { name: "Statistics & Probability", status: "completed", duration: "6 weeks" },
        { name: "SQL Database Management", status: "in-progress", duration: "5 weeks" },
        { name: "Data Visualization with Python", status: "pending", duration: "6 weeks" }
      ]
    },
    {
      phase: 3,
      title: "Specialization",
      duration: "5 months",
      level: "NSQF Level 6",
      status: "pending",
      courses: [
        { name: "Machine Learning Fundamentals", status: "pending", duration: "8 weeks" },
        { name: "Deep Learning Basics", status: "pending", duration: "6 weeks" },
        { name: "MLOps and Deployment", status: "pending", duration: "6 weeks" }
      ]
    },
    {
      phase: 4,
      title: "Industry Experience",
      duration: "6 months",
      level: "NSQF Level 7",
      status: "pending",
      courses: [
        { name: "Capstone Project", status: "pending", duration: "12 weeks" },
        { name: "Industry Internship", status: "pending", duration: "12 weeks" },
        { name: "Professional Certification", status: "pending", duration: "2 weeks" }
      ]
    }
  ];

  const milestones = [
    { title: "Complete Python Fundamentals", date: "Dec 2024", achieved: true },
    { title: "Data Analysis Certificate", date: "Jan 2025", achieved: true },
    { title: "SQL Proficiency Badge", date: "Feb 2025", achieved: false },
    { title: "First ML Model Deployment", date: "Apr 2025", achieved: false },
    { title: "Industry Internship", date: "Aug 2025", achieved: false }
  ];

  const generateRoadmap = () => {
    setShowRoadmap(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <Circle className="h-5 w-5 text-primary fill-primary/20" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-success bg-success-light';
      case 'in-progress':
        return 'border-primary bg-primary-light';
      default:
        return 'border-muted bg-muted/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Roadmap Generator Form */}
      {!showRoadmap && (
        <Card className="border-2 border-dashed border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-primary" />
              AI Roadmap Generator
            </CardTitle>
            <CardDescription>
              Let our AI create a personalized learning roadmap based on your goals and current skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Career Goal</label>
                <Input
                  placeholder="e.g., AI/ML Engineer, Data Scientist"
                  value={currentGoal}
                  onChange={(e) => setCurrentGoal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Desired Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">6 months</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                    <SelectItem value="2years">2 years</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Experience Level</label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Complete Beginner</SelectItem>
                  <SelectItem value="basic">Basic Knowledge</SelectItem>
                  <SelectItem value="intermediate">Some Experience</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Context (Optional)</label>
              <Textarea
                placeholder="Tell us about your educational background, interests, or specific areas you'd like to focus on..."
                rows={3}
              />
            </div>

            <Button 
              onClick={generateRoadmap} 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              disabled={!currentGoal || !timeframe || !experience}
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate My Personalized Roadmap
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Roadmap */}
      {showRoadmap && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your AI-Generated Learning Roadmap</h2>
              <p className="text-muted-foreground">Path to becoming an AI/ML Engineer in 18 months</p>
            </div>
            <Button variant="outline" onClick={() => setShowRoadmap(false)}>
              Regenerate Roadmap
            </Button>
          </div>

          {/* Roadmap Timeline */}
          <div className="space-y-6">
            {roadmapPhases.map((phase, index) => (
              <Card key={phase.phase} className={`${getStatusColor(phase.status)} transition-all duration-300 hover:shadow-lg`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {phase.phase}
                      </div>
                      <div>
                        <CardTitle className="flex items-center">
                          {getStatusIcon(phase.status)}
                          <span className="ml-2">{phase.title}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {phase.duration}
                          </span>
                          <Badge variant="outline">{phase.level}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                    {phase.status === 'in-progress' && (
                      <Badge className="bg-primary text-primary-foreground">
                        Current Phase
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {phase.courses.map((course, courseIndex) => (
                      <div key={courseIndex} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(course.status)}
                          <div>
                            <p className="font-medium">{course.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {course.duration}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant={course.status === 'pending' ? 'outline' : 'ghost'}>
                          {course.status === 'completed' ? 'View Certificate' : 
                           course.status === 'in-progress' ? 'Continue' : 'Start Course'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Milestones Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-accent" />
                Key Milestones
              </CardTitle>
              <CardDescription>
                Important achievements along your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                    <div className={`h-4 w-4 rounded-full ${milestone.achieved ? 'bg-success' : 'bg-muted-foreground'}`} />
                    <div className="flex-1">
                      <p className={`font-medium ${milestone.achieved ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {milestone.title}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {milestone.date}
                      </p>
                    </div>
                    {milestone.achieved && (
                      <Badge className="bg-success-light text-success-foreground">
                        <Award className="h-3 w-3 mr-1" />
                        Achieved
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Career Progression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Expected Career Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-pathway-beginner" />
                  <h4 className="font-semibold">Junior Data Analyst</h4>
                  <p className="text-sm text-muted-foreground">After 6 months</p>
                  <p className="text-lg font-bold text-pathway-beginner">₹4-6 LPA</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-pathway-intermediate" />
                  <h4 className="font-semibold">ML Engineer</h4>
                  <p className="text-sm text-muted-foreground">After 12 months</p>
                  <p className="text-lg font-bold text-pathway-intermediate">₹8-12 LPA</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-pathway-expert" />
                  <h4 className="font-semibold">Senior AI Engineer</h4>
                  <p className="text-sm text-muted-foreground">After 18 months</p>
                  <p className="text-lg font-bold text-pathway-expert">₹15-25 LPA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};