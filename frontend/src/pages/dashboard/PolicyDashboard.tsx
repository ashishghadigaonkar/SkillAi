import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin,
  Award,
  Target,
  AlertCircle,
  CheckCircle2,
  FileText,
  Download,
  Filter,
  Calendar
} from "lucide-react";

const PolicyDashboard = () => {
  const overallStats = {
    totalLearners: 156400,
    activeCourses: 1250,
    employmentRate: 73,
    skillGapReduction: 28
  };

  const stateData = [
    { state: "Maharashtra", learners: 23400, completion: 78, employment: 82 },
    { state: "Karnataka", learners: 19800, completion: 81, employment: 79 },
    { state: "Tamil Nadu", learners: 18200, completion: 75, employment: 75 },
    { state: "Uttar Pradesh", learners: 16900, completion: 68, employment: 65 },
    { state: "Gujarat", learners: 12100, completion: 83, employment: 88 }
  ];

  const skillDemands = [
    { skill: "Data Science & AI", demand: "High", growth: "+34%", gap: "Critical" },
    { skill: "Digital Marketing", demand: "High", growth: "+28%", gap: "Moderate" },
    { skill: "Cloud Computing", demand: "Very High", growth: "+45%", gap: "Critical" },
    { skill: "Mobile App Development", demand: "High", growth: "+31%", gap: "High" },
    { skill: "Cybersecurity", demand: "Very High", growth: "+52%", gap: "Critical" }
  ];

  const nsqfAlignment = [
    { level: "Level 4", courses: 245, learners: 34500, compliance: 92 },
    { level: "Level 5", courses: 189, learners: 28900, compliance: 87 },
    { level: "Level 6", courses: 156, learners: 22100, compliance: 89 },
    { level: "Level 7", courses: 98, learners: 15400, compliance: 94 }
  ];

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'Very High': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getGapColor = (gap: string) => {
    switch (gap) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent-light/10 to-primary-light/20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Policy Analytics Dashboard</h1>
                <p className="text-sm text-muted-foreground">Ministry of Skill Development & Entrepreneurship</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button size="sm" className="bg-accent hover:bg-accent/90">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
            <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
            <TabsTrigger value="nsqf">NSQF Compliance</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* National Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">{overallStats.totalLearners.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Learners</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-secondary">{overallStats.activeCourses.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Active Programs</p>
                    </div>
                    <Award className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-success">{overallStats.employmentRate}%</p>
                      <p className="text-sm text-muted-foreground">Employment Rate</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-accent">{overallStats.skillGapReduction}%</p>
                      <p className="text-sm text-muted-foreground">Gap Reduction</p>
                    </div>
                    <Target className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing States */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-accent" />
                  State Performance Overview
                </CardTitle>
                <CardDescription>
                  Top 5 states by learner enrollment and outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stateData.map((state, index) => (
                    <div key={state.state} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{state.state}</p>
                          <p className="text-sm text-muted-foreground">
                            {state.learners.toLocaleString()} learners enrolled
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{state.completion}%</p>
                          <p className="text-xs text-muted-foreground">Completion</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{state.employment}%</p>
                          <p className="text-xs text-muted-foreground">Employment</p>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed analysis of skill development programs across Indian states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Map View</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed regional analytics and heatmaps coming soon
                  </p>
                  <Button>Explore Regional Data</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-warning" />
                  Critical Skill Gap Analysis
                </CardTitle>
                <CardDescription>
                  Industry demand vs. available skilled workforce
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillDemands.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{skill.skill}</h4>
                        <p className="text-sm text-muted-foreground">
                          Market growth: {skill.growth} year-over-year
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getDemandColor(skill.demand)}>
                          {skill.demand} Demand
                        </Badge>
                        <Badge className={getGapColor(skill.gap)}>
                          {skill.gap} Gap
                        </Badge>
                        <Button size="sm" variant="outline">
                          Action Plan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nsqf" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-primary" />
                  NSQF Compliance Dashboard
                </CardTitle>
                <CardDescription>
                  National Skills Qualifications Framework alignment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nsqfAlignment.map((level, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-semibold">NSQF {level.level}</h4>
                          <p className="text-sm text-muted-foreground">
                            {level.courses} courses • {level.learners.toLocaleString()} learners
                          </p>
                        </div>
                        <Badge className={level.compliance >= 90 ? 'bg-success-light text-success-foreground' : 'bg-warning-light text-warning-foreground'}>
                          {level.compliance}% Compliant
                        </Badge>
                      </div>
                      <Progress value={level.compliance} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-success" />
                    Placement Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-success mb-2">73%</div>
                    <div className="text-sm text-muted-foreground">Overall Employment Rate</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Within 3 months</span>
                      <span className="font-semibold">58%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Within 6 months</span>
                      <span className="font-semibold">73%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average salary increase</span>
                      <span className="font-semibold">+42%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Program Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">4.6</div>
                    <div className="text-sm text-muted-foreground">Average Program Rating</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Course completion rate</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skills improvement</span>
                      <span className="font-semibold">+65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Industry relevance</span>
                      <span className="font-semibold">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PolicyDashboard;