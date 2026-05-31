import { getDemoUserEmail } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { allowMockFallback } from "@/lib/mock-fallback";
import { sanitizeCommunityPayload } from "@/lib/content-moderation";
import { buildCourseInsightSummary, getFriendDirectoryMock } from "@/lib/social-data";
import { addCourseReview as addFallbackReview, addDiscussionPost as addFallbackDiscussion, acceptFriendRequest as acceptFallbackRequest, declineFriendRequest as declineFallbackRequest, getCourseCommunityState, getSocialDashboardState, sendFriendRequest as sendFallbackRequest, sendMessage as sendFallbackMessage } from "@/lib/social-store";
import { CourseCommunityView, SocialDashboardView, SocialFriendProfile } from "@/lib/types";

function buildFriendProfile(user: any): SocialFriendProfile {
  const privacy = user.privacySettings;
  const majors = privacy?.showMajorsToFriends
    ? (user.programSelections ?? [])
        .filter((selection: any) => selection.program?.type === "MAJOR")
        .map((selection: any) => selection.program.name)
    : [];
  const minors = privacy?.showMajorsToFriends
    ? (user.programSelections ?? [])
        .filter((selection: any) => selection.program?.type === "MINOR")
        .map((selection: any) => selection.program.name)
    : [];

  return {
    id: user.id,
    name: user.name ?? user.email,
    school: user.school?.shortName ?? "Unknown school",
    majors,
    minors,
    visiblePlanTitles: privacy?.showPlansToFriends ? (user.plans ?? []).map((plan: any) => plan.title) : [],
    visibleScheduleLabels: privacy?.showSchedulesToFriends
      ? (user.plans ?? []).flatMap((plan: any) => (plan.semesters ?? []).map((semester: any) => semester.label))
      : []
  };
}

function buildEmptyCourseCommunity(courseId: string): CourseCommunityView {
  return {
    courseId,
    reviews: [],
    discussion: [],
    studentInsightSummary: buildCourseInsightSummary([])
  };
}

export async function getSocialDashboard(): Promise<SocialDashboardView> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: await getDemoUserEmail() },
      include: {
        school: true,
        privacySettings: true,
        plans: { include: { semesters: true } },
        programSelections: { include: { program: true } },
        friendshipsAsUserA: {
          include: {
            userB: {
              include: {
                school: true,
                privacySettings: true,
                plans: { include: { semesters: true } },
                programSelections: { include: { program: true } }
              }
            }
          }
        },
        friendshipsAsUserB: {
          include: {
            userA: {
              include: {
                school: true,
                privacySettings: true,
                plans: { include: { semesters: true } },
                programSelections: { include: { program: true } }
              }
            }
          }
        },
        receivedFriendRequests: {
          where: { status: "PENDING" as any },
          include: {
            sender: {
              include: {
                school: true,
                privacySettings: true,
                plans: { include: { semesters: true } },
                programSelections: { include: { program: true } }
              }
            }
          }
        },
        sentFriendRequests: {
          where: { status: "PENDING" as any },
          include: {
            receiver: {
              include: {
                school: true,
                privacySettings: true,
                plans: { include: { semesters: true } },
                programSelections: { include: { program: true } }
              }
            }
          }
        },
        messageThreadParticipants: {
          include: {
            thread: {
              include: {
                participants: {
                  include: {
                    user: true
                  }
                },
                messages: {
                  include: {
                    sender: true
                  },
                  orderBy: { createdAt: "asc" }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return getSocialDashboardState();
    }

    const selfProfile = buildFriendProfile(user);
    const friends = [
      ...user.friendshipsAsUserA.map((friendship: any) => buildFriendProfile(friendship.userB)),
      ...user.friendshipsAsUserB.map((friendship: any) => buildFriendProfile(friendship.userA))
    ];

    const incomingRequests = user.receivedFriendRequests.map((request: any) => ({
      id: request.id,
      fromUser: buildFriendProfile(request.sender),
      toUser: selfProfile,
      status: request.status,
      message: request.message ?? undefined,
      createdAt: request.createdAt.toISOString()
    }));

    const outgoingRequests = user.sentFriendRequests.map((request: any) => ({
      id: request.id,
      fromUser: selfProfile,
      toUser: buildFriendProfile(request.receiver),
      status: request.status,
      message: request.message ?? undefined,
      createdAt: request.createdAt.toISOString()
    }));

    const threads = user.messageThreadParticipants.map((participant: any) => ({
      id: participant.thread.id,
      title:
        participant.thread.title ??
        participant.thread.participants
          .filter((threadParticipant: any) => threadParticipant.userId !== user.id)
          .map((threadParticipant: any) => threadParticipant.user.name ?? threadParticipant.user.email)
          .join(", "),
      participantNames: participant.thread.participants.map((threadParticipant: any) => threadParticipant.user.name ?? threadParticipant.user.email),
      messages: participant.thread.messages.map((message: any) => ({
        id: message.id,
        senderName: message.sender.name ?? message.sender.email,
        body: message.body,
        createdAt: message.createdAt.toISOString()
      }))
    }));

    return { friends, incomingRequests, outgoingRequests, threads };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return getSocialDashboardState();
  }
}

export async function getSuggestedFriendProfiles(): Promise<SocialFriendProfile[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: await getDemoUserEmail() },
      include: {
        friendshipsAsUserA: true,
        friendshipsAsUserB: true,
        sentFriendRequests: {
          where: { status: "PENDING" as any }
        },
        receivedFriendRequests: {
          where: { status: "PENDING" as any }
        }
      }
    });

    if (!user) {
      return getFriendDirectoryMock();
    }

    const excludedIds = new Set<string>([
      user.id,
      ...user.friendshipsAsUserA.map((friendship: any) => friendship.userBId),
      ...user.friendshipsAsUserB.map((friendship: any) => friendship.userAId),
      ...user.sentFriendRequests.map((request: any) => request.receiverId),
      ...user.receivedFriendRequests.map((request: any) => request.senderId)
    ]);

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: [...excludedIds] }
      },
      include: {
        school: true,
        privacySettings: true,
        plans: { include: { semesters: true } },
        programSelections: { include: { program: true } }
      },
      orderBy: [{ name: "asc" }, { email: "asc" }]
    });

    return candidates.map((candidate: any) => buildFriendProfile(candidate));
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return getFriendDirectoryMock();
  }
}

export async function sendSocialFriendRequest(input: { toUser: SocialFriendProfile; message?: string }) {
  try {
    const sender = await prisma.user.findUnique({ where: { email: await getDemoUserEmail() } });
    if (!sender) return sendFallbackRequest(input);

    const receiver = await prisma.user.findUnique({ where: { id: input.toUser.id } });
    if (!receiver) return sendFallbackRequest(input);

    return await prisma.friendRequest.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        message: input.message,
        status: "PENDING" as any
      }
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return sendFallbackRequest(input);
  }
}

export async function respondToFriendRequest(requestId: string, action: "accept" | "decline") {
  try {
    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return action === "accept" ? acceptFallbackRequest(requestId) : declineFallbackRequest(requestId);
    }

    if (action === "accept") {
      await prisma.$transaction([
        prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED" as any, respondedAt: new Date() }
        }),
        prisma.friendship.create({
          data: {
            userAId: request.senderId,
            userBId: request.receiverId
          }
        })
      ]);
      return { success: true };
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "DECLINED" as any, respondedAt: new Date() }
    });
    return { success: true };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return action === "accept" ? acceptFallbackRequest(requestId) : declineFallbackRequest(requestId);
  }
}

export async function sendSocialMessage(input: { threadId: string; body: string; sharedCourseCode?: string; sharedPlanTitle?: string }) {
  try {
    const sender = await prisma.user.findUnique({ where: { email: await getDemoUserEmail() } });
    if (!sender) return sendFallbackMessage(input);

    return await prisma.message.create({
      data: {
        threadId: input.threadId,
        senderId: sender.id,
        body: input.body
      }
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return sendFallbackMessage(input);
  }
}

export async function getCourseCommunity(courseSlug: string): Promise<CourseCommunityView> {
  try {
    const course = await prisma.course.findFirst({
      where: { slug: courseSlug },
      include: {
        reviews: {
          include: { user: true },
          orderBy: { createdAt: "desc" }
        },
        discussionPosts: {
          include: {
            user: true,
            comments: {
              include: { user: true },
              orderBy: { createdAt: "asc" }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!course) {
      return getCourseCommunityState(courseSlug);
    }

    const reviews = course.reviews.map((review: any) => ({
      id: review.id,
      authorName: review.user.name ?? review.user.email,
      title: review.title ?? undefined,
      body: review.body,
      pseudonym: review.pseudonym ?? undefined,
      difficultyRating: review.difficultyRating,
      workloadRating: review.workloadRating,
      usefulnessRating: review.usefulnessRating,
      recommendationRating: review.recommendationRating,
      averageWeeklyHours: review.averageWeeklyHours ?? undefined,
      lecturesUseful: review.lecturesUseful ?? undefined,
      attendanceImportant: review.attendanceImportant ?? undefined,
      hardestPart: review.hardestPart ?? undefined,
      advice: review.advice ?? undefined,
      tags: review.tags,
      reasonTag: review.reasonTag ?? undefined,
      upvoteCount: review.upvoteCount,
      createdAt: review.createdAt.toISOString()
    }));

    const discussion = course.discussionPosts.map((post: any) => ({
      id: post.id,
      authorName: post.user.name ?? post.user.email,
      title: post.title,
      body: post.body,
      upvoteCount: post.upvoteCount,
      createdAt: post.createdAt.toISOString(),
      comments: post.comments.map((comment: any) => ({
        id: comment.id,
        authorName: comment.user.name ?? comment.user.email,
        body: comment.body,
        upvoteCount: comment.upvoteCount,
        createdAt: comment.createdAt.toISOString()
      }))
    }));

    const difficultyAverage = reviews.length
      ? `${(reviews.reduce((sum, review) => sum + review.difficultyRating, 0) / reviews.length).toFixed(1)}/5 from student reports`
      : "No student reports yet";

    return {
      courseId: course.id,
      reviews,
      discussion,
      studentInsightSummary:
        reviews.length > 0
          ? {
              perceivedDifficulty: difficultyAverage,
              averageWeeklyWorkload: `${(reviews.reduce((sum, review) => sum + (review.averageWeeklyHours ?? 0), 0) / reviews.length).toFixed(1)} hrs/week`,
              lecturesUseful: reviews.some((review) => review.lecturesUseful) ? "Mostly yes" : "No student reports yet",
              attendanceMatters: reviews.some((review) => review.attendanceImportant) ? "Often" : "No student reports yet",
              hardestPart: reviews[0]?.hardestPart ?? "No student reports yet",
              bestAdvice: reviews.map((review) => review.advice).filter(Boolean) as string[]
            }
          : buildEmptyCourseCommunity(course.id).studentInsightSummary
    };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return getCourseCommunityState(courseSlug);
  }
}

export async function createCourseReview(input: {
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
  const sanitizedInput = sanitizeCommunityPayload(input, ["title", "body", "advice"]);

  try {
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { email: await getDemoUserEmail() } }),
      prisma.course.findFirst({ where: { slug: sanitizedInput.courseSlug } })
    ]);

    if (!user || !course) return addFallbackReview(sanitizedInput);

    await prisma.courseReview.create({
      data: {
        courseId: course.id,
        userId: user.id,
        title: sanitizedInput.title,
        body: sanitizedInput.body,
        difficultyRating: sanitizedInput.difficultyRating,
        workloadRating: sanitizedInput.workloadRating,
        usefulnessRating: sanitizedInput.usefulnessRating,
        recommendationRating: sanitizedInput.recommendationRating,
        advice: sanitizedInput.advice,
        reasonTag: (sanitizedInput.reasonTag as any) ?? undefined,
        tags: sanitizedInput.tags as any
      }
    });

    return getCourseCommunity(sanitizedInput.courseSlug);
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return addFallbackReview(sanitizedInput);
  }
}

export async function createDiscussionPost(input: { courseSlug: string; title: string; body: string }) {
  const sanitizedInput = sanitizeCommunityPayload(input, ["title", "body"]);

  try {
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { email: await getDemoUserEmail() } }),
      prisma.course.findFirst({ where: { slug: sanitizedInput.courseSlug } })
    ]);

    if (!user || !course) return addFallbackDiscussion(sanitizedInput);

    await prisma.courseDiscussionPost.create({
      data: {
        courseId: course.id,
        userId: user.id,
        title: sanitizedInput.title,
        body: sanitizedInput.body
      }
    });

    return getCourseCommunity(sanitizedInput.courseSlug);
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return addFallbackDiscussion(sanitizedInput);
  }
}
