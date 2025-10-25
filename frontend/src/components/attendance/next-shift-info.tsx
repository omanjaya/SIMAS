import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertTriangle } from "lucide-react"

interface NextShiftInfoProps {
  nextPeriod?: {
    name: string
    start_time: string
    end_time: string
  }
  isLate?: boolean
}

export function NextShiftInfo({ nextPeriod, isLate }: NextShiftInfoProps) {
  if (!nextPeriod) return null

  return (
    <Alert variant={isLate ? 'destructive' : 'default'}>
      {isLate ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <AlertDescription>
        {isLate ? (
          <span className="font-medium">
            You are late! Expected clock-in before {nextPeriod.start_time}
          </span>
        ) : (
          <span>
            Next shift: <strong>{nextPeriod.name}</strong> ({nextPeriod.start_time} -
{nextPeriod.end_time})
          </span>
        )}
      </AlertDescription>
    </Alert>
  )
}