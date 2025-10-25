flowchart TD
  Start[Start]
  Start --> Login[Login Screen]
  Login --> AuthCheck[Check Authentication]
  AuthCheck -- Authenticated --> ProfileCheck[Check Profile Completion]
  AuthCheck -- Not Authenticated --> Login
  ProfileCheck -- Complete --> Dashboard[Main Dashboard]
  ProfileCheck -- Incomplete --> ProfileWizard[Profile Completion Wizard]
  ProfileWizard --> ProfileCheck
  Dashboard --> EmployeeMgmt[Employee Management]
  Dashboard --> Attendance[Attendance Tracking]
  Dashboard --> LeaveMgmt[Leave Management]
  Dashboard --> ScheduleMgmt[Schedule Management]
  Dashboard --> Payroll[Payroll Processing]
  Dashboard --> Analytics[Reporting and Analytics]
  subgraph Modules
    EmployeeMgmt
    Attendance
    LeaveMgmt
    ScheduleMgmt
    Payroll
    Analytics
  end
  EmployeeMgmt --> AuditLog[Audit Logging]
  Attendance --> AuditLog
  LeaveMgmt --> AuditLog
  ScheduleMgmt --> AuditLog
  Payroll --> AuditLog
  Analytics --> AuditLog
  Dashboard --> Logout[Logout]
  Logout --> Start