export type OfficialRequirementAudit = {
  programSlug: string;
  officialSourceUrl: string;
  officialSourceLabel: string;
  sourceBackedSummary: string;
  lowerDivision: string[];
  upperDivision: string[];
  electives: string[];
  unitAndOverlapRules: string[];
  advisingNotes: string[];
};

export const officialRequirementAudits: OfficialRequirementAudit[] = [
  {
    programSlug: "ucb-data-science-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A50AMU",
    officialSourceLabel: "UC Berkeley Catalog - Data Science BA",
    sourceBackedSummary:
      "Official Berkeley Data Science major requirements organize the major around lower-division foundations, core upper-division data science work, domain emphasis choices, human contexts/ethics, and major-specific unit rules.",
    lowerDivision: [
      "Programming and computational foundations such as COMPSCI 61A / approved equivalent pathways",
      "Mathematics and linear algebra preparation such as MATH 54 and related lower-division math/statistics work",
      "Introductory data science foundation such as DATA C8"
    ],
    upperDivision: [
      "Core upper-division data science courses such as DATA C100",
      "Domain emphasis or approved upper-division pathway selections",
      "Human contexts / ethics requirement such as DATA C104 or approved alternatives"
    ],
    electives: [
      "Approved domain emphasis courses",
      "Approved upper-division electives depending on the chosen domain"
    ],
    unitAndOverlapRules: [
      "Students should verify total unit minimums and overlap limits against the official major page and current college rules.",
      "Upper-division overlap rules should remain configurable in the planning engine."
    ],
    advisingNotes: [
      "Take programming and math foundations early so DATA C100 and upper-division work unlock on time.",
      "Do not treat projected future offerings as guaranteed; use the official class schedule when it becomes available."
    ]
  },
  {
    programSlug: "ucb-computer-science-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A5201U",
    officialSourceLabel: "UC Berkeley Catalog - Computer Science BA",
    sourceBackedSummary:
      "Official Berkeley Computer Science BA requirements separate lower-division core preparation from upper-division technical course planning and enforce technical-course and overlap constraints.",
    lowerDivision: [
      "COMPSCI 61A",
      "COMPSCI 61B",
      "COMPSCI 70"
    ],
    upperDivision: [
      "Upper-division technical computer science courses of 3+ units taken for a letter grade",
      "Major planning should emphasize technical breadth while respecting the official list of non-counting seminar/independent-study style courses"
    ],
    electives: [
      "Approved upper-division technical electives",
      "Track-style selections chosen around systems, theory, AI, graphics, security, or related interests"
    ],
    unitAndOverlapRules: [
      "Official guidance limits overlap between majors/minors and requires technical courses for the major.",
      "Students must maintain the required GPA across lower- and upper-division major courses."
    ],
    advisingNotes: [
      "61A, 61B, and 70 are the key gating sequence for the major; delays here ripple across every later semester.",
      "Course numbering alone is not enough; the advising layer should flag upper-division courses that do not count as technical major credit."
    ]
  },
  {
    programSlug: "ucb-business-administration-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/70141U",
    officialSourceLabel: "UC Berkeley Catalog - Business Administration BS",
    sourceBackedSummary:
      "Official Berkeley Haas requirements emphasize upper-division business coursework, non-business upper-division breadth, and a four-semester completion model once in the program.",
    lowerDivision: [
      "Pre-major / application preparation courses and prerequisites should be planned before admission timing windows",
      "UGBA 10 is a useful planning anchor in the current MVP sample"
    ],
    upperDivision: [
      "A minimum of 38 upper-division business units",
      "Core Haas upper-division coursework completed within the major sequence"
    ],
    electives: [
      "Upper-division business electives",
      "Non-business upper-division coursework needed to satisfy official breadth/unit expectations"
    ],
    unitAndOverlapRules: [
      "Official guide calls for at least 12 upper-division non-business units.",
      "Students complete the degree in four semesters, excluding summer."
    ],
    advisingNotes: [
      "Haas planning is sequencing-sensitive once admitted, so plan entry timing alongside prerequisite completion.",
      "Reserved-seat and demand risk matter more for some business courses than the catalog alone suggests."
    ]
  },
  {
    programSlug: "ucb-integrative-biology-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25975U",
    officialSourceLabel: "UC Berkeley Catalog - Integrative Biology BA",
    sourceBackedSummary:
      "Official Berkeley Integrative Biology guidance uses shared lower-division requirements for both emphases, then emphasis-specific upper-division grouping plus lab/field expectations and unit minimums.",
    lowerDivision: [
      "Shared lower-division biology, chemistry, mathematics, and statistics foundations",
      "One of INTEGBI 77A or 77B by declaration timing"
    ],
    upperDivision: [
      "Upper-division lecture and lab/field-lab courses from the official IB groups",
      "Emphasis-specific upper-division group requirements for Ecology, Evolution, and Organismal Biology or Integrative Human Biology"
    ],
    electives: [
      "Approved IB electives and research/honors credit where allowed",
      "Additional approved upper-division work needed to meet the 24 upper-division unit minimum inside the major structure"
    ],
    unitAndOverlapRules: [
      "Official guidance calls for at least 24 upper-division units within the major structure.",
      "Official overlap guidance limits major/minor and double-major overlap."
    ],
    advisingNotes: [
      "The upper-division plan should explicitly show Group A/B/C and lab coverage so students can see gaps quickly.",
      "Field-lab expectations differ by emphasis and should be called out clearly in the advising UI."
    ]
  },
  {
    programSlug: "ucb-data-science-minor",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A5I172U",
    officialSourceLabel: "UC Berkeley Catalog - Data Science Minor",
    sourceBackedSummary:
      "Official Berkeley Data Science minor guidance centers the minor on foundational computing and statistics preparation, then layers upper-division data science coursework plus approved contextual or elective choices.",
    lowerDivision: [
      "Lower-division preparation in programming and data/statistics foundations such as COMPSCI 61A, DATA C8, or approved equivalents",
      "Quantitative preparation should be finished early so upper-division data science courses stay schedulable"
    ],
    upperDivision: [
      "Upper-division data science coursework such as DATA C100",
      "Approved ethics or applied upper-division follow-on coursework depending on the official pathway language"
    ],
    electives: [
      "Approved upper-division data science electives",
      "Contextual courses that support the student's home major without breaking overlap constraints"
    ],
    unitAndOverlapRules: [
      "Students should verify overlap limits between the minor and their home major using the current official catalog page.",
      "Minor planning should still respect letter-grade and residency rules from the official source."
    ],
    advisingNotes: [
      "The minor is easiest to complete when DATA C8 and programming preparation are done before heavy upper-division semesters.",
      "Use the planning layer to avoid stacking all minor courses into a single project-heavy term."
    ]
  },
  {
    programSlug: "ucb-mathematics-minor",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25I071U",
    officialSourceLabel: "UC Berkeley Catalog - Mathematics Minor",
    sourceBackedSummary:
      "Official Berkeley mathematics minor guidance emphasizes proof-oriented and quantitative depth through lower- and upper-division mathematics coursework, with overlap and grade constraints that matter for double-counting scenarios.",
    lowerDivision: [
      "Proof-oriented preparation such as MATH 55 or approved equivalents",
      "Linear algebra and related quantitative foundations such as MATH 54"
    ],
    upperDivision: [
      "Upper-division mathematics coursework selected from approved offerings",
      "Minor planning should separate proof-heavy and computation-heavy courses across terms when possible"
    ],
    electives: [
      "Approved mathematics and related quantitative electives",
      "Statistics-linked electives when the official catalog language allows them"
    ],
    unitAndOverlapRules: [
      "Students should confirm overlap restrictions between the mathematics minor and majors/minors in data science, statistics, or computer science.",
      "Letter-grade expectations and any residency requirements should remain configurable in the advising layer."
    ],
    advisingNotes: [
      "A mathematics minor works best when proof foundations are completed before upper-division technical planning gets crowded.",
      "The planner should highlight where math minor requirements overlap productively with CS and data science foundations."
    ]
  },
  {
    programSlug: "ucb-computer-science-minor",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/16I011U",
    officialSourceLabel: "UC Berkeley Catalog - Computer Science Minor",
    sourceBackedSummary:
      "Official Berkeley Computer Science minor guidance organizes the minor around a seven-course sequence with lower-division preparation, upper-division technical work, GPA expectations, and overlap limits with the student's major.",
    lowerDivision: [
      "Programming and systems foundations such as COMPSCI 61A and COMPSCI 61B",
      "Discrete mathematics / theory preparation such as COMPSCI 70 or approved supporting coursework",
      "Additional foundational quantitative work such as MATH 55 when used in the approved sequence"
    ],
    upperDivision: [
      "Upper-division technical computer science courses chosen from the approved EECS/CS list",
      "Minor planning should verify that upper-division choices satisfy the official technical-course expectations rather than just high-numbered course labels"
    ],
    electives: [
      "Approved upper-division technical electives in systems, AI, theory, databases, or security",
      "Minor electives should be selected to minimize overlap conflicts with the student's home major"
    ],
    unitAndOverlapRules: [
      "The official CS minor requires all seven courses for a passing letter grade and at least a 2.0 GPA across those courses.",
      "Official guidance allows only one upper-division course of overlap between the student's declared major and the CS minor."
    ],
    advisingNotes: [
      "The CS minor is most manageable when 61A, 61B, and the theory/proof requirement are completed before upper-division technical clustering starts.",
      "The planner should surface overlap risk early because the one-course upper-division overlap rule changes which electives are safe to use."
    ]
  },
  {
    programSlug: "ucb-mathematics-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25540U",
    officialSourceLabel: "UC Berkeley Catalog - Mathematics BA",
    sourceBackedSummary:
      "Official Berkeley Mathematics BA guidance combines lower-division calculus and proof preparation with upper-division breadth and depth, and it supports planning toward honors or a teaching concentration.",
    lowerDivision: [
      "Core lower-division preparation such as MATH 53, MATH 54, and MATH 55",
      "Proof-oriented preparation should be completed early because it gates many upper-division mathematics courses"
    ],
    upperDivision: [
      "Upper-division mathematics courses such as linear algebra and approved analysis, algebra, or applied mathematics pathways",
      "Major planning should distinguish general major completion from honors or concentration-specific expectations"
    ],
    electives: [
      "Approved upper-division mathematics electives",
      "Related quantitative electives that may support concentration-style planning when officially permitted"
    ],
    unitAndOverlapRules: [
      "Students should verify current upper-division unit minimums, residency rules, and any honors thresholds from the official mathematics major page.",
      "If a teaching concentration or honors route is intended, the advising layer should mark those additions separately from the base major."
    ],
    advisingNotes: [
      "Math major plans become much smoother once proof preparation is finished before the upper-division sequence begins.",
      "The planner should explicitly separate lower-division prep, core upper-division work, and optional honors/concentration paths so students do not confuse them."
    ]
  },
  {
    programSlug: "ucb-cognitive-science-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25175U",
    officialSourceLabel: "UC Berkeley Catalog - Cognitive Science BA",
    sourceBackedSummary:
      "Official Berkeley Cognitive Science guidance combines computing, psychology, linguistics, and neuroscience foundations with upper-division breadth across multiple approved pathways.",
    lowerDivision: [
      "Introductory cognitive science and computing foundations such as COGSCI 1 and COMPSCI 61A",
      "Supporting quantitative preparation in mathematics and statistics"
    ],
    upperDivision: [
      "Upper-division COGSCI courses and approved cross-listed electives",
      "Breadth across computation, cognition, and domain emphasis areas"
    ],
    electives: [
      "Approved upper-division electives from COGSCI, COMPSCI, DATA, and related departments",
      "Research or honors credit where officially permitted"
    ],
    unitAndOverlapRules: [
      "Students should verify overlap limits between COGSCI and related majors such as data science or computer science.",
      "Upper-division unit minimums and pathway requirements should be checked against the current catalog page."
    ],
    advisingNotes: [
      "COGSCI plans work best when computing and quantitative foundations are completed before upper-division breadth courses cluster together.",
      "Use the planner to avoid stacking project-heavy COGSCI and COMPSCI courses in the same term."
    ]
  },
  {
    programSlug: "ucb-economics-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25101U",
    officialSourceLabel: "UC Berkeley Catalog - Economics BA",
    sourceBackedSummary:
      "Official Berkeley Economics guidance emphasizes quantitative preparation, core micro/macro theory, econometrics, and upper-division field coursework.",
    lowerDivision: [
      "Introductory economics such as ECON 1",
      "Mathematics and statistics preparation supporting econometrics and upper-division theory"
    ],
    upperDivision: [
      "Core upper-division theory and econometrics sequences",
      "Field courses selected from approved upper-division economics offerings"
    ],
    electives: [
      "Approved upper-division economics electives",
      "Related quantitative electives when officially permitted"
    ],
    unitAndOverlapRules: [
      "Students should confirm overlap rules between economics and business, data science, or statistics pathways.",
      "Letter-grade and prerequisite sequencing requirements matter for econometrics placement."
    ],
    advisingNotes: [
      "Finish calculus and statistics preparation before attempting econometrics-heavy terms.",
      "Economics demand spikes in core theory courses, so spread quantitative and writing-heavy classes when possible."
    ]
  },
  {
    programSlug: "ucb-statistics-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25675U",
    officialSourceLabel: "UC Berkeley Catalog - Statistics BA",
    sourceBackedSummary:
      "Official Berkeley Statistics guidance builds probability and inference foundations, then layers upper-division statistical theory, computing, and applied modeling coursework.",
    lowerDivision: [
      "Introductory statistics such as STAT 20",
      "Calculus and linear algebra preparation such as MATH 53 and MATH 54"
    ],
    upperDivision: [
      "Probability and inference sequences such as STAT 134 and STAT 135",
      "Upper-division modeling, computing, and applied statistics courses"
    ],
    electives: [
      "Approved upper-division statistics electives",
      "Related data science or mathematics electives when officially permitted"
    ],
    unitAndOverlapRules: [
      "Students should verify overlap between statistics, data science, and mathematics requirements.",
      "Upper-division unit minimums and computing requirements should be checked against the current catalog page."
    ],
    advisingNotes: [
      "Probability preparation should be completed before upper-division inference-heavy semesters.",
      "Statistics majors benefit from spreading computing-intensive courses across terms."
    ]
  },
  {
    programSlug: "ucb-physics-major",
    officialSourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/25775U",
    officialSourceLabel: "UC Berkeley Catalog - Physics BA",
    sourceBackedSummary:
      "Official Berkeley Physics guidance sequences introductory mechanics and electromagnetism with mathematics preparation, then advances through upper-division core physics and laboratory work.",
    lowerDivision: [
      "Introductory physics sequence such as PHYSICS 7A, 7B, and 7C",
      "Mathematics preparation such as MATH 53 and MATH 54"
    ],
    upperDivision: [
      "Upper-division mechanics, electromagnetism, quantum, and laboratory courses",
      "Approved physics electives supporting research or applied interests"
    ],
    electives: [
      "Approved upper-division physics electives",
      "Related mathematics or engineering electives when officially permitted"
    ],
    unitAndOverlapRules: [
      "Students should verify laboratory and upper-division unit requirements against the current catalog page.",
      "Overlap with engineering or mathematics majors should be checked before double-counting courses."
    ],
    advisingNotes: [
      "Physics sequencing is rigid: delays in the 7-series or math prep push back every later term.",
      "Laboratory and problem-set heavy courses should not be stacked without considering weekly workload."
    ]
  }
];

export function getOfficialRequirementAudit(programSlug: string) {
  return officialRequirementAudits.find((audit) => audit.programSlug === programSlug);
}
