import { getToken } from "@/lib/core/tokens";
import { auth } from "@clerk/nextjs/server";
import GenerateTokenTrigger from "./create-token";
import TokenCard from "./token-card";

export default async function ApiTokenPage() {
  const { userId } = auth();
  const token = await getToken(userId!);

  return (
    <div>
      <div className="max-w-3xl">
        <h2 className="text-lg font-medium">API Keys</h2>
        <p className="mb-10 mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          API Keys are used to authenticate requests to the API.
        </p>

        {token ? (
          <TokenCard
            start="******"
            createdAt={token.createdAt.getTime()}
            keyID={token.id}
          />
        ) : (
          <GenerateTokenTrigger />
        )}
      </div>
    </div>
  );
}
