import { ExecutionDetail } from "@/features/executions/components/execution-detail";

export const instant = false;

export default async function Page({ params }: PageProps<"/executions/[id]">) {
  const { id } = await params;
  return <ExecutionDetail id={id} />;
}
