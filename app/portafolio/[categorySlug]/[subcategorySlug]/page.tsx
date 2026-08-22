import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
};

export default async function SubcategoryPlansRedirect({ params }: PageProps) {
  const { categorySlug, subcategorySlug } = await params;
  redirect(`/portafolio/${categorySlug}#${subcategorySlug}`);
}
