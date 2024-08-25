export interface CreateCustomDomainInput {
  domain: string;
}

export interface DeleteCustomDomainInput {
  id: string;
}

export type CustomDomainStatus = "active" | "pending" | "invalid";
