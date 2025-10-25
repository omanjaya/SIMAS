<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use Carbon\Carbon;

class ScheduleValidationService
{
    public function getActiveScheduleForToday(int $employeeId, int $dayOfWeek, ?Carbon $time = null): ?EmployeeSchedule
    {
        $time = $time ?: Carbon::now();

        $employee = Employee::with(['schedules' => function ($query) use ($dayOfWeek) {
            $query->where('day_of_week', $dayOfWeek)
                ->where('is_active', true);
        }])->find($employeeId);

        if (! $employee) {
            return null;
        }

        return $employee->getScheduleForDay($dayOfWeek);
    }

    public function isWithinScheduleTime(EmployeeSchedule $schedule, Carbon $currentTime): array
    {
        $startTime = Carbon::parse($schedule->start_time);
        $endTime = Carbon::parse($schedule->end_time);
        $maxCheckInTime = $startTime->copy()->addMinutes($schedule->late_tolerance_minutes);
        $maxCheckOutTime = $endTime->copy()->addMinutes($schedule->early_checkout_tolerance_minutes);

        $isWithinInTime = $currentTime->between($startTime, $maxCheckInTime);
        $isWithinOutTime = $currentTime->between($endTime->copy()->subMinutes($schedule->early_checkout_tolerance_minutes), $maxCheckOutTime);

        return [
            'valid' => $isWithinInTime || $isWithinOutTime,
            'is_within_in_time' => $isWithinInTime,
            'is_within_out_time' => $isWithinOutTime,
            'start_time' => $startTime->format('H:i:s'),
            'end_time' => $endTime->format('H:i:s'),
            'max_checkin_time' => $maxCheckInTime->format('H:i:s'),
            'max_checkout_time' => $maxCheckOutTime->format('H:i:s'),
        ];
    }

    public function calculateLateMinutes(EmployeeSchedule $schedule, Carbon $checkInTime): int
    {
        $scheduleStart = Carbon::parse($schedule->start_time);

        // Calculate signed difference (negative if late, positive if early)
        $diffInMinutes = $checkInTime->diffInMinutes($scheduleStart, false);

        // Return 0 if not late (on time or early), otherwise return the positive number of late minutes
        return max(0, $diffInMinutes * -1);
    }

    public function validateCheckIn(Employee $employee, Carbon $checkInTime): array
    {
        $dayOfWeek = $checkInTime->dayOfWeekIso; // 1 = Monday, 7 = Sunday
        $schedule = $employee->getScheduleForDay($dayOfWeek);

        if (! $schedule) {
            return [
                'valid' => false,
                'reason' => 'Check-in gagal: Tidak ada jadwal untuk hari ini',
                'is_within_tolerance' => false,
                'late_minutes' => 0,
                'schedule' => null,
            ];
        }

        if (! $schedule->is_active) {
            return [
                'valid' => false,
                'reason' => 'Jadwal tidak aktif',
                'is_within_tolerance' => false,
                'late_minutes' => 0,
                'schedule' => $schedule,
            ];
        }

        // Create schedule datetime by combining date from checkInTime with schedule start_time
        $scheduleDateTime = $checkInTime->copy()->setTimeFromTimeString($schedule->start_time);
        $maxAllowedTime = $scheduleDateTime->copy()->addMinutes($schedule->late_tolerance_minutes);

        $isWithinTolerance = $checkInTime->lte($maxAllowedTime);
        $lateMinutes = $schedule->calculateLateMinutes($checkInTime);

        return [
            'valid' => $isWithinTolerance,
            'reason' => $isWithinTolerance ? 'Dalam batas toleransi' : 'Kehadiran terlambat',
            'is_within_tolerance' => $isWithinTolerance,
            'late_minutes' => $lateMinutes,
            'schedule' => $schedule,
        ];
    }

    public function validateCheckOut(Employee $employee, Carbon $checkOutTime): array
    {
        $dayOfWeek = $checkOutTime->dayOfWeekIso; // 1 = Monday, 7 = Sunday
        $schedule = $employee->getScheduleForDay($dayOfWeek);

        if (! $schedule) {
            return [
                'valid' => false,
                'reason' => 'Check-out gagal: Tidak ada jadwal untuk hari ini',
                'is_within_tolerance' => false,
                'early_minutes' => 0,
                'schedule' => null,
            ];
        }

        if (! $schedule->is_active) {
            return [
                'valid' => false,
                'reason' => 'Jadwal tidak aktif',
                'is_within_tolerance' => false,
                'early_minutes' => 0,
                'schedule' => $schedule,
            ];
        }

        // Create schedule datetime by combining date from checkOutTime with schedule end_time
        $scheduleDateTime = $checkOutTime->copy()->setTimeFromTimeString($schedule->end_time);
        $minAllowedTime = $scheduleDateTime->copy()->subMinutes($schedule->early_checkout_tolerance_minutes);
        $maxAllowedTime = $scheduleDateTime->copy()->addMinutes($schedule->early_checkout_tolerance_minutes);

        $isWithinTolerance = $checkOutTime->between($minAllowedTime, $maxAllowedTime);

        // Calculate early minutes if employee checked out before end time
        $earlyMinutes = 0;
        if ($checkOutTime->lt($scheduleDateTime)) {
            // Employee checked out before schedule end time
            $diffInMinutes = $scheduleDateTime->diffInMinutes($checkOutTime, false); // This will be negative
            $earlyMinutes = max(0, $diffInMinutes * -1); // Convert to positive minutes, ensuring at least 0
        }

        return [
            'valid' => $isWithinTolerance,
            'reason' => $isWithinTolerance ? 'Dalam batas toleransi' : 'Check-out terlalu awal',
            'is_within_tolerance' => $isWithinTolerance,
            'early_minutes' => $earlyMinutes,
            'schedule' => $schedule,
        ];
    }
}
