import { Badge } from "@/components/ui/badge";

export type ReadinessLevel = 'ready' | 'almost-ready' | 'needs-improvement' | 'critical';

interface ReadinessBadgeProps {
  level: ReadinessLevel;
  className?: string;
}

export function ReadinessBadge({ level, className = "" }: ReadinessBadgeProps) {
  const styles = {
    'ready': 'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    'almost-ready': 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    'needs-improvement': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    'critical': 'bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };

  const labels = {
    'ready': 'Ready',
    'almost-ready': 'Almost Ready',
    'needs-improvement': 'Needs Improvement',
    'critical': 'Critical',
  };

  return (
    <Badge variant="outline" className={`${styles[level]} font-medium ${className}`}>
      {labels[level]}
    </Badge>
  );
}
