import { getAdminProfile, getSettings } from "@/app/actions/settings";
import PengaturanClient from "./PengaturanClient";

export default async function PengaturanPage() {
  const [profile, settings] = await Promise.all([
    getAdminProfile(),
    getSettings(),
  ]);

  return (
    <PengaturanClient
      profile={profile}
      settings={settings}
    />
  );
}
