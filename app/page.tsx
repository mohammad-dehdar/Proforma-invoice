import EtmifyInvoiceForm from "@/components/etmify-invoice-form";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <EtmifyInvoiceForm username={session.username} />;
}
