import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Clock, 
  CheckCircle2, 
  Award, 
  TrendingUp,
  FileText,
  Upload,
  Star,
  Target,
  BarChart3,
  ArrowRight,
  RefreshCw
} from "lucide-react";

export const SkillAssessment = () => {
  const [currentAssessment, setCurrentAssessment] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const assessmentTypes = [
    {
      id: "technical",
      title: "Technical Skills Assessment",
      description: "Evaluate your programming, data analysis, and technical problem-solving abilities",
      duration: "45 minutes",
      questions: 25,
      level: "Adaptive",
      skills: ["Python", "SQL", "Data Analysis", "Problem Solving"],
      icon: Brain
    },
    {
      id: "soft-skills",
      title: "Soft Skills Evaluation",
      description: "Assess communication, leadership, teamwork, and professional skills",
      duration: "30 minutes",
      questions: 20,
      level: "Behavioral",
      skills: ["Communication", "Leadership", "Teamwork", "Time Management"],
      icon: Target
    },
    {
      id: "industry",
      title: "Industry Knowledge Test",
      description: "Test your understanding of industry trends, best practices, and domain expertise",
      duration: "35 minutes",
      questions: 30,
      level: "Domain-specific",
      skills: ["Industry Trends", "Best Practices", "Regulations", "Market Knowledge"],
      icon: TrendingUp
    }
  ];

  // Sample questions for technical assessment
  const technicalQuestions = [
    {
      id: 1,
      question: "Which of the following is the most appropriate data structure for implementing a Last-In-First-Out (LIFO) mechanism?",
      options: [
        "Queue",
        "Stack",
        "Linked List",
        "Hash Table"
      ],
      difficulty: "Medium",
      skill: "Data Structures"
    },
    {
      id: 2,
      question: "In Python, what does the following code output?\n\n```python\nlist1 = [1, 2, 3]\nlist2 = list1\nlist2.append(4)\nprint(list1)\n```",
      options: [
        "[1, 2, 3]",
        "[1, 2, 3, 4]",
        "Error",
        "None"
      ],
      difficulty: "Easy",
      skill: "Python Programming"
    },
    {
      id: 3,
      question: "Which SQL clause is used to filter the results of a GROUP BY operation?",
      options: [
        "WHERE",
        "HAVING",
        "ORDER BY",
        "LIMIT"
      ],
      difficulty: "Medium",
      skill: "SQL"
    }
  ];

  const skillLevels = [
    { skill: "Python Programming", current: 75, target: 85, nsqfLevel: "Level 5" },
    { skill: "Data Analysis", current: 60, target: 80, nsqfLevel: "Level 4" },
    { skill: "Machine Learning", current: 40, target: 70, nsqfLevel: "Level 6" },
    { skill: "SQL", current: 80, target: 90, nsqfLevel: "Level 5" },
    { skill: "Statistics", current: 55, target: 75, nsqfLevel: "Level 5" },
    { skill: "Communication", current: 85, target: 90, nsqfLevel: "Level 4" }
  ];

  const rplDocuments = [
    {
      type: "Academic Certificates",
      status: "Verified",
      level: "NSQF Level 4",
      points: 25
    },
    {
      type: "Work Experience",
      status: "Under Review",
      level: "NSQF Level 5",
      points: 30
    },
    {
      type: "Industry Certifications",
      status: "Pending Upload",
      level: "-",
      points: 0
    }
  ];

  const startAssessment = (assessmentId: string) => {
    setCurrentAssessment(assessmentId);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < technicalQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const renderAssessmentList = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {assessmentTypes.map((assessment) => {
          const IconComponent = assessment.icon;
          return (
            <Card key={assessment.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{assessment.title}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {assessment.duration}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <FileText className="h-3 w-3 mr-1" />
                    {assessment.questions} questions
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">{assessment.level}</Badge>
                  <div className="flex flex-wrap gap-1">
                    {assessment.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-white"
                  onClick={() => startAssessment(assessment.id)}
                >
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Skill Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Your Current Skill Levels
          </CardTitle>
          <CardDescription>
            Based on previous assessments and course completions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillLevels.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{skill.skill}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {skill.nsqfLevel}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {skill.current}% / {skill.target}%
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={skill.current} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current</span>
                    <span>Target</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RPL Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-accent" />
            Recognition of Prior Learning (RPL)
          </CardTitle>
          <CardDescription>
            Upload your certificates and work experience for NSQF credit recognition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rplDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.level} • {doc.points} credits
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    className={
                      doc.status === 'Verified' ? 'bg-success-light text-success-foreground' :
                      doc.status === 'Under Review' ? 'bg-warning-light text-warning-foreground' :
                      'bg-muted text-muted-foreground'
                    }
                  >
                    {doc.status}
                  </Badge>
                  {doc.status === 'Pending Upload' && (
                    <Button size="sm" variant="outline">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAssessmentQuestion = () => {
    const question = technicalQuestions[currentQuestion];
    
    return (
      <div className="space-y-6">
        {/* Progress */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {technicalQuestions.length}
              </span>
              <Badge variant="outline">{question.difficulty}</Badge>
            </div>
            <Progress value={((currentQuestion + 1) / technicalQuestions.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-primary-light text-primary-foreground">
                {question.skill}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setCurrentAssessment(null)}>
                Exit Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
              
              <RadioGroup
                value={answers[currentQuestion] || ""}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => currentQuestion > 0 ? setCurrentQuestion(prev => prev - 1) : null}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button 
                onClick={nextQuestion}
                disabled={!answers[currentQuestion]}
                className="bg-primary hover:bg-primary/90"
              >
                {currentQuestion === technicalQuestions.length - 1 ? 'Submit' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResults = () => (
    <div className="space-y-6">
      <Card className="border-2 border-success">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
          <CardDescription>
            Here's your detailed skill analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">78%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success mb-2">NSQF 5</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">6 months</div>
              <div className="text-sm text-muted-foreground">To Next Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Python Programming</span>
                  <span className="font-semibold text-success">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Data Structures</span>
                  <span className="font-semibold text-primary">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>SQL</span>
                  <span className="font-semibold text-success">90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Problem Solving</span>
                  <span className="font-semibold text-warning">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary-light rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Focus Area: Problem Solving</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Your weakest area. Recommended courses:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Algorithms & Logic</Badge>
                <Badge variant="outline">Coding Interview Prep</Badge>
                <Badge variant="outline">Competitive Programming</Badge>
              </div>
            </div>
            
            <div className="p-4 bg-success-light rounded-lg">
              <h4 className="font-semibold mb-2">⭐ Strength: SQL</h4>
              <p className="text-sm text-muted-foreground">
                You excel here! Consider advanced topics like query optimization and database design.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => setCurrentAssessment(null)} className="flex-1">
          Take Another Assessment
        </Button>
        <Button variant="outline" className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retake Assessment
        </Button>
      </div>
    </div>
  );

  if (showResults) {
    return renderResults();
  }

  if (currentAssessment && !showResults) {
    return renderAssessmentQuestion();
  }

  return renderAssessmentList();
};