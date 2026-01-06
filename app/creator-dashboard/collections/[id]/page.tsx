import CollectionPage from "./Collection";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <CollectionPage id={id} />;
}
