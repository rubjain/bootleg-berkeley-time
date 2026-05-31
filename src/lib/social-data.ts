import {
  CourseCommunityView,
  CourseDiscussionPostView,
  CourseReviewView,
  FriendRequestView,
  MessageThreadView,
  SocialDashboardView,
  SocialFriendProfile
} from "@/lib/types";

const friendProfiles: SocialFriendProfile[] = [
  {
    id: "friend-maya",
    name: "Maya Chen",
    school: "UC Berkeley",
    majors: ["Data Science"],
    minors: ["Education"],
    visiblePlanTitles: ["Sophomore Spring Plan"],
    visibleScheduleLabels: ["Spring 2026 weekly schedule"]
  },
  {
    id: "friend-jordan",
    name: "Jordan Patel",
    school: "UC Berkeley",
    majors: ["Computer Science"],
    minors: [],
    visiblePlanTitles: ["Systems Track Plan"],
    visibleScheduleLabels: ["Fall 2025 schedule"]
  },
  {
    id: "friend-zoe",
    name: "Zoe Ramirez",
    school: "UC Berkeley",
    majors: ["Business Administration"],
    minors: ["Data Science"],
    visiblePlanTitles: [],
    visibleScheduleLabels: []
  }
];

export function getFriendDirectoryMock() {
  return friendProfiles;
}

const courseReviewsByCourse: Record<string, CourseReviewView[]> = {
  "ucb-compsci-61a": [
    {
      id: "review-61a-1",
      authorName: "Maya Chen",
      title: "Huge time commitment but worth it",
      body: "This class teaches you how to think clearly about programming, but you need to start projects early.",
      difficultyRating: 4,
      workloadRating: 5,
      usefulnessRating: 5,
      recommendationRating: 5,
      averageWeeklyHours: 14,
      lecturesUseful: true,
      attendanceImportant: false,
      hardestPart: "Projects and abstraction jumps",
      advice: "Do not fall behind on the weekly work.",
      tags: ["PROJECT_HEAVY", "CONCEPTUALLY_HARD", "GREAT_PROFESSOR"],
      reasonTag: "IMPORTANT_FOR_MAJOR",
      upvoteCount: 18,
      createdAt: "2026-04-20T18:10:00.000Z"
    }
  ],
  "ucb-data-c100": [
    {
      id: "review-c100-1",
      authorName: "Jordan Patel",
      title: "Excellent bridge into applied data science",
      body: "Very practical and useful if you want to connect theory with projects. Manageable if your programming base is solid.",
      difficultyRating: 3,
      workloadRating: 4,
      usefulnessRating: 5,
      recommendationRating: 5,
      averageWeeklyHours: 11,
      lecturesUseful: true,
      attendanceImportant: true,
      hardestPart: "Project coordination",
      advice: "Take it after your programming and linear algebra base is comfortable.",
      tags: ["PROJECT_HEAVY", "USEFUL_ELECTIVE", "GREAT_PROFESSOR"],
      reasonTag: "IMPORTANT_FOR_MAJOR",
      upvoteCount: 11,
      createdAt: "2026-04-18T13:45:00.000Z"
    }
  ]
};

const courseDiscussionByCourse: Record<string, CourseDiscussionPostView[]> = {
  "ucb-compsci-61a": [
    {
      id: "post-61a-1",
      authorName: "Zoe Ramirez",
      title: "Best way to prep before week 1?",
      body: "I have not coded much before. What should I review before classes start?",
      upvoteCount: 9,
      createdAt: "2026-04-19T15:00:00.000Z",
      comments: [
        {
          id: "comment-61a-1",
          authorName: "Maya Chen",
          body: "Practice basic Python and get comfortable reading recursive code examples slowly.",
          upvoteCount: 6,
          createdAt: "2026-04-19T18:11:00.000Z"
        }
      ]
    }
  ],
  "ucb-data-c100": [
    {
      id: "post-c100-1",
      authorName: "Jordan Patel",
      title: "Worth taking with another technical class?",
      body: "Trying to pair this with a math-heavy semester. Curious how rough the project load gets.",
      upvoteCount: 4,
      createdAt: "2026-04-17T11:20:00.000Z",
      comments: [
        {
          id: "comment-c100-1",
          authorName: "Maya Chen",
          body: "It is doable, but I would avoid stacking it with two other project classes if you want balance.",
          upvoteCount: 3,
          createdAt: "2026-04-17T12:30:00.000Z"
        }
      ]
    }
  ]
};

export function getSocialDashboardMock(): SocialDashboardView {
  const incoming: FriendRequestView[] = [
    {
      id: "request-1",
      fromUser: friendProfiles[2],
      toUser: {
        id: "demo-user",
        name: "Alex Student",
        school: "UC Berkeley",
        majors: ["Data Science"],
        minors: ["Data Science"],
        visiblePlanTitles: ["4-Year Graduation Plan"],
        visibleScheduleLabels: ["Spring Year 2"]
      },
      status: "PENDING",
      message: "Want to compare class plans for next semester.",
      createdAt: "2026-04-22T17:00:00.000Z"
    }
  ];

  const outgoing: FriendRequestView[] = [
    {
      id: "request-2",
      fromUser: {
        id: "demo-user",
        name: "Alex Student",
        school: "UC Berkeley",
        majors: ["Data Science"],
        minors: ["Data Science"],
        visiblePlanTitles: ["4-Year Graduation Plan"],
        visibleScheduleLabels: ["Spring Year 2"]
      },
      toUser: friendProfiles[1],
      status: "PENDING",
      message: "Want to compare CS upper-div planning.",
      createdAt: "2026-04-21T19:30:00.000Z"
    }
  ];

  const threads: MessageThreadView[] = [
    {
      id: "thread-1",
      title: "Maya Chen",
      participantNames: ["Alex Student", "Maya Chen"],
      messages: [
        {
          id: "message-1",
          senderName: "Maya Chen",
          body: "You should really look at DATA C100 next term.",
          createdAt: "2026-04-22T20:10:00.000Z",
          sharedCourseCode: "DATA C100"
        },
        {
          id: "message-2",
          senderName: "Alex Student",
          body: "Can you share your plan layout for that semester?",
          createdAt: "2026-04-22T20:14:00.000Z",
          sharedPlanTitle: "Sophomore Spring Plan"
        }
      ]
    }
  ];

  return {
    friends: friendProfiles.slice(0, 2),
    incomingRequests: incoming,
    outgoingRequests: outgoing,
    threads
  };
}

export function getCourseCommunityMock(courseSlug: string): CourseCommunityView {
  const reviews = courseReviewsByCourse[courseSlug] ?? [];
  const discussion = courseDiscussionByCourse[courseSlug] ?? [];

  const avgDifficulty =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.difficultyRating, 0) / reviews.length).toFixed(1)
      : "N/A";
  const avgWorkload =
    reviews.length > 0
      ? `${(reviews.reduce((sum, review) => sum + (review.averageWeeklyHours ?? 0), 0) / reviews.length).toFixed(1)} hrs/week`
      : "No reports yet";

  return {
    courseId: courseSlug,
    reviews,
    discussion,
    studentInsightSummary: {
      perceivedDifficulty: reviews.length ? `${avgDifficulty}/5 from student reports` : "No reports yet",
      averageWeeklyWorkload: avgWorkload,
      lecturesUseful: reviews.some((review) => review.lecturesUseful) ? "Mostly yes" : "Not enough data",
      attendanceMatters: reviews.some((review) => review.attendanceImportant) ? "Sometimes" : "Usually not critical",
      hardestPart: reviews[0]?.hardestPart ?? "No reports yet",
      bestAdvice: reviews.map((review) => review.advice).filter(Boolean) as string[]
    }
  };
}

export function buildCourseInsightSummary(reviews: CourseReviewView[]) {
  if (reviews.length === 0) {
    return {
      perceivedDifficulty: "No student reports yet",
      averageWeeklyWorkload: "No student reports yet",
      lecturesUseful: "No student reports yet",
      attendanceMatters: "No student reports yet",
      hardestPart: "No student reports yet",
      bestAdvice: [] as string[]
    };
  }

  const avgDifficulty = (
    reviews.reduce((sum, review) => sum + review.difficultyRating, 0) / reviews.length
  ).toFixed(1);
  const avgHours = (
    reviews.reduce((sum, review) => sum + (review.averageWeeklyHours ?? 0), 0) / reviews.length
  ).toFixed(1);

  return {
    perceivedDifficulty: `${avgDifficulty}/5 from student reports`,
    averageWeeklyWorkload: `${avgHours} hrs/week`,
    lecturesUseful: reviews.filter((review) => review.lecturesUseful).length >= Math.ceil(reviews.length / 2) ? "Mostly yes" : "Mixed",
    attendanceMatters: reviews.filter((review) => review.attendanceImportant).length >= Math.ceil(reviews.length / 2) ? "Often" : "Usually optional",
    hardestPart: reviews[0]?.hardestPart ?? "Mixed",
    bestAdvice: reviews.map((review) => review.advice).filter(Boolean) as string[]
  };
}

export function getCommunityRecommendationSignal(courseSlug: string) {
  const community = getCourseCommunityMock(courseSlug);
  if (community.reviews.length === 0) {
    return {
      scoreDelta: 0,
      summary: "No student review signal yet"
    };
  }

  const avgRecommendation =
    community.reviews.reduce((sum, review) => sum + review.recommendationRating, 0) / community.reviews.length;
  const avgDifficulty =
    community.reviews.reduce((sum, review) => sum + review.difficultyRating, 0) / community.reviews.length;

  let scoreDelta = 0;
  if (avgRecommendation >= 4) scoreDelta += 6;
  if (avgDifficulty <= 3.2) scoreDelta += 2;
  if (avgDifficulty >= 4.3) scoreDelta -= 2;

  return {
    scoreDelta,
    summary: `${avgRecommendation.toFixed(1)}/5 student recommendation from ${community.reviews.length} review${community.reviews.length === 1 ? "" : "s"}`
  };
}
