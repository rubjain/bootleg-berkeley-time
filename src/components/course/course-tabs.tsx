"use client";

import { useState } from "react";
import { CommunityModerationMenu } from "@/components/community-moderation-menu";
import { DiscussionComposer, ReviewComposer } from "@/components/social-actions";
import { CourseCommunityView } from "@/lib/types";

type TabKey =
  | "overview"
  | "grade"
  | "enrollment"
  | "professors"
  | "requirements"
  | "reviews"
  | "discussion";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "grade", label: "Grade Data" },
  { key: "enrollment", label: "Enrollment Trends" },
  { key: "professors", label: "Professors" },
  { key: "requirements", label: "Requirements Satisfied" },
  { key: "reviews", label: "Student Reviews" },
  { key: "discussion", label: "Discussion" }
];

const panelClass = "rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm";
const insetClass = "rounded-2xl bg-[rgba(36,48,71,0.05)] p-4";

export function CourseTabs(props: {
  courseSlug: string;
  community: CourseCommunityView;
  overview: React.ReactNode;
  gradeData: React.ReactNode;
  enrollment: React.ReactNode;
  professors: React.ReactNode;
  requirements: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-[#243047] text-white"
                : "bg-[rgba(255,252,246,0.9)] text-[#5a6273] ring-1 ring-[rgba(39,50,71,0.12)] hover:text-[#19212f]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? props.overview : null}
      {activeTab === "grade" ? props.gradeData : null}
      {activeTab === "enrollment" ? props.enrollment : null}
      {activeTab === "professors" ? props.professors : null}
      {activeTab === "requirements" ? props.requirements : null}
      {activeTab === "reviews" ? <CourseReviewsSection courseSlug={props.courseSlug} community={props.community} /> : null}
      {activeTab === "discussion" ? <CourseDiscussionSection courseSlug={props.courseSlug} community={props.community} /> : null}
    </div>
  );
}

function CourseReviewsSection({ courseSlug, community }: { courseSlug: string; community: CourseCommunityView }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <div className={panelClass}>
          <h2 className="text-xl font-semibold text-[#19212f]">Historical student insight</h2>
          <div className="mt-4 space-y-3 text-sm text-[#4b5668]">
            <p>
              <strong className="text-[#19212f]">Difficulty:</strong> {community.studentInsightSummary.perceivedDifficulty}
            </p>
            <p>
              <strong className="text-[#19212f]">Workload:</strong> {community.studentInsightSummary.averageWeeklyWorkload}
            </p>
            <p>
              <strong className="text-[#19212f]">Lectures useful:</strong> {community.studentInsightSummary.lecturesUseful}
            </p>
            <p>
              <strong className="text-[#19212f]">Attendance mattered:</strong>{" "}
              {community.studentInsightSummary.attendanceMatters}
            </p>
            <p>
              <strong className="text-[#19212f]">Hardest part:</strong> {community.studentInsightSummary.hardestPart}
            </p>
            <div>
              <p className="font-semibold text-[#19212f]">Best advice</p>
              <ul className="mt-2 space-y-2">
                {community.studentInsightSummary.bestAdvice.length ? (
                  community.studentInsightSummary.bestAdvice.map((advice) => (
                    <li key={advice}>{advice}</li>
                  ))
                ) : (
                  <li>No student advice posted yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <ReviewComposer courseSlug={courseSlug} />
        <div className="rounded-[1.75rem] border border-[rgba(201,111,74,0.25)] bg-[rgba(201,111,74,0.08)] p-5 text-sm text-[#6f4038]">
          Reviews are moderated. Use the menu on each post to report harassment or block an author (saved to your account when signed in).
        </div>
      </div>

      <div className="space-y-4">
        {community.reviews.length ? (
          community.reviews.map((review) => (
            <div key={review.id} className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#19212f]">{review.title ?? "Student review"}</h3>
                  <p className="text-sm text-[#6a7383]">{review.pseudonym ?? review.authorName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#4b5668]">{review.upvoteCount} helpful votes</p>
                  <CommunityModerationMenu
                    targetType="review"
                    targetId={review.id}
                    authorName={review.authorName}
                    courseSlug={courseSlug}
                  />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#4b5668]">{review.body}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6a7383]">
                <span>Difficulty {review.difficultyRating}/5</span>
                <span>Workload {review.workloadRating}/5</span>
                <span>Usefulness {review.usefulnessRating}/5</span>
                <span>Recommend {review.recommendationRating}/5</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[rgba(36,48,71,0.06)] px-3 py-1 text-xs font-medium text-[#314056]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={`${panelClass} text-sm text-[#6a7383]`}>No reviews posted yet.</div>
        )}
      </div>
    </div>
  );
}

function CourseDiscussionSection({ courseSlug, community }: { courseSlug: string; community: CourseCommunityView }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <DiscussionComposer courseSlug={courseSlug} />
        <div className={panelClass}>
          <h2 className="text-xl font-semibold text-[#19212f]">Discussion rules</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-[#4b5668]">
            <p>
              Keep course discussion useful, specific, and safe. Share study strategies, professor fit, and workload
              context without posting harassment or private personal information.
            </p>
            <p>Reports are stored for admin review when you are signed in. Blocks hide authors on this device and in your account.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {community.discussion.length ? (
          community.discussion.map((post) => (
            <div key={post.id} className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#19212f]">{post.title}</h3>
                  <p className="text-sm text-[#6a7383]">{post.authorName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#4b5668]">{post.upvoteCount} upvotes</p>
                  <CommunityModerationMenu
                    targetType="discussion"
                    targetId={post.id}
                    authorName={post.authorName}
                    courseSlug={courseSlug}
                  />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#4b5668]">{post.body}</p>
              <div className="mt-5 space-y-3 border-t border-[rgba(39,50,71,0.08)] pt-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className={insetClass}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#19212f]">{comment.authorName}</p>
                      <CommunityModerationMenu
                        targetType="comment"
                        targetId={comment.id}
                        authorName={comment.authorName}
                        courseSlug={courseSlug}
                      />
                    </div>
                    <p className="mt-2 text-sm text-[#4b5668]">{comment.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={`${panelClass} text-sm text-[#6a7383]`}>No discussion threads yet.</div>
        )}
      </div>
    </div>
  );
}
