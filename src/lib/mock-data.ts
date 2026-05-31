import { getCourseCatalogDetail } from "@/lib/course-catalog-detail";
import { defaultRateMyProfessorsSearchUrl } from "@/lib/instructor-profiles";
import { CourseDetail, ProgramDetail, RecommendationResult, SchoolSummary, TermDetail } from "@/lib/types";

export const mockSchools: SchoolSummary[] = [
  {
    id: "school_ucb",
    code: "UCB",
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    slug: "uc-berkeley",
    city: "Berkeley",
    state: "CA",
    isActive: true
  }
];

function enrichMockCourse(course: RawMockCourse, allCourses: RawMockCourse[]): CourseDetail {
  const instructors = course.historicalInstructors.map((name, index) => ({
      id: `mock-instructor-${course.slug}-${index}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      departmentCode: course.departmentCode,
      recentTerms: course.termsOffered,
      rating:
        name === "Jennifer Wang"
          ? {
              overall: 4.5,
              difficulty: 4.2,
              reviewCount: 126,
              summary: "Students praise clarity and strong exam preparation.",
              sourceName: "Rate My Professors (sample)",
              sourceUrl: defaultRateMyProfessorsSearchUrl(name)
            }
          : name === "Miguel Alvarez"
            ? {
                overall: 4.1,
                difficulty: 3.8,
                reviewCount: 41,
                summary: "Project-heavy but highly practical.",
                sourceName: "Rate My Professors (sample)",
                sourceUrl: defaultRateMyProfessorsSearchUrl(name)
              }
            : name === "Priya Shah"
              ? {
                  overall: 4.0,
                  difficulty: 3.2,
                  reviewCount: 58,
                  summary: "Clear communicator with fair grading on business writing assignments.",
                  sourceName: "Rate My Professors (sample)",
                  sourceUrl: defaultRateMyProfessorsSearchUrl(name)
                }
              : undefined
    }));

  const relatedCourseLinks = course.relatedCourses.map((code) => {
    const match = allCourses.find((item) => item.code === code);
    return match
      ? { code: match.code, slug: match.slug, title: match.title }
      : { code, slug: code.toLowerCase().replace(/\s+/g, "-"), title: code };
  });

  return {
    ...course,
    relatedCourseLinks,
    catalogDetail: getCourseCatalogDetail({
        code: course.code,
        title: course.title,
        description: course.description,
        level: course.level,
        departmentCode: course.departmentCode,
        requirementTags: course.requirementTags,
        prerequisitesText: course.prerequisitesText
      }),
    instructors,
    departmentName: course.departmentName ?? course.departmentCode,
    descriptionPreview: course.description.length > 160 ? `${course.description.slice(0, 160).trimEnd()}…` : course.description
  };
}

type RawMockCourse = Omit<CourseDetail, "catalogDetail" | "instructors" | "relatedCourseLinks">;

const rawMockCourses: RawMockCourse[] = [
  {
    id: "course_61a",
    code: "COMPSCI 61A",
    slug: "ucb-compsci-61a",
    title: "The Structure and Interpretation of Computer Programs",
    departmentCode: "COMPSCI",
    units: "4 units",
    level: "Lower Division",
    requirementTags: ["cs-core", "data-foundation", "programming"],
    breadthTags: ["Quantitative Reasoning"],
    termsOffered: ["Fall", "Spring", "Summer"],
    fillRisk: "Fills very quickly",
    dataTone: "historical",
    description: "Introductory programming and abstraction using Python with a strong emphasis on problem solving and program design.",
    prerequisitesText: "No formal prerequisites.",
    gradeDistribution: { A: 32, B: 36, C: 20, D: 7, F: 5 },
    averageGpa: 3.22,
    historicalInstructors: ["Jennifer Wang", "Course staff"],
    professorSummary: "External professor ratings are placeholder-ready. Historical grade and enrollment signals are available.",
    futureOfferingNote: "Expected in future terms based on historical cadence, but not guaranteed unless marked official.",
    bestSemesterNote: "Best in Fall or Spring when the full support ecosystem and downstream sequencing are strongest.",
    weeklyScheduleSummary: [
      { label: "Lecture 001", days: "MWF", time: "10:00-10:59", location: "Wheeler 150", status: "CLOSED" }
    ],
    requirementsSatisfied: [
      { program: "Data Science", bucket: "Foundations in Math and Computing" },
      { program: "Computer Science", bucket: "Lower-Division Core" }
    ],
    relatedCourses: ["COMPSCI 61B", "DATA C8", "MATH 54"]
  },
  {
    id: "course_datac100",
    code: "DATA C100",
    slug: "ucb-data-c100",
    title: "Principles and Techniques of Data Science",
    departmentCode: "DATA",
    units: "4 units",
    level: "Upper Division",
    requirementTags: ["data-core", "major-core"],
    breadthTags: [],
    termsOffered: ["Spring"],
    fillRisk: "Fills moderately fast",
    dataTone: "historical",
    description: "End-to-end data science practice with modeling, cleaning, communication, and ethics.",
    prerequisitesText: "DATA C8 and programming/mathematics preparation.",
    gradeDistribution: { A: 42, B: 34, C: 15, D: 5, F: 4 },
    averageGpa: 3.48,
    historicalInstructors: ["Miguel Alvarez"],
    professorSummary: "Instructor quality block is ready for future approved rating imports.",
    futureOfferingNote: "Spring availability is based on official and historical sample data.",
    bestSemesterNote: "Best after finishing your core foundations so you can unlock more upper-division planning options.",
    weeklyScheduleSummary: [
      { label: "Lecture 001", days: "TuTh", time: "14:00-15:29", location: "Soda 306", status: "WAITLIST" }
    ],
    requirementsSatisfied: [
      { program: "Data Science", bucket: "Core" },
      { program: "Data Science Minor", bucket: "Upper Division" }
    ],
    relatedCourses: ["DATA C104", "COMPSCI 61B", "COMPSCI 70"]
  },
  {
    id: "course_ugba100",
    code: "UGBA 100",
    slug: "ucb-ugba-100",
    title: "Business Communication in Diverse Work Environments",
    departmentCode: "UGBA",
    units: "3 units",
    level: "Upper Division",
    requirementTags: ["business-core"],
    breadthTags: [],
    termsOffered: ["Projected Fall"],
    fillRisk: "Projected high demand",
    dataTone: "projected",
    description: "Communication, collaboration, and leadership in applied business settings.",
    prerequisitesText: "Declared or intended business pathway.",
    historicalInstructors: ["Priya Shah"],
    professorSummary: "No approved external rating source connected yet.",
    futureOfferingNote: "Fall 2025 is a projection based on historical cadence and Haas enrollment notes.",
    bestSemesterNote: "Historically best in fall, but this sample record is projected rather than guaranteed.",
    weeklyScheduleSummary: [
      { label: "Lecture 001", days: "MW", time: "11:00-12:29", location: "Cheit Hall", status: "PROJECTED" }
    ],
    requirementsSatisfied: [{ program: "Business Administration", bucket: "Core" }],
    relatedCourses: ["UGBA 10"]
  }
];

export const mockCourses: CourseDetail[] = rawMockCourses.map((course) => enrichMockCourse(course, rawMockCourses));

export const mockPrograms: ProgramDetail[] = [
  {
    id: "program_data_major",
    slug: "ucb-data-science-major",
    code: "DATA-BA",
    name: "Data Science",
    type: "MAJOR",
    degreeLabel: "BA",
    overview: "Interdisciplinary program combining statistics, computing, ethics, and domain study.",
    sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A50AMU",
    sourceConfidence: "HIGH",
    parserStatus: "APPROVED",
    unitMinimum: 120,
    categories: [
      {
        id: "cat_core",
        title: "Core",
        description: "Required lower- and upper-division data science courses.",
        rules: [{
          id: "rule_core",
          ruleType: "REQUIRED_COURSE",
          title: "Complete the data science core sequence",
          description: "Both courses are required.",
          minSelect: 2,
          courseCodes: ["DATA C8", "DATA C100"],
          allowedDepartmentCodes: ["DATA"],
          allowedTags: ["data-core"],
          sourceRefText: "Official Berkeley Data Science major page"
        }]
      },
      {
        id: "cat_foundations",
        title: "Foundations in Math and Computing",
        description: "Representative MVP subset of official foundations.",
        rules: [{
          id: "rule_foundations",
          ruleType: "CHOOSE_N_COURSES",
          title: "Choose 4 foundations courses",
          description: "Use historical offering data to time these efficiently.",
          minSelect: 4,
          courseCodes: ["COMPSCI 61A", "COMPSCI 61B", "COMPSCI 70", "MATH 54"],
          allowedDepartmentCodes: ["COMPSCI", "MATH"],
          allowedTags: ["math-foundation", "data-foundation"],
          sourceRefText: "Official Berkeley Data Science major page"
        }]
      }
    ]
  },
  {
    id: "program_cs_major",
    slug: "ucb-computer-science-major",
    code: "CS-BA",
    name: "Computer Science",
    type: "MAJOR",
    degreeLabel: "BA",
    overview: "CDSS computer science pathway focused on theory, systems, and software.",
    sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A5201U",
    sourceConfidence: "MEDIUM",
    parserStatus: "REVIEW_REQUIRED",
    unitMinimum: 120,
    categories: [{
      id: "cat_cs_lower",
      title: "Lower-Division Core",
      description: "Illustrative normalized subset for MVP.",
      rules: [{
        id: "rule_cs_lower",
        ruleType: "CHOOSE_N_COURSES",
        title: "Complete lower-division core",
        minSelect: 3,
        courseCodes: ["COMPSCI 61A", "COMPSCI 61B", "COMPSCI 70"],
        allowedDepartmentCodes: ["COMPSCI"],
        allowedTags: ["cs-core"],
        sourceRefText: "Official Berkeley Computer Science page"
      }]
    }]
  },
  {
    id: "program_business_major",
    slug: "ucb-business-administration-major",
    code: "BUS-BA",
    name: "Business Administration",
    type: "MAJOR",
    degreeLabel: "BS",
    overview: "Haas undergraduate business program with prerequisites, core, and breadth-linked planning needs.",
    sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/70141U",
    sourceConfidence: "HIGH",
    parserStatus: "APPROVED",
    unitMinimum: 120,
    categories: [{
      id: "cat_business_prep",
      title: "Preparation and Core",
      description: "Representative Haas preparation and upper-division core coverage.",
      rules: [
        {
          id: "rule_business_prep",
          ruleType: "CHOOSE_N_COURSES",
          title: "Complete business preparation",
          minSelect: 3,
          courseCodes: ["UGBA 10", "MATH 54", "STAT 20", "ECON 1"],
          allowedDepartmentCodes: ["UGBA", "MATH", "STAT", "ECON"],
          allowedTags: ["business-prep", "math-foundation", "statistics-foundation"],
          sourceRefText: "Official Berkeley Business Administration page"
        },
        {
          id: "rule_business_core",
          ruleType: "CHOOSE_N_COURSES",
          title: "Complete representative Haas core courses",
          minSelect: 3,
          courseCodes: ["UGBA 100", "UGBA 101A", "UGBA 102A"],
          allowedDepartmentCodes: ["UGBA"],
          allowedTags: ["business-core"],
          sourceRefText: "Official Berkeley Business Administration page"
        }
      ]
    }]
  },
  {
    id: "program_ib_major",
    slug: "ucb-integrative-biology-major",
    code: "IB-BA",
    name: "Integrative Biology",
    type: "MAJOR",
    degreeLabel: "BA",
    overview: "Whole-organism biology major with lower-division foundations and emphasis-based upper-division study.",
    sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25975U",
    sourceConfidence: "MEDIUM",
    parserStatus: "REVIEW_REQUIRED",
    unitMinimum: 120,
    categories: [{
      id: "cat_ib_foundations",
      title: "Lower and Upper Division Coverage",
      description: "Representative preparation and emphasis coverage for integrative biology planning.",
      rules: [
        {
          id: "rule_ib_lower",
          ruleType: "CHOOSE_N_COURSES",
          title: "Complete lower-division preparation",
          minSelect: 3,
          courseCodes: ["IB 35AC", "STAT 20", "MATH 53", "PHYSICS 7A"],
          allowedDepartmentCodes: ["IB", "STAT", "MATH", "PHYSICS"],
          allowedTags: ["biology-foundation", "statistics-foundation", "calculus"],
          sourceRefText: "Official Berkeley Integrative Biology page"
        }
      ]
    }]
  },
  {
    id: "program_data_minor",
    slug: "ucb-data-science-minor",
    code: "DATA-MIN",
    name: "Data Science",
    type: "MINOR",
    degreeLabel: "Minor",
    overview: "Flexible data science minor for students across Berkeley majors.",
    sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A5I172U",
    sourceConfidence: "HIGH",
    parserStatus: "APPROVED",
    unitMinimum: 24,
    categories: [{
      id: "cat_data_minor",
      title: "Foundation, Core, and Elective",
      description: "Representative minor structure spanning foundations and one upper-division follow-on.",
      rules: [
        {
          id: "rule_data_minor_foundation",
          ruleType: "CHOOSE_N_COURSES",
          title: "Complete programming and statistics preparation",
          minSelect: 2,
          courseCodes: ["DATA C8", "COMPSCI 61A", "STAT 20", "STAT 134"],
          allowedDepartmentCodes: ["DATA", "COMPSCI", "STAT"],
          allowedTags: ["data-foundation", "statistics-foundation", "programming"],
          sourceRefText: "Official Berkeley Data Science minor page"
        },
        {
          id: "rule_data_minor_upper",
          ruleType: "CHOOSE_N_COURSES",
          title: "Complete the core and one elective",
          minSelect: 2,
          courseCodes: ["DATA C100", "DATA C104", "DATA 144", "DATA 140"],
          allowedDepartmentCodes: ["DATA"],
          allowedTags: ["data-core", "data-elective", "data-ethics", "probability"],
          sourceRefText: "Official Berkeley Data Science minor page"
        }
      ]
    }]
  },
  {
    id: "program_math_minor",
    slug: "ucb-mathematics-minor",
    code: "MATH-MIN",
    name: "Mathematics",
    type: "MINOR",
    degreeLabel: "Minor",
    overview: "Proof-based and applied mathematics minor for students building stronger quantitative depth.",
    sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25I071U",
    sourceConfidence: "MEDIUM",
    parserStatus: "REVIEW_REQUIRED",
    unitMinimum: 24,
    categories: [{
      id: "cat_math_minor",
      title: "Quantitative Core",
      description: "Representative proof and applied math minor coverage.",
      rules: [{
        id: "rule_math_minor_core",
        ruleType: "CHOOSE_N_COURSES",
        title: "Choose 3 mathematics core courses",
        minSelect: 3,
        courseCodes: ["MATH 53", "MATH 54", "MATH 55", "MATH 110", "STAT 134"],
        allowedDepartmentCodes: ["MATH", "STAT"],
        allowedTags: ["math-foundation", "proofs", "statistics-foundation", "math-upperdiv"],
        sourceRefText: "Official Berkeley Mathematics minor page"
      }]
    }]
  },
  {
    id: "program_cs_minor",
    slug: "ucb-computer-science-minor",
    code: "CS-MIN",
    name: "Computer Science",
    type: "MINOR",
    degreeLabel: "Minor",
    overview: "Seven-course computer science minor built around lower-division preparation plus upper-division technical coursework.",
    sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/16I011U",
    sourceConfidence: "HIGH",
    parserStatus: "REVIEW_REQUIRED",
    unitMinimum: 28,
    categories: [{
      id: "cat_cs_minor",
      title: "Core and Technical Electives",
      description: "Representative CS minor sequence with overlap-sensitive upper-division planning.",
      rules: [
        {
          id: "rule_cs_minor_core",
          ruleType: "CHOOSE_N_COURSES",
          title: "Complete the lower-division minor core",
          minSelect: 4,
          courseCodes: ["COMPSCI 61A", "COMPSCI 61B", "COMPSCI 70", "MATH 55"],
          allowedDepartmentCodes: ["COMPSCI", "MATH"],
          allowedTags: ["cs-core", "proofs"],
          sourceRefText: "Official Berkeley Computer Science minor page"
        },
        {
          id: "rule_cs_minor_upper",
          ruleType: "CHOOSE_N_COURSES",
          title: "Choose 3 upper-division technical courses",
          minSelect: 3,
          courseCodes: ["COMPSCI 170", "COMPSCI 188", "COMPSCI 162", "COMPSCI 186"],
          allowedDepartmentCodes: ["COMPSCI"],
          allowedTags: ["cs-upperdiv", "algorithms", "ai", "systems"],
          sourceRefText: "Official Berkeley Computer Science minor page"
        }
      ]
    }]
  },
  {
    id: "program_math_major",
    slug: "ucb-mathematics-major",
    code: "MATH-BA",
    name: "Mathematics",
    type: "MAJOR",
    degreeLabel: "BA",
    overview: "Mathematics BA with lower-division proof preparation and upper-division theoretical or applied depth.",
    sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25540U",
    sourceConfidence: "MEDIUM",
    parserStatus: "REVIEW_REQUIRED",
    unitMinimum: 120,
    categories: [
      {
        id: "cat_math_major_lower",
        title: "Lower-Division Preparation",
        description: "Proof and calculus preparation that unlocks upper-division math.",
        rules: [{
          id: "rule_math_major_lower",
          ruleType: "CHOOSE_N_COURSES",
          title: "Complete the lower-division mathematics sequence",
          minSelect: 3,
          courseCodes: ["MATH 53", "MATH 54", "MATH 55"],
          allowedDepartmentCodes: ["MATH"],
          allowedTags: ["math-foundation", "proofs", "calculus"],
          sourceRefText: "Official Berkeley Mathematics major page"
        }]
      },
      {
        id: "cat_math_major_upper",
        title: "Upper-Division Depth",
        description: "Representative upper-division mathematics breadth and depth.",
        rules: [{
          id: "rule_math_major_upper",
          ruleType: "CHOOSE_N_COURSES",
          title: "Choose 2 upper-division quantitative depth courses",
          minSelect: 2,
          courseCodes: ["MATH 110", "STAT 134"],
          allowedDepartmentCodes: ["MATH", "STAT"],
          allowedTags: ["math-upperdiv", "statistics-foundation"],
          sourceRefText: "Official Berkeley Mathematics major page"
        }]
      }
    ]
  }
];

export const mockTerms: TermDetail[] = [
  {
    id: "term_2025_fall",
    slug: "ucb-2025-fall",
    name: "Fall 2025",
    season: "FALL",
    year: 2025,
    isProjected: true,
    offerings: [{
      id: "off_ugba_100",
      courseId: "course_ugba100",
      courseSlug: "ucb-ugba-100",
      courseCode: "UGBA 100",
      courseTitle: "Business Communication in Diverse Work Environments",
      departmentCode: "UGBA",
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Priya Shah",
      location: "Cheit Hall",
      meetingDays: "MW",
      timeStart: "11:00",
      timeEnd: "12:29",
      capacity: 180,
      enrolled: 0,
      waitlist: 0,
      status: "PROJECTED",
      projectedReason: "Projected from prior fall cadence and Haas enrollment notes."
    }]
  }
];

export const mockRecommendations: RecommendationResult[] = [
  {
    courseCode: "COMPSCI 61B",
    title: "Data Structures",
    courseSlug: "ucb-compsci-61b",
    compareWithSlug: "ucb-data-c100",
    compareWithCode: "DATA C100",
    score: 92,
    reasons: ["Closes a major prerequisite chain", "Improves eligibility for DATA C100", "Historically offered in the selected term pattern"],
    warnings: ["Historically high demand during enrollment"]
  },
  {
    courseCode: "MATH 54",
    title: "Linear Algebra and Differential Equations",
    courseSlug: "ucb-math-54",
    compareWithSlug: "ucb-compsci-61b",
    compareWithCode: "COMPSCI 61B",
    score: 83,
    reasons: ["Supports multiple Data Science foundation rules", "Balances technical progress without duplicating domain buckets"],
    warnings: []
  }
];
