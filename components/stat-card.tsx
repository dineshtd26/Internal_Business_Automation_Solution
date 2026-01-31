import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  color?: 'primary' | 'accent' | 'secondary' | 'destructive';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  secondary: 'bg-secondary/10 text-secondary',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'primary',
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className={`text-xs mt-3 font-semibold flex items-center gap-1 ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
                <span>{trend.percentage}% from last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-xl`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
