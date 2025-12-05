# Frontend Barbershop

Proyecto Next.js limpio y ordenado para la barbería.

## Configuración
- `NEXT_PUBLIC_API_URL`: URL base del backend (ej. `http://localhost:3000`).

## Convenciones
- Cliente HTTP único en `src/lib/api.ts` con helpers `get`, `post`, `put`, `del`.
- Respuestas del backend pueden venir envueltas como `{ success, message, data }`; el cliente normaliza y devuelve `data` directamente.
- Token de auth almacenado en `localStorage` bajo `auth_token`.
- Hooks de estado del token: `src/lib/useAuthToken.ts` actualiza en tiempo real entre pestañas.
- Utilidades de rol/token en `src/lib/auth.ts`.

## Uso del cliente API
```ts
import { api } from "@/lib/api";

// Servicios
const services = await api.getServices();
await api.createService({ name: "Corte", price: 20 });

// Auth
await api.login({ email: "a@b.com", password: "123" });
```

## Buenas prácticas
- No hacer fetch directo: usa `api.ts` para manejo de errores y headers.
- Mantener componentes server/client según necesidad; evita lógica de fetch en UI.
- No comitear `.next`, `node_modules`, ni `.env*` (ver `.gitignore`).

## Scripts
- `dev`: arranca desarrollo.
- `build`: compila producción.
- `start`: inicia servidor de producción.
- `lint`: ejecuta ESLint.
