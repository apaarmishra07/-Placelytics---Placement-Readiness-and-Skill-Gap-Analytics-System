export interface TargetRoleSpec {
  role: string;
  requiredSkills: string[];
  description: string;
}

export const TARGET_ROLES: TargetRoleSpec[] = [
  {
    role: "Software Engineer",
    description:
      "General-purpose engineering roles: building products, services, and tools.",
    requiredSkills: [
      "Data Structures",
      "Algorithms",
      "Java",
      "Python",
      "Git",
      "SQL",
      "REST APIs",
      "System Design Basics",
    ],
  },
  {
    role: "Frontend Engineer",
    description: "Web UI engineering: building user-facing experiences.",
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "HTML",
      "CSS",
      "Git",
      "REST APIs",
      "Accessibility",
    ],
  },
  {
    role: "Backend Engineer",
    description: "Server-side engineering: APIs, databases, infrastructure.",
    requiredSkills: [
      "Java",
      "Spring Boot",
      "Node.js",
      "SQL",
      "REST APIs",
      "Docker",
      "System Design Basics",
      "Git",
    ],
  },
  {
    role: "Data Analyst",
    description: "Analyzing data, building dashboards, and reporting insights.",
    requiredSkills: [
      "SQL",
      "Excel",
      "Python",
      "Power BI",
      "Statistics",
      "Data Visualization",
      "Communication",
    ],
  },
  {
    role: "Data Scientist",
    description: "Modelling, ML, and turning data into predictive products.",
    requiredSkills: [
      "Python",
      "Statistics",
      "Machine Learning",
      "SQL",
      "Pandas",
      "Scikit-learn",
      "Data Visualization",
      "Deep Learning",
    ],
  },
  {
    role: "DevOps Engineer",
    description: "Infrastructure, CI/CD, deployment, and reliability.",
    requiredSkills: [
      "Linux",
      "Docker",
      "Kubernetes",
      "AWS",
      "CI/CD",
      "Bash",
      "Terraform",
      "Monitoring",
    ],
  },
  {
    role: "Mobile Engineer",
    description: "Building native and cross-platform mobile applications.",
    requiredSkills: [
      "Java",
      "Kotlin",
      "Swift",
      "React Native",
      "Git",
      "REST APIs",
      "UI Design",
    ],
  },
  {
    role: "QA Engineer",
    description: "Quality assurance, automation, and testing strategy.",
    requiredSkills: [
      "Manual Testing",
      "Selenium",
      "Java",
      "Python",
      "SQL",
      "API Testing",
      "Test Planning",
    ],
  },
];

export function getRole(role: string): TargetRoleSpec | undefined {
  return TARGET_ROLES.find(
    (r) => r.role.toLowerCase() === role.toLowerCase(),
  );
}

export interface SkillGapResult {
  targetRole: string;
  requiredSkills: string[];
  currentSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  coverage: number;
}

export function computeSkillGap(
  targetRole: string,
  currentSkills: string[],
): SkillGapResult {
  const role = getRole(targetRole);
  const required = role?.requiredSkills ?? [];
  const currentLower = currentSkills.map((s) => s.toLowerCase());
  const matched: string[] = [];
  const missing: string[] = [];
  for (const req of required) {
    if (currentLower.includes(req.toLowerCase())) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }
  const coverage =
    required.length === 0
      ? 100
      : Math.round((matched.length / required.length) * 100);
  return {
    targetRole,
    requiredSkills: required,
    currentSkills,
    matchedSkills: matched,
    missingSkills: missing,
    coverage,
  };
}
