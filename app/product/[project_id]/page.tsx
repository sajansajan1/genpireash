import TechPackMakerPage from "../page";


export default async function Page(props: { params: Promise<{ project_id: string }> }) {
  const { project_id } = await props.params;
  return <TechPackMakerPage projectId={project_id} />;
}
