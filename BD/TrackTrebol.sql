-- ==========================================
-- 0. EXTENSIONES Y TIPOS DE DATOS (ENUMS)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE rol_usuario AS ENUM ('super_admin', 'admin', 'vecino', 'conductor');
CREATE TYPE estado_gps AS ENUM ('Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja');
CREATE TYPE estado_operativo AS ENUM ('En Servicio', 'En Descanso', 'En Taller');

-- ==========================================
-- 1. SEGURIDAD Y PERFILES
-- ==========================================
CREATE TABLE perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol rol_usuario NOT NULL DEFAULT 'vecino',
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. AUDITORÍA Y LOGS
-- ==========================================
CREATE TABLE historial_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES perfiles(id),
    accion VARCHAR(50) NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id VARCHAR(100),
    datos_nuevos JSONB,
    ip_origen VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medida de seguridad: nadie puede alterar el historial
REVOKE UPDATE, DELETE ON historial_logs FROM PUBLIC;

CREATE OR REPLACE FUNCTION funcion_auditoria_logs()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historial_logs (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        row_to_json(NEW)::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. INVENTARIO: GPS, CAMIONES Y CONDUCTORES
-- ==========================================
CREATE TABLE dispositivos_gps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imei VARCHAR(15) UNIQUE NOT NULL CHECK (imei ~ '^[0-9]{15}$'),
    modelo VARCHAR(50) DEFAULT 'TK102B',
    estado estado_gps DEFAULT 'Disponible',
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conductores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES perfiles(id),
    nombre_completo VARCHAR(150) NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL CHECK (ci ~ '^[0-9]+$'),
    licencia VARCHAR(50) NOT NULL,
    vencimiento_licencia DATE NOT NULL CHECK (vencimiento_licencia > CURRENT_DATE),
    contacto VARCHAR(20),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE camiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa VARCHAR(15) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    anio INTEGER,
    estado_mecanico VARCHAR(200),
    estado_operativo estado_operativo DEFAULT 'En Descanso',
    gps_actual_id UUID REFERENCES dispositivos_gps(id) UNIQUE, 
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. OPERATIVIDAD: ASIGNACIONES DINÁMICAS
-- ==========================================
CREATE TABLE historial_turnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camion_id UUID REFERENCES camiones(id) NOT NULL,
    conductor_id UUID REFERENCES conductores(id) NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Nulo indica turno activo
    -- Campos de Auditoría solicitados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    -- Regla: Un conductor no puede tener dos turnos abiertos al mismo tiempo 
    CONSTRAINT turno_abierto_unico UNIQUE NULLS NOT DISTINCT (conductor_id, fecha_fin)
);

-- ==========================================
-- 5. EXPERIENCIA DEL VECINO Y ZONAS
-- ==========================================
CREATE TABLE domicilios_vecinos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vecino_id UUID REFERENCES perfiles(id) NOT NULL,
    coordenadas GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE feedback_vecinos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vecino_id UUID REFERENCES perfiles(id) NOT NULL,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario VARCHAR(250),
    ubicacion GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE geocercas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    color_hex VARCHAR(7) DEFAULT '#00FF00',
    poligono GEOMETRY(Polygon, 4326) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. TRIGGERS DE AUDITORÍA (COMPLETO)
-- ==========================================
-- Esta sección garantiza que CUALQUIER movimiento en las tablas principales
-- quede registrado de forma inmutable en 'historial_logs'.

-- 1. Auditoría para Usuarios y Roles
CREATE TRIGGER trg_auditoria_perfiles
AFTER INSERT OR UPDATE ON perfiles
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

-- 2. Auditoría para el Inventario de Hardware GPS
CREATE TRIGGER trg_auditoria_gps
AFTER INSERT OR UPDATE ON dispositivos_gps
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

-- 3. Auditoría para el Personal Operativo
CREATE TRIGGER trg_auditoria_conductores
AFTER INSERT OR UPDATE ON conductores
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

-- 4. Auditoría para la Flota de Vehículos
CREATE TRIGGER trg_auditoria_camiones
AFTER INSERT OR UPDATE ON camiones
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

-- 5. Auditoría para las Asignaciones (Quién manejó qué)
CREATE TRIGGER trg_auditoria_turnos
AFTER INSERT OR UPDATE ON historial_turnos
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

-- 6. Auditoría para las Zonas de Trabajo (Geocercas)
CREATE TRIGGER trg_auditoria_geocercas
AFTER INSERT OR UPDATE ON geocercas
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

-- 7. Auditoría para la Interacción del Vecino (Opcional pero recomendado para soporte)
CREATE TRIGGER trg_auditoria_domicilios
AFTER INSERT OR UPDATE ON domicilios_vecinos
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

CREATE TRIGGER trg_auditoria_feedback
AFTER INSERT OR UPDATE ON feedback_vecinos
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();