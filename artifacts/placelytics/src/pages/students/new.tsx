import { Layout } from "@/components/layout";
import { StudentForm, StudentFormValues } from "@/components/student-form";
import { 
  useCreateStudent,
  getListStudentsQueryKey,
  getGetAdminDashboardQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewStudentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createStudent = useCreateStudent();

  const onSubmit = (data: StudentFormValues) => {
    createStudent.mutate({ data }, {
      onSuccess: (student) => {
        toast({ title: "Student created successfully" });
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        setLocation(`/students/${student.id}`);
      },
      onError: (error) => {
        toast({ 
          title: "Failed to create student", 
          description: (error as any)?.message || "Something went wrong",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/students" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to students
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-muted-foreground mt-1">
            Create a new student profile to track their placement readiness.
          </p>
        </div>

        <StudentForm 
          onSubmit={onSubmit} 
          isSubmitting={createStudent.isPending} 
        />
      </div>
    </Layout>
  );
}
