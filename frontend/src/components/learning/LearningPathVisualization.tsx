import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Search,
  Award,
  Play,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";

export const LearningPathVisualization = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const courses = [
    {
      id: 1,
      title: "Python Programming for Beginners",
      provider: "TechSkill India",
      description: "Learn Python from scratch with hands-on projects and real-world applications",
      level: "NSQF Level 4",
      duration: "8 weeks",
      rating: 4.8,
      enrolled: 12500,
      progress: 0,
      status: "available",
      category: "Programming",
      skills: ["Python", "Programming Basics", "Problem Solving"],
      price: "Free",
      language: "English, Hindi",
      nextBatch: "Starting Jan 15, 2025"
    },
    {
      id: 2,
      title: "Data Analysis with Excel Advanced",
      provider: "Skill India Digital",
      description: "Master advanced Excel techniques for data analysis and business intelligence",
      level: "NSQF Level 5",
      duration: "6 weeks",
      rating: 4.6,
      enrolled: 8300,
      progress: 45,
      status: "enrolled",
      category: "Data Analysis",
      skills: ["Excel", "Data Visualization", "Pivot Tables"],
      price: "₹2,999",
      language: "English, Hindi, Tamil",
      nextBatch: "Ongoing"
    },
    {
      id: 3,
      title: "Machine Learning Fundamentals",
      provider: "AICTE Approved",
      description: "Introduction to ML algorithms, supervised and unsupervised learning",
      level: "NSQF Level 6",
      duration: "12 weeks",
      rating: 4.9,
      enrolled: 15600,
      progress: 0,
      status: "recommended",
      category: "Artificial Intelligence",
      skills: ["Machine Learning", "Python", "Statistics"],
      price: "₹4,999",
      language: "English",
      nextBatch: "Starting Feb 1, 2025"
    },
    {
      id: 4,
      title: "Digital Marketing Certification",
      provider: "Google Skillshop",
      description: "Comprehensive digital marketing course with Google Ads and Analytics",
      level: "NSQF Level 5",
      duration: "10 weeks",
      rating: 4.7,
      enrolled: 20100,
      progress: 0,
      status: "available",
      category: "Marketing",
      skills: ["Digital Marketing", "Google Ads", "Analytics"],
      price: "Free",
      language: "English, Hindi",
      nextBatch: "Starting Jan 20, 2025"
    },
    {
      id: 5,
      title: "Cloud Computing with AWS",
      provider: "Amazon Web Services",
      description: "Learn cloud fundamentals and AWS services for modern applications",
      level: "NSQF Level 6",
      duration: "14 weeks",
      rating: 4.8,
      enrolled: 9800,
      progress: 78,
      status: "enrolled",
      category: "Cloud Computing",
      skills: ["AWS", "Cloud Architecture", "DevOps"],
      price: "₹7,999",
      language: "English",
      nextBatch: "Ongoing"
    },
    {
      id: 6,
      title: "Mobile App Development - Flutter",
      provider: "Google Developers",
      description: "Build cross-platform mobile apps using Flutter and Dart",
      level: "NSQF Level 6",
      duration: "16 weeks",
      rating: 4.7,
      enrolled: 11200,
      progress: 0,
      status: "recommended",
      category: "Mobile Development",
      skills: ["Flutter", "Dart", "Mobile UI/UX"],
      price: "₹5,999",
      language: "English, Hindi",
      nextBatch: "Starting Feb 10, 2025"
    }
  ];

  const categories = [
    "Programming", "Data Analysis", "Artificial Intelligence", 
    "Marketing", "Cloud Computing", "Mobile Development"
  ];

  const levels = [
    "NSQF Level 4", "NSQF Level 5", "NSQF Level 6", "NSQF Level 7"
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = filterLevel === "all" || course.level === filterLevel;
    const matchesCategory = filterCategory === "all" || course.category === filterCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getStatusBadge = (status: string, progress: number) => {
    switch (status) {
      case 'enrolled':
        return <Badge className="bg-primary-light text-primary-foreground">Enrolled ({progress}%)</Badge>;
      case 'recommended':
        return <Badge className="bg-accent-light text-accent-foreground">🎯 Recommended</Badge>;
      case 'completed':
        return <Badge className="bg-success-light text-success-foreground">✅ Completed</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  };

  const getActionButton = (course: any) => {
    if (course.status === 'enrolled') {
      return (
        <Button className="bg-primary hover:bg-primary/90">
          <Play className="h-4 w-4 mr-2" />
          Continue Learning
        </Button>
      );
    } else if (course.status === 'completed') {
      return (
        <Button variant="outline">
          <Award className="h-4 w-4 mr-2" />
          View Certificate
        </Button>
      );
    } else {
      return (
        <Button variant="outline" className="hover:bg-primary hover:text-white">
          <BookOpen className="h-4 w-4 mr-2" />
          Enroll Now
        </Button>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            Course Catalog
          </CardTitle>
          <CardDescription>
            Explore NSQF-aligned courses and build your personalized learning path
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                {getStatusBadge(course.status, course.progress)}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  {course.rating}
                </div>
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              <CardDescription className="text-sm">{course.provider}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>

              {course.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {course.duration}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {course.level}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {course.enrolled.toLocaleString()} enrolled
                  </div>
                  <span className={`font-semibold ${course.price === 'Free' ? 'text-success' : 'text-primary'}`}>
                    {course.price}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {course.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {course.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      🗣️ {course.language}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      📅 {course.nextBatch}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {getActionButton(course)}
                  <Button variant="ghost" size="sm" className="px-2">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or explore different categories
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setFilterLevel("all");
              setFilterCategory("all");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Learning Path Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-accent" />
            Suggested Learning Paths
          </CardTitle>
          <CardDescription>
            Curated sequences of courses to achieve specific career goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border border-dashed hover:border-solid transition-all">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">🤖 AI/ML Engineer Path</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Python → Statistics → Machine Learning → Deep Learning
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">18 months • 6 courses</span>
                  <Button size="sm" variant="outline">Explore Path</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-dashed hover:border-solid transition-all">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">📊 Data Analyst Path</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Excel → SQL → Python → Data Visualization
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">12 months • 4 courses</span>
                  <Button size="sm" variant="outline">Explore Path</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};