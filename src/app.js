const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();

app.use(express.json());

// Configuración de Supabase
const supabaseUrl = process.env.url_bd;
const supabaseKey = process.env.service_rol;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las credenciales de Supabase en el archivo .env (url_bd o service_rol)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Registro en consola para confirmar la conexión base
console.log("Conexión con Supabase configurada exitosamente.");

// Middleware para inyectar el cliente de supabase en los endpoints
app.use((req, res, next) => {
    req.supabase = supabase;
    next();
});

// Configuración de rutas (Se desarrollarán después)
/*
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/ops', require('./routes/ops'));
*/

app.get('/', (req, res) => {
    res.json({ message: 'Servidor API de Track Trebol Activo y con Supabase Configurado.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = app;
