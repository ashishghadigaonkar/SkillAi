import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Target, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  Sparkles,
  Save,
  Trash2,
  Plus,
  ArrowRight,
  Brain
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export const EnhancedRoadmapGenerator = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [generateForm, setGenerateForm] = useState({
    title: '',
    target_role: user?.target_role || '',
    current_level: user?.current_level || 'NSQF Level 1',
    target_level: 'NSQF Level 5',
    user_preferences: {}
  });

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const data = await apiService.getMyRoadmaps();
      setRoadmaps(data);
    } catch (error) {
      console.error('Failed to load roadmaps:', error);
    }
  };

  const generateRoadmap = async () => {
    if (!generateForm.title || !generateForm.target_role) {
      toast({
        title: "Please fill required fields",
        description: "Title and target role are required",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const roadmap = await apiService.generateRoadmap(generateForm);
      setSelectedRoadmap(roadmap);
      
      toast({
        title: "Roadmap generated successfully!",
        description: "Your personalized learning path is ready",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRoadmap = async (roadmapId: string) => {
    setIsSaving(true);
    try {
      await apiService.saveRoadmap(roadmapId);
      await loadRoadmaps();
      
      toast({
        title: "Roadmap saved!",
        description: "Added to your learning journey",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const markItemComplete = async (roadmapId: string, itemId: string) => {
    try {
      await apiService.markRoadmapItemComplete(roadmapId, itemId);
      
      // Update local state
      setRoadmaps(prev => prev.map(roadmap => 
        roadmap.id === roadmapId 
          ? {
              ...roadmap,
              items: roadmap.items.map((item: any) =>
                item.id === itemId ? { ...item, is_completed: true } : item
              )
            }
          : roadmap
      ));
      
      toast({
        title: "Progress updated!",
        description: "Great job completing this milestone",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const nsqfLevels = [
    'NSQF Level 1',
    'NSQF Level 2', 
    'NSQF Level 3',
    'NSQF Level 4',
    'NSQF Level 5',
    'NSQF Level 6',
    'NSQF Level 7',
    'NSQF Level 8',
    'NSQF Level 9',
    'NSQF Level 10'
  ];

  const popularRoles = [
    'AI/ML Engineer',
    'Data Scientist',
    'Web Developer',
    'Mobile App Developer',
    'DevOps Engineer',
    'Cybersecurity Analyst',
    'Digital Marketing Specialist',
    'Business Analyst',
    'UI/UX Designer',
    'Cloud Architect'
  ];

  return (
    <div className="space-y-6">
      {/* Generate New Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center" data-testid="generate-roadmap-title">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Generate Learning Roadmap
          </CardTitle>
          <CardDescription>
            Create AI-powered personalized learning paths tailored to your career goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Roadmap Title</Label>
              <Input
                id="title"
                value={generateForm.title}
                onChange={(e) => setGenerateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Path to AI/ML Engineering"
                data-testid="roadmap-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_role">Target Career Role</Label>
              <Select 
                value={generateForm.target_role} 
                onValueChange={(value) => setGenerateForm(prev => ({ ...prev, target_role: value }))}
              >
                <SelectTrigger data-testid="target-role-select">
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent>
                  {popularRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_level">Current Level</Label>
              <Select 
                value={generateForm.current_level} 
                onValueChange={(value) => setGenerateForm(prev => ({ ...prev, current_level: value }))}
              >
                <SelectTrigger data-testid="current-level-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nsqfLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_level">Target Level</Label>
              <Select 
                value={generateForm.target_level} 
                onValueChange={(value) => setGenerateForm(prev => ({ ...prev, target_level: value }))}
              >
                <SelectTrigger data-testid="target-level-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nsqfLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateRoadmap} 
            disabled={isGenerating}
            className="w-full bg-primary hover:bg-primary/90"
            data-testid="generate-roadmap-button"
          >
            {isGenerating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Generating AI Roadmap...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Roadmap
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Roadmap Preview */}
      {selectedRoadmap && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle data-testid="generated-roadmap-title">{selectedRoadmap.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Target className="h-4 w-4" />
                  {selectedRoadmap.target_role} • {selectedRoadmap.estimated_duration}
                </CardDescription>
              </div>
              <Button 
                onClick={() => saveRoadmap(selectedRoadmap.id)}
                disabled={isSaving}
                data-testid="save-roadmap-button"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save to My Roadmaps
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedRoadmap.description}</p>
              
              <div className="space-y-4">
                {selectedRoadmap.items.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-start space-x-4" data-testid={`roadmap-item-${index}`}>
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        item.is_completed ? 'bg-green-100 text-green-700' : 'bg-primary-light text-primary'
                      }`}>
                        {item.is_completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{item.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.duration}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      
                      {item.skills_gained.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.skills_gained.map((skill: string, skillIndex: number) => (
                            <Badge key={skillIndex} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Roadmaps */}
      <div>
        <h3 className="text-xl font-semibold mb-4" data-testid="my-roadmaps-title">My Learning Roadmaps</h3>
        
        {roadmaps.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {roadmaps.map((roadmap) => {
              const completedItems = roadmap.items.filter((item: any) => item.is_completed).length;
              const totalItems = roadmap.items.length;
              const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
              
              return (
                <Card key={roadmap.id} className="hover:shadow-lg transition-all" data-testid={`roadmap-${roadmap.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Target className="h-4 w-4" />
                          {roadmap.target_role}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {roadmap.current_level} → {roadmap.target_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{completedItems}/{totalItems} completed</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      {roadmap.items.slice(0, 3).map((item: any, index: number) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 
                              className={`h-4 w-4 ${
                                item.is_completed ? 'text-green-500' : 'text-gray-300'
                              }`} 
                            />
                            <span className="text-sm truncate">{item.title}</span>
                          </div>
                          {!item.is_completed && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markItemComplete(roadmap.id, item.id)}
                              data-testid={`complete-item-${item.id}`}
                            >
                              Mark Done
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {roadmap.items.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{roadmap.items.length - 3} more items
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {roadmap.estimated_duration}
                      </span>
                      <span>Created {new Date(roadmap.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No roadmaps yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first AI-powered learning roadmap to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};