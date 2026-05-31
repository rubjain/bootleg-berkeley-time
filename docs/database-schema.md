# Database Schema Design

## Primary entities

- `School`: campus-level tenant boundary
- `Department`: academic unit under a school
- `Course`: normalized course catalog entry
- `Term`: semester/session record
- `CourseOffering`: term-specific offering/section data
- `Instructor`: reusable instructor identity
- `ProfessorRating`: external or manual quality signals
- `Program`: major, minor, or certificate
- `RequirementSource`: provenance metadata for requirement ingestion
- `ProgramRequirementSet`: versioned set of rules for a program
- `RequirementCategory`: bucket such as lower division, upper division, electives, or ethics
- `RequirementRule`: normalized rule record for exact course, choose-N, tag-based, unit-based, or group logic
- `RequirementOptionGroup`: nested selectable options within a rule
- `User`, `UserProgramSelection`, `UserCourseHistory`, `UserPlan`, `PlannedSemester`, `PlannedCourse`: planning and persistence

## Versioning strategy

- `ProgramRequirementSet` supports active and historical versions
- each set can point to the `RequirementSource` used for the import
- requirement rows include display order and source references so the UI can render official structure faithfully
