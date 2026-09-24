# Student Survival Hub - Updated Source

This package is based on the user's previously downloaded Bolt project.

Changes included:
- Real add/edit/delete forms for Attendance, Assignments, Exams, Timetable and Money.
- Attendance advisor uses each student's profile minimum-attendance setting.
- Profile settings modal for name, course, year, budget and minimum attendance.
- Existing Supabase Auth flow made more robust for profile creation.
- User-data loading errors are surfaced instead of silently becoming empty data.
- Demo data seeding checks all core tables to avoid duplicate demo data.
- Exam topic updates persist preparation progress.
- Existing UI/design is preserved as much as possible.

IMPORTANT:
- The original .env file was intentionally excluded from this package.
- Keep the Supabase environment variables already configured in your Replit project.
- The Supabase migration is included under supabase/migrations.
- Apply the migration to the live Supabase project if it has not already been applied.

Recommended Replit workflow:
1. Keep a backup of your current Replit project.
2. Upload/replace the source files from this package.
3. Keep your existing Replit environment variables.
4. Run `npm run typecheck`, `npm run lint`, and `npm run build`.
5. Open the app and test two separate student accounts.
