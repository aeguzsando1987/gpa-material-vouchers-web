'use client';

import { useRouter, useParams } from 'next/navigation';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import { ProductUpdatePayload } from '@/lib/types/product';
import ProductForm from '@/components/forms/ProductForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.id as string);

  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const updateProductMutation = useUpdateProduct();

  const handleSubmit = async (data: ProductUpdatePayload) => {
    await updateProductMutation.mutateAsync({ id: productId, data });
    router.push('/misc/products');
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Producto no encontrado</p>
          <Button
            variant="outline"
            onClick={() => router.push('/misc/products')}
            className="mt-4"
          >
            Volver a productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/misc/products')}
          className="gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a productos
        </Button>
      </div>

      {/* Formulario */}
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        isLoading={updateProductMutation.isPending}
      />
    </div>
  );
}
