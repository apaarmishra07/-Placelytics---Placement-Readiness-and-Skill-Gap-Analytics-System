import { useState } from "react";
import { Link } from "wouter";
import { 
  useListStudents,
  getListStudentsQueryKey,
  useListBatches,
  getListBatchesQueryKey,
  useListTargetRoles,
  getListTargetRolesQueryKey
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ReadinessBadge } from "@/components/readiness-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [batch, setBatch] = useState<string>("all");
  const [role, setRole] = useState<string>("all");

  const { data: students, isLoading } = useListStudents({
    search: debouncedSearch || undefined,
    batch: batch !== "all" ? batch : undefined,
    targetRole: role !== "all" ? role : undefined,
  }, {
    query: { queryKey: getListStudentsQueryKey({
      search: debouncedSearch || undefined,
      batch: batch !== "all" ? batch : undefined,
      targetRole: role !== "all" ? role : undefined,
    })}
  });

  const { data: batches } = useListBatches({
    query: { queryKey: getListBatchesQueryKey() }
  });

  const { data: roles } = useListTargetRoles({
    query: { queryKey: getListTargetRolesQueryKey() }
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track student placement readiness.
            </p>
          </div>
          <Link href="/students/new">
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Student
            </Button>
          </Link>
        </div>

        <div className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email or roll number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full bg-background"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={batch} onValueChange={setBatch}>
              <SelectTrigger className="w-[160px] bg-background">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3 text-muted-foreground" />
                  <SelectValue placeholder="Batch" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches?.map(b => (
                  <SelectItem key={b.batch} value={b.batch}>{b.batch}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[180px] bg-background">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3 text-muted-foreground" />
                  <SelectValue placeholder="Role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles?.map(r => (
                  <SelectItem key={r.role} value={r.role}>{r.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Target Role</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-[40px] ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : students?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p>No students found matching your filters.</p>
                      {(search || batch !== "all" || role !== "all") && (
                        <Button variant="link" onClick={() => { setSearch(""); setBatch("all"); setRole("all"); }}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                students?.map((student) => (
                  <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Link href={`/students/${student.id}`} className="block">
                        <div className="font-medium text-foreground">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.rollNumber} • {student.email}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/students/${student.id}`} className="block text-muted-foreground">
                        {student.batch}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/students/${student.id}`} className="block text-muted-foreground">
                        {student.targetRole}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <Link href={`/students/${student.id}`} className="block">
                        {student.score}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/students/${student.id}`} className="block">
                        <ReadinessBadge level={student.readinessLevel} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
