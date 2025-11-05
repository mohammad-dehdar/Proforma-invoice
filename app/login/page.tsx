import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { getSessionFromCookies } from "@/lib/auth/server";

export default function LoginPage() {
  const session = getSessionFromCookies();

  if (session) {
    redirect("/");
  }

  return <LoginForm />;
}
