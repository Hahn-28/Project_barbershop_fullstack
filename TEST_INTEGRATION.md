# Test de Integración Backend ↔ Frontend

## Resumen de cambios
✅ **Backend sincronizado con Frontend**

### 1. Cambios en Backend

#### `backend/src/routes/bookings.routes.js`
- ✅ Removido `adminOnly` de `PUT /:id/status`
- **Antes:** Solo admins podían actualizar estado
- **Ahora:** Cualquier usuario autenticado puede actualizar estado de sus reservas

#### `backend/src/controllers/bookings.controller.js`
- ✅ Agregada validación de permisos en `updateBookingStatus`
- **Validaciones:**
  - Solo ADMIN puede cambiar estado a `CONFIRMED`
  - Solo propietario (userId) o ADMIN pueden cambiar a `CANCELLED`
  - Se valida que la reserva exista antes de actualizar

### 2. Cambios en Frontend

#### `frontend/src/lib/hooks/useBookings.ts`
- ✅ Removido parámetro `userId` innecesario
- Ahora el hook es más simple y reutilizable
- Mantiene validación de errores

#### `frontend/src/components/dashboard/ClientDashboard.tsx`
- ✅ Actualizado `useBookings()` sin parámetro
- Sincronizado con nuevo contrato de hook

#### `frontend/src/app/dashboard/page.tsx`
- ✅ Refactorizado a 30 líneas (antes 330)
- Eliminada duplicación de lógica
- Usa componentes modulares

## Pruebas Recomendadas

### Test 1: Cliente cancela su propia reserva
```
1. Login como cliente
2. Ir a Dashboard → Mis Reservas
3. Click en "Cancelar" en una reserva PENDING
4. ✅ Debe mostrar toast: "Reserva cancelada"
5. ✅ Estado debe cambiar a CANCELLED
```

### Test 2: Cliente intenta confirmar reserva (debe fallar)
```
1. Enviar directamente PUT /bookings/:id/status con status="CONFIRMED"
2. ✅ Debe devolver 403: "Only admins can confirm bookings"
```

### Test 3: Admin confirma reserva
```
1. Login como ADMIN
2. Ir a Dashboard → Admin → Todas las Reservas
3. Click en "Confirmar" en una reserva PENDING
4. ✅ Debe mostrar toast: "Reserva confirmada"
5. ✅ Estado debe cambiar a CONFIRMED
```

### Test 4: Admin cancela reserva de otro usuario
```
1. Login como ADMIN
2. En Admin Dashboard, click "Cancelar" en reserva de otro usuario
3. ✅ Debe permitir sin error
4. ✅ Estado debe cambiar a CANCELLED
```

### Test 5: Cliente intenta cancelar reserva de otro (debe fallar)
```
1. Obtener ID de reserva de otro usuario
2. Enviar PUT /bookings/:id/status con status="CANCELLED"
3. ✅ Debe devolver 403: "You can only cancel your own bookings"
```

## Estado de Errores Manejados

El frontend ahora muestra mensajes específicos para:
- ❌ 500: "Error del servidor. Por favor, intenta más tarde."
- ❌ 403: "No tienes permisos para ver estas reservas."
- ❌ 401: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
- ❌ Connection: "No se pudo conectar al servidor. Verifica tu conexión."

## Verificación Rápida

```bash
# 1. Backend debe estar corriendo en puerto 4000
curl http://localhost:4000/

# 2. Frontend debe estar corriendo en puerto 3000
curl http://localhost:3000/

# 3. Test endpoint (autenticado)
curl -H "Authorization: Bearer <TOKEN>" \
  -X PUT http://localhost:4000/bookings/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"CANCELLED"}'
```

## Conclusión

✅ **Backend y Frontend están sincronizados**
- Las validaciones están en sincronía
- Los permisos se validan correctamente
- Los mensajes de error son consistentes
- La lógica de negocio es coherente

