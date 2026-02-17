import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import prismaClient from "../utils/prisma";

import type {
  projectPayload,
  projectTagsPayload,
  projectMediaPayload,
} from "../utils/type";

// Data Validation baad mein.
//          - Aadarsh Verma, 16 February 2026, 08:04 PM

class ProjectController {
  async createProject(req: Request<{}, {}, projectPayload>, res: Response) {
    try {
      const data: projectPayload = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const file = req.file;
      // TODO: upload file to cloudinary
      let coverImageUrl = "";
      const newProject = await prismaClient.projects.create({
        data: {
          title: data.title,
          description: data.description,
          projectUrl: data.projectUrl,
          coverImage: coverImageUrl,
          repositoryUrl: data.repositoryUrl,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(),
          isOngoing: data.isOngoing,
          visibility: data.visibility,
          publishStatus: data.publishStatus,
          publishTime: data.publishTime,
          skills: data.skills,
          ownerId: userId,
        },
      });

      return res.status(200).json(apiResponse(201, "Project Created!!", null));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }

  async updateProject(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const data: projectPayload = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const existingProject = await prismaClient.projects.findUnique({
        where: { id },
      });

      if (!existingProject) {
        return res
          .status(404)
          .json(apiResponse(404, "Project not found", null));
      }

      if (existingProject.ownerId !== userId) {
        return res.status(403).json(apiResponse(403, "Forbidden", null));
      }

      const updatedProject = await prismaClient.projects.update({
        where: { id },
        data: {
          title: data.title ?? existingProject.title,
          description: data.description ?? existingProject.description,
          projectUrl: data.projectUrl ?? existingProject.projectUrl,
          repositoryUrl: data.repositoryUrl ?? existingProject.repositoryUrl,
          startDate: data.startDate
            ? new Date(data.startDate)
            : existingProject.startDate,
          endDate: data.endDate
            ? new Date(data.endDate)
            : existingProject.endDate,
          isOngoing: data.isOngoing ?? existingProject.isOngoing,
          visibility: data.visibility ?? existingProject.visibility,
          publishStatus: data.publishStatus ?? existingProject.publishStatus,
          publishTime: data.publishTime
            ? new Date(data.publishTime)
            : existingProject.publishTime,
          skills: data.skills ?? existingProject.skills,
        },
      });

      return res
        .status(200)
        .json(apiResponse(200, "Project Updated!!", updatedProject));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async deleteProject(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const project = await prismaClient.projects.findUnique({
        where: { id },
      });

      if (!project) {
        return res
          .status(404)
          .json(apiResponse(404, "Project not found", null));
      }

      if (project.ownerId !== userId) {
        return res.status(403).json(apiResponse(403, "Forbidden", null));
      }

      await prismaClient.projects.delete({
        where: { id },
      });

      return res
        .status(200)
        .json(apiResponse(200, "Project Deleted Successfully", null));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async getProjectById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const project = await prismaClient.projects.findUnique({
        where: { id },
      });

      if (!project) {
        return res
          .status(404)
          .json(apiResponse(404, "Project not found", null));
      }

      return res.status(200).json(apiResponse(200, "Success", project));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async getAllUserProjects(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const projects = await prismaClient.projects.findMany({
        where: { ownerId: userId },
      });

      return res.status(200).json(apiResponse(200, "Success", projects));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }
}

export default new ProjectController();
