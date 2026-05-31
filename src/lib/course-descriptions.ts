/**
 * Extended catalog blurbs merged at read time so existing databases pick up richer copy without re-seeding.
 */
const extendedCourseDescriptions: Record<string, string> = {
  "COMPSCI 61A":
    "The Structure and Interpretation of Computer Programs introduces Berkeley students to programming through Python while emphasizing abstraction, recursion, and program design. Lectures and discussion sections build from small functions to larger projects, with weekly labs that stress debugging and style. The course is the gateway to the EECS and data science pipelines and pairs well with early math preparation. Students should expect a fast pace, collaborative lab culture, and exams that reward conceptual mastery over memorization.",
  "COMPSCI 61B":
    "Data Structures covers fundamental abstract data types, asymptotic analysis, and object-oriented design in Java. Projects implement structures such as lists, trees, and graphs while reinforcing software engineering practices like testing and encapsulation. The course bridges introductory programming and upper-division systems or algorithms classes. Plan for substantial weekly programming workload and start projects early to avoid end-of-term bottlenecks.",
  "COMPSCI 70":
    "Discrete Mathematics and Probability Theory builds the mathematical language used across computer science, from logic and proofs to counting and probability. Topics support later work in algorithms, cryptography, machine learning, and theory courses. Problem sets emphasize proof writing and precise reasoning. Strong algebra preparation helps; many students take this alongside COMPSCI 61B.",
  "DATA C8":
    "Foundations of Data Science introduces computational and statistical thinking using real-world datasets. Students work in Python with tabular data, visualization, and basic inference while learning to communicate results responsibly. The course satisfies quantitative reasoning breadth and opens the data science major pathway. Expect lab-heavy weeks and projects that mirror introductory data journalism or policy analysis workflows.",
  "DATA C100":
    "Principles and Techniques of Data Science extends inferential statistics, modeling, and computation for prediction and decision-making. Students implement methods in Python, interpret uncertainty, and critique ethical implications of data-driven systems. The class is a core requirement for data science majors and a common elective for EECS students. Prior comfort with probability, linear algebra, and programming is essential.",
  "DATA C104":
    "Human Contexts and Ethics in Data examines how data collection, analysis, and deployment shape society. Case studies span privacy, fairness, labor, and governance with writing assignments that connect technical choices to human impact. The course complements technical data classes and satisfies breadth expectations for interdisciplinary majors. Participation and reading load are meaningful—budget time beyond problem sets.",
  "COMPSCI 170":
    "Efficient Algorithms and Intractable Problems develops design techniques—divide and conquer, dynamic programming, greedy methods—and introduces complexity theory. Proof-based homework and challenging exams are standard. The course is central for theory-minded EECS students and competitive for graduate-school preparation. Start problem sets early and form study groups for exam review.",
  "COMPSCI 188":
    "Introduction to Artificial Intelligence surveys search, knowledge representation, learning, and planning with programming projects that ground concepts. Students connect classical AI ideas to modern machine learning pipelines. The class is popular for upper-division CS electives and data-focused minors. Projects and midterms reward both implementation skill and conceptual clarity.",
  "COMPSCI 162":
    "Operating Systems and Systems Programming explores processes, synchronization, memory, file systems, and distributed systems concepts through C-heavy projects. Labs often involve building kernel-adjacent components or simulators. Expect long debugging sessions and close reading of man pages. COMPSCI 61B and systems maturity are assumed.",
  "COMPSCI 186":
    "Introduction to Database Systems teaches relational modeling, SQL, indexing, transactions, and application design for data-intensive services. Projects typically build a database-backed application or query engine component. The course is essential for backend engineering paths and data platform roles. Comfort with Java or similar OO languages is common among enrollees.",
  "COMPSCI 169A":
    "Introduction to Software Engineering covers team processes, specifications, testing, and delivery of a substantial group project. Students practice version control, code review, and agile rituals used in industry internships. Communication skills matter as much as coding—plan for meetings and documentation milestones throughout the term.",
  "DATA 140":
    "Probability for Data Science develops rigorous probability theory tailored to statistics and machine learning applications. Students work with random variables, expectations, and limit theorems with computational exercises in Python. The course supports DATA C100/102 and STAT pathways. Mathematical maturity and calculus are expected.",
  "DATA 101":
    "Data Engineering focuses on pipelines, storage formats, reliability, and orchestration for production analytics. Labs may include cloud tooling, batch processing, and monitoring. Ideal for students targeting ML platform or analytics engineering internships. Prior data science coursework and systems exposure are strongly recommended.",
  "DATA 102":
    "Data, Inference, and Decisions combines statistical modeling with decision theory and communication of results to stakeholders. Case studies emphasize prediction, causal questions, and uncertainty quantification. Capstone-style assignments mirror industry analytics workflows. Complete DATA C100 and probability preparation before enrolling.",
  "DATA 144":
    "Data Mining and Analytics surveys classification, clustering, and pattern discovery with emphasis on scalable methods and evaluation. Projects use real datasets and stress proper validation. Useful for students bridging statistics and machine learning electives. Programming and linear algebra fluency help throughout.",
  "STAT 20":
    "Introduction to Probability and Statistics introduces descriptive statistics, basic probability, and inference with R or similar tools. The course supports social science, business, and pre-data-science pathways. Weekly labs reinforce computation; exams focus on interpretation as well as calculation.",
  "STAT 134":
    "Concepts of Probability offers a proof-oriented introduction to probability theory for statistics and data science majors. Topics include distributions, expectation, and convergence with problem sets that build proof skills. Often taken concurrently with upper-division math classes.",
  "STAT 135":
    "Concepts of Statistics develops estimation, hypothesis testing, and regression with mathematical rigor. Students connect theory to applied data analysis. STAT 134 or equivalent probability background is expected.",
  "STAT 133":
    "Concepts of Computing with Data introduces programming and data handling for statistics students using R-centric workflows. Useful before heavier machine learning or data science classes. Gentle pace for students newer to coding.",
  "STAT 150":
    "Stochastic Processes covers Markov chains, Poisson processes, and applications in queues and finance. Mathematical sophistication is required; probability coursework is a prerequisite.",
  "STAT 151A":
    "Introduction to Time Series teaches ARIMA models, forecasting, and spectral ideas with applied projects. Valuable for economics, environmental science, and data internships. Regression and probability preparation are assumed.",
  "STAT 154":
    "Modern Statistical Prediction and Machine Learning introduces supervised learning methods with statistical grounding. Cross-validation, regularization, and model selection appear throughout. Prior statistics and computing coursework is essential.",
  "MATH 54":
    "Linear Algebra and Differential Equations combines matrix theory with ODE techniques widely used in engineering and physics. Webwork-style homework and exams reward steady practice. Gateway course for many quantitative majors.",
  "MATH 55":
    "Discrete Mathematics introduces combinatorics, graph theory, and number theory with proof emphasis. Popular with EECS students alongside COMPSCI 70. Problem-set heavy with elegant but tricky exam questions.",
  "MATH 53":
    "Multivariable Calculus covers partial derivatives, multiple integrals, and vector calculus tools for physics and engineering. Visualization and computation both matter on exams.",
  "MATH 110":
    "Linear Algebra provides a proof-based treatment of vector spaces, eigenvalues, and linear transformations. Stronger theory focus than MATH 54; important for math and theory CS paths.",
  "MATH 104":
    "Introduction to Real Analysis develops rigorous limits, continuity, and differentiation for mathematics majors. Challenging problem sets and exams; plan substantial weekly study time.",
  "UGBA 10":
    "Principles of Business introduces accounting, finance, marketing, and organizational behavior for non-Haas students exploring business fundamentals. Case discussions and exams emphasize application over technical depth.",
  "UGBA 100":
    "Business Communication develops professional writing, presentations, and team communication expected in Haas and consulting recruiting. Frequent assignments with peer feedback; attendance matters.",
  "UGBA 101A":
    "Microeconomic Analysis for Business applies calculus-based micro theory to managerial decisions. Problem sets mirror economics graduate prep at an accessible pace for business majors.",
  "UGBA 102A":
    "Macroeconomic Analysis for Business examines growth, monetary policy, and business cycles with policy case studies. Graphical and algebraic models dominate exams.",
  "UGBA 103":
    "Introduction to Finance introduces valuation, risk, and capital markets with spreadsheet modeling. Useful before recruiting for banking or consulting internships.",
  "UGBA 104":
    "Analytic Decision Making Using Spreadsheets teaches optimization and simulation for operations and consulting contexts. Project-based with Excel or similar tools.",
  "ECON 1":
    "Introduction to Economics surveys micro and macro principles for social science breadth. Large lectures with discussion sections; exams test graphs and intuition.",
  "ECON 100A":
    "Microeconomic Theory builds consumer and producer theory with calculus. Problem sets are central; essential for economics major upper division.",
  "ECON 100B":
    "Macroeconomic Theory develops IS-LM, growth, and policy models with mathematical formality. ECON 100A and math preparation are expected.",
  "ECON 140":
    "Economic Statistics and Econometrics connects regression to causal inference questions in economics. Statistical computing assignments mirror empirical research workflows.",
  "ECON 136":
    "Financial Economics applies micro and macro tools to asset pricing and market institutions. Quantitative exercises assume calculus and statistics comfort.",
  "IB 35AC":
    "Human Biological Variation explores genetics, health disparities, and social context with AC breadth credit. Essays and discussion participation carry significant weight.",
  "IB 131":
    "Human Physiology covers organ systems with lab components for integrative biology majors. Memorization and application both appear on exams.",
  "IB C77":
    "Concepts in Human Health and Disease integrates molecular biology with public health examples. Suitable for pre-health and interdisciplinary students.",
  "IB 150":
    "Integrative Biology Research and Communication prepares students for upper-division research with scientific writing workshops. Smaller enrollment than introductory IB courses.",
  "COGSCI 1":
    "Introduction to Cognitive Science surveys psychology, neuroscience, linguistics, and computation as accounts of mind. Accessible entry to the interdisciplinary major.",
  "COGSCI 131":
    "Computational Models of Cognition implements cognitive theories in code and simulation. Programming and COGSCI 1 preparation recommended.",
  "COGSCI C100":
    "Basic Issues in Cognition dives into perception, memory, and language with primary literature readings. Writing-intensive for upper-division cog sci students.",
  "COGSCI 140":
    "Neural Computation connects neuroscience with mathematical models of brain function. Useful for students bridging CS and cog sci.",
  "COGSCI 132":
    "Scientific Approaches to Consciousness examines theories and experiments on conscious experience from multiple disciplines. Seminar-style with papers and presentations.",
  "ENGIN 7":
    "Introduction to Computer Programming for Scientists and Engineers teaches MATLAB or Python for numerical computation in engineering contexts. Project-based with applications to physics and chemistry problems.",
  "PHYSICS 7A":
    "Physics for Scientists and Engineers: Mechanics covers kinematics, forces, energy, and rotation with calculus-based problem solving. Labs reinforce experimental methods.",
  "PHYSICS 7B":
    "Physics for Scientists and Engineers: Electricity and Magnetism continues the 7-series with fields, circuits, and Maxwell concepts. Weekly problem sets are lengthy.",
  "PHYSICS 7C":
    "Physics for Scientists and Engineers: Waves, Heat, and Optics completes introductory physics with thermodynamics and wave phenomena. Prepare for upper-division lab courses afterward.",
  "PHYSICS 137A":
    "Quantum Mechanics introduces wave functions, operators, and simple systems for physics majors. Mathematically demanding with weekly problem sets.",
  "PHYSICS 111A":
    "Mechanics Laboratory develops experimental design, error analysis, and technical reporting for physics majors. Partner work and lab notebooks are graded carefully."
};

const departmentContext: Record<string, string> = {
  COMPSCI:
    "As part of Berkeley EECS, this course fits into a dense prerequisite chain—use CourseMap to verify timing with math and lab courses.",
  DATA: "This data science pathway course combines computation, statistics, and domain context expected in Berkeley's Data Science program.",
  STAT: "Statistics offerings at Berkeley emphasize both applied workflow and theoretical foundations for research and industry analytics roles.",
  MATH: "Mathematics courses here support engineering, economics, and computer science majors with rigorous problem sets and proof-based extensions.",
  UGBA: "Haas-affiliated coursework emphasizes communication, case analysis, and recruiting-relevant skills alongside technical business tools.",
  ECON: "Economics courses blend graphical intuition with formal models used in policy, finance, and graduate preparation.",
  IB: "Integrative Biology classes connect molecular detail to organismal and public-health perspectives with lab or writing components.",
  COGSCI: "Cognitive science integrates psychology, neuroscience, and computation—ideal for students exploring interdisciplinary mind and brain questions.",
  ENGIN: "College of Engineering courses stress applied problem solving for physical systems and numerical methods.",
  PHYSICS: "Physics coursework pairs calculus-based theory with laboratories that build experimental and technical communication skills."
};

function expandGeneric(code: string, base: string) {
  const departmentCode = code.split(" ")[0] ?? "";
  const context = departmentContext[departmentCode] ?? "At UC Berkeley, this course contributes to major, minor, and breadth planning.";
  return `${base.trim()} ${context} Use instructor ratings, prerequisite tracking, and term history on CourseMap to choose the best semester for your schedule.`;
}

export function mergeCourseDescription(code: string, baseDescription: string) {
  const extended = extendedCourseDescriptions[code];
  if (extended) return extended;
  if (baseDescription.length > 320) return baseDescription;
  return expandGeneric(code, baseDescription);
}
