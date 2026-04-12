# Instrucciones Generales para el Equipo de Desarrollo

**IMPORTANTE: Para todos los desarrolladores**
- Deben guiarse estrictamente por el **documento del proyecto** (ustedes ya saben a qué me refiero) en base a todos los requerimientos y reglas de negocio allí descritas.
- Para estructurar las validaciones y los datos de envío/recepción, **la base de datos (TrackTrebol.sql) es la guía oficial obligatoria**. Verifiquen qué datos son requeridos u opcionales, longitudes máximas y valores por defecto en el esquema SQL.
- Validen rigurosamente los datos en los formularios (Frontend) antes de enviar la petición, y luego verifiquen la integridad nuevamente a la llegada de la solicitud (Backend).
- **Login y Sesión:** De momento, y para no bloquear el desarrollo, se deberá trabajar con **datos ficticios/quemados** en lo relacionado a la sesión de usuario hasta que el sistema de autenticación centralizado se encuentre finalizado.

### Requerimientos de Comunicación Frontend/Backend
- El **Frontend** tiene que preparar todo su entorno (HTML, CSS y JS puro/modular). Para hacer las peticiones, utilizarán obligatoriamente **Fetch API**, enviando y recibiendo el cuerpo de datos en formato **JSON**.
- El **Backend** analizará dichos Request JSON y su labor es procesarlo, registrar y **confirmar siempre la correcta recepción** o enviar las respuestas de error respectivas a través de una respuesta JSON estándar.

---

## Responsabilidades y Tareas por Desarrollador / Rama

### 1. Dev A (Jhon) - [Rama: backend/auth]
**Prioridad: Sprint 1 (Inicio Seguro)**
- **Core Auth:** Implementar la lógica de autenticación utilizando el SDK de Supabase, manejando de forma segura el intercambio de tokens (JWT).
- **Middleware de Autorización:** Crear funciones de interceptación (middlewares) que validen el rol del usuario (Súper Admin, Admin, Operador/Conductor) antes de llegar a cualquier controlador protegido.
- **Lógica de Bloqueo:** Programar la lógica del contador de intentos fallidos (máximo 5 iteraciones). Al alcanzar ese número, se debe bloquear temporalmente el acceso de la cuenta.
- **Endpoint de Auditoría:** Crear el controlador GET para `historial_logs` asegurando recibir parámetros de paginación (`offset` / `limit`) en la URL para devolver los registros de 50 en 50.

### 2. Desarrollador B - [Rama: backend/user]
**Lógica de Entidades y Usuarios**
Se encarga en particular de la gestión de la tabla `perfiles` y `conductores`.
- **CRUD de Usuarios:** Desarrollar controladores POST, PUT y PATCH para los perfiles. La eliminación debe manejarse forzosamente mediante **Soft Delete** (actualizar la columna `deleted_at`).
- **Validaciones de Perfil:** Validar meticulosamente formatos (ej. uso de Regex para correos) y asegurar mediante lógica interna que el ID del perfil nuevo coincide en todo momento con el UUID registrado en la tabla de Auth de Supabase enviada en el Token.
- **Controlador de Conductores:** Crear un endpoint POST para registrar datos de índole laboral (Cédula de Identidad, tipo de Licencia), existiendo la casuística de poder vincularlo, o no, en ese mismo momento con un `perfil_id`.

### 3. Desarrollador C - [Rama: backend/asset]
**Lógica de Activos e Inventario**
Se encarga de la maquinaria y periféricos de rastreo.
- **Controlador de Camiones:** Implementar la lógica para dar de alta camiones en el sistema. Se exige validador de que la placa introducida **no exista de forma duplicada** y manejar las actualizaciones para sus estados operativos (ej. En Servicio, En Descanso, En Taller).
- **Gestión de Hardware GPS:** Endpoints base para registrar el inventario en formato alta/baja de hardware para dispositivos *TK102B*. El validador fundamental es que el código IMEI digitado cuente estrictamente con **15 dígitos numéricos**.
- **Vinculación Camión-GPS:** Diseñar la lógica backend y validaciones que permitan vincular y cambiar un `dispositivo_gps_id` hacia un vehículo. Antes de la transacción, el sistema debe revisar que ese propio GPS se halle en estado "Disponible".

### 4. Desarrollador D - [Rama: backend/ops]
**Lógica Operativa y Turnos**
Se encarga de las métricas y la operatividad intersecada.
- **Controlador de Turnos:** Lógica esencial para iniciar un turno marcando su `fecha_inicio` y cerrarlo insertando su `fecha_fin`. La lógica exige que previo a abrir un turno en el controlador, indague que su conductor actual no posea otro en estado abierto.
- **Cálculo de Disponibilidad:** Elaborar un endpoint/ruta que devuelva el agrupado/listado en vivo de qué camiones y qué operarios/conductores NO disponen de un turno activo actualmente en la base de datos para la asignación rápida.
- **API de Dashboard:** Programar un endpoint consolidado usando SQL eficiente, consultas agregadas (`COUNT`, `GROUP BY`) u ORM para despachar totales generales para los indicadores (KPIs). Qué tamaño tiene la flota y en qué porcentaje o estatus operativo ronda cada activo.
