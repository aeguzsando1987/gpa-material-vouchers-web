'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2, ShieldCheck } from 'lucide-react';

import { useIOManagers, useAddIOManager, useRemoveIOManager } from '@/hooks/useIOManagers';
import { useIndividuals } from '@/hooks/useIndividuals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function IOManagersPage() {
  const { data: ioManagers, isLoading, error } = useIOManagers();
  const { data: individuals } = useIndividuals(0, 500);
  const addIOManager = useAddIOManager();
  const removeIOManager = useRemoveIOManager();

  const [selectedIndividualId, setSelectedIndividualId] = useState<string>('');

  // Individuals que aún no son contralores
  const existingIds = new Set((ioManagers ?? []).map((m) => m.individual_id));
  const availableIndividuals = (individuals ?? []).filter((i) => !existingIds.has(i.id));

  const handleAdd = async () => {
    if (!selectedIndividualId) return;
    await addIOManager.mutateAsync(Number(selectedIndividualId));
    setSelectedIndividualId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold">Contralores</h1>
          <p className="text-muted-foreground">
            Gestiona quién puede dar la segunda aprobación (contraloría) de los vales
          </p>
        </div>
      </div>

      {/* Alta de contralor */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar contralor</CardTitle>
          <CardDescription>
            Selecciona una persona para habilitarla como contralor (io manager).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Select value={selectedIndividualId} onValueChange={setSelectedIndividualId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar persona" />
                </SelectTrigger>
                <SelectContent>
                  {availableIndividuals.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {`${i.name} ${i.last_name}`.trim()}
                      {i.email ? ` — ${i.email}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAdd}
              disabled={!selectedIndividualId || addIOManager.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {addIOManager.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de contralores */}
      <Card>
        <CardHeader>
          <CardTitle>Contralores activos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error al cargar contralores. Intenta recargar la página.
            </div>
          ) : (ioManagers ?? []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay contralores registrados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ioManagers ?? []).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.individual_name ?? `Individual #${m.individual_id}`}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.individual_email ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeIOManager.mutate(m.id)}
                          disabled={removeIOManager.isPending}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Quitar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
