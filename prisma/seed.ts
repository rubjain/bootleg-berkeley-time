import {
  AuthProviderType,
  ConfidenceLevel,
  CourseFeedbackTag,
  CourseHistoryStatus,
  DataStatus,
  MessagePermission,
  OfferingStatus,
  PlanCourseStatus,
  PlanVisibility,
  PrismaClient,
  ProgramSelectionType,
  ProgramType,
  RequirementRuleType,
  RequirementSourceType,
  RequirementSyncStatus,
  ReviewReasonTag,
  RelationshipType,
  TermSeason,
  UserRole,
  ThreadType
} from "@prisma/client";
import { instructorRmpAliases } from "../src/lib/instructor-rmp-aliases";

const prisma = new PrismaClient();

async function main() {
  await prisma.contentReport.deleteMany();
  await prisma.userBlock.deleteMany();
  await prisma.courseDiscussionComment.deleteMany();
  await prisma.courseDiscussionPost.deleteMany();
  await prisma.courseReviewVote.deleteMany();
  await prisma.courseReview.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageThreadParticipant.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.userPrivacySettings.deleteMany();
  await prisma.authAccount.deleteMany();
  await prisma.userFavoriteCourse.deleteMany();
  await prisma.plannedCourse.deleteMany();
  await prisma.plannedSemester.deleteMany();
  await prisma.userPlan.deleteMany();
  await prisma.userProgramSelection.deleteMany();
  await prisma.userCourseHistory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.courseRelationship.deleteMany();
  await prisma.enrollmentHistory.deleteMany();
  await prisma.gradeDistribution.deleteMany();
  await prisma.requirementOptionGroup.deleteMany();
  await prisma.requirementRule.deleteMany();
  await prisma.requirementCategory.deleteMany();
  await prisma.programRequirementSet.deleteMany();
  await prisma.requirementSource.deleteMany();
  await prisma.program.deleteMany();
  await prisma.professorRating.deleteMany();
  await prisma.courseOfferingInstructor.deleteMany();
  await prisma.courseOffering.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.term.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.school.deleteMany();

  const berkeley = await prisma.school.create({
    data: {
      code: "UCB",
      name: "University of California, Berkeley",
      shortName: "UC Berkeley",
      slug: "uc-berkeley",
      city: "Berkeley",
      state: "CA",
      website: "https://www.berkeley.edu"
    }
  });

  const departments = await Promise.all([
    prisma.department.create({ data: { schoolId: berkeley.id, code: "COMPSCI", name: "Electrical Engineering and Computer Sciences", slug: "eecs", website: "https://eecs.berkeley.edu" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "DATA", name: "Data Science Undergraduate Studies", slug: "data-science", website: "https://data.berkeley.edu" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "UGBA", name: "Haas School of Business Undergraduate Program", slug: "haas-undergrad", website: "https://haas.berkeley.edu/undergrad" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "IB", name: "Integrative Biology", slug: "integrative-biology", website: "https://ib.berkeley.edu" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "MATH", name: "Mathematics", slug: "mathematics", website: "https://math.berkeley.edu" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "STAT", name: "Statistics", slug: "statistics", website: "https://statistics.berkeley.edu" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "COGSCI", name: "Cognitive Science Program", slug: "cognitive-science", website: "https://cogsci.berkeley.edu" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "ECON", name: "Economics", slug: "economics", website: "https://www.econ.berkeley.edu" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "ENGIN", name: "College of Engineering", slug: "engineering", website: "https://engineering.berkeley.edu" } }),
    prisma.department.create({ data: { schoolId: berkeley.id, code: "PHYSICS", name: "Physics", slug: "physics", website: "https://physics.berkeley.edu" } })
  ]);

  const dept = Object.fromEntries(departments.map((item) => [item.code, item]));

  const terms = await Promise.all([
    prisma.term.create({ data: { schoolId: berkeley.id, code: "2024-FALL", slug: "ucb-2024-fall", name: "Fall 2024", season: TermSeason.FALL, year: 2024 } }),
    prisma.term.create({ data: { schoolId: berkeley.id, code: "2025-SPRING", slug: "ucb-2025-spring", name: "Spring 2025", season: TermSeason.SPRING, year: 2025 } }),
    prisma.term.create({ data: { schoolId: berkeley.id, code: "2025-SUMMER", slug: "ucb-2025-summer", name: "Summer 2025", season: TermSeason.SUMMER, year: 2025, isFuture: true } }),
    prisma.term.create({
      data: {
        schoolId: berkeley.id,
        code: "2025-FALL",
        slug: "ucb-2025-fall",
        name: "Fall 2025",
        season: TermSeason.FALL,
        year: 2025,
        isFuture: true,
        isProjected: true,
        dataStatus: DataStatus.PROJECTED
      }
    })
  ]);

  const term = Object.fromEntries(terms.map((item) => [item.code, item]));

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.COMPSCI.id,
        code: "COMPSCI 61A",
        slug: "ucb-compsci-61a",
        title: "The Structure and Interpretation of Computer Programs",
        description: "Introductory programming and abstraction using Python with a strong emphasis on problem solving and program design.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Lower Division",
        breadthTags: ["Quantitative Reasoning"],
        requirementTags: ["cs-core", "data-foundation", "programming"],
        prerequisitesText: "No formal prerequisites."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.COMPSCI.id,
        code: "COMPSCI 61B",
        slug: "ucb-compsci-61b",
        title: "Data Structures",
        description: "Data structures, algorithms, and software engineering fundamentals.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Lower Division",
        breadthTags: [],
        requirementTags: ["cs-core", "data-foundation", "algorithms"],
        prerequisitesText: "COMPSCI 61A."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.COMPSCI.id,
        code: "COMPSCI 70",
        slug: "ucb-compsci-70",
        title: "Discrete Mathematics and Probability Theory",
        description: "Logic, proofs, discrete probability, and combinatorics for computer science.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Lower Division",
        breadthTags: [],
        requirementTags: ["cs-core", "math-foundation", "probability"],
        prerequisitesText: "Mathematical maturity; COMPSCI 61A recommended."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.DATA.id,
        code: "DATA C8",
        slug: "ucb-data-c8",
        title: "Foundations of Data Science",
        description: "Computational and inferential thinking with real-world data, visualization, and prediction.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Lower Division",
        breadthTags: ["Data Literacy"],
        requirementTags: ["data-core", "connector-eligible"],
        prerequisitesText: "No formal prerequisites."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.DATA.id,
        code: "DATA C100",
        slug: "ucb-data-c100",
        title: "Principles and Techniques of Data Science",
        description: "End-to-end data science practice with modeling, cleaning, communication, and ethics.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Upper Division",
        breadthTags: [],
        requirementTags: ["data-core", "major-core"],
        prerequisitesText: "DATA C8 and programming/mathematics preparation."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.DATA.id,
        code: "DATA C104",
        slug: "ucb-data-c104",
        title: "Human Contexts and Ethics of Data",
        description: "Ethics, institutions, and social impacts of data-driven systems.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Upper Division",
        breadthTags: ["Human Contexts"],
        requirementTags: ["data-ethics", "program-elective"],
        prerequisitesText: "Upper-division standing recommended."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.UGBA.id,
        code: "UGBA 10",
        slug: "ucb-ugba-10",
        title: "Principles of Business",
        description: "Survey of modern business concepts including accounting, finance, marketing, and strategy.",
        unitsMin: 3,
        unitsMax: 3,
        level: "Lower Division",
        breadthTags: [],
        requirementTags: ["business-prereq", "business-foundation"],
        prerequisitesText: "No formal prerequisites."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.UGBA.id,
        code: "UGBA 100",
        slug: "ucb-ugba-100",
        title: "Business Communication in Diverse Work Environments",
        description: "Communication, collaboration, and leadership in applied business settings.",
        unitsMin: 3,
        unitsMax: 3,
        level: "Upper Division",
        breadthTags: [],
        requirementTags: ["business-core"],
        prerequisitesText: "Declared or intended business pathway."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.IB.id,
        code: "IB 35AC",
        slug: "ucb-ib-35ac",
        title: "Human Biological Variation",
        description: "Biological and social perspectives on human variation and inequality.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Lower Division",
        breadthTags: ["American Cultures"],
        requirementTags: ["ib-lower", "breadth"],
        prerequisitesText: "No formal prerequisites."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.MATH.id,
        code: "MATH 54",
        slug: "ucb-math-54",
        title: "Linear Algebra and Differential Equations",
        description: "Matrix theory, eigenvalues, systems of differential equations, and applications.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Lower Division",
        breadthTags: [],
        requirementTags: ["math-foundation", "data-foundation"],
        prerequisitesText: "Calculus preparation."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.MATH.id,
        code: "MATH 55",
        slug: "ucb-math-55",
        title: "Discrete Mathematics",
        description: "Logic, proofs, induction, graphs, and combinatorial structures for mathematical reasoning.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Lower Division",
        breadthTags: [],
        requirementTags: ["math-foundation", "cs-core", "proofs"],
        prerequisitesText: "No formal prerequisites."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.STAT.id,
        code: "STAT 20",
        slug: "ucb-stat-20",
        title: "Introduction to Probability and Statistics",
        description: "Probability, inference, and statistical reasoning with an emphasis on applied interpretation.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Lower Division",
        breadthTags: [],
        requirementTags: ["statistics-foundation", "data-foundation"],
        prerequisitesText: "College algebra or equivalent preparation."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.COMPSCI.id,
        code: "COMPSCI 170",
        slug: "ucb-compsci-170",
        title: "Efficient Algorithms and Intractable Problems",
        description: "Algorithm design paradigms, NP-completeness, optimization, and approximation.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Upper Division",
        breadthTags: [],
        requirementTags: ["cs-upperdiv", "algorithms", "major-core"],
        prerequisitesText: "COMPSCI 61B and COMPSCI 70."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.COMPSCI.id,
        code: "COMPSCI 188",
        slug: "ucb-compsci-188",
        title: "Introduction to Artificial Intelligence",
        description: "Search, games, probabilistic reasoning, and machine learning foundations for intelligent systems.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Upper Division",
        breadthTags: [],
        requirementTags: ["cs-upperdiv", "ai", "program-elective"],
        prerequisitesText: "COMPSCI 61A, COMPSCI 61B, and probability preparation."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.DATA.id,
        code: "DATA 144",
        slug: "ucb-data-144",
        title: "Data Mining and Analytics",
        description: "Scalable data mining techniques, pattern discovery, and practical analytics workflows.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Upper Division",
        breadthTags: [],
        requirementTags: ["data-elective", "machine-learning", "program-elective"],
        prerequisitesText: "DATA C100 or comparable preparation."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.UGBA.id,
        code: "UGBA 101A",
        slug: "ucb-ugba-101a",
        title: "Financial Accounting",
        description: "Concepts and analysis of financial statements for managerial and investing decisions.",
        unitsMin: 3,
        unitsMax: 3,
        level: "Upper Division",
        breadthTags: [],
        requirementTags: ["business-core", "accounting"],
        prerequisitesText: "Business major standing or equivalent preparation."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.UGBA.id,
        code: "UGBA 102A",
        slug: "ucb-ugba-102a",
        title: "Introduction to Financial Management",
        description: "Time value of money, firm valuation, capital budgeting, and financial decision-making.",
        unitsMin: 3,
        unitsMax: 3,
        level: "Upper Division",
        breadthTags: [],
        requirementTags: ["business-core", "finance"],
        prerequisitesText: "Business major standing and quantitative preparation."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.IB.id,
        code: "IB 131",
        slug: "ucb-ib-131",
        title: "Human Physiology",
        description: "Physiology of major organ systems with a focus on integrative mechanisms and adaptation.",
        unitsMin: 4,
        unitsMax: 4,
        level: "Upper Division",
        breadthTags: [],
        requirementTags: ["ib-upperdiv", "biology-core"],
        prerequisitesText: "Introductory biology preparation."
      }
    }),
    prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.IB.id,
        code: "IB C77",
        slug: "ucb-ib-c77",
        title: "Concepts in Human Health and Disease",
        description: "Interdisciplinary exploration of disease mechanisms, public health, and human biology.",
        unitsMin: 3,
        unitsMax: 3,
        level: "Upper Division",
        breadthTags: ["Biological Science"],
        requirementTags: ["ib-upperdiv", "program-elective"],
        prerequisitesText: "Introductory biology or consent of instructor."
      }
    })
  ]);

  const course = Object.fromEntries(courses.map((item) => [item.code, item]));

  const supplementalCourseSeeds = [
    {
      departmentCode: "COMPSCI",
      code: "COMPSCI 162",
      slug: "ucb-compsci-162",
      title: "Operating Systems and Systems Programming",
      description: "Processes, concurrency, virtualization, storage, and distributed systems foundations.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["cs-upperdiv", "systems", "major-core"],
      prerequisitesText: "COMPSCI 61B and systems maturity."
    },
    {
      departmentCode: "COMPSCI",
      code: "COMPSCI 186",
      slug: "ucb-compsci-186",
      title: "Introduction to Database Systems",
      description: "Relational modeling, SQL, query optimization, transactions, and data-intensive application design.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["cs-upperdiv", "data-systems", "program-elective"],
      prerequisitesText: "COMPSCI 61B or equivalent programming preparation."
    },
    {
      departmentCode: "DATA",
      code: "DATA 140",
      slug: "ucb-data-140",
      title: "Probability for Data Science",
      description: "Probability theory, random variables, distributions, and statistical modeling for data science.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["data-core", "probability", "major-core"],
      prerequisitesText: "Calculus and mathematical maturity."
    },
    {
      departmentCode: "DATA",
      code: "DATA 101",
      slug: "ucb-data-101",
      title: "Data Engineering",
      description: "Data pipelines, storage systems, reliability, and infrastructure for production data workflows.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["data-elective", "data-systems", "program-elective"],
      prerequisitesText: "DATA C100 or equivalent systems and data preparation."
    },
    {
      departmentCode: "STAT",
      code: "STAT 134",
      slug: "ucb-stat-134",
      title: "Concepts of Probability",
      description: "Foundational probability theory for mathematically rigorous statistics and data science study.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Lower Division",
      breadthTags: [],
      requirementTags: ["statistics-foundation", "probability", "math-foundation"],
      prerequisitesText: "Calculus preparation."
    },
    {
      departmentCode: "STAT",
      code: "STAT 135",
      slug: "ucb-stat-135",
      title: "Concepts of Statistics",
      description: "Statistical inference, estimation, testing, and modeling with mathematical depth.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["statistics-foundation", "inference", "data-elective"],
      prerequisitesText: "Probability preparation such as STAT 134."
    },
    {
      departmentCode: "STAT",
      code: "STAT 151A",
      slug: "ucb-stat-151a",
      title: "Introduction to Time Series",
      description: "Time-series models, forecasting, and applied statistical analysis of temporal data.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["statistics-elective", "data-elective", "program-elective"],
      prerequisitesText: "Upper-division probability and statistics preparation."
    },
    {
      departmentCode: "MATH",
      code: "MATH 53",
      slug: "ucb-math-53",
      title: "Multivariable Calculus",
      description: "Partial derivatives, multiple integration, vector calculus, and geometric applications.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Lower Division",
      breadthTags: [],
      requirementTags: ["math-foundation", "calculus", "engineering-foundation"],
      prerequisitesText: "Single-variable calculus."
    },
    {
      departmentCode: "MATH",
      code: "MATH 110",
      slug: "ucb-math-110",
      title: "Linear Algebra",
      description: "Vector spaces, linear transformations, inner products, and diagonalization with proof-based emphasis.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["math-upperdiv", "proofs", "program-elective"],
      prerequisitesText: "MATH 54 or equivalent preparation."
    },
    {
      departmentCode: "UGBA",
      code: "UGBA 103",
      slug: "ucb-ugba-103",
      title: "Leading People",
      description: "Organizational behavior, leadership, team dynamics, and managing in complex organizations.",
      unitsMin: 3,
      unitsMax: 3,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["business-core", "leadership"],
      prerequisitesText: "Business major standing or equivalent preparation."
    },
    {
      departmentCode: "UGBA",
      code: "UGBA 104",
      slug: "ucb-ugba-104",
      title: "Business Data Analytics",
      description: "Applied analytics for business decision-making, experimentation, and operational insights.",
      unitsMin: 3,
      unitsMax: 3,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["business-core", "analytics", "program-elective"],
      prerequisitesText: "Statistics and business major preparation."
    },
    {
      departmentCode: "IB",
      code: "IB 150",
      slug: "ucb-ib-150",
      title: "Organismal Biology",
      description: "Comparative organismal structure, function, and evolutionary adaptation across major taxa.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["ib-upperdiv", "biology-core", "program-elective"],
      prerequisitesText: "Lower-division biology preparation."
    },
    {
      departmentCode: "COGSCI",
      code: "COGSCI 1",
      slug: "ucb-cogsci-1",
      title: "Introduction to Cognitive Science",
      description: "Interdisciplinary introduction to mind, language, computation, and human cognition.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Lower Division",
      breadthTags: ["Social and Behavioral Sciences"],
      requirementTags: ["cogsci-foundation", "breadth"],
      prerequisitesText: "No formal prerequisites."
    },
    {
      departmentCode: "COGSCI",
      code: "COGSCI 131",
      slug: "ucb-cogsci-131",
      title: "Computational Models of Cognition",
      description: "Computational approaches to learning, reasoning, and cognitive representation.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["cogsci-upperdiv", "ai", "program-elective"],
      prerequisitesText: "Programming and cognitive science background recommended."
    },
    {
      departmentCode: "ECON",
      code: "ECON 1",
      slug: "ucb-econ-1",
      title: "Introduction to Economics",
      description: "Survey of microeconomics and macroeconomics for policy and market reasoning.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Lower Division",
      breadthTags: ["Social and Behavioral Sciences"],
      requirementTags: ["econ-foundation", "breadth"],
      prerequisitesText: "No formal prerequisites."
    },
    {
      departmentCode: "ECON",
      code: "ECON 100A",
      slug: "ucb-econ-100a",
      title: "Microeconomic Analysis",
      description: "Consumer theory, producer theory, market structure, and welfare analysis.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["econ-upperdiv", "program-elective"],
      prerequisitesText: "Lower-division economics and calculus preparation."
    },
    {
      departmentCode: "ENGIN",
      code: "ENGIN 7",
      slug: "ucb-engin-7",
      title: "Introduction to Computer Programming for Scientists and Engineers",
      description: "Programming and problem-solving for engineering contexts using Python and numerical methods.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Lower Division",
      breadthTags: [],
      requirementTags: ["engineering-foundation", "programming"],
      prerequisitesText: "College-level mathematics preparation."
    },
    {
      departmentCode: "PHYSICS",
      code: "PHYSICS 7A",
      slug: "ucb-physics-7a",
      title: "Physics for Scientists and Engineers",
      description: "Mechanics, oscillations, and thermodynamics for science and engineering students.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Lower Division",
      breadthTags: ["Physical Science"],
      requirementTags: ["physics-foundation", "engineering-foundation"],
      prerequisitesText: "Concurrent calculus recommended."
    },
    {
      departmentCode: "PHYSICS",
      code: "PHYSICS 7B",
      slug: "ucb-physics-7b",
      title: "Physics for Scientists and Engineers",
      description: "Electricity, magnetism, optics, and waves for science and engineering students.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Lower Division",
      breadthTags: ["Physical Science"],
      requirementTags: ["physics-foundation", "engineering-foundation", "electricity-magnetism"],
      prerequisitesText: "PHYSICS 7A and concurrent or prior multivariable calculus."
    },
    {
      departmentCode: "PHYSICS",
      code: "PHYSICS 7C",
      slug: "ucb-physics-7c",
      title: "Physics for Scientists and Engineers",
      description: "Thermal physics, quantum phenomena, and modern physics foundations for scientists and engineers.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Lower Division",
      breadthTags: ["Physical Science"],
      requirementTags: ["physics-foundation", "modern-physics", "engineering-foundation"],
      prerequisitesText: "PHYSICS 7A and PHYSICS 7B."
    },
    {
      departmentCode: "PHYSICS",
      code: "PHYSICS 137A",
      slug: "ucb-physics-137a",
      title: "Quantum Mechanics",
      description: "Wave mechanics, operators, angular momentum, and approximation methods in quantum theory.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["physics-upperdiv", "quantum", "program-elective"],
      prerequisitesText: "Lower-division physics sequence and differential equations preparation."
    },
    {
      departmentCode: "COGSCI",
      code: "COGSCI C100",
      slug: "ucb-cogsci-c100",
      title: "Basic Issues in Cognition",
      description: "Core theories and debates across perception, reasoning, language, and learning in cognitive science.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["cogsci-core", "major-core"],
      prerequisitesText: "Introductory cognitive science or equivalent preparation."
    },
    {
      departmentCode: "COGSCI",
      code: "COGSCI 140",
      slug: "ucb-cogsci-140",
      title: "Cognitive Psychology",
      description: "Experimental study of attention, memory, categorization, and decision making.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["cogsci-upperdiv", "psychology", "program-elective"],
      prerequisitesText: "Cognitive science or psychology background recommended."
    },
    {
      departmentCode: "ECON",
      code: "ECON 100B",
      slug: "ucb-econ-100b",
      title: "Macroeconomic Analysis",
      description: "Economic growth, unemployment, inflation, monetary policy, and macroeconomic fluctuations.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["econ-upperdiv", "macro", "major-core"],
      prerequisitesText: "Lower-division economics and calculus preparation."
    },
    {
      departmentCode: "ECON",
      code: "ECON 140",
      slug: "ucb-econ-140",
      title: "Econometrics",
      description: "Regression, causal inference, and empirical methods for economic analysis.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["econ-upperdiv", "econometrics", "data-elective"],
      prerequisitesText: "Probability, statistics, and economic analysis preparation."
    },
    {
      departmentCode: "STAT",
      code: "STAT 133",
      slug: "ucb-stat-133",
      title: "Concepts in Computing with Data",
      description: "Statistical computing workflows, reproducible analysis, and modern data tooling for applied statistics.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["statistics-core", "data-systems", "program-elective"],
      prerequisitesText: "Introductory statistics and some programming experience."
    },
    {
      departmentCode: "STAT",
      code: "STAT 150",
      slug: "ucb-stat-150",
      title: "Stochastic Processes",
      description: "Markov chains, Poisson processes, and probabilistic models of evolving random systems.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["statistics-upperdiv", "probability", "program-elective"],
      prerequisitesText: "Rigorous probability preparation such as STAT 134 or DATA 140."
    },
    {
      departmentCode: "COMPSCI",
      code: "COMPSCI 169A",
      slug: "ucb-compsci-169a",
      title: "Introduction to Software Engineering",
      description: "Modern software product development with team workflows, testing, iteration, and deployment.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["cs-upperdiv", "software", "project-heavy"],
      prerequisitesText: "Programming maturity equivalent to COMPSCI 61B."
    },
    {
      departmentCode: "DATA",
      code: "DATA 102",
      slug: "ucb-data-102",
      title: "Data, Inference, and Decisions",
      description: "Prediction, causal reasoning, experimentation, and statistical decision-making for data science.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["data-core", "inference", "data-elective"],
      prerequisitesText: "Data science core and probability preparation."
    },
    {
      departmentCode: "MATH",
      code: "MATH 104",
      slug: "ucb-math-104",
      title: "Introduction to Analysis",
      description: "Rigorous real analysis with proofs, limits, continuity, and sequences of functions.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["math-upperdiv", "proofs", "analysis"],
      prerequisitesText: "Proof-writing preparation such as MATH 55."
    },
    {
      departmentCode: "ECON",
      code: "ECON 136",
      slug: "ucb-econ-136",
      title: "Financial Economics",
      description: "Asset pricing, risk, markets, and financial decision-making using economic reasoning.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["econ-upperdiv", "finance", "program-elective"],
      prerequisitesText: "Intermediate microeconomics and quantitative preparation."
    },
    {
      departmentCode: "PHYSICS",
      code: "PHYSICS 111A",
      slug: "ucb-physics-111a",
      title: "Experimental Physics",
      description: "Measurement, uncertainty, instrumentation, and experimental practice for physics majors.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["physics-upperdiv", "lab", "program-elective"],
      prerequisitesText: "Lower-division physics sequence completion."
    },
    {
      departmentCode: "STAT",
      code: "STAT 154",
      slug: "ucb-stat-154",
      title: "Modern Statistical Prediction and Machine Learning",
      description: "Regression, classification, regularization, and predictive modeling for modern statistical workflows.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["statistics-upperdiv", "machine-learning", "data-elective"],
      prerequisitesText: "Probability, inference, and statistical computing preparation."
    },
    {
      departmentCode: "COGSCI",
      code: "COGSCI 132",
      slug: "ucb-cogsci-132",
      title: "Psychology of Perception",
      description: "Perception, attention, sensory systems, and experimental approaches to how humans interpret the world.",
      unitsMin: 4,
      unitsMax: 4,
      level: "Upper Division",
      breadthTags: [],
      requirementTags: ["cogsci-upperdiv", "psychology", "program-elective"],
      prerequisitesText: "Introductory cognitive science or psychology background recommended."
    }
  ] as const;

  for (const supplementalCourse of supplementalCourseSeeds) {
    const createdCourse = await prisma.course.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept[supplementalCourse.departmentCode].id,
        code: supplementalCourse.code,
        slug: supplementalCourse.slug,
        title: supplementalCourse.title,
        description: supplementalCourse.description,
        unitsMin: supplementalCourse.unitsMin,
        unitsMax: supplementalCourse.unitsMax,
        level: supplementalCourse.level,
        breadthTags: [...supplementalCourse.breadthTags],
        requirementTags: [...supplementalCourse.requirementTags],
        prerequisitesText: supplementalCourse.prerequisitesText
      }
    });

    course[createdCourse.code] = createdCourse;
  }

  const instructors = await Promise.all([
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.COMPSCI.id, name: "Jennifer Wang", slug: "jennifer-wang" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.DATA.id, name: "Miguel Alvarez", slug: "miguel-alvarez" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.UGBA.id, name: "Priya Shah", slug: "priya-shah" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.IB.id, name: "Elena Torres", slug: "elena-torres" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.COMPSCI.id, name: "Noah Kim", slug: "noah-kim" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.STAT.id, name: "Sara Lopez", slug: "sara-lopez" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.UGBA.id, name: "Daniel Brooks", slug: "daniel-brooks" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.COMPSCI.id, name: "Ava Sullivan", slug: "ava-sullivan" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.DATA.id, name: "Rohan Mehta", slug: "rohan-mehta" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.MATH.id, name: "Lila Foster", slug: "lila-foster" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.COGSCI.id, name: "Ethan Park", slug: "ethan-park" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.ECON.id, name: "Grace Liu", slug: "grace-liu" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.ENGIN.id, name: "Marcus Reed", slug: "marcus-reed" } }),
    prisma.instructor.create({ data: { schoolId: berkeley.id, departmentId: dept.PHYSICS.id, name: "Olivia Hart", slug: "olivia-hart" } })
  ]);

  const instructor = Object.fromEntries(instructors.map((item) => [item.name, item]));

  for (const [slug, alias] of Object.entries(instructorRmpAliases)) {
    if (alias.rmpProfessorId) {
      await prisma.instructor.updateMany({
        where: { slug },
        data: { rmpProfessorId: alias.rmpProfessorId } as { rmpProfessorId: string }
      });
    }
  }

  const offering61A = await prisma.courseOffering.create({
    data: {
      courseId: course["COMPSCI 61A"].id,
      termId: term["2024-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Jennifer Wang",
      location: "Wheeler 150",
      meetingDays: "MWF",
      timeStart: "10:00",
      timeEnd: "10:59",
      capacity: 1800,
      enrolled: 1794,
      waitlist: 120,
      seatsReserved: 250,
      status: OfferingStatus.CLOSED
    }
  });

  const offeringC100 = await prisma.courseOffering.create({
    data: {
      courseId: course["DATA C100"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Miguel Alvarez",
      location: "Soda 306",
      meetingDays: "TuTh",
      timeStart: "14:00",
      timeEnd: "15:29",
      capacity: 450,
      enrolled: 441,
      waitlist: 38,
      seatsReserved: 50,
      status: OfferingStatus.WAITLIST
    }
  });

  const offeringUGBA100 = await prisma.courseOffering.create({
    data: {
      courseId: course["UGBA 100"].id,
      termId: term["2025-FALL"].id,
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
      seatsReserved: 90,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from prior fall cadence and Haas enrollment notes.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offering61B = await prisma.courseOffering.create({
    data: {
      courseId: course["COMPSCI 61B"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Course staff",
      location: "Dwinelle 155",
      meetingDays: "MWF",
      timeStart: "13:00",
      timeEnd: "13:59",
      capacity: 900,
      enrolled: 872,
      waitlist: 64,
      seatsReserved: 120,
      status: OfferingStatus.WAITLIST
    }
  });

  const offeringMath54 = await prisma.courseOffering.create({
    data: {
      courseId: course["MATH 54"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Lila Foster",
      location: "Evans 60",
      meetingDays: "MW",
      timeStart: "13:00",
      timeEnd: "14:29",
      capacity: 520,
      enrolled: 498,
      waitlist: 12,
      seatsReserved: 25,
      status: OfferingStatus.OPEN
    }
  });

  const offering170 = await prisma.courseOffering.create({
    data: {
      courseId: course["COMPSCI 170"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Noah Kim",
      location: "Soda 310",
      meetingDays: "TuTh",
      timeStart: "11:00",
      timeEnd: "12:29",
      capacity: 320,
      enrolled: 312,
      waitlist: 21,
      seatsReserved: 30,
      status: OfferingStatus.WAITLIST
    }
  });

  const offeringStat20 = await prisma.courseOffering.create({
    data: {
      courseId: course["STAT 20"].id,
      termId: term["2025-SUMMER"].id,
      sectionCode: "201",
      component: "Lecture",
      instructorText: "Sara Lopez",
      location: "Evans 10",
      meetingDays: "MW",
      timeStart: "13:00",
      timeEnd: "14:59",
      capacity: 180,
      enrolled: 122,
      waitlist: 0,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offering101A = await prisma.courseOffering.create({
    data: {
      courseId: course["UGBA 101A"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Daniel Brooks",
      location: "Chou Hall",
      meetingDays: "TuTh",
      timeStart: "09:30",
      timeEnd: "10:59",
      capacity: 210,
      enrolled: 0,
      waitlist: 0,
      seatsReserved: 110,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from Haas fall rotation and prior enrollment demand.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offering162 = await prisma.courseOffering.create({
    data: {
      courseId: course["COMPSCI 162"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Ava Sullivan",
      location: "Cory 105",
      meetingDays: "MW",
      timeStart: "14:00",
      timeEnd: "15:29",
      capacity: 280,
      enrolled: 0,
      waitlist: 0,
      seatsReserved: 40,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from historical fall systems rotation.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offering186 = await prisma.courseOffering.create({
    data: {
      courseId: course["COMPSCI 186"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Ava Sullivan",
      location: "Soda 320",
      meetingDays: "TuTh",
      timeStart: "15:30",
      timeEnd: "16:59",
      capacity: 260,
      enrolled: 247,
      waitlist: 14,
      seatsReserved: 20,
      status: OfferingStatus.WAITLIST
    }
  });

  const offering140 = await prisma.courseOffering.create({
    data: {
      courseId: course["DATA 140"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Rohan Mehta",
      location: "Evans 60",
      meetingDays: "MWF",
      timeStart: "12:00",
      timeEnd: "12:59",
      capacity: 420,
      enrolled: 401,
      waitlist: 19,
      seatsReserved: 40,
      status: OfferingStatus.WAITLIST
    }
  });

  const offering101 = await prisma.courseOffering.create({
    data: {
      courseId: course["DATA 101"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Rohan Mehta",
      location: "Soda 306",
      meetingDays: "TuTh",
      timeStart: "12:30",
      timeEnd: "13:59",
      capacity: 180,
      enrolled: 0,
      waitlist: 0,
      seatsReserved: 10,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from recent data engineering elective demand.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offeringMath53 = await prisma.courseOffering.create({
    data: {
      courseId: course["MATH 53"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Lila Foster",
      location: "Evans 10",
      meetingDays: "MWF",
      timeStart: "09:00",
      timeEnd: "09:59",
      capacity: 520,
      enrolled: 501,
      waitlist: 18,
      seatsReserved: 25,
      status: OfferingStatus.WAITLIST
    }
  });

  const offeringMath110 = await prisma.courseOffering.create({
    data: {
      courseId: course["MATH 110"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Lila Foster",
      location: "Evans 71",
      meetingDays: "MWF",
      timeStart: "11:00",
      timeEnd: "11:59",
      capacity: 160,
      enrolled: 148,
      waitlist: 7,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringCogsci1 = await prisma.courseOffering.create({
    data: {
      courseId: course["COGSCI 1"].id,
      termId: term["2024-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Ethan Park",
      location: "Dwinelle 155",
      meetingDays: "TuTh",
      timeStart: "10:00",
      timeEnd: "11:29",
      capacity: 340,
      enrolled: 319,
      waitlist: 9,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringEcon1 = await prisma.courseOffering.create({
    data: {
      courseId: course["ECON 1"].id,
      termId: term["2024-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Grace Liu",
      location: "Pimentel 1",
      meetingDays: "MWF",
      timeStart: "13:00",
      timeEnd: "13:59",
      capacity: 600,
      enrolled: 577,
      waitlist: 23,
      seatsReserved: 0,
      status: OfferingStatus.WAITLIST
    }
  });

  const offeringEngin7 = await prisma.courseOffering.create({
    data: {
      courseId: course["ENGIN 7"].id,
      termId: term["2025-SUMMER"].id,
      sectionCode: "101",
      component: "Lecture",
      instructorText: "Marcus Reed",
      location: "Etcheverry 3100",
      meetingDays: "TuTh",
      timeStart: "10:00",
      timeEnd: "11:59",
      capacity: 150,
      enrolled: 112,
      waitlist: 0,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringPhysics7A = await prisma.courseOffering.create({
    data: {
      courseId: course["PHYSICS 7A"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Olivia Hart",
      location: "LeConte 4",
      meetingDays: "MWF",
      timeStart: "08:00",
      timeEnd: "08:59",
      capacity: 420,
      enrolled: 0,
      waitlist: 0,
      seatsReserved: 35,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from standard physics fall sequence demand.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offeringUGBA10 = await prisma.courseOffering.create({
    data: {
      courseId: course["UGBA 10"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Priya Shah",
      location: "Haas Courtyard",
      meetingDays: "MW",
      timeStart: "10:00",
      timeEnd: "11:29",
      capacity: 320,
      enrolled: 298,
      waitlist: 14,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringDataC104 = await prisma.courseOffering.create({
    data: {
      courseId: course["DATA C104"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Rohan Mehta",
      location: "Wheeler 102",
      meetingDays: "MW",
      timeStart: "11:00",
      timeEnd: "12:29",
      capacity: 280,
      enrolled: 264,
      waitlist: 8,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringCS188 = await prisma.courseOffering.create({
    data: {
      courseId: course["COMPSCI 188"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Noah Kim",
      location: "Soda 306",
      meetingDays: "TuTh",
      timeStart: "15:30",
      timeEnd: "16:59",
      capacity: 360,
      enrolled: 0,
      waitlist: 0,
      seatsReserved: 45,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from prior fall AI enrollment demand.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offeringMath55 = await prisma.courseOffering.create({
    data: {
      courseId: course["MATH 55"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Lila Foster",
      location: "Evans 10",
      meetingDays: "MWF",
      timeStart: "11:00",
      timeEnd: "11:59",
      capacity: 180,
      enrolled: 176,
      waitlist: 0,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringIB131 = await prisma.courseOffering.create({
    data: {
      courseId: course["IB 131"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Course staff",
      location: "Valley Life Sciences 2050",
      meetingDays: "TuTh",
      timeStart: "11:00",
      timeEnd: "12:29",
      capacity: 140,
      enrolled: 118,
      waitlist: 0,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringIBC77 = await prisma.courseOffering.create({
    data: {
      courseId: course["IB C77"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Course staff",
      location: "Valley Life Sciences 2060",
      meetingDays: "MWF",
      timeStart: "09:00",
      timeEnd: "09:59",
      capacity: 120,
      enrolled: 0,
      waitlist: 0,
      seatsReserved: 0,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from prior fall IB field-lab cadence.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offeringCS70 = await prisma.courseOffering.create({
    data: {
      courseId: course["COMPSCI 70"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Noah Kim",
      location: "Wheeler 150",
      meetingDays: "TuTh",
      timeStart: "12:30",
      timeEnd: "13:59",
      capacity: 420,
      enrolled: 401,
      waitlist: 6,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringDataC8 = await prisma.courseOffering.create({
    data: {
      courseId: course["DATA C8"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Miguel Alvarez",
      location: "Wheeler 150",
      meetingDays: "MWF",
      timeStart: "09:00",
      timeEnd: "09:59",
      capacity: 900,
      enrolled: 884,
      waitlist: 0,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringData144 = await prisma.courseOffering.create({
    data: {
      courseId: course["DATA 144"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Rohan Mehta",
      location: "Soda 320",
      meetingDays: "TuTh",
      timeStart: "14:00",
      timeEnd: "15:29",
      capacity: 240,
      enrolled: 0,
      waitlist: 0,
      seatsReserved: 30,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from prior fall data mining enrollment.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offeringIB35AC = await prisma.courseOffering.create({
    data: {
      courseId: course["IB 35AC"].id,
      termId: term["2024-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Course staff",
      location: "Valley Life Sciences 2050",
      meetingDays: "MWF",
      timeStart: "12:00",
      timeEnd: "12:59",
      capacity: 280,
      enrolled: 268,
      waitlist: 0,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  const offeringUGBA102A = await prisma.courseOffering.create({
    data: {
      courseId: course["UGBA 102A"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Daniel Brooks",
      location: "Chou Hall",
      meetingDays: "MW",
      timeStart: "14:00",
      timeEnd: "15:29",
      capacity: 190,
      enrolled: 172,
      waitlist: 4,
      seatsReserved: 60,
      status: OfferingStatus.OPEN
    }
  });

  const offeringStat134 = await prisma.courseOffering.create({
    data: {
      courseId: course["STAT 134"].id,
      termId: term["2025-FALL"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Sara Lopez",
      location: "Evans 10",
      meetingDays: "MWF",
      timeStart: "10:00",
      timeEnd: "10:59",
      capacity: 260,
      enrolled: 0,
      waitlist: 0,
      seatsReserved: 0,
      status: OfferingStatus.PROJECTED,
      isProjected: true,
      projectedReason: "Projected from standard fall probability sequence.",
      dataStatus: DataStatus.PROJECTED
    }
  });

  const offeringStat135 = await prisma.courseOffering.create({
    data: {
      courseId: course["STAT 135"].id,
      termId: term["2025-SPRING"].id,
      sectionCode: "001",
      component: "Lecture",
      instructorText: "Sara Lopez",
      location: "Evans 10",
      meetingDays: "TuTh",
      timeStart: "11:00",
      timeEnd: "12:29",
      capacity: 220,
      enrolled: 205,
      waitlist: 3,
      seatsReserved: 0,
      status: OfferingStatus.OPEN
    }
  });

  await prisma.courseOfferingInstructor.createMany({
    data: [
      { courseOfferingId: offering61A.id, instructorId: instructor["Jennifer Wang"].id, role: "Instructor" },
      { courseOfferingId: offeringC100.id, instructorId: instructor["Miguel Alvarez"].id, role: "Instructor" },
      { courseOfferingId: offeringUGBA100.id, instructorId: instructor["Priya Shah"].id, role: "Instructor" },
      { courseOfferingId: offering170.id, instructorId: instructor["Noah Kim"].id, role: "Instructor" },
      { courseOfferingId: offeringStat20.id, instructorId: instructor["Sara Lopez"].id, role: "Instructor" },
      { courseOfferingId: offering101A.id, instructorId: instructor["Daniel Brooks"].id, role: "Instructor" },
      { courseOfferingId: offering162.id, instructorId: instructor["Ava Sullivan"].id, role: "Instructor" },
      { courseOfferingId: offering186.id, instructorId: instructor["Ava Sullivan"].id, role: "Instructor" },
      { courseOfferingId: offering140.id, instructorId: instructor["Rohan Mehta"].id, role: "Instructor" },
      { courseOfferingId: offering101.id, instructorId: instructor["Rohan Mehta"].id, role: "Instructor" },
      { courseOfferingId: offeringMath53.id, instructorId: instructor["Lila Foster"].id, role: "Instructor" },
      { courseOfferingId: offeringMath110.id, instructorId: instructor["Lila Foster"].id, role: "Instructor" },
      { courseOfferingId: offeringCogsci1.id, instructorId: instructor["Ethan Park"].id, role: "Instructor" },
      { courseOfferingId: offeringEcon1.id, instructorId: instructor["Grace Liu"].id, role: "Instructor" },
      { courseOfferingId: offeringEngin7.id, instructorId: instructor["Marcus Reed"].id, role: "Instructor" },
      { courseOfferingId: offeringPhysics7A.id, instructorId: instructor["Olivia Hart"].id, role: "Instructor" },
      { courseOfferingId: offering61B.id, instructorId: instructor["Ava Sullivan"].id, role: "Instructor" },
      { courseOfferingId: offeringMath54.id, instructorId: instructor["Lila Foster"].id, role: "Instructor" },
      { courseOfferingId: offeringUGBA10.id, instructorId: instructor["Priya Shah"].id, role: "Instructor" },
      { courseOfferingId: offeringDataC104.id, instructorId: instructor["Rohan Mehta"].id, role: "Instructor" },
      { courseOfferingId: offeringCS188.id, instructorId: instructor["Noah Kim"].id, role: "Instructor" },
      { courseOfferingId: offeringMath55.id, instructorId: instructor["Lila Foster"].id, role: "Instructor" },
      { courseOfferingId: offeringCS70.id, instructorId: instructor["Noah Kim"].id, role: "Instructor" },
      { courseOfferingId: offeringDataC8.id, instructorId: instructor["Miguel Alvarez"].id, role: "Instructor" },
      { courseOfferingId: offeringData144.id, instructorId: instructor["Rohan Mehta"].id, role: "Instructor" },
      { courseOfferingId: offeringUGBA102A.id, instructorId: instructor["Daniel Brooks"].id, role: "Instructor" },
      { courseOfferingId: offeringStat134.id, instructorId: instructor["Sara Lopez"].id, role: "Instructor" },
      { courseOfferingId: offeringStat135.id, instructorId: instructor["Sara Lopez"].id, role: "Instructor" }
    ]
  });

  await prisma.professorRating.createMany({
    data: [
      {
        instructorId: instructor["Jennifer Wang"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.5,
        averageDifficulty: 4.2,
        reviewCount: 126,
        sentimentSummary: "Students praise clarity and strong exam preparation.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Miguel Alvarez"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.1,
        averageDifficulty: 3.8,
        reviewCount: 41,
        sentimentSummary: "Project-heavy but highly practical.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Noah Kim"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.3,
        averageDifficulty: 4.0,
        reviewCount: 58,
        sentimentSummary: "Clear walkthroughs on algorithm patterns with challenging but fair assessments.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Ava Sullivan"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.4,
        averageDifficulty: 4.1,
        reviewCount: 37,
        sentimentSummary: "Students like the systems intuition and project scaffolding.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Rohan Mehta"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.2,
        averageDifficulty: 3.9,
        reviewCount: 29,
        sentimentSummary: "Strong applied framing with practical data infrastructure examples.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Sara Lopez"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.0,
        averageDifficulty: 3.4,
        reviewCount: 33,
        sentimentSummary: "Students say the statistics pacing is approachable and example-driven.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Lila Foster"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.4,
        averageDifficulty: 4.1,
        reviewCount: 52,
        sentimentSummary: "Proof-heavy courses feel demanding, but students like the structure and clarity.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Ethan Park"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.1,
        averageDifficulty: 3.3,
        reviewCount: 24,
        sentimentSummary: "Interdisciplinary framing lands well and lectures are usually considered engaging.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Grace Liu"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.3,
        averageDifficulty: 3.7,
        reviewCount: 46,
        sentimentSummary: "Students appreciate the intuition for theory and clean economic examples.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Olivia Hart"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.2,
        averageDifficulty: 4.0,
        reviewCount: 31,
        sentimentSummary: "Physics explanations are described as precise, with labs and problem sets still quite demanding.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Priya Shah"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.0,
        averageDifficulty: 3.2,
        reviewCount: 58,
        sentimentSummary: "Clear communicator with fair grading on business writing assignments.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Daniel Brooks"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 3.9,
        averageDifficulty: 3.5,
        reviewCount: 44,
        sentimentSummary: "Case-heavy class with useful feedback on presentations and memos.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Elena Torres"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.2,
        averageDifficulty: 3.1,
        reviewCount: 27,
        sentimentSummary: "Engaging lectures with manageable exams if you keep up with readings.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      },
      {
        instructorId: instructor["Marcus Reed"].id,
        sourceName: "Rate My Professors",
        sourceUrl: "https://www.ratemyprofessors.com/",
        rating: 4.1,
        averageDifficulty: 3.6,
        reviewCount: 39,
        sentimentSummary: "Solid intro engineering instructor with approachable office hours.",
        dataStatus: DataStatus.MANUAL_PLACEHOLDER
      }
    ]
  });

  await prisma.gradeDistribution.createMany({
    data: [
      {
        courseId: course["COMPSCI 61A"].id,
        instructorId: instructor["Jennifer Wang"].id,
        termId: term["2024-FALL"].id,
        averageGpa: 3.22,
        totalStudents: 1678,
        distribution: { A: 32, B: 36, C: 20, D: 7, F: 5 }
      },
      {
        courseId: course["DATA C100"].id,
        instructorId: instructor["Miguel Alvarez"].id,
        termId: term["2025-SPRING"].id,
        averageGpa: 3.48,
        totalStudents: 410,
        distribution: { A: 42, B: 34, C: 15, D: 5, F: 4 }
      },
      {
        courseId: course["COMPSCI 170"].id,
        instructorId: instructor["Noah Kim"].id,
        termId: term["2025-SPRING"].id,
        averageGpa: 3.26,
        totalStudents: 289,
        distribution: { A: 29, B: 38, C: 22, D: 7, F: 4 }
      },
      {
        courseId: course["DATA 140"].id,
        instructorId: instructor["Rohan Mehta"].id,
        termId: term["2025-SPRING"].id,
        averageGpa: 3.31,
        totalStudents: 372,
        distribution: { A: 31, B: 39, C: 20, D: 6, F: 4 }
      },
      {
        courseId: course["COMPSCI 186"].id,
        instructorId: instructor["Ava Sullivan"].id,
        termId: term["2025-SPRING"].id,
        averageGpa: 3.42,
        totalStudents: 233,
        distribution: { A: 36, B: 37, C: 17, D: 6, F: 4 }
      },
      {
        courseId: course["STAT 20"].id,
        instructorId: instructor["Sara Lopez"].id,
        termId: term["2025-SUMMER"].id,
        averageGpa: 3.36,
        totalStudents: 118,
        distribution: { A: 35, B: 38, C: 18, D: 5, F: 4 }
      },
      {
        courseId: course["MATH 53"].id,
        instructorId: instructor["Lila Foster"].id,
        termId: term["2025-FALL"].id,
        averageGpa: 3.18,
        totalStudents: 488,
        distribution: { A: 28, B: 37, C: 23, D: 8, F: 4 }
      },
      {
        courseId: course["MATH 110"].id,
        instructorId: instructor["Lila Foster"].id,
        termId: term["2025-SPRING"].id,
        averageGpa: 3.24,
        totalStudents: 142,
        distribution: { A: 30, B: 36, C: 22, D: 7, F: 5 }
      },
      {
        courseId: course["COGSCI 1"].id,
        instructorId: instructor["Ethan Park"].id,
        termId: term["2024-FALL"].id,
        averageGpa: 3.51,
        totalStudents: 307,
        distribution: { A: 43, B: 33, C: 15, D: 5, F: 4 }
      },
      {
        courseId: course["ECON 1"].id,
        instructorId: instructor["Grace Liu"].id,
        termId: term["2024-FALL"].id,
        averageGpa: 3.29,
        totalStudents: 552,
        distribution: { A: 33, B: 37, C: 20, D: 6, F: 4 }
      },
      {
        courseId: course["PHYSICS 7A"].id,
        instructorId: instructor["Olivia Hart"].id,
        termId: term["2025-FALL"].id,
        averageGpa: 3.14,
        totalStudents: 396,
        distribution: { A: 27, B: 36, C: 24, D: 8, F: 5 }
      }
    ]
  });

  await prisma.enrollmentHistory.createMany({
    data: [
      {
        courseId: course["COMPSCI 61A"].id,
        termId: term["2024-FALL"].id,
        phaseLabel: "Phase 1",
        capacity: 1800,
        enrolled: 1730,
        waitlist: 40,
        reservedSeatRisk: true,
        fillRateBucket: "Fills very quickly",
        filledAtDays: 3
      },
      {
        courseId: course["DATA C100"].id,
        termId: term["2025-SPRING"].id,
        phaseLabel: "Phase 2",
        capacity: 450,
        enrolled: 441,
        waitlist: 38,
        reservedSeatRisk: false,
        fillRateBucket: "Fills moderately fast",
        filledAtDays: 12
      },
      {
        courseId: course["UGBA 100"].id,
        termId: term["2025-FALL"].id,
        phaseLabel: "Projected",
        capacity: 180,
        reservedSeatRisk: true,
        fillRateBucket: "Projected high demand",
        filledAtDays: 7,
        dataStatus: DataStatus.PROJECTED
      },
      {
        courseId: course["COMPSCI 170"].id,
        termId: term["2025-SPRING"].id,
        phaseLabel: "Adjustment Period",
        capacity: 320,
        enrolled: 312,
        waitlist: 21,
        reservedSeatRisk: false,
        fillRateBucket: "Fills moderately fast",
        filledAtDays: 10
      },
      {
        courseId: course["STAT 20"].id,
        termId: term["2025-SUMMER"].id,
        phaseLabel: "Open registration",
        capacity: 180,
        enrolled: 122,
        waitlist: 0,
        reservedSeatRisk: false,
        fillRateBucket: "Usually accessible",
        filledAtDays: 20
      },
      {
        courseId: course["DATA 140"].id,
        termId: term["2025-SPRING"].id,
        phaseLabel: "Phase 2",
        capacity: 420,
        enrolled: 401,
        waitlist: 19,
        reservedSeatRisk: false,
        fillRateBucket: "Fills moderately fast",
        filledAtDays: 11
      },
      {
        courseId: course["COMPSCI 186"].id,
        termId: term["2025-SPRING"].id,
        phaseLabel: "Phase 2",
        capacity: 260,
        enrolled: 247,
        waitlist: 14,
        reservedSeatRisk: false,
        fillRateBucket: "Fills moderately fast",
        filledAtDays: 13
      },
      {
        courseId: course["MATH 53"].id,
        termId: term["2025-FALL"].id,
        phaseLabel: "Adjustment Period",
        capacity: 520,
        enrolled: 501,
        waitlist: 18,
        reservedSeatRisk: false,
        fillRateBucket: "Common but in demand",
        filledAtDays: 16
      },
      {
        courseId: course["ECON 1"].id,
        termId: term["2024-FALL"].id,
        phaseLabel: "Late add/drop",
        capacity: 600,
        enrolled: 577,
        waitlist: 23,
        reservedSeatRisk: false,
        fillRateBucket: "Common but in demand",
        filledAtDays: 9
      }
    ]
  });

  await prisma.courseRelationship.createMany({
    data: [
      {
        fromCourseId: course["COMPSCI 61A"].id,
        toCourseId: course["COMPSCI 61B"].id,
        type: RelationshipType.PREREQUISITE,
        reason: "Recommended prerequisite chain."
      },
      {
        fromCourseId: course["DATA C8"].id,
        toCourseId: course["DATA C100"].id,
        type: RelationshipType.PREREQUISITE,
        reason: "Core data science sequence."
      },
      {
        fromCourseId: course["COMPSCI 61B"].id,
        toCourseId: course["COMPSCI 170"].id,
        type: RelationshipType.PREREQUISITE,
        reason: "Algorithms course depends on strong data structures background."
      },
      {
        fromCourseId: course["COMPSCI 70"].id,
        toCourseId: course["COMPSCI 170"].id,
        type: RelationshipType.PREREQUISITE,
        reason: "Discrete math and probability underpin upper-division algorithms."
      },
      {
        fromCourseId: course["DATA C100"].id,
        toCourseId: course["DATA 144"].id,
        type: RelationshipType.RECOMMENDED_AFTER,
        reason: "Analytics elective builds cleanly on the core data science workflow."
      },
      {
        fromCourseId: course["DATA C100"].id,
        toCourseId: course["DATA 101"].id,
        type: RelationshipType.RECOMMENDED_AFTER,
        reason: "Data engineering follows naturally after the main data science workflow course."
      },
      {
        fromCourseId: course["DATA 140"].id,
        toCourseId: course["DATA 144"].id,
        type: RelationshipType.PREREQUISITE,
        reason: "Probability strengthens readiness for upper-division analytics."
      },
      {
        fromCourseId: course["COMPSCI 61B"].id,
        toCourseId: course["COMPSCI 162"].id,
        type: RelationshipType.PREREQUISITE,
        reason: "Systems programming depends on data structures and implementation maturity."
      },
      {
        fromCourseId: course["COMPSCI 61B"].id,
        toCourseId: course["COMPSCI 186"].id,
        type: RelationshipType.PREREQUISITE,
        reason: "Database systems assumes core software and data structure fluency."
      },
      {
        fromCourseId: course["STAT 134"].id,
        toCourseId: course["STAT 135"].id,
        type: RelationshipType.PREREQUISITE,
        reason: "Rigorous statistics builds on the probability sequence."
      },
      {
        fromCourseId: course["MATH 53"].id,
        toCourseId: course["PHYSICS 7A"].id,
        type: RelationshipType.RECOMMENDED_AFTER,
        reason: "Vector and multivariable calculus support the engineering physics sequence."
      }
    ]
  });

  const programs = await Promise.all([
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.DATA.id,
        code: "DATA-BA",
        name: "Data Science",
        slug: "ucb-data-science-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BA",
        overview: "Interdisciplinary program combining statistics, computing, ethics, and domain study.",
        unitMinimum: 120
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.COMPSCI.id,
        code: "CS-BA",
        name: "Computer Science",
        slug: "ucb-computer-science-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BA",
        overview: "CDSS computer science pathway focused on theory, systems, and software.",
        unitMinimum: 120
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.UGBA.id,
        code: "BUS-BA",
        name: "Business Administration",
        slug: "ucb-business-administration-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BS",
        overview: "Haas undergraduate business program with prerequisites, core, and breadth-linked planning needs.",
        unitMinimum: 120
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.IB.id,
        code: "IB-BA",
        name: "Integrative Biology",
        slug: "ucb-integrative-biology-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BA",
        overview: "Whole-organism biology major with lower-division foundations and emphasis-based upper-division study.",
        unitMinimum: 120
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.COMPSCI.id,
        code: "CS-MIN",
        name: "Computer Science",
        slug: "ucb-computer-science-minor",
        type: ProgramType.MINOR,
        degreeLabel: "Minor",
        overview: "Seven-course computer science minor for students outside CS and EECS.",
        unitMinimum: 28
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.DATA.id,
        code: "DATA-MIN",
        name: "Data Science",
        slug: "ucb-data-science-minor",
        type: ProgramType.MINOR,
        degreeLabel: "Minor",
        overview: "Flexible data science minor for students across Berkeley majors.",
        unitMinimum: 24
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.MATH.id,
        code: "MATH-BA",
        name: "Mathematics",
        slug: "ucb-mathematics-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BA",
        overview: "Mathematics BA with proof preparation, upper-division depth, and optional honors or teaching concentration pathways.",
        unitMinimum: 120
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.MATH.id,
        code: "MATH-MIN",
        name: "Mathematics",
        slug: "ucb-mathematics-minor",
        type: ProgramType.MINOR,
        degreeLabel: "Minor",
        overview: "Proof-based and applied mathematics minor for students building stronger quantitative depth.",
        unitMinimum: 24
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.COGSCI.id,
        code: "COGSCI-BA",
        name: "Cognitive Science",
        slug: "ucb-cognitive-science-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BA",
        overview: "Interdisciplinary major spanning computation, psychology, philosophy, neuroscience, and language.",
        unitMinimum: 120
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.ECON.id,
        code: "ECON-BA",
        name: "Economics",
        slug: "ucb-economics-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BA",
        overview: "Economics major built around theory, empirical methods, and quantitative social science.",
        unitMinimum: 120
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.STAT.id,
        code: "STAT-BA",
        name: "Statistics",
        slug: "ucb-statistics-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BA",
        overview: "Statistics major focused on probability, inference, computing, and applied modeling.",
        unitMinimum: 120
      }
    }),
    prisma.program.create({
      data: {
        schoolId: berkeley.id,
        departmentId: dept.PHYSICS.id,
        code: "PHYS-BA",
        name: "Physics",
        slug: "ucb-physics-major",
        type: ProgramType.MAJOR,
        degreeLabel: "BA",
        overview: "Physics major with lower-division mechanics and electromagnetism plus upper-division theory depth.",
        unitMinimum: 120
      }
    })
  ]);

  const program = Object.fromEntries(programs.map((item) => [item.code, item]));

  const sources = await Promise.all([
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["DATA-BA"].id,
        sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A50AMU",
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.APPROVED,
        lastSyncedAt: new Date("2026-04-21T00:00:00.000Z"),
        notes: "Official catalog-backed major requirements with reviewed normalization for MVP.",
        confidence: ConfidenceLevel.HIGH
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["CS-BA"].id,
        sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A5201U",
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-21T00:00:00.000Z"),
        notes: "Official source captured; deeper upper-division mapping still needs review.",
        confidence: ConfidenceLevel.MEDIUM
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["BUS-BA"].id,
        sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/70141U",
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.APPROVED,
        lastSyncedAt: new Date("2026-04-21T00:00:00.000Z"),
        notes: "Catalog and Haas enrollment page reviewed together for prerequisite and enrollment notes.",
        confidence: ConfidenceLevel.HIGH
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["IB-BA"].id,
        sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25975U",
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-21T00:00:00.000Z"),
        notes: "Emphasis-specific upper-division groupings need more granular mapping.",
        confidence: ConfidenceLevel.MEDIUM
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["CS-MIN"].id,
        sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/16I011U",
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-25T00:00:00.000Z"),
        notes: "Official Berkeley CS minor source captured with overlap-sensitive rule draft.",
        confidence: ConfidenceLevel.HIGH
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["DATA-MIN"].id,
        sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A5I172U",
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.APPROVED,
        lastSyncedAt: new Date("2026-04-21T00:00:00.000Z"),
        notes: "Minor pathway mapped from official Berkeley catalog page.",
        confidence: ConfidenceLevel.HIGH
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["MATH-BA"].id,
        sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25540U",
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-25T00:00:00.000Z"),
        notes: "Mathematics BA source captured with lower-division proof prep and representative upper-division depth mapping.",
        confidence: ConfidenceLevel.MEDIUM
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["MATH-MIN"].id,
        sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25I071U",
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-21T00:00:00.000Z"),
        notes: "Minor mapping seeded from the Berkeley mathematics catalog page with a review-ready quantitative core draft.",
        confidence: ConfidenceLevel.MEDIUM
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["COGSCI-BA"].id,
        sourceUrl: "https://cogsci.berkeley.edu",
        sourceType: RequirementSourceType.DEPARTMENT_PAGE,
        parserKey: "berkeley-department-page",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-28T00:00:00.000Z"),
        notes: "Cognitive science major seeded from the department site with representative interdisciplinary requirement buckets.",
        confidence: ConfidenceLevel.MEDIUM
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["ECON-BA"].id,
        sourceUrl: "https://www.econ.berkeley.edu",
        sourceType: RequirementSourceType.DEPARTMENT_PAGE,
        parserKey: "berkeley-department-page",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-28T00:00:00.000Z"),
        notes: "Economics major seeded from the department site with theory and econometrics planning coverage.",
        confidence: ConfidenceLevel.MEDIUM
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["STAT-BA"].id,
        sourceUrl: "https://statistics.berkeley.edu",
        sourceType: RequirementSourceType.DEPARTMENT_PAGE,
        parserKey: "berkeley-department-page",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-28T00:00:00.000Z"),
        notes: "Statistics major seeded from the department site with probability, inference, and computing depth buckets.",
        confidence: ConfidenceLevel.MEDIUM
      }
    }),
    prisma.requirementSource.create({
      data: {
        schoolId: berkeley.id,
        programId: program["PHYS-BA"].id,
        sourceUrl: "https://physics.berkeley.edu",
        sourceType: RequirementSourceType.DEPARTMENT_PAGE,
        parserKey: "berkeley-department-page",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        lastSyncedAt: new Date("2026-04-28T00:00:00.000Z"),
        notes: "Physics major seeded from the department site with lower-division sequence and upper-division theory placeholders.",
        confidence: ConfidenceLevel.MEDIUM
      }
    })
  ]);

  const dataScienceSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["DATA-BA"].id,
      sourceId: sources[0].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Sample normalized Berkeley Data Science major requirements."
    }
  });

  const dsCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: dataScienceSet.id,
        title: "Core",
        slug: "core",
        description: "Required data science core courses.",
        minCourses: 2,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: dataScienceSet.id,
        title: "Foundations in Math and Computing",
        slug: "foundations",
        description: "Foundational lower-division preparation.",
        minCourses: 4,
        displayOrder: 2
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: dataScienceSet.id,
        title: "Human Contexts and Ethics",
        slug: "ethics",
        description: "At least one approved ethics course.",
        minCourses: 1,
        displayOrder: 3
      }
    })
  ]);

  const coreRule = await prisma.requirementRule.create({
    data: {
      categoryId: dsCategories[0].id,
      ruleType: RequirementRuleType.REQUIRED_COURSE,
      title: "Complete the data science core sequence",
      description: "Both introductory and upper-division data science core courses are required.",
      courseCodes: ["DATA C8", "DATA C100"],
      allowedDepartmentCodes: [],
      allowedTags: [],
      sourceRefText: "Official Berkeley Data Science major page",
      displayOrder: 1
    }
  });

  await prisma.requirementRule.create({
    data: {
      categoryId: dsCategories[1].id,
      ruleType: RequirementRuleType.CHOOSE_N_COURSES,
      title: "Choose 4 foundations courses",
      description: "Representative MVP subset of official lower-division foundations.",
      minSelect: 4,
      courseCodes: ["COMPSCI 61A", "COMPSCI 61B", "MATH 54", "COMPSCI 70", "STAT 20", "STAT 134", "MATH 53"],
      allowedDepartmentCodes: ["COMPSCI", "MATH", "STAT"],
      allowedTags: ["math-foundation", "data-foundation", "statistics-foundation", "calculus"],
      sourceRefText: "Official Berkeley Data Science major page",
      displayOrder: 1
    }
  });

  await prisma.requirementRule.create({
    data: {
      categoryId: dsCategories[2].id,
      ruleType: RequirementRuleType.CHOOSE_N_COURSES,
      title: "Choose 1 ethics course",
      minSelect: 1,
      courseCodes: ["DATA C104"],
      allowedDepartmentCodes: ["DATA"],
      allowedTags: ["data-ethics"],
      sourceRefText: "Official Berkeley Data Science major page",
      displayOrder: 1
    }
  });

  await prisma.requirementOptionGroup.create({
    data: {
      ruleId: coreRule.id,
      title: "Core courses",
      minSelect: 2,
      maxSelect: 2,
      optionCourseCodes: ["DATA C8", "DATA C100"],
      optionTags: [],
      optionDepartmentCodes: ["DATA"],
      sourceRefText: "Official Berkeley Data Science major page",
      displayOrder: 1
    }
  });

  const csSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["CS-BA"].id,
      sourceId: sources[1].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Expanded Berkeley Computer Science major core mapping for planner and social recommendation workflows."
    }
  });

  const csCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: csSet.id,
        title: "Lower Division Core",
        slug: "lower-division-core",
        description: "Required lower-division programming, data structures, and discrete math sequence.",
        minCourses: 4,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: csSet.id,
        title: "Upper Division Theory and AI",
        slug: "upper-division-theory-and-ai",
        description: "Representative upper-division sequence for algorithms and intelligent systems.",
        minCourses: 2,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: csCategories[0].id,
        ruleType: RequirementRuleType.REQUIRED_COURSE,
        title: "Complete the lower-division CS core",
        description: "Representative Berkeley CS core sequence for planning and progress tracking.",
        courseCodes: ["COMPSCI 61A", "COMPSCI 61B", "COMPSCI 70", "MATH 55"],
        allowedDepartmentCodes: ["COMPSCI", "MATH"],
        allowedTags: ["cs-core", "proofs"],
        sourceRefText: "Official Berkeley Computer Science major page",
        displayOrder: 1
      },
      {
        categoryId: csCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Choose 2 upper-division depth courses",
        description: "Sample depth mapping that captures theory and AI pathways.",
        minSelect: 2,
        courseCodes: ["COMPSCI 170", "COMPSCI 188", "COMPSCI 162", "COMPSCI 186", "COMPSCI 169A"],
        allowedDepartmentCodes: ["COMPSCI"],
        allowedTags: ["cs-upperdiv", "ai", "algorithms", "systems", "data-systems", "software", "project-heavy"],
        sourceRefText: "Official Berkeley Computer Science major page",
        displayOrder: 1
      }
    ]
  });

  const cognitiveScienceSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["COGSCI-BA"].id,
      sourceId: sources[8].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Representative cognitive science mapping across intro, core theory, computation, and mind-science electives."
    }
  });

  const cognitiveScienceCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: cognitiveScienceSet.id,
        title: "Introductory and Core Theory",
        slug: "introductory-and-core-theory",
        description: "Foundational cognitive science entrypoints and shared upper-division theory survey.",
        minCourses: 2,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: cognitiveScienceSet.id,
        title: "Computation and Mind",
        slug: "computation-and-mind",
        description: "Computational and psychological depth options used in many cognitive science plans.",
        minCourses: 2,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: cognitiveScienceCategories[0].id,
        ruleType: RequirementRuleType.REQUIRED_COURSE,
        title: "Complete the introductory cognitive science sequence",
        description: "Seeded interdisciplinary cognitive science core for planner and compare workflows.",
        courseCodes: ["COGSCI 1", "COGSCI C100"],
        allowedDepartmentCodes: ["COGSCI"],
        allowedTags: ["cogsci-foundation", "cogsci-core"],
        sourceRefText: "UC Berkeley Cognitive Science department site",
        displayOrder: 1
      },
      {
        categoryId: cognitiveScienceCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Choose 2 computational or mind-science depth courses",
        description: "Representative upper-division interdisciplinary breadth across cognition, computation, and quantitative methods.",
        minSelect: 2,
        courseCodes: ["COGSCI 131", "COGSCI 132", "COGSCI 140", "COMPSCI 61A", "DATA C8", "STAT 20"],
        allowedDepartmentCodes: ["COGSCI", "COMPSCI", "DATA", "STAT"],
        allowedTags: ["cogsci-upperdiv", "ai", "psychology", "programming", "statistics-foundation"],
        sourceRefText: "UC Berkeley Cognitive Science department site",
        displayOrder: 1
      }
    ]
  });

  const economicsSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["ECON-BA"].id,
      sourceId: sources[9].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Representative economics mapping across intro preparation, intermediate theory, and empirical methods."
    }
  });

  const economicsCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: economicsSet.id,
        title: "Preparation and Introductory Economics",
        slug: "preparation-and-introductory-economics",
        description: "Lower-division economics and quantitative preparation before upper-division theory.",
        minCourses: 2,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: economicsSet.id,
        title: "Intermediate Theory and Econometrics",
        slug: "intermediate-theory-and-econometrics",
        description: "Representative upper-division theory and empirical methods sequence.",
        minCourses: 3,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: economicsCategories[0].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete economics and quantitative preparation",
        description: "Seeded preparation sequence for economics planning and recommendation logic.",
        minSelect: 2,
        courseCodes: ["ECON 1", "MATH 53", "STAT 20"],
        allowedDepartmentCodes: ["ECON", "MATH", "STAT"],
        allowedTags: ["econ-foundation", "calculus", "statistics-foundation"],
        sourceRefText: "UC Berkeley Economics department site",
        displayOrder: 1
      },
      {
        categoryId: economicsCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete intermediate theory and econometrics",
        description: "Representative economics core of micro, macro, and econometrics.",
        minSelect: 3,
        courseCodes: ["ECON 100A", "ECON 100B", "ECON 136", "ECON 140"],
        allowedDepartmentCodes: ["ECON"],
        allowedTags: ["econ-upperdiv", "macro", "econometrics", "finance"],
        sourceRefText: "UC Berkeley Economics department site",
        displayOrder: 1
      }
    ]
  });

  const statisticsSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["STAT-BA"].id,
      sourceId: sources[10].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Representative statistics major mapping across probability, inference, computing, and stochastic modeling."
    }
  });

  const statisticsCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: statisticsSet.id,
        title: "Probability and Inference Core",
        slug: "probability-and-inference-core",
        description: "Shared mathematical statistics backbone before advanced electives.",
        minCourses: 3,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: statisticsSet.id,
        title: "Computing and Applied Modeling",
        slug: "computing-and-applied-modeling",
        description: "Representative computing and modeling choices for data-forward statistics plans.",
        minCourses: 2,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: statisticsCategories[0].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete the probability and inference core",
        description: "Representative sequence for mathematical statistics preparation.",
        minSelect: 3,
        courseCodes: ["STAT 134", "STAT 135", "DATA 140", "MATH 54"],
        allowedDepartmentCodes: ["STAT", "DATA", "MATH"],
        allowedTags: ["statistics-foundation", "inference", "probability", "math-foundation"],
        sourceRefText: "UC Berkeley Statistics department site",
        displayOrder: 1
      },
      {
        categoryId: statisticsCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Choose 2 computing or modeling depth courses",
        description: "Sample advanced depth in statistical computing, stochastic modeling, and time series.",
        minSelect: 2,
        courseCodes: ["STAT 133", "STAT 150", "STAT 151A", "STAT 154", "DATA 144", "DATA 102"],
        allowedDepartmentCodes: ["STAT", "DATA"],
        allowedTags: ["statistics-core", "statistics-upperdiv", "statistics-elective", "data-elective", "data-systems", "machine-learning", "inference"],
        sourceRefText: "UC Berkeley Statistics department site",
        displayOrder: 1
      }
    ]
  });

  const physicsSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["PHYS-BA"].id,
      sourceId: sources[11].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Representative physics major mapping across the lower-division sequence and upper-division quantum depth."
    }
  });

  const physicsCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: physicsSet.id,
        title: "Lower-Division Physics Sequence",
        slug: "lower-division-physics-sequence",
        description: "Mechanics, electromagnetism, and modern physics preparation.",
        minCourses: 5,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: physicsSet.id,
        title: "Upper-Division Theory Depth",
        slug: "upper-division-theory-depth",
        description: "Representative advanced theory coverage for quantum and mathematical physics planning.",
        minCourses: 2,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: physicsCategories[0].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete the lower-division physics and math sequence",
        description: "Representative lower-division path for physics majors and adjacent engineering-heavy plans.",
        minSelect: 5,
        courseCodes: ["PHYSICS 7A", "PHYSICS 7B", "PHYSICS 7C", "MATH 53", "MATH 54"],
        allowedDepartmentCodes: ["PHYSICS", "MATH"],
        allowedTags: ["physics-foundation", "engineering-foundation", "calculus", "electricity-magnetism", "modern-physics"],
        sourceRefText: "UC Berkeley Physics department site",
        displayOrder: 1
      },
      {
        categoryId: physicsCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Choose 2 upper-division theory courses",
        description: "Representative upper-division physics depth with quantum and mathematical preparation.",
        minSelect: 2,
        courseCodes: ["PHYSICS 137A", "PHYSICS 111A", "MATH 110", "STAT 134"],
        allowedDepartmentCodes: ["PHYSICS", "MATH", "STAT"],
        allowedTags: ["physics-upperdiv", "quantum", "proofs", "probability", "lab"],
        sourceRefText: "UC Berkeley Physics department site",
        displayOrder: 1
      }
    ]
  });

  const businessSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["BUS-BA"].id,
      sourceId: sources[2].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Expanded Haas business mapping with prerequisites and core coursework."
    }
  });

  const businessCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: businessSet.id,
        title: "Preparation",
        slug: "preparation",
        description: "Lower-division preparation used by many intended business students.",
        minCourses: 3,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: businessSet.id,
        title: "Core Business Courses",
        slug: "core-business-courses",
        description: "Representative Haas core coverage for communications, accounting, and finance.",
        minCourses: 3,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: businessCategories[0].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete business preparation",
        description: "Seeded preparation subset for schedule planning and recommendation fit.",
        minSelect: 3,
        courseCodes: ["UGBA 10", "MATH 54", "STAT 20", "ECON 1", "MATH 53"],
        allowedDepartmentCodes: ["UGBA", "MATH", "STAT"],
        allowedTags: ["business-prereq", "statistics-foundation", "econ-foundation", "calculus"],
        sourceRefText: "Official Berkeley Business Administration major page",
        displayOrder: 1
      },
      {
        categoryId: businessCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete core business sequence",
        description: "Sample upper-division Haas core sequence.",
        minSelect: 3,
        courseCodes: ["UGBA 100", "UGBA 101A", "UGBA 102A", "UGBA 103", "UGBA 104"],
        allowedDepartmentCodes: ["UGBA"],
        allowedTags: ["business-core", "finance", "accounting", "leadership", "analytics"],
        sourceRefText: "Official Berkeley Business Administration major page",
        displayOrder: 1
      }
    ]
  });

  const ibSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["IB-BA"].id,
      sourceId: sources[3].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Expanded Integrative Biology mapping with lower-division and sample upper-division emphasis coverage."
    }
  });

  const ibCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: ibSet.id,
        title: "Lower Division Preparation",
        slug: "lower-division-preparation",
        description: "Foundational biology and quantitative preparation sample set.",
        minCourses: 2,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: ibSet.id,
        title: "Upper Division Organismal and Health Study",
        slug: "upper-division-organismal-health",
        description: "Sample upper-division emphasis options for biology planning.",
        minCourses: 2,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: ibCategories[0].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete lower-division preparation",
        description: "Representative preparation subset included in the MVP data model.",
        minSelect: 2,
        courseCodes: ["IB 35AC", "STAT 20", "MATH 53", "PHYSICS 7A"],
        allowedDepartmentCodes: ["IB", "STAT", "MATH", "PHYSICS"],
        allowedTags: ["ib-lower", "statistics-foundation", "calculus", "physics-foundation"],
        sourceRefText: "Official Berkeley Integrative Biology major page",
        displayOrder: 1
      },
      {
        categoryId: ibCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Choose 2 upper-division IB courses",
        description: "Sample emphasis-level options for organismal and human health interests.",
        minSelect: 2,
        courseCodes: ["IB 131", "IB C77", "IB 150"],
        allowedDepartmentCodes: ["IB"],
        allowedTags: ["ib-upperdiv"],
        sourceRefText: "Official Berkeley Integrative Biology major page",
        displayOrder: 1
      }
    ]
  });

  const dataMinorSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["DATA-MIN"].id,
      sourceId: sources[5].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Expanded data science minor mapping for non-majors combining foundations, core, and an elective."
    }
  });

  const dataMinorCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: dataMinorSet.id,
        title: "Foundation",
        slug: "foundation",
        description: "Baseline computing and statistics preparation.",
        minCourses: 2,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: dataMinorSet.id,
        title: "Core and Elective",
        slug: "core-and-elective",
        description: "Minor core plus one approved upper-division follow-on.",
        minCourses: 2,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: dataMinorCategories[0].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete programming and statistics preparation",
        description: "Representative foundation coverage for the data science minor.",
        minSelect: 2,
        courseCodes: ["DATA C8", "COMPSCI 61A", "STAT 20", "STAT 134"],
        allowedDepartmentCodes: ["DATA", "COMPSCI", "STAT"],
        allowedTags: ["data-foundation", "statistics-foundation", "programming"],
        sourceRefText: "Official Berkeley Data Science minor page",
        displayOrder: 1
      },
      {
        categoryId: dataMinorCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete the core and one elective",
        description: "Minor progression from the common core into one upper-division application area.",
        minSelect: 2,
        courseCodes: ["DATA C100", "DATA C104", "DATA 144", "DATA 140", "DATA 101", "DATA 102"],
        allowedDepartmentCodes: ["DATA"],
        allowedTags: ["data-core", "data-elective", "data-ethics", "probability", "data-systems", "inference"],
        sourceRefText: "Official Berkeley Data Science minor page",
        displayOrder: 1
      }
    ]
  });

  const mathMajorSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["MATH-BA"].id,
      sourceId: sources[6].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Representative mathematics BA mapping across lower-division proof preparation and upper-division quantitative depth."
    }
  });

  const mathMajorCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: mathMajorSet.id,
        title: "Lower-Division Preparation",
        slug: "lower-division-preparation",
        description: "Proof and calculus preparation before upper-division mathematics.",
        minCourses: 3,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: mathMajorSet.id,
        title: "Upper-Division Depth",
        slug: "upper-division-depth",
        description: "Representative upper-division mathematics breadth and depth.",
        minCourses: 2,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: mathMajorCategories[0].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete lower-division mathematics preparation",
        description: "Complete the core calculus and proof-oriented sequence.",
        minSelect: 3,
        courseCodes: ["MATH 53", "MATH 54", "MATH 55"],
        allowedDepartmentCodes: ["MATH"],
        allowedTags: ["math-foundation", "proofs", "calculus"],
        sourceRefText: "Official Berkeley Mathematics major page",
        displayOrder: 1
      },
      {
        categoryId: mathMajorCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Choose 2 upper-division quantitative depth courses",
        description: "Representative upper-division depth coursework for the mathematics BA.",
        minSelect: 2,
        courseCodes: ["MATH 104", "MATH 110", "STAT 134"],
        allowedDepartmentCodes: ["MATH", "STAT"],
        allowedTags: ["math-upperdiv", "statistics-foundation", "proofs", "analysis"],
        sourceRefText: "Official Berkeley Mathematics major page",
        displayOrder: 1
      }
    ]
  });

  const mathMinorSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["MATH-MIN"].id,
      sourceId: sources[7].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Seeded mathematics minor mapping for quantitative planning scenarios."
    }
  });

  const mathMinorCategory = await prisma.requirementCategory.create({
    data: {
      requirementSetId: mathMinorSet.id,
      title: "Quantitative Core",
      slug: "quantitative-core",
      description: "Representative proof and applied linear algebra requirement coverage.",
      minCourses: 3,
      displayOrder: 1
    }
  });

  await prisma.requirementRule.create({
    data: {
      categoryId: mathMinorCategory.id,
      ruleType: RequirementRuleType.CHOOSE_N_COURSES,
      title: "Choose 3 mathematics core courses",
      description: "Sample quantitative sequence used to model cross-program overlap and planning.",
      minSelect: 3,
      courseCodes: ["MATH 53", "MATH 54", "MATH 55", "MATH 104", "MATH 110", "STAT 20", "STAT 134"],
      allowedDepartmentCodes: ["MATH", "STAT"],
      allowedTags: ["math-foundation", "proofs", "statistics-foundation", "math-upperdiv", "calculus", "analysis"],
      sourceRefText: "Official Berkeley Mathematics page",
      displayOrder: 1
    }
  });

  const csMinorSet = await prisma.programRequirementSet.create({
    data: {
      programId: program["CS-MIN"].id,
      sourceId: sources[4].id,
      versionLabel: "2025-26",
      effectiveFrom: new Date("2025-08-20T00:00:00.000Z"),
      isActive: true,
      notes: "Seven-course CS minor mapping with lower-division preparation and upper-division technical electives."
    }
  });

  const csMinorCategories = await Promise.all([
    prisma.requirementCategory.create({
      data: {
        requirementSetId: csMinorSet.id,
        title: "Lower-Division Core",
        slug: "lower-division-core",
        description: "Foundational CS minor coursework before upper-division technical classes.",
        minCourses: 4,
        displayOrder: 1
      }
    }),
    prisma.requirementCategory.create({
      data: {
        requirementSetId: csMinorSet.id,
        title: "Upper-Division Technical Courses",
        slug: "upper-division-technical-courses",
        description: "Three upper-division technical electives from the approved list.",
        minCourses: 3,
        displayOrder: 2
      }
    })
  ]);

  await prisma.requirementRule.createMany({
    data: [
      {
        categoryId: csMinorCategories[0].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Complete the CS minor lower-division sequence",
        description: "Representative lower-division sequence for the Berkeley CS minor.",
        minSelect: 4,
        courseCodes: ["COMPSCI 61A", "COMPSCI 61B", "COMPSCI 70", "MATH 55"],
        allowedDepartmentCodes: ["COMPSCI", "MATH"],
        allowedTags: ["cs-core", "proofs"],
        sourceRefText: "Official Berkeley Computer Science minor page",
        displayOrder: 1
      },
      {
        categoryId: csMinorCategories[1].id,
        ruleType: RequirementRuleType.CHOOSE_N_COURSES,
        title: "Choose 3 upper-division technical courses",
        description: "Representative upper-division technical depth for the Berkeley CS minor.",
        minSelect: 3,
        courseCodes: ["COMPSCI 170", "COMPSCI 188", "COMPSCI 162", "COMPSCI 186", "COMPSCI 169A"],
        allowedDepartmentCodes: ["COMPSCI"],
        allowedTags: ["cs-upperdiv", "algorithms", "ai", "systems", "software", "project-heavy"],
        sourceRefText: "Official Berkeley Computer Science minor page",
        displayOrder: 1
      }
    ]
  });

  const mockUser = await prisma.user.create({
    data: {
      schoolId: berkeley.id,
      email: "student@berkeley.edu",
      name: "Alex Student",
      authProvider: AuthProviderType.BERKELEY_MOCK,
      role: UserRole.ADMIN
    }
  });

  await prisma.userProgramSelection.create({
    data: {
      userId: mockUser.id,
      programId: program["DATA-BA"].id,
      selectionType: ProgramSelectionType.PRIMARY_MAJOR,
      isPrimary: true
    }
  });

  await prisma.userProgramSelection.create({
    data: {
      userId: mockUser.id,
      programId: program["DATA-MIN"].id,
      selectionType: ProgramSelectionType.MINOR,
      isPrimary: false
    }
  });

  await prisma.authAccount.create({
    data: {
      userId: mockUser.id,
      provider: AuthProviderType.BERKELEY_MOCK,
      providerAccountId: "student@berkeley.edu"
    }
  });

  await prisma.userCourseHistory.createMany({
    data: [
      { userId: mockUser.id, courseId: course["COMPSCI 61A"].id, termId: term["2024-FALL"].id, status: CourseHistoryStatus.COMPLETED, grade: "A-", units: 4 },
      { userId: mockUser.id, courseId: course["DATA C8"].id, termId: term["2025-SPRING"].id, status: CourseHistoryStatus.COMPLETED, grade: "A", units: 4 },
      { userId: mockUser.id, courseId: course["STAT 20"].id, termId: term["2025-SUMMER"].id, status: CourseHistoryStatus.IN_PROGRESS, units: 4 }
    ]
  });

  const plan = await prisma.userPlan.create({
    data: {
      userId: mockUser.id,
      schoolId: berkeley.id,
      title: "4-Year Graduation Plan",
      catalogYear: "2025-26",
      isPrimary: true,
      notes: "Seeded sample plan for planner UX."
    }
  });

  const semester1 = await prisma.plannedSemester.create({
    data: { planId: plan.id, label: "Fall Year 2", yearIndex: 2, season: TermSeason.FALL, unitsTarget: 15, sortOrder: 1 }
  });

  const semester2 = await prisma.plannedSemester.create({
    data: { planId: plan.id, label: "Spring Year 2", yearIndex: 2, season: TermSeason.SPRING, unitsTarget: 16, sortOrder: 2 }
  });

  await prisma.plannedCourse.createMany({
    data: [
      { semesterId: semester1.id, courseId: course["COMPSCI 61B"].id, plannedTermId: term["2025-FALL"].id, status: PlanCourseStatus.PLANNED, notes: "Needed for CS/Data progression." },
      { semesterId: semester1.id, courseId: course["MATH 54"].id, plannedTermId: term["2025-FALL"].id, status: PlanCourseStatus.PLANNED },
      { semesterId: semester1.id, courseId: course["UGBA 10"].id, plannedTermId: term["2025-FALL"].id, status: PlanCourseStatus.PLANNED, notes: "Exploring Haas-compatible breadth and business preparation." },
      { semesterId: semester2.id, courseId: course["DATA C100"].id, plannedTermId: term["2025-SPRING"].id, status: PlanCourseStatus.PLANNED, notes: "Take after completing CS 61B and core prep." },
      { semesterId: semester2.id, courseId: course["DATA C104"].id, plannedTermId: term["2025-SPRING"].id, status: PlanCourseStatus.PLANNED, notes: "Ethics requirement and lighter conceptual pairing." }
    ]
  });

  await prisma.userFavoriteCourse.createMany({
    data: [
      { userId: mockUser.id, courseId: course["COMPSCI 61B"].id },
      { userId: mockUser.id, courseId: course["DATA C100"].id }
    ]
  });

  await prisma.userPrivacySettings.create({
    data: {
      userId: mockUser.id,
      showMajorsToFriends: true,
      showPlansToFriends: true,
      showSchedulesToFriends: true,
      shareProfileWithFriends: true,
      allowCoursePlanComparison: true,
      messagePermission: MessagePermission.FRIENDS_ONLY
    }
  });

  const maya = await prisma.user.create({
    data: {
      schoolId: berkeley.id,
      email: "maya@berkeley.edu",
      name: "Maya Chen",
      authProvider: AuthProviderType.EMAIL
    }
  });

  const jordan = await prisma.user.create({
    data: {
      schoolId: berkeley.id,
      email: "jordan@berkeley.edu",
      name: "Jordan Patel",
      authProvider: AuthProviderType.EMAIL
    }
  });

  const zoe = await prisma.user.create({
    data: {
      schoolId: berkeley.id,
      email: "zoe@berkeley.edu",
      name: "Zoe Ramirez",
      authProvider: AuthProviderType.EMAIL
    }
  });

  const lucas = await prisma.user.create({
    data: {
      schoolId: berkeley.id,
      email: "lucas@berkeley.edu",
      name: "Lucas Nguyen",
      authProvider: AuthProviderType.EMAIL
    }
  });

  await prisma.userPrivacySettings.createMany({
    data: [
      {
        userId: maya.id,
        showMajorsToFriends: true,
        showPlansToFriends: true,
        showSchedulesToFriends: true,
        shareProfileWithFriends: true,
        allowCoursePlanComparison: true,
        messagePermission: MessagePermission.FRIENDS_ONLY
      },
      {
        userId: jordan.id,
        showMajorsToFriends: true,
        showPlansToFriends: true,
        showSchedulesToFriends: false,
        shareProfileWithFriends: true,
        allowCoursePlanComparison: true,
        messagePermission: MessagePermission.FRIENDS_ONLY
      },
      {
        userId: zoe.id,
        showMajorsToFriends: true,
        showPlansToFriends: false,
        showSchedulesToFriends: false,
        shareProfileWithFriends: true,
        allowCoursePlanComparison: false,
        messagePermission: MessagePermission.FRIENDS_ONLY
      },
      {
        userId: lucas.id,
        showMajorsToFriends: true,
        showPlansToFriends: true,
        showSchedulesToFriends: true,
        shareProfileWithFriends: true,
        allowCoursePlanComparison: true,
        messagePermission: MessagePermission.FRIENDS_ONLY
      }
    ]
  });

  await prisma.userProgramSelection.createMany({
    data: [
      { userId: maya.id, programId: program["DATA-BA"].id, selectionType: ProgramSelectionType.PRIMARY_MAJOR, isPrimary: true },
      { userId: jordan.id, programId: program["CS-BA"].id, selectionType: ProgramSelectionType.PRIMARY_MAJOR, isPrimary: true },
      { userId: jordan.id, programId: program["MATH-MIN"].id, selectionType: ProgramSelectionType.MINOR, isPrimary: false },
      { userId: zoe.id, programId: program["BUS-BA"].id, selectionType: ProgramSelectionType.PRIMARY_MAJOR, isPrimary: true },
      { userId: zoe.id, programId: program["DATA-MIN"].id, selectionType: ProgramSelectionType.MINOR, isPrimary: false },
      { userId: lucas.id, programId: program["IB-BA"].id, selectionType: ProgramSelectionType.PRIMARY_MAJOR, isPrimary: true }
    ]
  });

  const mayaPlan = await prisma.userPlan.create({
    data: {
      userId: maya.id,
      schoolId: berkeley.id,
      title: "Sophomore Spring Plan",
      catalogYear: "2025-26",
      isPrimary: true,
      visibility: PlanVisibility.FRIENDS_ONLY
    }
  });

  const mayaSemester = await prisma.plannedSemester.create({
    data: {
      planId: mayaPlan.id,
      label: "Spring Year 2",
      yearIndex: 2,
      season: TermSeason.SPRING,
      unitsTarget: 16,
      sortOrder: 1
    }
  });

  await prisma.plannedCourse.createMany({
    data: [
      { semesterId: mayaSemester.id, courseId: course["DATA C100"].id, plannedTermId: term["2025-SPRING"].id, status: PlanCourseStatus.PLANNED },
      { semesterId: mayaSemester.id, courseId: course["COMPSCI 61B"].id, plannedTermId: term["2025-SPRING"].id, status: PlanCourseStatus.PLANNED }
    ]
  });

  const jordanPlan = await prisma.userPlan.create({
    data: {
      userId: jordan.id,
      schoolId: berkeley.id,
      title: "Systems and Theory Track",
      catalogYear: "2025-26",
      isPrimary: true,
      visibility: PlanVisibility.FRIENDS_ONLY
    }
  });

  const jordanSemester = await prisma.plannedSemester.create({
    data: {
      planId: jordanPlan.id,
      label: "Fall Year 3",
      yearIndex: 3,
      season: TermSeason.FALL,
      unitsTarget: 15,
      sortOrder: 1
    }
  });

  await prisma.plannedCourse.createMany({
    data: [
      { semesterId: jordanSemester.id, courseId: course["COMPSCI 170"].id, plannedTermId: term["2025-SPRING"].id, status: PlanCourseStatus.PLANNED },
      { semesterId: jordanSemester.id, courseId: course["COMPSCI 188"].id, plannedTermId: term["2025-FALL"].id, status: PlanCourseStatus.PLANNED },
      { semesterId: jordanSemester.id, courseId: course["MATH 55"].id, plannedTermId: term["2025-FALL"].id, status: PlanCourseStatus.COMPLETED }
    ]
  });

  const lucasPlan = await prisma.userPlan.create({
    data: {
      userId: lucas.id,
      schoolId: berkeley.id,
      title: "IB Health and Physiology Plan",
      catalogYear: "2025-26",
      isPrimary: true,
      visibility: PlanVisibility.PUBLIC
    }
  });

  const lucasSemester = await prisma.plannedSemester.create({
    data: {
      planId: lucasPlan.id,
      label: "Spring Year 3",
      yearIndex: 3,
      season: TermSeason.SPRING,
      unitsTarget: 15,
      sortOrder: 1
    }
  });

  await prisma.plannedCourse.createMany({
    data: [
      { semesterId: lucasSemester.id, courseId: course["IB 131"].id, plannedTermId: term["2025-SPRING"].id, status: PlanCourseStatus.PLANNED },
      { semesterId: lucasSemester.id, courseId: course["IB C77"].id, plannedTermId: term["2025-FALL"].id, status: PlanCourseStatus.PLANNED }
    ]
  });

  await prisma.friendship.createMany({
    data: [
      { userAId: mockUser.id, userBId: maya.id },
      { userAId: mockUser.id, userBId: jordan.id },
      { userAId: maya.id, userBId: lucas.id }
    ]
  });

  await prisma.friendRequest.createMany({
    data: [
      {
        senderId: zoe.id,
        receiverId: mockUser.id,
        message: "Want to compare class plans for next semester."
      },
      {
        senderId: mockUser.id,
        receiverId: lucas.id,
        message: "Would love to compare biology breadth-friendly planning."
      }
    ]
  });

  const directThread = await prisma.messageThread.create({
    data: {
      type: ThreadType.DIRECT,
      title: "Maya Chen"
    }
  });

  await prisma.messageThreadParticipant.createMany({
    data: [
      { threadId: directThread.id, userId: mockUser.id },
      { threadId: directThread.id, userId: maya.id }
    ]
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: directThread.id,
        senderId: maya.id,
        body: "You should really look at DATA C100 next term."
      },
      {
        threadId: directThread.id,
        senderId: mockUser.id,
        body: "Can you share your plan layout for that semester?"
      }
    ]
  });

  const jordanThread = await prisma.messageThread.create({
    data: {
      type: ThreadType.DIRECT,
      title: "Jordan Patel"
    }
  });

  await prisma.messageThreadParticipant.createMany({
    data: [
      { threadId: jordanThread.id, userId: mockUser.id },
      { threadId: jordanThread.id, userId: jordan.id }
    ]
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: jordanThread.id,
        senderId: jordan.id,
        body: "CS 170 is manageable if you do not pair it with too many proof-heavy classes.",
        sharedCourseId: course["COMPSCI 170"].id
      },
      {
        threadId: jordanThread.id,
        senderId: mockUser.id,
        body: "I may stack it with DATA C100, still deciding."
      }
    ]
  });

  const reviewOne = await prisma.courseReview.create({
    data: {
      courseId: course["COMPSCI 61A"].id,
      userId: maya.id,
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
      tags: [CourseFeedbackTag.PROJECT_HEAVY, CourseFeedbackTag.CONCEPTUALLY_HARD, CourseFeedbackTag.GREAT_PROFESSOR],
      reasonTag: ReviewReasonTag.IMPORTANT_FOR_MAJOR,
      upvoteCount: 18
    }
  });

  await prisma.courseReview.create({
    data: {
      courseId: course["DATA C100"].id,
      userId: jordan.id,
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
      tags: [CourseFeedbackTag.PROJECT_HEAVY, CourseFeedbackTag.GREAT_PROFESSOR],
      reasonTag: ReviewReasonTag.IMPORTANT_FOR_MAJOR,
      upvoteCount: 11
    }
  });

  const reviewThree = await prisma.courseReview.create({
    data: {
      courseId: course["COMPSCI 170"].id,
      userId: jordan.id,
      title: "Fast-paced but one of the most useful theory classes",
      body: "The workload spikes around problem sets, but it makes upper-division CS feel much more connected.",
      difficultyRating: 4,
      workloadRating: 4,
      usefulnessRating: 5,
      recommendationRating: 5,
      averageWeeklyHours: 12,
      lecturesUseful: true,
      attendanceImportant: true,
      hardestPart: "NP-completeness proofs and approximation arguments",
      advice: "Keep a running sheet of algorithm patterns and proof techniques.",
      tags: [CourseFeedbackTag.CONCEPTUALLY_HARD, CourseFeedbackTag.TIME_CONSUMING, CourseFeedbackTag.GREAT_PROFESSOR],
      reasonTag: ReviewReasonTag.IMPORTANT_FOR_MAJOR,
      upvoteCount: 7
    }
  });

  await prisma.courseReview.create({
    data: {
      courseId: course["UGBA 100"].id,
      userId: zoe.id,
      title: "Helpful for presentations and team dynamics",
      body: "Lighter than the quantitative Haas classes, but the communication practice is very real and useful.",
      difficultyRating: 2,
      workloadRating: 3,
      usefulnessRating: 4,
      recommendationRating: 4,
      averageWeeklyHours: 6,
      lecturesUseful: true,
      attendanceImportant: true,
      hardestPart: "Keeping up with team deliverables",
      advice: "Pick a team early and stay organized on deadlines.",
      tags: [CourseFeedbackTag.ATTENDANCE_REQUIRED, CourseFeedbackTag.GREAT_PROFESSOR],
      reasonTag: ReviewReasonTag.USEFUL_ELECTIVE,
      upvoteCount: 5
    }
  });

  await prisma.courseReviewVote.createMany({
    data: [
      {
        reviewId: reviewOne.id,
        userId: mockUser.id,
        isHelpful: true
      },
      {
        reviewId: reviewThree.id,
        userId: maya.id,
        isHelpful: true
      }
    ]
  });

  const discussionPost = await prisma.courseDiscussionPost.create({
    data: {
      courseId: course["COMPSCI 61A"].id,
      userId: zoe.id,
      title: "Best way to prep before week 1?",
      body: "I have not coded much before. What should I review before classes start?",
      upvoteCount: 9
    }
  });

  await prisma.courseDiscussionComment.create({
    data: {
      postId: discussionPost.id,
      userId: maya.id,
      body: "Practice basic Python and get comfortable reading recursive code examples slowly.",
      upvoteCount: 6
    }
  });

  const cs170Post = await prisma.courseDiscussionPost.create({
    data: {
      courseId: course["COMPSCI 170"].id,
      userId: jordan.id,
      title: "Best prep before algorithms starts?",
      body: "Would reviewing graph traversals and induction ahead of week one make the semester smoother?",
      upvoteCount: 5
    }
  });

  await prisma.courseDiscussionComment.createMany({
    data: [
      {
        postId: cs170Post.id,
        userId: mockUser.id,
        body: "Revisiting proofs from MATH 55 helped me more than trying to speedrun a whole algorithms textbook.",
        upvoteCount: 3
      },
      {
        postId: cs170Post.id,
        userId: maya.id,
        body: "Yes, especially induction, asymptotic notation, and graph basics.",
        upvoteCount: 2
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
