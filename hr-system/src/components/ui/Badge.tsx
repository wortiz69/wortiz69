import { cn } from "@/lib/utils";

type Variant = "gray" | "blue" | "green" | "yellow" | "red" | "purple" | "orange";

const variants: Record<Variant, string> = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function leaveStatusVariant(status: string): Variant {
  switch (status) {
    case "APPROVED": return "green";
    case "REJECTED": return "red";
    case "CANCELLED": return "gray";
    default: return "yellow";
  }
}

export function candidateStageVariant(stage: string): Variant {
  switch (stage) {
    case "HIRED": return "green";
    case "REJECTED": return "red";
    case "OFFER": return "purple";
    case "INTERVIEW": return "blue";
    case "SCREENING": return "orange";
    default: return "gray";
  }
}
