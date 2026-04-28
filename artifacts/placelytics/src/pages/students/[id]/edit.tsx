import { Layout } from "@/components/layout";
import { StudentForm, StudentFormValues } from "@/components/student-form";
import { 
  useUpdateStudent,
  useGetStudent,
  getGetStudentQueryKey,
  getListStudentsQueryKey,
  getGetAdminDashboardQueryKey,
  getGetStudentScoreQueryKey,
  getGetStudentSkillGapQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditStudentPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: student, isLoading } = useGetStudent(id, {
    query: { enabled: Number.isFinite(id), queryKey: getGetStudentQueryKey(id) }
  });

  const updateStudent = useUpdateStudent();

  const onSubmit = (data: StudentFormValues) => {
    updateStudent.mutate({ id, data }, {
      onSuccess: () => {
        toast({ title: "Student updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetStudentScoreQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetStudentSkillGapQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        setLocation(`/students/${id}`);
      },
      onError: (error) => {
        toast({ 
          title: "Failed to update student", 
          description: (error as any)?.message || "Something went wrong",
          variant: "destructive" 
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold">Student not found</h2>
          <Link href="/students" className="text-primary mt-4 inline-block">Return to students list</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href={`/students/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to student profile
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-muted-foreground mt-1">
            Update {student.name}'s profile and skills.
          </p>
        </div>

        <StudentForm 
          defaultValues={student}
          onSubmit={onSubmit} 
          isSubmitting={updateStudent.isPending} 
        />
      </div>
    </Layout>
  );
}
