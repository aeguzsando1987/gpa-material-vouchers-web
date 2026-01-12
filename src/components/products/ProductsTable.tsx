'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import { Product, getProductCategoryName } from '@/lib/types/product';
import { useDeleteProduct } from '@/hooks/useProducts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductsTableProps {
  products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const deleteProductMutation = useDeleteProduct();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleEdit = (id: number) => {
    router.push(`/misc/products/${id}/edit`);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProductMutation.mutateAsync({
        id: productToDelete.id,
        hardDelete: false, // Soft delete por defecto
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No hay productos registrados</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-900 font-semibold">Código</TableHead>
              <TableHead className="text-gray-900 font-semibold">Nombre</TableHead>
              <TableHead className="text-gray-900 font-semibold">Categoría</TableHead>
              <TableHead className="text-gray-900 font-semibold">Unidad</TableHead>
              <TableHead className="text-gray-900 font-semibold text-center">
                Serializado
              </TableHead>
              <TableHead className="text-gray-900 font-semibold text-center">
                Veces Usado
              </TableHead>
              <TableHead className="text-gray-900 font-semibold text-center">
                Estado
              </TableHead>
              <TableHead className="text-gray-900 font-semibold text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">
                  {product.code || '-'}
                </TableCell>
                <TableCell className="text-gray-700">
                  {product.name}
                  {product.part_number && (
                    <div className="text-xs text-gray-500">
                      PN: {product.part_number}
                    </div>
                  )}
                  {product.description && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {product.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-gray-700">
                  {getProductCategoryName(product.category)}
                </TableCell>
                <TableCell className="text-gray-700">
                  {product.unit_of_measure}
                </TableCell>
                <TableCell className="text-center">
                  {product.is_serialized ? (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Sí
                    </Badge>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </TableCell>
                <TableCell className="text-center font-semibold text-gray-900">
                  {product.usage_count}
                </TableCell>
                <TableCell className="text-center">
                  {product.is_active ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product.id)}
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              ¿Eliminar producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              ¿Está seguro de que desea eliminar el producto{' '}
              <span className="font-semibold">{productToDelete?.name}</span>
              {productToDelete?.code && ` (código: ${productToDelete.code})`}? Este
              producto ha sido usado {productToDelete?.usage_count} veces.
              <br />
              <br />
              El producto será marcado como inactivo (soft delete).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
