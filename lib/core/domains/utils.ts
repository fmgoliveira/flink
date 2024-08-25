import { VercelDomainResponse, VercelErrorResponse } from "./types";

export async function addDomainToVercelProject(domain: string) {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains?teamId=${process.env.TEAM_ID_VERCEL}`,
    {
      body: `{\n  "name": "${domain}"\n}`,
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN_VERCEL}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    }
  );

  const responseJson = (await response.json()) as unknown;

  console.log(responseJson);

  // const data = (await response.json()) as VercelDomainResponse | VercelErrorResponse;
  const data = responseJson as VercelDomainResponse | VercelErrorResponse;

  console.log(data);

  if ("error" in data) {
    // throw new Error(data.error.message);
    switch (data.error.code) {
      case "forbidden":
        throw new Error(
          "You don't have permission to add a domain to this project"
        );
      case "domain_taken":
        throw new Error("This domain is already taken");
      default:
        throw new Error("Failed to add domain to project");
    }
  }

  return {
    ...data,
    verificationChallenges:
      data.verification?.map((challenge) => ({
        type: challenge.type,
        domain: challenge.domain,
        value: challenge.value,
      })) ?? [],
  };
}

export async function deleteDomainFromVercelProject(domain: string) {
  await fetch(
    `https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains/${domain}?teamId=${process.env.TEAM_ID_VERCEL}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
      },
    }
  );
}
