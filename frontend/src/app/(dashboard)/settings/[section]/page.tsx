import { redirect } from "next/navigation";

interface SettingsSectionPageProps {
  params: { section: string };
}

export default function SettingsSectionPage({ params }: SettingsSectionPageProps) {
  const section = params.section;
  const targetSection = section ? encodeURIComponent(section) : '';
  const search = targetSection ? `?section=${targetSection}` : '';

  redirect(`/settings${search}`);
}
