# SIMAS App Flow Document

## Onboarding and Sign-In/Sign-Up

When a new user first hears about SIMAS, they arrive at the public landing page by visiting the application URL in a browser. The landing page briefly describes the system’s benefits and includes two clear buttons labeled "Sign In" and "Sign Up." A user who does not yet have an account clicks the "Sign Up" button and is shown a registration form to provide their full name, work email address, and a password that they enter twice to confirm. After submitting the form, the system sends a verification email with a link. Once the user clicks the link, their account is confirmed, and they are able to log in. If a user already has an account, they can click the "Sign In" button, enter their email address and password, and then press "Log In." That action authenticates the user and grants access to the application.

If a user forgets their password, they click a small "Forgot Password" link on the sign-in page. That takes them to a password recovery form where they enter the email associated with their account. The system sends a password reset link to that email. When the user clicks the reset link, they arrive at a page to enter a new password twice. After saving the new password, the user is redirected back to the sign-in page and can log in with their updated credentials. The sign-out flow is available from a menu in the top navigation bar, and clicking it immediately ends the session and returns the user to the landing page.

## Main Dashboard or Home Page

After a successful login and any necessary email verification or password reset, the user may be prompted to complete their profile through the profile completion wizard if this is their first time logging in. Once profile completion is finished or for returning users, the system lands them on the main dashboard. The dashboard features a left sidebar with navigation links for Employees, Attendance, Leave, Payroll, Schedule, Analytics, Audit Logs, and Settings. At the top, a header shows the application logo, a search field, and the user’s name with an avatar that opens a menu for Profile and Sign Out.

In the center of the screen, the dashboard displays summary cards showing metrics such as today’s attendance count, pending leave requests, upcoming payroll approvals, and shift schedule status. Below the summary cards, the screen may show a recent activity feed listing user actions captured by the audit log. From any of these summary cards or the sidebar links, users can click through to the detailed pages for each feature.

## Detailed Feature Flows and Page Transitions

### Employee Management

When the user selects the Employees link in the sidebar, the system navigates to a page that lists all employee profiles. At the top of that list is a button labeled "Add Employee." Clicking that opens a modal or a full-page form where the user completes fields for personal information, employment details, emergency contacts, and role assignment. Upon submitting, the form calls the backend API and, if successful, closes the form and refreshes the employee list to include the new profile. Editing an existing employee is done by clicking an "Edit" button next to the employee row, which reopens the form pre-filled with their data. After updating, the system shows confirmation and returns to the list.

### Attendance Tracking

Selecting the Attendance link takes the user to the attendance dashboard. For regular employees, this page shows a "Clock In" or "Clock Out" button depending on their current state. Clicking the button records a timestamp via the API and updates the on-screen status. Managers or administrators see additional controls to view all employee attendance records for a given day. They may also import bulk attendance data from biometric devices by clicking an "Import Biometric Data" button, which opens a file selector, uploads the biometric data file, processes it in the background, and then displays a success notification once records are imported.

### Leave Management

The Leave section is accessible from the sidebar. Employees click a "Request Leave" button to open a request form where they choose leave dates, leave type, and an optional comment. Submitting the form creates a pending leave request in the system and notifies the user of the outcome. Managers visiting the same Leave page see a list of pending requests. Each request has Approve and Reject buttons. Approving updates the leave balances and reflects the approved leave on the attendance calendar. Rejecting prompts the manager to add an optional reason, and then the system notifies the employee that the request was declined.

### Payroll Processing

When users with payroll permissions click the Payroll link, they arrive at the payroll overview. It lists payroll batches that require approval, with details like total amount, number of employees, and due date. Clicking on a batch opens a detailed view where the user can review individual payslips, make manual adjustments, and finally click an "Approve Payroll" button. Approving triggers a backend job to generate official payslips and send them to employees via email. A progress indicator shows the status of this job, and upon completion the system displays a confirmation message.

### Schedule Management

Under the Schedule link, administrators see a calendar layout illustrating employee shifts. They can click "Create Schedule" to open a form or use an inline editor on the calendar. Here they set shift start and end times, assign employees, and designate breaks. Saving the schedule sends the data to the API, updates the calendar, and synchronizes with the attendance module so that any discrepancies between scheduled hours and actual check-in times are highlighted.

### Reporting and Analytics

The Analytics link brings users to interactive dashboards showing charts and tables for metrics such as total hours worked per department, overtime trends, and total payroll costs for a selected period. Users can apply filters by date range, department, or employee role. Changing a filter automatically fetches new data from the analytics API service and updates the visualizations. There is an Export button that lets users download the current report view as a PDF or CSV.

### Profile Completion Wizard

After a user signs up and logs in for the first time, they are redirected to a profile completion wizard. This multi-step form collects additional details such as bank account information, tax identifiers, and emergency contact information. Each step requires validation before proceeding to the next. Once all steps are successfully completed, the user is redirected to the main dashboard and receives a confirmation that their profile is now complete.

### Audit Log Viewing

The Audit Logs link in the sidebar is reserved for users with administrative privileges. Clicking it leads to a paginated table showing a chronological feed of all critical actions captured by the system, such as user logins, record creations, updates, and deletions. Each entry shows the user name, timestamp, action type, and a summary of the change. Administrators can filter logs by date range and action type, and they can click an entry to see more context if available.

## Settings and Account Management

Users can manage their personal account settings by clicking the avatar in the top header and selecting Profile. The Profile page is divided into tabs for Personal Information and Security Settings. In Personal Information, users update their name, email address, and contact phone number. Any change requires entering the current password to confirm. In Security Settings, users can change their password by providing the current password and entering a new one twice. Below these tabs, users can toggle notification preferences for email alerts on events such as leave approvals or payroll completion. Saving changes calls the API and displays a success banner. From Settings, a user can click "Back to Dashboard" in the sidebar to resume normal application use.

## Error States and Alternate Paths

When a user enters invalid data in any form, the system prevents submission and highlights fields with inline error messages explaining the correction needed. If an API call fails due to network issues, a notification banner appears at the top of the page stating "Network error. Please check your connection and try again." This banner persists until connectivity is restored or the user retries the action. If a user attempts to access a page they are not authorized to view, they are redirected to a 403 Forbidden page that explains they lack permission and provides a link back to the dashboard. In case of a server error on the backend, the application shows a generic error page with a message apologizing for the inconvenience and a link to reload the page or contact support.

## Conclusion and Overall App Journey

A new user begins their journey by registering on the landing page, verifying their email, and setting a password. After signing in, they complete a brief profile wizard to fill out necessary personal and payroll details. The application then delivers them to the main dashboard, where they can navigate to core modules such as Employee Management, Attendance Tracking, Leave Management, Payroll Processing, Schedule Management, and Reporting and Analytics. Administrators can also review Audit Logs and configure Settings for themselves or the organization. Throughout everyday usage, users clock in and out, request leave, approve payroll, manage schedules, and review analytics. Any errors or authorization issues are handled gracefully, ensuring the user always knows how to proceed. When their work is done, they simply click Sign Out to end their session.