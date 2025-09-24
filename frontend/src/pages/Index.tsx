import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, BarChart3, Brain, ArrowRight, CheckCircle, TrendingUp, Target } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [userRole, setUserRole] = useState<'learner' | 'trainer' | 'policymaker' | null>(null);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Pathways",
      description: "Personalized learning journeys aligned with NSQF standards"
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Real-time job market insights and skill demand forecasting"
    },
    {
      icon: Target,
      title: "Roadmap Generator",
      description: "Dynamic career roadmaps that adapt to your progress"
    },
    {
      icon: CheckCircle,
      title: "NSQF Certification",
      description: "Government-recognized qualifications and micro-credentials"
    }
  ];

  const stats = [
    { value: "10M+", label: "Learners Empowered" },
    { value: "5000+", label: "Skill Programs" },
    { value: "95%", label: "Employment Rate" },
    { value: "28", label: "States Covered" }
  ];

  const handleRoleSelect = (role: 'learner' | 'trainer' | 'policymaker') => {
    setUserRole(role);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/20 to-accent-light/30">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SkillPath AI</h1>
                <p className="text-xs text-muted-foreground">Smart India Initiative</p>
              </div>
            </div>
            <Button onClick={() => setShowAuth(true)} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-success-light text-success-foreground">
            🇮🇳 Smart India Hackathon 2025
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            AI-Powered Learning
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
              Pathways for India
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Personalized skill development journeys aligned with NSQF standards. 
            Empowering millions with AI-driven career roadmaps and market intelligence.
          </p>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-primary/50"
              onClick={() => handleRoleSelect('learner')}
            >
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">I'm a Learner</CardTitle>
                <CardDescription>
                  Discover personalized pathways to achieve your career goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-secondary/50"
              onClick={() => handleRoleSelect('trainer')}
            >
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-full bg-secondary-light flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">I'm a Trainer</CardTitle>
                <CardDescription>
                  Manage courses and track learner progress effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:bg-secondary group-hover:text-white">
                  Manage Training <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-accent/50"
              onClick={() => handleRoleSelect('policymaker')}
            >
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">I'm a Policymaker</CardTitle>
                <CardDescription>
                  Access analytics and insights for policy decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-white">
                  View Analytics <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines artificial intelligence with India's National Skills Qualifications Framework
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        selectedRole={userRole}
      />
    </div>
  );
};

export default Index;