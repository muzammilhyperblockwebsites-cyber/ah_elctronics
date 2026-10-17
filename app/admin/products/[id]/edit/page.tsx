import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  if (!id) notFound();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  let gallery: string[] = [];
  let specifications: Record<string, string> = {};

  try {
    gallery = JSON.parse(product.gallery || "[]");
  } catch {}

  try {
    specifications = JSON.parse(product.specifications || "{}");
  } catch {}

  const parsedProduct = {
    ...product,
    gallery,
    specifications,
  };

  return (
    <div>
      <ProductForm initialData={parsedProduct} isEdit={true} />
    </div>
  );
}
