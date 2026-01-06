import TechPackDetailPage from "./techpack";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <TechPackDetailPage id={id} />;
}
