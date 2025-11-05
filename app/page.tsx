import { redirect } from "next/navigation";
import EtmifyInvoiceForm from "@/components/etmify-invoice-form";
import { getSessionFromCookies } from "@/lib/auth/server";

export default function Home() {
  const session = getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return <EtmifyInvoiceForm />;
}
