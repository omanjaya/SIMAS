"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

interface CalendarEvent {
  id: number
  date: string
  title: string
  type: 'schedule' | 'leave' | 'holiday'
  status?: 'approved' | 'pending' | 'rejected'
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, 
'0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => event.date.startsWith(dateStr))
  }

  const eventColors = {
    schedule: 'bg-blue-100 text-blue-800 border-blue-200',
    leave: 'bg-orange-100 text-orange-800 border-orange-200',
    holiday: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm 
text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border rounded-lg 
bg-muted/20" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = getEventsForDate(day)
            const isToday = new Date().toDateString() === new Date(year, month,
day).toDateString()

            return (
              <div
                key={day}
                className={`min-h-[80px] border rounded-lg p-1 ${
                  isToday ? 'border-primary border-2 bg-primary/5' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 
''}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <Badge
                      key={event.id}
                      variant="outline"
                      className={`text-xs truncate block cursor-pointer 
${eventColors[event.type]}`}
                      onClick={() => onEventClick?.(event)}
                    >
                      {event.title}
                    </Badge>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm">Schedule</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-sm">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-sm">Holiday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}