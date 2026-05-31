import { ProfileEditor } from "@/components/profile-editor";
import { PageShell } from "@/components/page-shell";
import { getActiveUserEmail } from "@/lib/auth/session";
import { getCoursePickerOptions, getPrograms } from "@/lib/repositories";
import { getDashboardView } from "@/lib/user-data";

export default async function ProfilePage() {
  const [dashboard, programs, courseOptions, email] = await Promise.all([
    getDashboardView(),
    getPrograms(),
    getCoursePickerOptions(),
    getActiveUserEmail()
  ]);

  return (
    <PageShell
      eyebrow="Profile"
      title={dashboard?.userName ? `${dashboard.userName}'s academic profile` : "Your academic profile"}
      description="Update your major, minor, and completed courses. These inputs power requirement progress, planner warnings, and course recommendations."
    >
      <p className="mb-6 text-sm text-[#6a7383]">
        Signed in as <span className="font-medium text-[#19212f]">{email}</span>
        {dashboard?.schoolName ? ` · ${dashboard.schoolName}` : ""}
      </p>

      <ProfileEditor
        programs={programs.map((program) => ({ id: program.id, name: program.name, type: program.type }))}
        selectedPrograms={dashboard?.selectedPrograms ?? []}
        completedCourses={dashboard?.completedCourses ?? []}
        courseOptions={courseOptions.map((course) => ({ id: course.id, code: course.code, title: course.title }))}
      />
    </PageShell>
  );
}
