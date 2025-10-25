import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

interface FaceTemplateStatusProps {
  status: 'enrolled' | 'not_enrolled' | 'pending' | 'expired'
  lastEnrolled?: string
  showDetails?: boolean
}

export function FaceTemplateStatus({ status, lastEnrolled, showDetails = true }: 
FaceTemplateStatusProps) {
  const statusConfig = {
    enrolled: {
      icon: CheckCircle,
      variant: 'default' as const,
      label: 'Enrolled',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    not_enrolled: {
      icon: AlertCircle,
      variant: 'destructive' as const,
      label: 'Not Enrolled',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    pending: {
      icon: Clock,
      variant: 'secondary' as const,
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    expired: {
      icon: AlertCircle,
      variant: 'outline' as const,
      label: 'Expired',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={`${config.bgColor} ${config.color}`}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
      {showDetails && lastEnrolled && status === 'enrolled' && (
        <span className="text-xs text-muted-foreground">
          Last updated: {new Date(lastEnrolled).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}