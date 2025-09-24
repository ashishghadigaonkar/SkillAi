import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Brain, 
  Target,
  Sparkles,
  RotateCcw,
  Play,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "../../services/api";

export const EnhancedAssessment = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Assessment creation form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    type: 'multiple_choice',
    difficulty: 'beginner',
    subject: '',
    duration_minutes: 30
  });

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      handleSubmitAssessment();
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const loadAssessments = async () => {
    try {
      const data = await apiService.getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Failed to load assessments:', error);
    }
  };

  const startAssessment = async (assessment: any) => {
    try {
      const fullAssessment = await apiService.getAssessment(assessment.id);
      setSelectedAssessment(fullAssessment);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeRemaining(fullAssessment.duration_minutes * 60);
      setIsActive(true);
      setShowResults(false);
    } catch (error: any) {
      toast({
        title: "Failed to start assessment",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!selectedAssessment) return;
    
    setIsLoading(true);
    setIsActive(false);
    
    try {
      const timeTaken = selectedAssessment.duration_minutes - Math.floor(timeRemaining / 60);
      const submissionData = {
        ...answers,
        time_taken: timeTaken
      };
      
      const result = await apiService.submitAssessment(selectedAssessment.id, submissionData);
      setResults(result);
      setShowResults(true);
      
      toast({
        title: "Assessment completed!",
        description: `You scored ${result.percentage.toFixed(1)}%`,
      });
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewAssessment = async () => {
    if (!createForm.title || !createForm.subject) {
      toast({
        title: "Please fill required fields",
        description: "Title and subject are required",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await apiService.createAssessment(createForm);
      
      toast({
        title: "Assessment created!",
        description: "Your new assessment has been generated",
      });
      
      setShowCreateForm(false);
      setCreateForm({
        title: '',
        description: '',
        type: 'multiple_choice',
        difficulty: 'beginner',
        subject: '',
        duration_minutes: 30
      });
      
      // Reload assessments
      await loadAssessments();
    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAssessment = () => {
    setSelectedAssessment(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(0);
    setIsActive(false);
    setShowResults(false);
    setResults(null);
  };

  // Render assessment list
  if (!selectedAssessment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" data-testid="assessments-title">Skill Assessments</h2>
            <p className="text-muted-foreground">Test your knowledge and skills</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-primary hover:bg-primary/90"
            data-testid="create-assessment-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Create New Assessment
              </CardTitle>
              <CardDescription>
                Generate AI-powered assessments tailored to your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input
                    id="title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Python Programming Quiz"
                    data-testid="assessment-title-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., python, data-science"
                    data-testid="assessment-subject-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this assessment covers"
                  data-testid="assessment-description-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Assessment Type</Label>
                  <Select 
                    value={createForm.type} 
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="assessment-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="skill_based">Skill-Based</SelectItem>
                      <SelectItem value="ai_generated">AI Generated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={createForm.difficulty} 
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger data-testid="assessment-difficulty-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="180"
                    value={createForm.duration_minutes}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    data-testid="assessment-duration-input"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  data-testid="cancel-create-button"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createNewAssessment} 
                  disabled={isLoading}
                  data-testid="create-assessment-submit"
                >
                  {isLoading ? "Creating..." : "Create Assessment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-all cursor-pointer" data-testid={`assessment-${assessment.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{assessment.title}</CardTitle>
                    <CardDescription className="mt-1">{assessment.description}</CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      assessment.type === 'ai_generated' ? 'bg-purple-50 text-purple-700' :
                      assessment.type === 'skill_based' ? 'bg-blue-50 text-blue-700' :
                      'bg-green-50 text-green-700'
                    }
                  >
                    {assessment.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Brain className="h-4 w-4 mr-1" />
                      {assessment.subject}
                    </span>
                    <Badge className={`capitalize ${
                      assessment.difficulty === 'advanced' ? 'bg-red-100 text-red-700' :
                      assessment.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {assessment.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {assessment.duration_minutes} minutes
                    </span>
                    <span className="text-muted-foreground">
                      {assessment.questions?.length || 0} questions
                    </span>
                  </div>

                  <Button 
                    onClick={() => startAssessment(assessment)}
                    className="w-full"
                    data-testid={`start-assessment-${assessment.id}`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {assessments.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assessments available</h3>
              <p className="text-muted-foreground mb-4">Create your first assessment to get started</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                data-testid="first-assessment-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Assessment
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render results
  if (showResults && results) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {results.percentage >= 70 ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl" data-testid="results-title">Assessment Complete!</CardTitle>
            <CardDescription>{selectedAssessment.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary" data-testid="final-score">
                {results.percentage.toFixed(1)}%
              </div>
              <p className="text-muted-foreground">
                {results.score} out of {results.total_points} points
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Your Score:</span>
                <span className="font-semibold">{results.score}/{results.total_points}</span>
              </div>
              <Progress value={results.percentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Time taken: {results.time_taken_minutes} minutes</span>
                <span>{results.percentage >= 70 ? 'Passed' : 'Needs Improvement'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={resetAssessment}
                className="flex-1"
                data-testid="back-to-assessments-button"
              >
                Back to Assessments
              </Button>
              <Button 
                onClick={() => startAssessment(selectedAssessment)}
                className="flex-1"
                data-testid="retake-assessment-button"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render active assessment
  const currentQuestion = selectedAssessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedAssessment.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{selectedAssessment.title}</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {selectedAssessment.questions.length}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary" data-testid="time-remaining">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-muted-foreground">Time Remaining</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl" data-testid="question-text">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.options ? (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2" data-testid={`option-${index}`}>
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer:</Label>
              <Input
                id="answer"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                data-testid="text-answer-input"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          data-testid="previous-question-button"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex === selectedAssessment.questions.length - 1 ? (
            <Button
              onClick={handleSubmitAssessment}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
              data-testid="submit-assessment-button"
            >
              {isLoading ? "Submitting..." : "Submit Assessment"}
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              data-testid="next-question-button"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};