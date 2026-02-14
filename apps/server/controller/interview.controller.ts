import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import prismaClient from "../utils/prisma";
import * as InterviewTypes from "../utils/type";
import cacheClient from "../utils/redis";
class InterviewController {
  async createInterviewSuite(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const jobListingId = req.params.id;
      const data: InterviewTypes.SuiteCreation = req.body;

      if (!userId) throw new Error("userId is required");
      if (!jobListingId) throw new Error("joblisting missing");
      if (req.user?.type === "USER") throw new Error("unauthorized");

      const dbUser = await prismaClient.interviewer.findUnique({
        where: { id: userId },
      });
      if (!dbUser) throw new Error("no interviewer found");

      const dbJobListing = await prismaClient.jobListing.findUnique({
        where: { id: jobListingId as string },
      });
      if (!dbJobListing) throw new Error("no such joblisting found");
      if (dbJobListing.organizationId != dbUser.orgId)
        throw new Error("unAuthorized to make these changes");

      const dbInterviewSuite = await prismaClient.interviewSuite.findUnique({
        where: { jobListingId: dbJobListing.id },
      });
      if (dbInterviewSuite)
        throw new Error("A job suite for this listing already exists");

      const createdSuite = await prismaClient.interviewSuite.create({
        data: {
          name: data.name,
          jobListingId: dbJobListing.id,
          startDate: data.startDate,
          endDate: data.endDate,
          creatorId: dbUser.id,
          publishStatus: data.publishStatus ?? "NOT_PUBLISHED",
          orgId: dbUser.orgId,
        },
      });

      if (!createdSuite) throw new Error("error creating interview suite");

      await cacheClient.invalidateCache(
        `/interview-suite/company/${dbUser.orgId}`,
      );

      return res
        .status(200)
        .json(apiResponse(200, "interview suite created", createdSuite));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async updateInterviewSuite(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const suiteId = req.params.id;
      const data: Partial<InterviewTypes.SuiteCreation> = req.body;

      if (!userId) throw new Error("userId is required");
      if (!suiteId) throw new Error("suiteId is  missing");
      if (req.user?.type === "USER") throw new Error("unauthorized");

      const dbUser = await prismaClient.interviewer.findUnique({
        where: { id: userId },
      });
      if (!dbUser) throw new Error("no interviewer found");

      const dbInterviewSuite = await prismaClient.interviewSuite.findUnique({
        where: { id: suiteId as string },
      });

      if (!dbInterviewSuite) throw new Error("No interviewSuite found");

      const updatedSuite = await prismaClient.interviewSuite.update({
        where: {
          id: dbInterviewSuite.id,
        },
        data: {
          name: data.name ?? dbInterviewSuite.name,
          startDate: data.startDate ?? dbInterviewSuite.startDate,
          endDate: data.endDate ?? dbInterviewSuite.endDate,
          publishStatus: data.publishStatus ?? dbInterviewSuite.publishStatus,
        },
      });

      if (!updatedSuite) throw new Error("error updating interview suite");
      await cacheClient.invalidateCache(`/interview-suit/${suiteId}`);
      await cacheClient.invalidateCache(
        `/interview-suite/company/${dbUser.orgId}`,
      );
      return res
        .status(200)
        .json(apiResponse(200, "interview suite updated", updatedSuite));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async deleteInterviewSuite(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const suiteId = req.params.id;

      if (!userId) throw new Error("userId is required");
      if (!suiteId) throw new Error("suiteId is  missing");
      if (req.user?.type === "USER") throw new Error("unauthorized");

      const dbUser = await prismaClient.interviewer.findUnique({
        where: { id: userId },
      });
      if (!dbUser) throw new Error("no interviewer found");

      const dbInterviewSuite = await prismaClient.interviewSuite.findUnique({
        where: { id: suiteId as string },
      });

      if (!dbInterviewSuite) throw new Error("No interviewSuite found");

      const deletedSuite = await prismaClient.interviewSuite.delete({
        where: {
          id: dbInterviewSuite.id,
        },
      });

      if (!deletedSuite) throw new Error("error deleting interview suite");
      await cacheClient.invalidateCache(`/interview-suit/${suiteId}`);
      await cacheClient.invalidateCache(
        `/interview-suite/company/${dbUser.orgId}`,
      );
      return res
        .status(200)
        .json(apiResponse(200, "interview suite deleted", deletedSuite));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getInterviewSuiteById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const suiteId = req.params.id;

      if (!userId) throw new Error("userId is required");
      if (!suiteId) throw new Error("suiteId is  missing");
      if (req.user?.type === "USER") throw new Error("unauthorized");

      const cachedResponse = await cacheClient.getCache(
        `/interview-suit/${suiteId}`,
      );
      if (cachedResponse) {
        return res
          .status(200)
          .json(
            apiResponse(
              200,
              "interview suite fetched",
              JSON.parse(cachedResponse),
            ),
          );
      }

      const dbUser = await prismaClient.interviewer.findUnique({
        where: { id: userId },
      });
      if (!dbUser) throw new Error("no interviewer found");

      const dbInterviewSuite = await prismaClient.interviewSuite.findUnique({
        where: { id: suiteId as string },
        select: {
          name: true,
          startDate: true,
          endDate: true,
          publishStatus: true,
          jobListing: {
            select: {
              jobDescription: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      });

      if (!dbInterviewSuite) throw new Error("No interviewSuite found");

      await cacheClient.setCache(
        `/interview-suit/${suiteId}`,
        JSON.stringify(dbInterviewSuite),
      );

      return res
        .status(200)
        .json(apiResponse(200, "interview suite fetched", dbInterviewSuite));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getAllCompanyInterviewSuite(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("userId is missing");
      if (req.user?.type === "USER") throw new Error("unauthorized");

      const dbUser = await prismaClient.interviewer.findUnique({
        where: {
          id: userId,
        },
      });

      if (!dbUser) throw new Error("user not found");

      const cachedInterviewSuite = await cacheClient.getCache(
        `/interview-suite/company/${dbUser.orgId}`,
      );
      if (cachedInterviewSuite) {
        return res
          .status(200)
          .json(
            apiResponse(200, "interview suite fetched", cachedInterviewSuite),
          );
      }

      const dbInterviewSuite = await prismaClient.interviewSuite.findMany({
        where: {
          orgId: dbUser.orgId,
        },
      });

      await cacheClient.setCache(
        `/interview-suite/company/${dbUser.orgId}`,
        JSON.stringify(dbInterviewSuite || []),
      );

      return res
        .status(200)
        .json(apiResponse(200, "interview suite fetched", dbInterviewSuite));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }

  // interview-round
  async createInterviewRound(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async updateInterviewRound(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async deleteInterviewRound(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getAllInterviewRoundBySuite(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getInterviewRoundById(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }

  // interview-candidate
  async getAllCandidates(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getAllRoundCanddate(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async rejectCandidate(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async selectCandidateForNextRound(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async changeCandidateRoundStatus(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }

  // interview
  async createInterview(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async updateInterview(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getAllInterview(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getInterviewById(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async deleteInterview(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  // interview-record
  async createInterviewRecord(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
}
export default new InterviewController();
