# Instalación de Node.js en Windows

Para ejecutar este proyecto en un entorno local con Windows, es necesario tener instalado **Node.js**. A continuación, se detallan los pasos para realizar una instalación limpia y correcta.

## Versión Recomendada
Para evitar problemas de compatibilidad o errores durante la ejecución del proyecto, **debes descargar la versión exacta `v24.11.1`** de Node.js.

---

## Pasos para la instalación

1. **Descargar el instalador oficial:**
   - Ingresa al sitio web oficial de Node.js en su sección de versiones anteriores (Previous Releases) para conseguir la versión específica.
   - O usa este enlace directo para la versión **v24.11.1**: [Descargas de Node.js v24.11.1](https://nodejs.org/dist/v24.11.1/)
   - Descarga el archivo instalador ejecutable `.msi` para tu sistema operativo (probablemente `node-v24.11.1-x64.msi` para un Windows de 64 bits).

2. **Ejecutar el instalador:**
   - Cuando termine la descarga, abre el archivo `.msi` que acabas de descargar.
   - Haz clic en **"Next"** (Siguiente).
   - Acepta los términos de la licencia marcando la casilla correspondiente y presiona **"Next"**.
   - **Carpeta de destino:** Deja la ruta por defecto (típicamente `C:\Program Files\nodejs\`) y haz clic en **"Next"**.
   - **Custom Setup:** Asegúrate de que todas las opciones por defecto estén seleccionadas, muy especialmente la que dice **"Add to PATH"**. Al estar agregada al PATH, podrás utilizar los comandos de node desde cualquier terminal. Haz clic en **"Next"**.
   - **Herramientas nativas (Tools for Native Modules):** Opcionalmente, te preguntará si instalar herramientas adicionales como Chocolatey o dependencias de compilación. Para este proyecto no son obligatorias, por lo cual puedes **dejar la casilla desmarcada** y hacer clic en **"Next"**.
   - Haz clic en **"Install"** y aguarda a que finalice el proceso. Por último, haz clic en **"Finish"**.

3. **Comprobar que se instaló correctamente:**
   - Es necesario abrir una **nueva** ventana de terminal (CMD o PowerShell) para que reconozca los cambios en el sistema.
   - Escribe el siguiente comando y presiona `Enter`:
     ```bash
     node -v
     ```
   - La terminal **debe responder exactamente con la versión requerida**: `v24.11.1`.
   - A continuación, comprueba el gestor de paquetes de Node (`npm`) ejecutando:
     ```bash
     npm -v
     ```
   - Te deberá devolver un número indicando la versión de npm.

---

Con esto, Node.js estará listo en tu sistema Windows bajo la misma versión necesaria (`v24.11.1`) y ya podrás instalar las dependencias (`npm install`) y levantar el servidor del proyecto.
