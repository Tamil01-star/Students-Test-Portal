Create a full-stack responsive web application called “Classic Examination Portal”.

The purpose of the website is:
- Conduct online examinations
- Manage test schedules
- Allow staff to create exams
- Allow students to attend exams
- Maintain secure exam environment
- Focus only on educational and examination activities

==================================================
GENERAL DESIGN REQUIREMENTS
==================================================

1. The entire website theme must be:
- Minimal
- Elegant
- Academic
- Professional
- Classic
- Dark + Light mixed educational theme
- Smooth animations
- Clean typography
- No gaming style
- No unnecessary colors
- Focus mode interface

2. Use:
- HTML5
- CSS3
- JavaScript
- React.js frontend
- Node.js backend
- Express.js
- MongoDB database
- JWT authentication
- Tailwind CSS for styling

3. Website must be:
- Fully responsive
- Mobile responsive
- Tablet responsive
- Desktop optimized

4. Add:
- Loading animations
- Smooth transitions
- Blur glass cards
- Soft shadows
- Academic dashboard style

==================================================
AUTHENTICATION SYSTEM
==================================================

5. Create two user roles:
- Staff
- Student

6. Authentication must support:
- Gmail login
- College mail login
- Email + password login
- OTP verification
- Forgot password system

7. Restrict fake accounts.

8. Only valid Gmail or college email IDs are allowed.

9. Add email verification before account activation.

10. Use secure password hashing.

11. Add JWT token authentication.

12. Add session timeout.

13. Add remember me option.

==================================================
LANDING PAGE
==================================================

14. Create a beautiful landing page with:
- Hero section
- Portal introduction
- Features section
- Examination security section
- About institution section
- Login/Register buttons

15. Hero section should contain:
- Academic illustration
- Professional typography
- Animated background
- Examination related icons

16. Add:
- Sticky navbar
- Footer
- Contact details
- Institution branding

==================================================
STUDENT DASHBOARD
==================================================

17. Student dashboard should contain:
- Upcoming tests
- Test schedules
- Completed exams
- Scores
- Notifications
- Warnings
- Attendance status

18. Student can:
- View available exams
- Start examination
- Read instructions
- Submit answers
- View results after permission

19. Dashboard should show:
- Countdown timers
- Exam start time
- Remaining time
- Exam status

20. Add notification panel.

==================================================
STAFF DASHBOARD
==================================================

21. Staff dashboard should contain:
- Create exams
- Manage questions
- Set timings
- View students
- Monitor exam activity
- Publish results

22. Staff can:
- Add questions
- Edit questions
- Delete questions
- Assign marks
- Set duration
- Enable fullscreen enforcement
- Enable anti-cheat mode

23. Staff can create:
- MCQ questions
- True/False questions
- Paragraph questions
- Coding questions
- Fill in the blanks

24. Staff can upload:
- PDF files
- Images
- Instructions

==================================================
EXAM CREATION SYSTEM
==================================================

25. Exam creation form must include:
- Exam title
- Subject
- Date
- Start time
- End time
- Duration
- Total marks
- Instructions

26. Add question editor.

27. Staff should be able to:
- Save draft
- Publish exam
- Schedule exam

28. Add automatic validation.

29. Prevent overlapping schedules.

==================================================
EXAM SECURITY SYSTEM
==================================================

30. Before starting exam:
- Force fullscreen permission

31. Student must click:
“Enable Fullscreen and Start Exam”

32. If fullscreen is not enabled:
- Exam should not start

33. During examination:
- Detect fullscreen exit
- Detect tab switching
- Detect minimize
- Detect browser change

34. If student exits fullscreen:
- Show warning popup

35. Warning popup should say:
“You are violating examination rules.”

36. Add warning counter.

37. Maximum warnings allowed:
- 3 warnings

38. After 3 warnings:
- Auto submit examination
- End test immediately

39. Log every warning in database.

40. Prevent:
- Copy
- Paste
- Right click
- Text selection
- Keyboard shortcuts

41. Disable:
- Ctrl+C
- Ctrl+V
- Alt+Tab detection attempt
- F12
- Inspect element shortcuts

42. Add anti-cheat monitoring.

43. Add webcam permission option.

44. Add camera monitoring placeholder.

45. Add screen activity logs.

==================================================
EXAM INTERFACE
==================================================

46. Examination page should contain:
- Question palette
- Timer
- Navigation buttons
- Submit button
- Warning counter

47. Add:
- Previous question
- Next question
- Mark for review

48. Timer must always stay visible.

49. Auto save answers every few seconds.

50. Add autosubmit when timer ends.

51. Show confirmation before final submit.

52. Prevent page refresh during exam.

53. If page refresh happens:
- Restore exam session securely

==================================================
QUESTION NAVIGATION
==================================================

54. Question palette colors:
- Answered
- Unanswered
- Marked
- Current question

55. Add progress tracker.

56. Add exam completion percentage.

==================================================
RESULT SYSTEM
==================================================

57. Results page should contain:
- Student score
- Percentage
- Correct answers
- Wrong answers
- Time taken

58. Staff can:
- Publish results manually
- Hide results
- Download reports

59. Students can:
- View scores
- Download report

==================================================
DATABASE STRUCTURE
==================================================

60. Create collections for:
- Users
- Exams
- Questions
- Results
- Warnings
- Notifications

61. Store:
- Fullscreen violations
- Login activity
- Exam logs

==================================================
ADMIN FEATURES
==================================================

62. Add admin panel.

63. Admin can:
- Manage users
- Manage exams
- Block students
- Reset passwords
- View analytics

64. Add institution settings panel.

==================================================
NOTIFICATION SYSTEM
==================================================

65. Add real-time notifications.

66. Notify students about:
- Upcoming tests
- Schedule changes
- Result publication

67. Notify staff about:
- Student submissions
- Violations
- Exam status

==================================================
UI DESIGN DETAILS
==================================================

68. Use:
- Elegant cards
- Rounded corners
- Smooth hover effects
- Academic icons

69. Fonts:
- Poppins
- Inter
- Roboto

70. Colors:
- Deep blue
- White
- Gray
- Soft gold accents

71. Add:
- Dashboard graphs
- Analytics cards
- Modern sidebar

==================================================
ACCESSIBILITY
==================================================

72. Ensure:
- Keyboard accessibility
- Proper contrast
- Screen reader support

==================================================
SECURITY REQUIREMENTS
==================================================

73. Protect against:
- SQL injection
- XSS attacks
- CSRF attacks

74. Add rate limiting.

75. Add secure headers.

76. Validate all inputs.

==================================================
PERFORMANCE
==================================================

77. Optimize:
- API performance
- Database queries
- Lazy loading

78. Use:
- Pagination
- Caching
- Compression

==================================================
API FEATURES
==================================================

79. Create REST APIs for:
- Authentication
- Exams
- Questions
- Results
- Notifications

80. Use MVC architecture.

==================================================
FILE STRUCTURE
==================================================

81. Generate clean project structure.

82. Separate:
- Components
- Pages
- Routes
- Controllers
- Models
- Middleware

==================================================
EXTRA FEATURES
==================================================

83. Add dark mode toggle.

84. Add profile management.

85. Add institution logo upload.

86. Add exam instructions modal.

87. Add student activity timeline.

88. Add audit logs.

89. Add responsive charts.

90. Add export to PDF.

==================================================
ANIMATIONS
==================================================

91. Use:
- Framer Motion
- Smooth page transitions
- Hover animations

92. Keep animations minimal and professional.

==================================================
FINAL OUTPUT REQUIREMENTS
==================================================

93. Generate:
- Complete frontend
- Complete backend
- Database models
- API routes
- Authentication middleware

94. Generate production-ready code.

95. Add comments in important sections.

96. Create reusable components.

97. Ensure clean coding standards.

98. Use environment variables.

99. Add README documentation.

100. Add deployment instructions.

==================================================
SPECIAL EXAM LOGIC
==================================================

101. If fullscreen exits:
- Increase warning count

102. If warning count >= 3:
- Submit exam automatically

103. Save warning logs with timestamps.

104. Student cannot restart exam after auto submission.

105. Add secure exam session tracking.

106. Display remaining warnings.

107. Show red alert popup for violations.

==================================================
LOGIN PAGE DESIGN
==================================================

108. Login page must contain:
- Academic illustration
- Minimal form
- Professional gradient background

109. Add:
- Password visibility toggle
- Remember me checkbox

==================================================
REGISTER PAGE
==================================================

110. Registration form fields:
- Full name
- Email
- Department
- Student ID
- Password
- Confirm password

111. Validate all fields properly.

==================================================
SIDEBAR FEATURES
==================================================

112. Sidebar should include:
- Dashboard
- Exams
- Results
- Notifications
- Profile
- Logout

==================================================
HEADER FEATURES
==================================================

113. Header should contain:
- Institution logo
- User profile
- Notifications
- Dark mode toggle

==================================================
FOOTER
==================================================

114. Footer should include:
- Institution name
- Contact info
- Copyright
- Quick links

==================================================
MOBILE EXPERIENCE
==================================================

115. Mobile version should:
- Stack cards properly
- Have responsive sidebar
- Maintain readability

==================================================
DEPLOYMENT
==================================================

116. Prepare deployment for:
- Vercel frontend
- Render backend
- MongoDB Atlas database

==================================================
ADVANCED FEATURES
==================================================

117. Add AI-ready architecture.

118. Add future scalability support.

119. Add modular backend structure.

120. Add exam analytics.

==================================================
MONITORING FEATURES
==================================================

121. Monitor:
- Active students
- Active exams
- Violations
- Submission times

==================================================
FINAL DESIGN STYLE
==================================================

122. Final website should look like:
- Modern university portal
- Government examination system
- Professional educational dashboard

123. Avoid:
- Cartoon style
- Bright neon colors
- Gaming UI

124. Focus on:
- Security
- Simplicity
- Professionalism
- Reliability

==================================================
END GOAL
==================================================

125. Build a secure, scalable, elegant online examination portal with:
- Staff management
- Student examination system
- Fullscreen anti-cheat enforcement
- Warning detection
- Auto submission
- Academic classic theme
- Production-level architecture
- Modern responsive UI
- Strong authentication
- Real-time exam management