type UserLinksOverViewProps = {
  numberOfLinks: number;
  numberOfClicks: number;
};

const UserLinksOverView = ({
  numberOfLinks,
  numberOfClicks,
}: UserLinksOverViewProps) => {
  return (
    <div className="flex h-max flex-col gap-4 rounded-md bg-neutral-900/50 p-6">
      <div>
        <h1 className="text-xl font-semibold leading-tight text-neutral-300">
          Quick Stats
        </h1>
        <p className="text-sm text-neutral-500">
          Get a quick overview of your links
        </p>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2 rounded-md">
          <span className="text-xl font-semibold text-neutral-300">
            Total Links
          </span>
          <span className="text-3xl font-semibold text-neutral-500">
            {numberOfLinks}
          </span>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xl font-semibold text-neutral-300">
            Total Clicks
          </span>
          <span className="text-3xl font-semibold text-neutral-500">
            {numberOfClicks}
          </span>
        </div>
      </div>
    </div>
  );
};

export { UserLinksOverView };
