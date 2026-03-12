'use client';

import { useState, useEffect } from 'react';
import { Save, Send, Mail, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import emailConfigService, { EmailConfig, EmailConfigUpdate } from '@/lib/api/services/emailConfigService';
import { useAuthStore } from '@/lib/store/authStore';

export default function EmailConfigPage() {
  const { user } = useAuthStore();

  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [form, setForm] = useState<EmailConfigUpdate>({
    enabled: false,
    server: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: 'Sistema de Vales GPA',
    use_tls: true,
  });

  // Solo Admin puede acceder
  if (user?.role !== 1) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Acceso denegado. Solo administradores pueden configurar el correo.</AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await emailConfigService.getConfig();
      setConfig(data);
      setForm({
        enabled: data.enabled,
        server: data.server,
        port: data.port,
        username: data.username,
        password: '',
        from_email: data.from_email,
        from_name: data.from_name,
        use_tls: data.use_tls,
      });
      setTestRecipient(data.username || '');
    } catch (err) {
      showAlert('error', 'No se pudo cargar la configuración de correo.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: EmailConfigUpdate = { ...form };
      if (!payload.password) delete payload.password; // No enviar si está vacío
      await emailConfigService.saveConfig(payload);
      showAlert('success', 'Configuración guardada correctamente.');
      loadConfig();
    } catch (err: any) {
      showAlert('error', err?.response?.data?.detail || 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testRecipient) {
      showAlert('error', 'Ingresa el correo destinatario de prueba.');
      return;
    }
    setTesting(true);
    try {
      const result = await emailConfigService.sendTestEmail(testRecipient);
      showAlert('success', result.message);
    } catch (err: any) {
      showAlert('error', err?.response?.data?.detail || 'Error al enviar correo de prueba.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Mail className="h-7 w-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Configuración de Correo</h1>
          <p className="text-sm text-muted-foreground">
            Configure el servidor SMTP para envío automático de correos al crear vales.
          </p>
        </div>
      </div>

      {/* Estado actual */}
      {config && (
        <Alert className={config.source === 'database' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}>
          <AlertDescription className="text-sm">
            {config.source === 'database'
              ? '✅ Configuración cargada desde la base de datos.'
              : '⚙️ Configuración por defecto cargada.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de resultado */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}
          className={alert.type === 'success' ? 'border-green-200 bg-green-50' : ''}>
          {alert.type === 'success'
            ? <CheckCircle className="h-4 w-4 text-green-600" />
            : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Formulario principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Servidor SMTP</CardTitle>
          <CardDescription>
            Para Gmail: usar App Password (no la contraseña normal).<br />
            Obtenerla en: myaccount.google.com → Seguridad → Contraseñas de aplicación
            Debe habilitar antes la verificación de dos factores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Activar/Desactivar */}
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <input
              type="checkbox"
              id="enabled"
              checked={form.enabled}
              onChange={e => setForm({ ...form, enabled: e.target.checked })}
              className="h-4 w-4 cursor-pointer"
            />
            <Label htmlFor="enabled" className="cursor-pointer font-medium">
              Activar envío de correos
            </Label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="server">Servidor SMTP</Label>
              <Input
                id="server"
                value={form.server}
                onChange={e => setForm({ ...form, server: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="port">Puerto</Label>
              <Input
                id="port"
                type="number"
                value={form.port}
                onChange={e => setForm({ ...form, port: parseInt(e.target.value) || 587 })}
                placeholder="587"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Usuario (correo)</Label>
            <Input
              id="username"
              type="email"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="tu-correo@gmail.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              Contraseña / App Password
              {config?.password_set && <span className="ml-2 text-xs text-muted-foreground">(ya configurada — dejar en blanco para no cambiar)</span>}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={config?.password_set ? '••••••••••••••••' : 'App Password de 16 caracteres'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="from_email">Email remitente</Label>
              <Input
                id="from_email"
                type="email"
                value={form.from_email}
                onChange={e => setForm({ ...form, from_email: e.target.value })}
                placeholder="notificaciones@empresa.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from_name">Nombre remitente</Label>
              <Input
                id="from_name"
                value={form.from_name}
                onChange={e => setForm({ ...form, from_name: e.target.value })}
                placeholder="Sistema de Vales GPA"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <input
              type="checkbox"
              id="use_tls"
              checked={form.use_tls}
              onChange={e => setForm({ ...form, use_tls: e.target.checked })}
              className="h-4 w-4 cursor-pointer"
            />
            <Label htmlFor="use_tls" className="cursor-pointer">
              Usar STARTTLS (recomendado para puerto 587)
            </Label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar configuración
          </Button>
        </CardContent>
      </Card>

      {/* Correo de prueba */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Correo de Prueba</CardTitle>
          <CardDescription>Verifica que la configuración SMTP es correcta enviando un correo de prueba.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="test_recipient">Destinatario de prueba</Label>
            <Input
              id="test_recipient"
              type="email"
              value={testRecipient}
              onChange={e => setTestRecipient(e.target.value)}
              placeholder="tu-correo@ejemplo.com"
            />
          </div>
          <Button onClick={handleTest} disabled={testing || !form.enabled} variant="outline" className="w-full">
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar correo de prueba
          </Button>
          {!form.enabled && (
            <p className="text-xs text-muted-foreground text-center">
              Activa el envío de correos para poder enviar una prueba.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Información de configuración para SMTP corporativo */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Referencia de configuración</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p><strong>Gmail:</strong> server=smtp.gmail.com · port=587 · TLS=activado · contraseña=App Password</p>
          <p><strong>Outlook/365:</strong> server=smtp.office365.com · port=587 · TLS=activado</p>
          <p><strong>SMTP propio sin TLS:</strong> port=25 o 465 · TLS=desactivado</p>
        </CardContent>
      </Card>
    </div>
  );
}
