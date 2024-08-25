import { redirect } from "next/navigation";

const HomePage = () => {
  if (process.env.ROOT_REDIRECT) redirect(process.env.ROOT_REDIRECT);
  else redirect("/dashboard");
};

export default HomePage;
