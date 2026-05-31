Prompt 1 — Project setup & database
Paste this first to set the foundation:
Build a full stack college test portal web application using:
- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express.js
- Database: PostgreSQL
- Authentication: JWT tokens

PROJECT NAME: College Test Portal

DATABASE TABLES — create all of these:

1. users
   - id (primary key, auto increment)
   - user_id (unique — staff ID like "STF001" or register number like "REG2024001")
   - name (full name)
   - email
   - password (bcrypt hashed, never plain text)
   - role (enum: "management", "staff", "student")
   - password_changed (boolean, default false)
   - created_at (timestamp)

2. tests
   - id (primary key)
   - title (test name)
   - subject
   - scheduled_date (date)
   - start_time (time)
   - end_time (time)
   - created_by (foreign key → users.id, only staff)
   - is_active (boolean)
   - created_at (timestamp)

3. questions
   - id (primary key)
   - test_id (foreign key → tests.id)
   - question_text
   - option_a, option_b, option_c, option_d
   - correct_answer (enum: "a","b","c","d")
   - marks (integer)
   - created_at (timestamp)

4. test_enrollments
   - id (primary key)
   - test_id (foreign key → tests.id)
   - student_id (foreign key → users.id)
   - enrolled_at (timestamp)

5. test_submissions
   - id (primary key)
   - test_id (foreign key → tests.id)
   - student_id (foreign key → users.id)
   - answers (JSON — stores question_id and selected answer)
   - score (integer)
   - submitted_at (timestamp)
   - is_submitted (boolean, default false)

RULES:
- No self-registration allowed anywhere in the system
- Only management can create staff accounts
- Only staff can create student accounts using register numbers
- Students cannot create any account
- All passwords are bcrypt hashed
- Use JWT tokens that carry user_id, role, and name
- Token expires in 8 hours

Prompt 2 — Authentication & role logic
Paste this second:
Now build the complete authentication system for the college test portal:

LOGIN FLOW (same login page for all roles):
- Single login page at route /login
- User enters their user_id (Staff ID or Register Number) and password
- Backend checks user_id in the users table
- If found and password matches → generate JWT token with { user_id, role, name }
- If password_changed is false → redirect to /change-password (FORCED, cannot skip)
- If password_changed is true → redirect to their role dashboard

FORCED PASSWORD CHANGE:
- Route: /change-password
- Show this page only when password_changed = false
- User must enter: new password + confirm password
- Password rules: minimum 8 characters, at least one number, one uppercase letter
- On success: update password in DB, set password_changed = true, redirect to dashboard
- Block all other routes until password is changed — middleware must enforce this

ROLE-BASED ROUTING after login:
- role = "management" → redirect to /management/dashboard
- role = "staff"       → redirect to /staff/dashboard
- role = "student"     → redirect to /student/dashboard

CHANGE PASSWORD (anytime after first login):
- Available in profile/settings page for all roles
- User enters: current password, new password, confirm new password
- Backend verifies current password before saving new one
- Show success message on change

SECURITY MIDDLEWARE:
- Protect all routes with JWT verification middleware
- Add role-check middleware:
  - /management/* → only role = "management" allowed
  - /staff/*      → only role = "staff" allowed
  - /student/*    → only role = "student" allowed
- Return 403 Forbidden if wrong role tries to access a route
- Return 401 Unauthorized if no token present

ACCOUNT CREATION (no public signup):
- POST /api/management/create-staff
  → Only management can call this
  → Body: { name, email, staff_id, temp_password }
  → Creates user with role = "staff", password_changed = false

- POST /api/staff/create-student
  → Only staff can call this
  → Body: { name, email, register_number, temp_password }
  → Creates user with role = "student", password_changed = false

Prompt 3 — Staff features (test management)
Paste this third:
Now build the complete STAFF dashboard and features for the college test portal:

STAFF DASHBOARD at /staff/dashboard:
- Show welcome message with staff name
- Show summary cards: total tests created, total students, upcoming tests today
- Navigation: Create Test | My Tests | Add Questions | Student Results | Create Student Account | Change Password

FEATURE 1 — Create Test Schedule:
- Route: /staff/create-test
- Form fields: Test Title, Subject, Scheduled Date, Start Time, End Time
- On submit: save to tests table with created_by = logged-in staff id, is_active = true
- Show success message and redirect to My Tests

FEATURE 2 — Add Questions to a Test:
- Route: /staff/tests/:test_id/questions
- Show the test title at top
- Form to add one question at a time:
  - Question text (textarea)
  - Option A, Option B, Option C, Option D (text inputs)
  - Correct Answer (dropdown: A / B / C / D)
  - Marks (number input)
- Show all existing questions for this test below the form
- Allow staff to delete a question
- Questions only visible to students during the test, not before

FEATURE 3 — Enroll Students to a Test:
- Route: /staff/tests/:test_id/enroll
- Show list of all students
- Staff selects which students can attend this test (checkboxes)
- Save to test_enrollments table
- Only enrolled students can see and attend the test

FEATURE 4 — View All Results:
- Route: /staff/results
- Show dropdown to select a test
- On select: show table with columns — Register Number, Student Name, Score, Total Marks, Percentage, Submitted At
- Allow export as CSV

FEATURE 5 — Create Student Account:
- Route: /staff/create-student
- Form: Student Name, Email, Register Number, Temporary Password
- On submit: create user with role = "student", password_changed = false
- Show success with the register number clearly displayed

Prompt 4 — Student features + Management panel
Paste this last:
Now build the complete STUDENT dashboard and MANAGEMENT panel for the college test portal:

STUDENT DASHBOARD at /student/dashboard:
- Show welcome message with student name and register number
- Show summary cards: upcoming tests, tests completed, average score
- Navigation: My Tests | Attend Test | My Results | Change Password

FEATURE 1 — View Upcoming Tests:
- Route: /student/tests
- Show only tests the student is enrolled in (from test_enrollments)
- Show: Test Title, Subject, Date, Start Time, End Time, Status (Upcoming / Active / Completed)
- If current time is between start_time and end_time → show "Attend Now" button
- If already submitted → show "View Score" button
- If not yet started → show "Scheduled" badge

FEATURE 2 — Attend Test:
- Route: /student/tests/:test_id/attend
- Only accessible if:
  a) Student is enrolled in this test
  b) Current time is between start_time and end_time
  c) Student has not already submitted
- Show one question at a time with a timer counting down to end_time
- Student selects one option per question (radio buttons)
- "Next" and "Previous" buttons to navigate questions
- "Submit Test" button at the end
- On submit: calculate score automatically, save to test_submissions, mark is_submitted = true
- After submit: show score immediately — "You scored X out of Y"
- Block going back to re-attempt after submission

FEATURE 3 — View My Results:
- Route: /student/results
- Show table: Test Name, Subject, Date, Score, Total Marks, Percentage
- Only shows this student's own results — never other students' data

MANAGEMENT PANEL at /management/dashboard:
- Show total staff count, total students count, total tests count
- Navigation: Create Staff | View All Staff | View All Students | Change Password

MANAGEMENT FEATURE — Create Staff Account:
- Route: /management/create-staff
- Form: Staff Name, Email, Staff ID, Temporary Password
- On submit: create user with role = "staff", password_changed = false
- Show success with Staff ID clearly displayed

MANAGEMENT FEATURE — View All Staff:
- Route: /management/staff-list
- Table: Staff ID, Name, Email, Date Created, Active Tests Count
- Option to deactivate a staff account

MANAGEMENT FEATURE — View All Students:
- Route: /management/student-list
- Table: Register Number, Name, Email, Created By (which staff), Date Created
- Filter by staff who created them

FINAL CHECKLIST — make sure these are working:
1. No route accessible without JWT token
2. Wrong role gets 403 error page with "Access Denied" message
3. First-time login always redirects to change password
4. Students can only see their own test results
5. Students can only attend tests they are enrolled in
6. Test questions are hidden until the test starts
7. Once a test is submitted it cannot be re-attempted
8. All passwords stored as bcrypt hashes
9. Responsive design — works on mobile and desktop
10. Show loading spinners during API calls