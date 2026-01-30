"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UtensilsCrossed,
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Tag,
  Loader2,
} from "lucide-react";

type Category = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: string;
  available: boolean;
  imageUrl: string | null;
  createdAt: string;
};

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilterId, setCategoryFilterId] = useState<number | "">("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [productForm, setProductForm] = useState<{
    id: number | null;
    name: string;
    categoryId: number | "";
    price: string;
    available: boolean;
    imageUrl: string;
  }>({
    id: null,
    name: "",
    categoryId: "",
    price: "",
    available: true,
    imageUrl: "",
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al cargar categorías");
      }
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar categorías");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError(null);
    try {
      const url =
        categoryFilterId === ""
          ? "/api/admin/products"
          : `/api/admin/products?categoryId=${categoryFilterId}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al cargar productos");
      }
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar productos");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [categoryFilterId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear categoría");
      setNewCategoryName("");
      await fetchCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear categoría");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    const name = editingCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar categoría");
      setEditingCategoryId(null);
      setEditingCategoryName("");
      await fetchCategories();
      await fetchProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar categoría");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría? No se puede si tiene productos.")) return;
    setSavingCategory(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar categoría");
      setEditingCategoryId(null);
      await fetchCategories();
      await fetchProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar categoría");
    } finally {
      setSavingCategory(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      id: null,
      name: "",
      categoryId: categories.length ? categories[0].id : "",
      price: "",
      available: true,
      imageUrl: "",
    });
    setProductError(null);
  };

  const handleEditProduct = (p: Product) => {
    setProductForm({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      price: p.price,
      available: p.available,
      imageUrl: p.imageUrl ?? "",
    });
    setProductError(null);
  };

  const handleSaveProduct = async () => {
    const name = productForm.name.trim();
    const categoryId = productForm.categoryId;
    const price = parseFloat(productForm.price);
    if (!name) {
      setProductError("Nombre requerido");
      return;
    }
    if (categoryId === "" || typeof categoryId !== "number") {
      setProductError("Selecciona una categoría");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      setProductError("Precio inválido");
      return;
    }
    setSavingProduct(true);
    setProductError(null);
    try {
      const body = {
        name,
        categoryId,
        price,
        available: productForm.available,
        imageUrl: productForm.imageUrl.trim() || null,
      };
      if (productForm.id) {
        const res = await fetch(`/api/admin/products/${productForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al actualizar producto");
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear producto");
      }
      resetProductForm();
      await fetchProducts();
    } catch (e) {
      setProductError(e instanceof Error ? e.message : "Error al guardar producto");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar producto");
      if (productForm.id === id) resetProductForm();
      await fetchProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar producto");
    }
  };

  const handleToggleAvailable = async (p: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !p.available }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      await fetchProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar disponibilidad");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <UtensilsCrossed className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Gestión del menú
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Alta, edición y baja de productos. Categorías, precios y disponibilidad.
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Categorías */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FolderTree className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Categorías</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Nombre de la categoría"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 w-48"
                aria-label="Nombre de la categoría"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={savingCategory || !newCategoryName.trim()}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
              >
                {savingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Nueva categoría
              </button>
            </div>
          </div>
          <div className="p-5">
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando categorías…
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No hay categorías. Crea una para organizar los productos.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/50 px-3 py-2"
                  >
                    {editingCategoryId === cat.id ? (
                      <>
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateCategory(cat.id);
                            if (e.key === "Escape") {
                              setEditingCategoryId(null);
                              setEditingCategoryName("");
                            }
                          }}
                          className="rounded border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1 text-sm w-40"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(cat.id)}
                          disabled={savingCategory || !editingCategoryName.trim()}
                          className="text-sm text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingCategoryName("");
                          }}
                          className="text-sm text-neutral-500 hover:underline"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(cat.id);
                            setEditingCategoryName(cat.name);
                          }}
                          className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                          aria-label="Editar categoría"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          disabled={savingCategory}
                          className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                          aria-label="Eliminar categoría"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Productos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Productos del menú</h2>
            <div className="flex items-center gap-3">
              <select
                value={categoryFilterId}
                onChange={(e) => setCategoryFilterId(e.target.value === "" ? "" : Number(e.target.value))}
                className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white"
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={resetProductForm}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                <Plus className="h-4 w-4" /> Nuevo producto
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300 w-12">Imagen</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Disponibilidad</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {loadingProducts ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      <Loader2 className="h-5 w-5 animate-spin inline-block" /> Cargando productos…
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                      No hay productos. Añade categorías y productos desde el formulario.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className={productForm.id === p.id ? "bg-neutral-100 dark:bg-neutral-700/50" : ""}
                    >
                      <td className="px-4 py-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-600 text-neutral-400">
                            <ImageIcon className="h-5 w-5" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{p.name}</td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{p.categoryName}</td>
                      <td className="px-4 py-3 text-neutral-900 dark:text-white">S/ {p.price}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailable(p)}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.available
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-neutral-200 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          {p.available ? "Disponible" : "No disponible"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(p)}
                          className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                          aria-label="Editar producto"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-red-500 hover:text-red-700"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Alta / Edición de producto */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Tag className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              {productForm.id ? "Edición de producto" : "Alta de producto"}
            </h2>
          </div>
          <div className="p-5">
            {productError && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400">{productError}</p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Hamburguesa clásica"
                  value={productForm.name}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="Nombre del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Categoría
                </label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      categoryId: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                  aria-label="Categoría"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Precio (S/)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={productForm.price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="Precio"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.available}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, available: e.target.checked }))
                    }
                    className="rounded border-neutral-300 dark:border-neutral-600"
                    aria-label="Disponible"
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Disponible</span>
                </label>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                URL de imagen
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={productForm.imageUrl}
                onChange={(e) => setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                aria-label="URL de imagen"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={savingProduct}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
              >
                {savingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar producto
              </button>
              <button
                type="button"
                onClick={resetProductForm}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
