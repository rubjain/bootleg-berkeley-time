import { ReportStatus, ReportTargetType } from "@prisma/client";
import { cookies } from "next/headers";
import { getActiveUserEmail } from "@/lib/auth/session";
import type { CourseCommunityView } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export const BLOCKED_AUTHORS_COOKIE = "coursemap_blocked_authors";

export type CommunityReport = {
  id: string;
  targetType: string;
  targetId: string;
  courseSlug?: string;
  authorName: string;
  reason: string;
  status: string;
  createdAt: string;
  reporterEmail?: string;
};

type ReportNotes = {
  courseSlug?: string;
  authorName?: string;
};

function mapUiTargetType(targetType: "review" | "discussion" | "comment"): ReportTargetType {
  if (targetType === "review") return ReportTargetType.COURSE_REVIEW;
  if (targetType === "discussion") return ReportTargetType.DISCUSSION_POST;
  return ReportTargetType.DISCUSSION_COMMENT;
}

function mapDbTargetType(targetType: ReportTargetType): string {
  if (targetType === ReportTargetType.COURSE_REVIEW) return "review";
  if (targetType === ReportTargetType.DISCUSSION_POST) return "discussion";
  return "comment";
}

function encodeNotes(input: ReportNotes) {
  return JSON.stringify(input);
}

function decodeNotes(notes: string | null): ReportNotes {
  if (!notes) return {};
  try {
    return JSON.parse(notes) as ReportNotes;
  } catch {
    return {};
  }
}

async function getReporterUserId() {
  const email = await getActiveUserEmail();
  if (!email) return null;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function findUserIdByName(name: string) {
  try {
    const user = await prisma.user.findFirst({ where: { name } });
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getBlockedAuthors(): Promise<Set<string>> {
  const blocked = new Set<string>();
  const cookieStore = await cookies();
  const raw = cookieStore.get(BLOCKED_AUTHORS_COOKIE)?.value;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as string[];
      parsed.filter((name) => typeof name === "string" && name.trim()).forEach((name) => blocked.add(name));
    } catch {
      // ignore malformed cookie
    }
  }

  const reporterId = await getReporterUserId();
  if (!reporterId) return blocked;

  try {
    const rows = await prisma.userBlock.findMany({
      where: { blockerId: reporterId },
      include: { blockedUser: { select: { name: true } } }
    });
    for (const row of rows) {
      if (row.blockedUser.name) blocked.add(row.blockedUser.name);
    }
  } catch {
    // database unavailable
  }

  return blocked;
}

export function filterCommunityByBlockedAuthors(
  community: CourseCommunityView,
  blockedAuthors: Set<string>
): CourseCommunityView {
  if (!blockedAuthors.size) return community;

  return {
    ...community,
    reviews: community.reviews.filter((review) => !blockedAuthors.has(review.authorName)),
    discussion: community.discussion
      .filter((post) => !blockedAuthors.has(post.authorName))
      .map((post) => ({
        ...post,
        comments: post.comments.filter((comment) => !blockedAuthors.has(comment.authorName))
      }))
  };
}

export async function recordCommunityReport(input: {
  targetType: "review" | "discussion" | "comment";
  targetId: string;
  authorName: string;
  courseSlug?: string;
  reason: string;
}) {
  const reporterId = await getReporterUserId();
  const reportedUserId = await findUserIdByName(input.authorName);
  const notes = encodeNotes({ courseSlug: input.courseSlug, authorName: input.authorName });

  if (reporterId) {
    try {
      const created = await prisma.contentReport.create({
        data: {
          reporterId,
          reportedUserId,
          targetType: mapUiTargetType(input.targetType),
          targetId: input.targetId,
          reason: input.reason,
          notes,
          status: ReportStatus.OPEN
        },
        include: { reporter: { select: { email: true } } }
      });

      const meta = decodeNotes(created.notes);
      return {
        id: created.id,
        targetType: mapDbTargetType(created.targetType),
        targetId: created.targetId,
        courseSlug: meta.courseSlug,
        authorName: meta.authorName ?? input.authorName,
        reason: created.reason,
        status: created.status,
        createdAt: created.createdAt.toISOString(),
        reporterEmail: created.reporter.email
      } satisfies CommunityReport;
    } catch {
      // fall through to ephemeral store
    }
  }

  return {
    id: `report-${Date.now()}`,
    targetType: input.targetType,
    targetId: input.targetId,
    courseSlug: input.courseSlug,
    authorName: input.authorName,
    reason: input.reason,
    status: ReportStatus.OPEN,
    createdAt: new Date().toISOString()
  } satisfies CommunityReport;
}

export async function blockCommunityAuthor(input: { authorName: string; reason: string }) {
  const reporterId = await getReporterUserId();
  const blockedUserId = await findUserIdByName(input.authorName);

  if (reporterId && blockedUserId && reporterId !== blockedUserId) {
    try {
      await prisma.userBlock.upsert({
        where: {
          blockerId_blockedUserId: {
            blockerId: reporterId,
            blockedUserId
          }
        },
        create: {
          blockerId: reporterId,
          blockedUserId,
          reason: input.reason
        },
        update: { reason: input.reason }
      });
    } catch {
      // continue to cookie fallback
    }
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(BLOCKED_AUTHORS_COOKIE)?.value;
  let blocked: string[] = [];

  if (existing) {
    try {
      blocked = JSON.parse(existing) as string[];
    } catch {
      blocked = [];
    }
  }

  if (!blocked.includes(input.authorName)) {
    blocked.push(input.authorName);
  }

  cookieStore.set(BLOCKED_AUTHORS_COOKIE, JSON.stringify(blocked), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
}

export async function listCommunityReports(): Promise<CommunityReport[]> {
  try {
    const rows = await prisma.contentReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: { select: { email: true } },
        reportedUser: { select: { name: true, email: true } }
      }
    });

    return rows.map((row) => {
      const meta = decodeNotes(row.notes);
      return {
        id: row.id,
        targetType: mapDbTargetType(row.targetType),
        targetId: row.targetId,
        courseSlug: meta.courseSlug,
        authorName: meta.authorName ?? row.reportedUser?.name ?? "Unknown author",
        reason: row.reason,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        reporterEmail: row.reporter.email
      };
    });
  } catch {
    return [];
  }
}

export async function updateCommunityReportStatus(reportId: string, status: ReportStatus) {
  return prisma.contentReport.update({
    where: { id: reportId },
    data: { status }
  });
}
