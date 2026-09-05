import { prisma } from "@/lib/prisma";

export type CategoryDto = {
  id: number;
  name: string;
};

export type ProductDto = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: string;
  available: boolean;
  imageUrl: string | null;
  createdAt: Date;
};

function toProductDto(row: {
  id: number;
  name: string;
  categoryId: number;
  category: { name: string };
  price: unknown;
  available: boolean;
  imageUrl: string | null;
  createdAt: Date;
}): ProductDto {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    price: String(row.price),
    available: row.available,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt,
  };
}

/**
 * Lista todas las categorías.
 */
export async function listCategories(): Promise<CategoryDto[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return categories;
}

/**
 * Crea una categoría.
 */
export async function createCategory(name: string): Promise<CategoryDto> {
  const category = await prisma.category.create({
    data: { name: name.trim() },
    select: { id: true, name: true },
  });
  return category;
}

/**
 * Actualiza una categoría.
 */
export async function updateCategory(id: number, name: string): Promise<CategoryDto | null> {
  const category = await prisma.category.update({
    where: { id },
    data: { name: name.trim() },
    select: { id: true, name: true },
  });
  return category;
}

/**
 * Elimina una categoría. Falla si tiene productos (Restrict).
 */
export async function deleteCategory(id: number): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

/**
 * Lista productos, opcionalmente filtrados por categoría.
 */
export async function listProducts(categoryId?: number): Promise<ProductDto[]> {
  const where = categoryId ? { categoryId } : {};
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    include: { category: { select: { name: true } } },
  });
  return products.map(toProductDto);
}

/**
 * Obtiene un producto por id.
 */
export async function getProductById(id: number): Promise<ProductDto | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
  if (!product) return null;
  return toProductDto(product);
}

/**
 * Crea un producto.
 */
export async function createProduct(data: {
  name: string;
  categoryId: number;
  price: number;
  available?: boolean;
  imageUrl?: string | null;
}): Promise<ProductDto> {
  const product = await prisma.product.create({
    data: {
      name: data.name.trim(),
      categoryId: data.categoryId,
      price: data.price,
      available: data.available ?? true,
      imageUrl: data.imageUrl?.trim() || null,
    },
    include: { category: { select: { name: true } } },
  });
  return toProductDto(product);
}

/**
 * Actualiza un producto.
 */
export async function updateProduct(
  id: number,
  data: {
    name?: string;
    categoryId?: number;
    price?: number;
    available?: boolean;
    imageUrl?: string | null;
  }
): Promise<ProductDto | null> {
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.available !== undefined && { available: data.available }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl?.trim() || null }),
    },
    include: { category: { select: { name: true } } },
  });
  return toProductDto(product);
}

/**
 * Elimina un producto.
 */
export async function deleteProduct(id: number): Promise<void> {
  await prisma.product.delete({ where: { id } });
}
