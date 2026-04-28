import { Layout } from "@/components/layout";
import { 
  useListTargetRoles,
  getListTargetRolesQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";

export default function RolesPage() {
  const { data: roles, isLoading } = useListTargetRoles({
    query: { queryKey: getListTargetRolesQueryKey() }
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Target Roles Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Skill requirements mapped to industry roles for skill-gap analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            roles?.map((role) => (
              <Card key={role.role} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    {role.role}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="mt-auto">
                    <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {role.requiredSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-secondary text-secondary-foreground border border-secondary-border">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
