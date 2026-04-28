import { Layout } from "@/components/layout";
import { 
  useGetStudent,
  getGetStudentQueryKey,
  useDeleteStudent,
  getListStudentsQueryKey,
  getGetAdminDashboardQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, FileText, Trash2, Mail, GraduationCap, Briefcase, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ReadinessBadge } from "@/components/readiness-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadarChart, Radar, Tooltip } from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StudentDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: student, isLoading } = useGetStudent(id, {
    query: { enabled: Number.isFinite(id), queryKey: getGetStudentQueryKey(id) }
  });

  const deleteStudent = useDeleteStudent();

  const handleDelete = () => {
    deleteStudent.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Student deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        setLocation("/students");
      },
      onError: (error) => {
        toast({ 
          title: "Failed to delete student", 
          description: (error as any)?.message || "Something went wrong",
          variant: "destructive" 
        });
      }
    });
  };

  const handleDownloadReport = () => {
    if (student?.reportUrl) {
      window.open(student.reportUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] col-span-1" />
            <Skeleton className="h-[400px] col-span-2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold">Student not found</h2>
          <Link href="/students" className="text-primary mt-4 inline-block">Return to students list</Link>
        </div>
      </Layout>
    );
  }

  const radarData = [
    { subject: 'Marks', A: student.breakdown.marks, fullMark: 100 },
    { subject: 'Aptitude', A: student.breakdown.aptitude, fullMark: 100 },
    { subject: 'Skills', A: student.breakdown.skillScore, fullMark: 100 },
    { subject: 'Projects', A: student.breakdown.projects, fullMark: 100 },
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/students" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to students
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
              <ReadinessBadge level={student.readinessLevel} />
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {student.email}</span>
              <span>•</span>
              <span>{student.rollNumber}</span>
              <span>•</span>
              <span>{student.batch}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleDownloadReport}>
              <FileText className="w-4 h-4" />
              PDF Report
            </Button>
            <Link href={`/students/${id}/edit`}>
              <Button variant="secondary" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Student</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {student.name}? This action cannot be undone and will remove all their analytical history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Readiness Score Card */}
          <Card className="col-span-1 lg:col-span-1 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/50" />
            <CardHeader className="text-center pb-2">
              <CardTitle>Readiness Score</CardTitle>
              <CardDescription>Overall campus placement readiness</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <div className="relative flex items-center justify-center w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted" />
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="88" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - student.score / 100)}
                    className="text-primary transition-all duration-1000 ease-in-out" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-foreground">{student.score}</span>
                  <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-1">/ 100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>Performance across components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Student" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>Raw scores and computed weights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><BookOpen className="w-3 h-3" /> Academics</p>
                  <p className="text-2xl font-bold">{student.breakdown.marks}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Aptitude</p>
                  <p className="text-2xl font-bold">{student.breakdown.aptitude}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" /> Tech Skills</p>
                  <p className="text-2xl font-bold">{student.breakdown.skillScore}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Projects</p>
                  <p className="text-2xl font-bold">{student.projects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Gap Analysis */}
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skill Gap Analysis</CardTitle>
                  <CardDescription>Target Role: <span className="font-medium text-foreground">{student.skillGap.targetRole}</span></CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{Math.round(student.skillGap.coverage)}%</span>
                  <p className="text-xs text-muted-foreground uppercase">Coverage</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Skills ({student.skillGap.matchedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {student.skillGap.matchedSkills.length > 0 ? (
                      student.skillGap.matchedSkills.map(skill => (
                        <Badge key={skill} className="bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None matched</span>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    Missing Skills ({student.skillGap.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {student.skillGap.missingSkills.length > 0 ? (
                      student.skillGap.missingSkills.map(skill => (
                        <Badge key={skill} variant="outline" className="border-destructive text-destructive bg-destructive/10">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">All required skills matched!</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Action Plan</CardTitle>
              <CardDescription>Personalized recommendations to improve readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {student.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 items-start bg-muted/50 p-3 rounded-lg border">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-medium">
                      {i + 1}
                    </div>
                    <span className="text-sm leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
