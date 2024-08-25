export interface GetLinkByAliasInput {
  alias: string;
  domain: string;
}

export interface GetLinkInput {
  id: string;
}

export interface ListLinksInput {
  page: number;
  pageSize: number;
  orderBy: "createdAt" | "totalClicks";
  orderDirection: "asc" | "desc";
}

export interface CreateLinkInput {
  url: string;
  alias?: string;
  disableAfterClicks?: number;
  disableAfterDate?: Date;
  password?: string;
  keepPath?: boolean;
  domain?: string;
}

export interface QuickLinkShorteningInput {
  url: string;
}

export interface UpdateLinkInput extends CreateLinkInput {
  id: string;
  disabled?: boolean;
}

export interface VerifyPasswordLinkInput {
  id: string;
  password: string;
}
