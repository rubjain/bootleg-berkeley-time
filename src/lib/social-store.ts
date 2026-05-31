import {
  CourseCommunityView,
  CourseDiscussionPostView,
  CourseReviewView,
  FriendRequestView,
  MessageThreadView,
  SocialDashboardView,
  SocialFriendProfile
} from "@/lib/types";
import { buildCourseInsightSummary, getCourseCommunityMock, getSocialDashboardMock } from "@/lib/social-data";

let socialDashboardState: SocialDashboardView = getSocialDashboardMock();
const courseCommunityState = new Map<string, CourseCommunityView>();

function ensureCourseCommunity(courseSlug: string) {
  const existing = courseCommunityState.get(courseSlug);
  if (existing) return existing;
  const initial = getCourseCommunityMock(courseSlug);
  courseCommunityState.set(courseSlug, initial);
  return initial;
}

export function getSocialDashboardState() {
  return socialDashboardState;
}

export function searchFriendProfiles(query: string) {
  const normalized = query.toLowerCase();
  const candidates: SocialFriendProfile[] = [
    ...socialDashboardState.friends,
    ...socialDashboardState.incomingRequests.map((request) => request.fromUser),
    ...socialDashboardState.outgoingRequests.map((request) => request.toUser)
  ];

  return candidates.filter((profile) =>
    [profile.name, profile.school, ...profile.majors, ...profile.minors]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export function sendFriendRequest(input: { toUser: SocialFriendProfile; message?: string }) {
  const request: FriendRequestView = {
    id: `request-${Date.now()}`,
    fromUser: {
      id: "demo-user",
      name: "Alex Student",
      school: "UC Berkeley",
      majors: ["Data Science"],
      minors: ["Data Science"],
      visiblePlanTitles: ["4-Year Graduation Plan"],
      visibleScheduleLabels: ["Spring Year 2"]
    },
    toUser: input.toUser,
    status: "PENDING",
    message: input.message,
    createdAt: new Date().toISOString()
  };

  socialDashboardState = {
    ...socialDashboardState,
    outgoingRequests: [request, ...socialDashboardState.outgoingRequests]
  };

  return request;
}

export function acceptFriendRequest(requestId: string) {
  const request = socialDashboardState.incomingRequests.find((item) => item.id === requestId);
  if (!request) return null;

  socialDashboardState = {
    ...socialDashboardState,
    friends: [request.fromUser, ...socialDashboardState.friends],
    incomingRequests: socialDashboardState.incomingRequests.filter((item) => item.id !== requestId)
  };

  return request.fromUser;
}

export function declineFriendRequest(requestId: string) {
  socialDashboardState = {
    ...socialDashboardState,
    incomingRequests: socialDashboardState.incomingRequests.filter((item) => item.id !== requestId)
  };
}

export function sendMessage(input: { threadId: string; body: string; sharedCourseCode?: string; sharedPlanTitle?: string }) {
  const nextThreads = socialDashboardState.threads.map((thread) => {
    if (thread.id !== input.threadId) return thread;

    const message = {
      id: `message-${Date.now()}`,
      senderName: "Alex Student",
      body: input.body,
      createdAt: new Date().toISOString(),
      sharedCourseCode: input.sharedCourseCode,
      sharedPlanTitle: input.sharedPlanTitle
    };

    return {
      ...thread,
      messages: [...thread.messages, message]
    };
  });

  socialDashboardState = {
    ...socialDashboardState,
    threads: nextThreads
  };

  return nextThreads.find((thread) => thread.id === input.threadId);
}

export function getCourseCommunityState(courseSlug: string) {
  return ensureCourseCommunity(courseSlug);
}

export function addCourseReview(input: {
  courseSlug: string;
  title?: string;
  body: string;
  difficultyRating: number;
  workloadRating: number;
  usefulnessRating: number;
  recommendationRating: number;
  tags: string[];
  advice?: string;
  reasonTag?: string;
}) {
  const current = ensureCourseCommunity(input.courseSlug);
  const review: CourseReviewView = {
    id: `review-${Date.now()}`,
    authorName: "Alex Student",
    title: input.title,
    body: input.body,
    difficultyRating: input.difficultyRating,
    workloadRating: input.workloadRating,
    usefulnessRating: input.usefulnessRating,
    recommendationRating: input.recommendationRating,
    tags: input.tags,
    advice: input.advice,
    reasonTag: input.reasonTag,
    upvoteCount: 0,
    createdAt: new Date().toISOString()
  };

  const reviews = [review, ...current.reviews];
  const updated = {
    ...current,
    reviews,
    studentInsightSummary: buildCourseInsightSummary(reviews)
  };
  courseCommunityState.set(input.courseSlug, updated);
  return updated;
}

export function addDiscussionPost(input: { courseSlug: string; title: string; body: string }) {
  const current = ensureCourseCommunity(input.courseSlug);
  const post: CourseDiscussionPostView = {
    id: `post-${Date.now()}`,
    authorName: "Alex Student",
    title: input.title,
    body: input.body,
    upvoteCount: 0,
    createdAt: new Date().toISOString(),
    comments: []
  };

  const updated = {
    ...current,
    discussion: [post, ...current.discussion]
  };
  courseCommunityState.set(input.courseSlug, updated);
  return updated;
}
