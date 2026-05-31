export type DataBadgeTone = "official" | "historical" | "projected" | "placeholder";

export type SchoolSummary = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  slug: string;
  city?: string;
  state?: string;
  isActive: boolean;
};

export type InstructorProfile = {
  id: string;
  name: string;
  slug: string;
  departmentCode?: string;
  departmentName?: string;
  bio?: string;
  rmpProfessorId?: string;
  recentTerms: string[];
  role?: string;
  rating?: {
    overall: number;
    difficulty: number;
    reviewCount: number;
    summary?: string;
    sourceName: string;
    sourceUrl?: string;
    isLive?: boolean;
    fetchedAt?: string;
    rmpProfessorId?: string;
    matchedName?: string;
    wouldTakeAgainPercent?: number;
  };
};

export type InstructorSummary = {
  id: string;
  name: string;
  slug: string;
  departmentCode?: string;
  departmentName?: string;
  courseCount: number;
  recentCourseCodes: string[];
  rating?: InstructorProfile["rating"];
};

export type InstructorDetail = InstructorProfile & {
  coursesTaught: Array<{
    courseId: string;
    courseCode: string;
    courseSlug: string;
    courseTitle: string;
    termName: string;
    role?: string;
  }>;
};

export type CourseCatalogDetail = {
  learningOutcomes: string[];
  workloadNotes: string;
  assessmentStyle: string;
  prerequisitesNote: string;
};

export type CourseSummary = {
  id: string;
  code: string;
  slug: string;
  title: string;
  departmentCode: string;
  departmentName?: string;
  descriptionPreview?: string;
  units: string;
  level: string;
  requirementTags: string[];
  breadthTags: string[];
  termsOffered: string[];
  fillRisk: string;
  dataTone: DataBadgeTone;
  topInstructorName?: string;
  topInstructorSlug?: string;
  topInstructorRating?: number;
};

export type RelatedCourseLink = {
  code: string;
  slug: string;
  title: string;
};

export type CoursePickerOption = {
  id: string;
  slug: string;
  code: string;
  title: string;
  departmentCode: string;
};

export type CourseDetail = CourseSummary & {
  description: string;
  catalogDetail: CourseCatalogDetail;
  prerequisitesText?: string;
  gradeDistribution?: Record<string, number>;
  averageGpa?: number;
  historicalInstructors: string[];
  instructors: InstructorProfile[];
  professorSummary: string;
  futureOfferingNote?: string;
  bestSemesterNote?: string;
  weeklyScheduleSummary: Array<{
    label: string;
    days?: string;
    time?: string;
    location?: string;
    status: string;
  }>;
  requirementsSatisfied: Array<{ program: string; bucket: string }>;
  relatedCourses: string[];
  relatedCourseLinks: RelatedCourseLink[];
  enrollmentTrend?: Array<{
    termName: string;
    enrolled: number;
    capacity: number;
    fillRateBucket?: string | null;
  }>;
  completedPrerequisiteCodes?: string[];
  unmetPrerequisiteCodes?: string[];
};

export type ProgramSummary = {
  id: string;
  slug: string;
  code: string;
  name: string;
  type: "MAJOR" | "MINOR" | "CERTIFICATE";
  degreeLabel?: string;
  overview: string;
  sourceUrl?: string;
  sourceConfidence?: string;
  parserStatus?: string;
};

export type ProgramDetail = ProgramSummary & {
  unitMinimum?: number;
  categories: Array<{
    id: string;
    title: string;
    description?: string;
    rules: Array<{
      id: string;
      ruleType: string;
      title: string;
      description?: string;
      minSelect?: number | null;
      courseCodes: string[];
      allowedDepartmentCodes: string[];
      allowedTags: string[];
      sourceRefText?: string | null;
    }>;
  }>;
};

export type TermDetail = {
  id: string;
  slug: string;
  name: string;
  season: string;
  year: number;
  isProjected: boolean;
  offerings: Array<{
    id: string;
    courseId: string;
    courseSlug: string;
    courseCode: string;
    courseTitle: string;
    departmentCode: string;
    sectionCode?: string | null;
    component?: string | null;
    instructorText?: string | null;
    location?: string | null;
    meetingDays?: string | null;
    timeStart?: string | null;
    timeEnd?: string | null;
    capacity?: number | null;
    enrolled?: number | null;
    waitlist?: number | null;
    status: string;
    projectedReason?: string | null;
  }>;
};

export type TermSummary = {
  id: string;
  slug: string;
  name: string;
  season: string;
  year: number;
  isProjected: boolean;
  offeringCount: number;
};

export type RecommendationResult = {
  courseCode: string;
  title: string;
  score: number;
  courseSlug?: string;
  compareWithSlug?: string;
  compareWithCode?: string;
  reasons: string[];
  warnings: string[];
  socialSignal?: string;
};

export type RequirementProgressCategory = {
  categoryId: string;
  title: string;
  completedRules: number;
  totalRules: number;
  completionPercent: number;
  matchedCourseCodes: string[];
  remainingRuleTitles: string[];
};

export type RequirementProgressSummary = {
  programId: string;
  programName: string;
  sourceUrl?: string;
  categories: RequirementProgressCategory[];
  completionPercent: number;
};

export type PlanSemesterView = {
  id: string;
  label: string;
  season: string;
  yearIndex: number;
  unitsTarget?: number;
  totalUnits: number;
  courses: Array<{
    id: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    units: number;
    status: string;
    plannedTermName?: string;
    warnings: string[];
  }>;
};

export type PlanDetailView = {
  id: string;
  title: string;
  catalogYear?: string;
  notes?: string;
  semesters: PlanSemesterView[];
  totalPlannedUnits: number;
  warnings: string[];
};

export type DashboardView = {
  userId: string;
  userName?: string;
  schoolName?: string;
  selectedPrograms: Array<{
    id: string;
    name: string;
    type: string;
    selectionType: string;
  }>;
  favoriteCourses: Array<{
    id: string;
    code: string;
    slug: string;
    title: string;
  }>;
  completedCourses: Array<{
    id: string;
    code: string;
    title: string;
    grade?: string;
  }>;
  plans: PlanDetailView[];
  requirementProgress: RequirementProgressSummary[];
};

export type CourseComparisonView = {
  left: CourseDetail;
  right: CourseDetail;
  summary: {
    workloadSignal: string;
    gradingSignal: string;
    enrollmentSignal: string;
  };
};

export type SocialFriendProfile = {
  id: string;
  name: string;
  school: string;
  majors: string[];
  minors: string[];
  visiblePlanTitles: string[];
  visibleScheduleLabels: string[];
};

export type FriendRequestView = {
  id: string;
  fromUser: SocialFriendProfile;
  toUser: SocialFriendProfile;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELED";
  message?: string;
  createdAt: string;
};

export type MessageView = {
  id: string;
  senderName: string;
  body: string;
  createdAt: string;
  sharedCourseCode?: string;
  sharedPlanTitle?: string;
};

export type MessageThreadView = {
  id: string;
  title: string;
  participantNames: string[];
  messages: MessageView[];
};

export type CourseReviewView = {
  id: string;
  authorName: string;
  title?: string;
  body: string;
  pseudonym?: string;
  difficultyRating: number;
  workloadRating: number;
  usefulnessRating: number;
  recommendationRating: number;
  averageWeeklyHours?: number;
  lecturesUseful?: boolean;
  attendanceImportant?: boolean;
  hardestPart?: string;
  advice?: string;
  tags: string[];
  reasonTag?: string;
  upvoteCount: number;
  createdAt: string;
};

export type CourseDiscussionCommentView = {
  id: string;
  authorName: string;
  body: string;
  upvoteCount: number;
  createdAt: string;
};

export type CourseDiscussionPostView = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  upvoteCount: number;
  createdAt: string;
  comments: CourseDiscussionCommentView[];
};

export type CourseCommunityView = {
  courseId: string;
  reviews: CourseReviewView[];
  discussion: CourseDiscussionPostView[];
  studentInsightSummary: {
    perceivedDifficulty: string;
    averageWeeklyWorkload: string;
    lecturesUseful: string;
    attendanceMatters: string;
    hardestPart: string;
    bestAdvice: string[];
  };
};

export type SocialDashboardView = {
  friends: SocialFriendProfile[];
  incomingRequests: FriendRequestView[];
  outgoingRequests: FriendRequestView[];
  threads: MessageThreadView[];
};
