import { getProgressPercentage } from "@/lib/utils";

type ProgressBarProps = {
  collected: number;
  target: number;
  className?: string;
};

export function ProgressBar({ collected, target, className }: ProgressBarProps) {
  const progress = getProgressPercentage(collected, target);

  return (
    <div className={className}>
      <div className="h-3 overflow-hidden rounded-lg bg-ink/10">
        <div
          className="h-full rounded-lg bg-leaf transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
