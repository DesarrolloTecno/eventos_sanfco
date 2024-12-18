const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;

// Configurar CORS para permitir solo el frontend en el puerto 3000
app.use(cors({
    origin: 'http://localhost:3000', // Permitir solicitudes solo desde tu frontend
    methods: ['POST', 'GET'],        // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type'] // Encabezados permitidos
}));

app.use(express.json()); // Middleware para parsear JSON en las solicitudes

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Eventos_sanfco',
    database: 'eventos'  // Asegúrate de usar el nombre correcto de tu base de datos
});

// Verificar conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err.message);
        return;
    }
    console.log('Conexión exitosa a MySQL');
});

// Ruta para consultar el DNI
app.post('/api/validate-dni', (req, res) => {
    const { dni } = req.body;  // Obtener el DNI del cuerpo de la solicitud

    if (!dni) {
        return res.status(400).json({ message: 'DNI es requerido' }); // Validar entrada
    }

    // Consultar la base de datos para verificar si el DNI existe
    const query = `
        SELECT usuario.nombre AS usuario, rol.nombre AS rol, rol.color AS color 
        FROM usuario 
        JOIN usuario_rol ON usuario.id_usuario = usuario_rol.id_usuario 
        JOIN rol ON usuario_rol.id_rol = rol.id_rol 
        WHERE usuario.DNI = ?`;

    db.query(query, [dni], (err, results) => {
        if (err) {
            console.error('Error en la consulta de base de datos:', err.message);
            return res.status(500).json({ message: 'Error en la base de datos' });
        }

        if (results.length > 0) {
            const user = results[0];  // Tomamos el primer resultado

            console.log('Datos encontrados:', user); // Mostrar los datos en el backend para depuración

            res.json({ match: true, user: user }); // Enviar solo el primer usuario
        } else {
            res.json({ match: false });
        }
    });
});



// Ruta principal para comprobar que el servidor está activo
app.get('/', (req, res) => {
    res.send('Servidor Backend corriendo correctamente');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
