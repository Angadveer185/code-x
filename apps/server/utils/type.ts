export interface JwtPayload {
  id: string;
  type: "ORGANIZATION" | "INTERVIEWER" | "USER";
}
export interface CreateInterviewerBody {
  name: string;
  email: string;
  username: string;
  orgId: string;
  password: string;
}
export interface UpdateInterviewerBody {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
}
export interface CreateUserBody {
  name: string;
  email: string;
  username: string;
  password: string;
}
export interface UpdateUserBody {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
}
export interface CreateOrganisationBody {
  name: string;
  email: string;
  username: string;
  password: string;
  tagline: string;
}
export interface UpdateOrganisationBody {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  tagline?: string;
}

export interface SuiteCreation {
  name: string;
  startDate: Date;
  endDate: Date;
  publishStatus: "NOT_PUBLISHED" | "PUBLISHED";
}

export interface projectPayload {
  title: string;
  description: string;
  coverImage?: string;
  projectUrl?: string;
  repositoryUrl?: string;
  startDate: Date;
  endDate: Date;
  isOngoing: boolean;
  visibility: "PUBLIC" | "CONNECTIONS" | "PRIVATE";
  publishStatus: "PUBLISHED" | "NOT_PUBLISHED";
  publishTime: Date;
  skills: string[];
  tags: projectTagsPayload[];
  projectMedias: projectMediaPayload[];
}

export interface projectTagsPayload {
  note: string;
  role: "CREATOR" | "CONTRIBUTOR" | "REVIEWER";
  userId: string;
}

export interface projectMediaPayload {
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  url: string;
  caption?: string;
}
