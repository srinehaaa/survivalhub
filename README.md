#  Student Survival Hub

> **One dashboard. Everything a student needs to survive college.**

Student Survival Hub is a full-stack student productivity and management platform designed to bring academics, attendance, exams, schedules, assignments, finances, and emergency task planning into one place.

Instead of switching between multiple apps and spreadsheets, students can manage their everyday college life from a single personalized dashboard.

---

##  Features

### Dashboard

A centralized overview of important student information, including:

* Upcoming assignments
* Exam deadlines
* Attendance status
* Priority tasks
* Financial overview
* Quick navigation to all modules

---

### Assignment Management

Track and manage assignments efficiently.

**Features:**

* Add assignments
* Edit assignment details
* Delete assignments
* Set deadlines
* Track completion progress
* Set importance levels
* Estimate required time
* Automatically determine assignment status
* Automatic priority calculation

Assignment status is tracked as:

* `Pending`
* `In Progress`
* `Completed`

---

### Attendance Tracker

Monitor attendance for every subject.

**Features:**

* Add subjects
* Record classes attended
* Record classes conducted
* Calculate attendance percentage
* Set a minimum attendance requirement
* Identify subjects below the required percentage
* Calculate how many additional classes are required
* Calculate how many classes can be missed while maintaining the target

This helps students make informed decisions about their attendance instead of manually calculating percentages.

---

###  Exam & Preparation Tracker

Keep track of upcoming examinations and preparation progress.

**Features:**

* Add and edit exams
* Exam countdown
* Track preparation percentage
* Add topics for each exam
* Mark topics as:

  * Not Started
  * Needs Revision
  * Completed
* Automatically reflect preparation progress

---

###  Timetable

Manage the weekly college schedule.

**Features:**

* Add classes
* Edit classes
* Delete classes
* Select days of the week
* Set start and end times
* Add classroom information
* Categorize classes with colors
* View the selected day's schedule at a glance

---

###  Money Tracker

Track student expenses and monthly budgets.

**Features:**

* Add expenses
* Edit expenses
* Delete expenses
* Categorize spending
* Track total spending
* Calculate remaining budget
* Monitor budget usage
* Visual spending indicators

Expense categories include:

*  Food
*  Travel
*  Shopping
*  Entertainment
*  Other

---

###  Panic Mode

One of the core features of Student Survival Hub.

When a student has multiple urgent tasks and limited time, **Panic Mode** generates a focused study/work plan based on the user's highest-priority tasks.

The student can select:

*  1 Hour
*  2 Hours
*  3 Hours
*  4 Hours

The system then creates a survival schedule containing focused work blocks and breaks.

This helps convert an overwhelming task list into an actionable short-term plan.

---

### Authentication & Personal Profiles

The application supports individual student accounts using Supabase Authentication.

Students can:

* Create an account
* Sign in
* Sign out
* Reset their password
* Maintain a personal profile
* Store their course and year
* Set their monthly budget
* Set their minimum attendance requirement

Each student's data is isolated from other users.

---

## Priority-Based Task Management

Student Survival Hub includes a priority system that considers information such as:

* Assignment/exam deadline
* Importance
* Estimated completion time
* Current status

These factors are used to identify tasks that require greater attention.

The resulting priority information is also used by **Panic Mode** to generate a practical survival plan.

---

##  Tech Stack

### Frontend

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Lucide React**

### Backend / Database

* **Supabase**
* **PostgreSQL**
* **Supabase Authentication**
* **Row Level Security (RLS)**

### Development Tools

* ESLint
* TypeScript
* PostCSS
* Vite

---

##  Project Structure

```text
Student-Survival-Hub/
│
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── ui.tsx
│   │
│   ├── lib/
│   │   ├── auth.tsx
│   │   ├── dateUtils.ts
│   │   ├── priority.ts
│   │   ├── profileTypes.ts
│   │   ├── sampleData.ts
│   │   ├── status.ts
│   │   ├── storage.ts
│   │   ├── supabase.ts
│   │   ├── types.ts
│   │   └── useUserData.ts
│   │
│   ├── pages/
│   │   ├── Assignments.tsx
│   │   ├── Attendance.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Exams.tsx
│   │   ├── Money.tsx
│   │   ├── PanicMode.tsx
│   │   └── Timetable.tsx
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── supabase/
│   └── migrations/
│       └── create_student_survival_hub_schema.sql
│
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Database Architecture

The application uses Supabase/PostgreSQL with separate tables for different areas of student life.

### Main Tables

| Table               | Purpose                         |
| ------------------- | ------------------------------- |
| `profiles`          | Student profile and preferences |
| `subjects`          | Attendance tracking             |
| `assignments`       | Assignment management           |
| `exams`             | Exam management                 |
| `exam_topics`       | Exam preparation topics         |
| `timetable_classes` | Weekly timetable                |
| `expenses`          | Expense tracking                |

###  Row Level Security

Row Level Security is enabled across the application's data tables.

Each student's records are associated with their authenticated user ID, ensuring that students can only access and modify their own data.

---

## 🔄 Application Flow

```text
                    ┌──────────────────┐
                    │   Student Login  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Dashboard     │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    Assignments          Attendance           Exams
          │                  │                  │
          │                  │                  │
          └──────────────┬───┴──────────────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Priority Engine  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   Panic Mode     │
                │ Survival Plan    │
                └──────────────────┘

        Timetable ────────────────┐
                                  │
        Money Tracker ────────────┤
                                  ▼
                           Student Profile
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/student-survival-hub.git
cd student-survival-hub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a Supabase project and configure the required environment variables.

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Never commit your `.env` file or secret keys to GitHub.**

### 4. Apply the database migration

Run the SQL migration located at:

```text
supabase/migrations/
```

in your Supabase SQL editor.

### 5. Start the development server

```bash
npm run dev
```

The application will be available through the local Vite development server.

---

## 🧪 Available Scripts

### Start development server

```bash
npm run dev
```

### Build the project

```bash
npm run build
```

### Run ESLint

```bash
npm run lint
```

### Run TypeScript type checking

```bash
npm run typecheck
```

### Preview production build

```bash
npm run preview
```

---

## 🔐 Security

The project uses several security mechanisms:

* Supabase Authentication
* PostgreSQL Row Level Security
* User-scoped database records
* Authenticated CRUD operations
* Environment variables for Supabase configuration
* No secret credentials stored in source code

---

## 🎯 Problem Statement

College students often manage different aspects of their academic and personal lives using separate applications.

For example:

* Assignments → Notes / reminders
* Attendance → Manual calculations
* Exams → Calendar
* Timetable → College portal
* Expenses → Notes / spreadsheets
* Urgent work → Usually managed manually

This fragmentation makes it difficult to understand what needs attention **right now**.

Student Survival Hub brings these tasks together and provides priority-based assistance when students are overwhelmed.

---

## 💡 Solution

Student Survival Hub acts as a **personal college management system**.

It combines:

> **Academic tracking + Time management + Attendance management + Financial tracking + Priority planning**

into one application.

The **Panic Mode** feature goes one step further by converting urgent tasks into a structured short-term action plan.

---

## 🔮 Future Enhancements

Potential future improvements include:

* 🤖 AI-powered study planning
* 📈 Academic performance analytics
* 🔔 Assignment and exam notifications
* 📱 Progressive Web App / mobile support
* 📊 Advanced expense analytics
* 🧠 Personalized study recommendations
* 📅 Calendar integration
* 📄 Automatic timetable import
* 🔗 Integration with college portals
* 🌙 Dark mode
* 📧 Email reminders
* 🤖 AI chatbot for student assistance

---

## 👩‍💻 Contributors

**Srineha Alampally**

BE – Artificial Intelligence & Data Science

Chaitanya Bharathi Institute of Technology, Hyderabad

---

##  Why Student Survival Hub?

College life can get chaotic.

Assignments pile up.
Exams get closer.
Attendance drops.
Schedules change.
Money disappears.
And suddenly everything feels urgent.

**Student Survival Hub brings it all together.**

> **Plan smarter. Track better. Survive college. 🎓**
<p align="center">
  <a href="https://github.com/lucide-icons/lucide#gh-light-mode-only">
    <img src="https://lucide.dev/lucide-react.svg#gh-light-mode-only" alt="Lucide React - Implementation of the lucide icon library for react applications." width="540">
  </a>
  <a href="https://github.com/lucide-icons/lucide#gh-dark-mode-only">
    <img src="https://lucide.dev/package-logos/dark/lucide-react.svg#gh-dark-mode-only" alt="Lucide React - Implementation of the lucide icon library for react applications." width="540">
  </a>
</p>


# Lucide React

Implementation of the lucide icon library for react applications.

> What is lucide? Read it [here](https://github.com/lucide-icons/lucide#what-is-lucide).

## Installation

```sh
yarn add lucide-react
```

or

```sh
npm install lucide-react
```

## Documentation

For full documentation, visit [lucide.dev](https://lucide.dev/guide/packages/lucide-react)

## Community

Join the [Discord server](https://discord.gg/EH6nSts) to chat with the maintainers and other users.

## License

Lucide is licensed under the ISC license. See [LICENSE](https://lucide.dev/license).

## Sponsors

<a href="https://vercel.com?utm_source=lucide&utm_campaign=oss">
  <img src="https://lucide.dev/vercel.svg" alt="Powered by Vercel" width="200" />
</a>

<a href="https://www.digitalocean.com/?refcode=b0877a2caebd&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge"><img src="https://lucide.dev/digitalocean.svg" width="200" alt="DigitalOcean Referral Badge" /></a>

### Awesome backer 🍺

<a href="https://www.scipress.io?utm_source=lucide"><img src="https://lucide.dev/sponsors/scipress.svg" width="180" alt="Scipress sponsor badge" /></a>
