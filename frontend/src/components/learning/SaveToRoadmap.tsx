import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Save, 
  Search, 
  BookOpen, 
  Target,
  CheckCircle2,
  Plus,
  Filter,
  Bookmark
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "../../services/api";

interface SaveableItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'assessment' | 'resource' | 'project';
  duration?: string;
  difficulty?: string;
  skills?: string[];
}

export const SaveToRoadmap = () => {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample saveable items (in real app, these would come from various sources)
  const [availableItems] = useState<SaveableItem[]>([
    {
      id: '1',
      title: 'Python Programming Fundamentals',
      description: 'Complete beginner course covering Python basics',
      type: 'course',
      duration: '6 weeks',
      difficulty: 'beginner',
      skills: ['Python', 'Programming']
    },
    {
      id: '2',
      title: 'Data Structures Assessment',
      description: 'Test your knowledge of arrays, linked lists, and trees',
      type: 'assessment',
      duration: '45 minutes',
      difficulty: 'intermediate',
      skills: ['Data Structures', 'Algorithms']
    },
    {
      id: '3',
      title: 'Machine Learning Project',
      description: 'Build a predictive model using real-world data',
      type: 'project',
      duration: '2 weeks',
      difficulty: 'advanced',
      skills: ['Machine Learning', 'Python', 'Data Analysis']
    },
    {
      id: '4',
      title: 'React Components Guide',
      description: 'Comprehensive guide to React component patterns',
      type: 'resource',
      duration: '3 hours',
      difficulty: 'intermediate',
      skills: ['React', 'JavaScript', 'Web Development']
    },
    {
      id: '5',
      title: 'SQL Database Design',
      description: 'Learn to design efficient database schemas',
      type: 'course',
      duration: '4 weeks',
      difficulty: 'intermediate',
      skills: ['SQL', 'Database Design']
    }
  ]);

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

  const handleItemSelect = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  };

  const saveItemsToRoadmap = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to save",
        variant: "destructive"
      });
      return;
    }

    if (!selectedRoadmap) {
      toast({
        title: "No roadmap selected",
        description: "Please select a roadmap to save items to",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call an API to add items to roadmap
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Items saved successfully!",
        description: `Added ${selectedItems.length} item(s) to your roadmap`,
      });
      
      setSelectedItems([]);
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return BookOpen;
      case 'assessment':
        return Target;
      case 'project':
        return CheckCircle2;
      case 'resource':
        return Bookmark;
      default:
        return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-700';
      case 'assessment':
        return 'bg-green-100 text-green-700';
      case 'project':
        return 'bg-purple-100 text-purple-700';
      case 'resource':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center" data-testid="save-to-roadmap-title">
            <Save className="h-5 w-5 mr-2 text-primary" />
            Save to My Roadmap
          </CardTitle>
          <CardDescription>
            Organize learning resources, courses, and assessments into your personalized roadmaps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-items-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                data-testid="filter-type-select"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="assessment">Assessments</option>
                <option value="project">Projects</option>
                <option value="resource">Resources</option>
              </select>
            </div>
          </div>

          {/* Roadmap Selection */}
          {roadmaps.length > 0 && (
            <div className="space-y-2">
              <Label>Select Roadmap:</Label>
              <div className="flex flex-wrap gap-2">
                {roadmaps.map((roadmap) => (
                  <Button
                    key={roadmap.id}
                    variant={selectedRoadmap === roadmap.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRoadmap(roadmap.id)}
                    data-testid={`select-roadmap-${roadmap.id}`}
                  >
                    {roadmap.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Items Counter */}
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary-light rounded-lg">
              <span className="text-sm font-medium">
                {selectedItems.length} item(s) selected
              </span>
              <Button 
                onClick={saveItemsToRoadmap}
                disabled={isLoading || !selectedRoadmap}
                size="sm"
                data-testid="save-selected-items-button"
              >
                {isLoading ? "Saving..." : "Save to Roadmap"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Items */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const Icon = getTypeIcon(item.type);
          const isSelected = selectedItems.includes(item.id);
          
          return (
            <Card 
              key={item.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onClick={() => handleItemSelect(item.id, !isSelected)}
              data-testid={`item-${item.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={isSelected}
                      onChange={(checked) => handleItemSelect(item.id, checked)}
                      data-testid={`checkbox-${item.id}`}
                    />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Badge className={`text-xs capitalize ${getTypeColor(item.type)}`}>
                    {item.type}
                  </Badge>
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {item.duration && (
                    <span className="flex items-center">
                      Duration: {item.duration}
                    </span>
                  )}
                  {item.difficulty && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize ${
                        item.difficulty === 'advanced' ? 'border-red-200 text-red-700' :
                        item.difficulty === 'intermediate' ? 'border-yellow-200 text-yellow-700' :
                        'border-green-200 text-green-700'
                      }`}
                    >
                      {item.difficulty}
                    </Badge>
                  )}
                </div>
                
                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {item.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `No items match "${searchTerm}"`
              : "No learning resources available"
            }
          </p>
        </div>
      )}

      {roadmaps.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No roadmaps available</h3>
            <p className="text-muted-foreground mb-4">
              Create your first roadmap to start organizing learning resources
            </p>
            <Button variant="outline" data-testid="create-first-roadmap-button">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Roadmap
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};