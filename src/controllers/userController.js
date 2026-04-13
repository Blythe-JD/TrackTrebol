const userController = {
    // 1. Crear Perfil (Sincronizado con UUID de Supabase)
    crearPerfil: async (req, res) => {
        const supabase = req.supabase;
        const { id, nombre_completo, rol } = req.body;

        try {
            const { data, error } = await supabase
                .from('perfiles')
                .insert([{ id, nombre_completo, rol }]);

            if (error) throw error;
            res.status(201).json({ status: "success", message: "Perfil creado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 2. Borrado Lógico (Soft Delete actualizando deleted_at)
    eliminarPerfil: async (req, res) => {
        const supabase = req.supabase;
        const { id } = req.params;

        try {
            const { error } = await supabase
                .from('perfiles')
                .update({ deleted_at: new Date() })
                .eq('id', id);

            if (error) throw error;
            res.json({ status: "success", message: "Perfil desactivado con éxito" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. Registrar Conductor (Validación de CI y Licencia)
    registrarConductor: async (req, res) => {
        const supabase = req.supabase;
        const { perfil_id, nombre_completo, ci, licencia, vencimiento_licencia } = req.body;

        // Validación: El CI debe ser solo números (Regla SQL)
        if (!/^[0-9]+$/.test(ci)) {
            return res.status(400).json({ error: "El CI debe contener solo dígitos numéricos" });
        }

        try {
            const { error } = await supabase
                .from('conductores')
                .insert([{ perfil_id, nombre_completo, ci, licencia, vencimiento_licencia }]);

            if (error) throw error;
            res.status(201).json({ status: "success", message: "Conductor registrado con éxito" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = userController;
