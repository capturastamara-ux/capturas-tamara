import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
    planSlug: string;
  }>;
};

export default async function PlanDetailRedirect({ params }: PageProps) {
  const { categorySlug, subcategorySlug, planSlug } = await params;
  redirect(`/portafolio/${categorySlug}/${subcategorySlug}#${planSlug}`);
}
