import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Calendar,
  Settings,
  LogOut,
  PieChart,
  Globe,
  BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { toast } from "@/hooks/use-toast";

const PolicyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [policyData, setPolicyData] = useState({
    overallStats: {
      totalLearners: 156400,
      activeCourses: 1250,
      employmentRate: 73,
      skillGapReduction: 28
    },
    stateData: [],
    skillDemands: [],
    nsqfAlignment: []
  });

  useEffect(() => {
    if (user) {
      loadPolicyData();
    }
  }, [user]);

  const loadPolicyData = async () => {
    try {
      setIsLoading(true);
      
      // Mock policy data - in production, this would come from analytics APIs
      const mockPolicyData = {
        overallStats: {
          totalLearners: 156400,
          activeCourses: 1250,
          employmentRate: 73,
          skillGapReduction: 28
        },
        stateData: [
          { state: "Maharashtra", learners: 23400, completion: 78, employment: 82 },
          { state: "Karnataka", learners: 19800, completion: 81, employment: 79 },
          { state: "Tamil Nadu", learners: 18200, completion: 75, employment: 75 },
          { state: "Uttar Pradesh", learners: 16900, completion: 68, employment: 65 },
          { state: "Gujarat", learners: 12100, completion: 83, employment: 88 }
        ],
        skillDemands: [
          { skill: "Data Science & AI", demand: "High", growth: "+34%", gap: "Critical" },
          { skill: "Digital Marketing", demand: "High", growth: "+28%", gap: "Moderate" },
          { skill: "Cloud Computing", demand: "Very High", growth: "+45%", gap: "Critical" },
          { skill: "Mobile App Development", demand: "High", growth: "+31%", gap: "High" },
          { skill: "Cybersecurity", demand: "Very High", growth: "+52%", gap: "Critical" }
        ],
        nsqfAlignment: [
          { level: "Level 4", courses: 245, learners: 34500, compliance: 92 },
          { level: "Level 5", courses: 189, learners: 28900, compliance: 87 },
          { level: "Level 6", courses: 156, learners: 22100, compliance: 89 },
          { level: "Level 7", courses: 98, learners: 15400, compliance: 94 }
        ]
      };

      setPolicyData(mockPolicyData);
    } catch (error) {
      console.error('Failed to load policy data:', error);
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

  const handleExportReport = () => {
    toast({
      title: "Report Export",
      description: "Generating comprehensive policy report...",
    });
  };

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

  if (!user) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent-light/10 to-primary-light/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading policy dashboard...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold" data-testid="policy-welcome">Welcome, {user.name}</h1>
                <p className="text-sm text-muted-foreground">Policy Analytics Dashboard • Ministry of Skill Development</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              {/* Profile Dropdown */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8" data-testid="policy-avatar">
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
                    data-testid="policy-profile-button"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    data-testid="policy-logout-button"
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
            <TabsTrigger value="overview" data-testid="policy-overview-tab">National Overview</TabsTrigger>
            <TabsTrigger value="regional" data-testid="policy-regional-tab">Regional Analysis</TabsTrigger>
            <TabsTrigger value="skills" data-testid="policy-skills-tab">Skill Gaps</TabsTrigger>
            <TabsTrigger value="nsqf" data-testid="policy-nsqf-tab">NSQF Compliance</TabsTrigger>
            <TabsTrigger value="outcomes" data-testid="policy-outcomes-tab">Outcomes</TabsTrigger>
            <TabsTrigger value="reports" data-testid="policy-reports-tab">Reports</TabsTrigger>
            <TabsTrigger value="profile" data-testid="policy-profile-tab">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* National Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary" data-testid="total-learners-policy">
                        {policyData.overallStats.totalLearners.toLocaleString()}
                      </p>
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
                      <p className="text-2xl font-bold text-secondary" data-testid="active-programs-policy">
                        {policyData.overallStats.activeCourses.toLocaleString()}
                      </p>
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
                      <p className="text-2xl font-bold text-success" data-testid="employment-rate-policy">
                        {policyData.overallStats.employmentRate}%
                      </p>
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
                      <p className="text-2xl font-bold text-accent" data-testid="gap-reduction-policy">
                        {policyData.overallStats.skillGapReduction}%
                      </p>
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-accent" />
                    State Performance Overview
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("regional")}>
                    View Regional Details
                  </Button>
                </CardTitle>
                <CardDescription>
                  Top 5 states by learner enrollment and outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policyData.stateData.map((state, index) => (
                    <div key={state.state} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`state-${index}`}>
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

            {/* Quick Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-warning" />
                    Priority Actions Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border-l-4 border-l-red-500 bg-red-50">
                    <h4 className="font-semibold text-red-700">Critical Skill Gaps</h4>
                    <p className="text-sm text-red-600">Cybersecurity and Cloud Computing showing 50%+ skill gaps</p>
                  </div>
                  <div className="p-3 border-l-4 border-l-yellow-500 bg-yellow-50">
                    <h4 className="font-semibold text-yellow-700">Regional Disparities</h4>
                    <p className="text-sm text-yellow-600">Northern states lagging in digital skills adoption</p>
                  </div>
                  <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50">
                    <h4 className="font-semibold text-blue-700">Funding Opportunities</h4>
                    <p className="text-sm text-blue-600">₹2.3B available for skill development initiatives</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-success" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-success-light rounded-lg">
                    <span className="text-success-foreground font-medium">Employment Rate Increase</span>
                    <Badge className="bg-success text-success-foreground">+5.2%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary-light rounded-lg">
                    <span className="text-primary-foreground font-medium">New Programs Launched</span>
                    <Badge className="bg-primary text-primary-foreground">125</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent-light rounded-lg">
                    <span className="text-accent-foreground font-medium">NSQF Compliance Improved</span>
                    <Badge className="bg-accent text-accent-foreground">+12%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  Regional Performance Analytics
                </CardTitle>
                <CardDescription>
                  Detailed analysis of skill development programs across Indian states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Regional Map</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed regional analytics with interactive heatmaps and drill-down capabilities
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
                  {policyData.skillDemands.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`skill-gap-${index}`}>
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
                  {policyData.nsqfAlignment.map((level, index) => (
                    <div key={index} className="p-4 border rounded-lg" data-testid={`nsqf-level-${index}`}>
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
                    <div className="text-4xl font-bold text-success mb-2" data-testid="overall-employment-rate">73%</div>
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
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    Program Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2" data-testid="program-rating">4.6</div>
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

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Policy Reports & Analytics
                  </div>
                  <Button onClick={handleExportReport} data-testid="generate-report-button">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardTitle>
                <CardDescription>
                  Comprehensive policy reports and data exports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Reporting Suite</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate comprehensive policy reports with detailed analytics and recommendations
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button variant="outline">Monthly Report</Button>
                    <Button variant="outline">Quarterly Analysis</Button>
                    <Button variant="outline">Annual Summary</Button>
                    <Button variant="outline">Custom Report</Button>
                  </div>
                </div>
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

export default PolicyDashboard;