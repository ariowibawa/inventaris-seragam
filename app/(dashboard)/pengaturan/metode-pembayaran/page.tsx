import { getPaymentMethods } from "@/app/actions/sales";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";
import MetodePembayaranClient from "./MetodePembayaranClient";

export default async function MetodePembayaranPage() {
  const profile = await getAdminProfile();
  if (!profile) {
    redirect("/login");
  }

  const paymentMethods = await getPaymentMethods();

  return <MetodePembayaranClient initialPaymentMethods={paymentMethods} />;
}
