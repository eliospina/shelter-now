# Guía: publicar Bunker Now en Google Play

Todo lo que hay que subir está en `design/play/` y el archivo de la app en
`android/app/build/outputs/bundle/release/app-release.aab`
(para volver a generarlo: `npm run build:release`).

Antes de empezar: fusiona el pull request #7, para que la política de
privacidad esté publicada en https://shelter-now-eta.vercel.app/privacy

## 1. Crear la app

Play Console → **Crear app**

| Campo | Respuesta |
|---|---|
| Nombre de la app | Bunker Now: närmaste skyddsrum |
| Idioma predeterminado | Svenska – sv-SE |
| App o juego | App |
| Gratuita o de pago | Gratuita |
| Declaraciones | Marca las dos casillas (políticas y leyes de exportación de EE. UU.) |

## 2. Configurar la app (panel → "Configura tu app")

**Política de privacidad**
- URL: https://shelter-now-eta.vercel.app/privacy

**Acceso a la app**
- Toda la funcionalidad está disponible sin restricciones (no hay inicio de sesión).

**Anuncios**
- No, la app no contiene anuncios.

**Clasificación del contenido** (cuestionario)
- Correo: ospieli85@gmail.com
- Categoría: **Todas las demás categorías** (no es juego, ni red social)
- Violencia, sexo, lenguaje, drogas, apuestas: **No** a todo
- ¿Los usuarios pueden comunicarse o compartir contenido entre sí? **No** (el SMS lo envía la app de mensajes del usuario)
- ¿Comparte la ubicación del usuario con otros usuarios? **No**
- ¿Compras digitales? **No**

**Público objetivo**
- Edades: **13–15, 16–17 y 18 o más** (no marques menores de 13: la app no está pensada para niños y eso activaría requisitos de Familias)

**App de noticias**: No

**Apps de COVID-19 / salud**: No

**Funciones financieras**: Ninguna

**¿Es una app gubernamental?**: **No** (es un proyecto independiente)

**Seguridad de los datos** (cuestionario)
- ¿Recoge o comparte datos de usuario? **Sí**
- ¿Todos los datos se cifran en tránsito? **Sí** (HTTPS)
- ¿Ofreces una forma de solicitar que se eliminen los datos? **No** (no se guardan: la política lo explica)
- Tipos de datos, marca solo estos dos:
  1. **Ubicación → Ubicación aproximada**
     - Recogida: Sí. Compartida: **No** (Anthropic y Vercel procesan los datos por encargo nuestro, y eso no cuenta como "compartir")
     - ¿Se procesa de forma efímera? **No** (se guarda en memoria hasta 6 horas)
     - ¿Obligatoria u opcional? **Obligatoria** (se envía siempre que hay internet)
     - Finalidad: **Funcionalidad de la app**
     - Por qué es aproximada: con internet, la app envía el id del refugio más cercano y la distancia, lo que muestra más o menos la zona. La ubicación exacta (GPS) nunca sale del móvil.
  2. **Actividad en la app → Otro contenido generado por el usuario**
     - Es la pregunta de seguimiento a Claude ("¿Puedo llevar a mi perro?")
     - Recogida: Sí. Compartida: No. Efímera: No. **Opcional** (solo si el usuario pregunta)
     - Finalidad: **Funcionalidad de la app**

## 3. Ficha de Play Store (Crecimiento → Presencia en Play Store → Ficha principal)

Textos: copia de `design/play/listing.md` (sueco como principal; añade inglés
en "Gestionar traducciones").

| Recurso | Archivo |
|---|---|
| Icono de la app (512 × 512) | `design/play/icon-512.png` |
| Gráfico de funciones (1024 × 500) | `design/play/feature-graphic.png` |
| Capturas de teléfono (mín. 2) | las 5 de `design/play/screenshots/` |

- Categoría: **Mapas y navegación**
- Correo de contacto: ospieli85@gmail.com
- Sitio web: https://shelter-now-eta.vercel.app

## 4. Subir la primera versión

**Probar → Prueba interna → Crear versión**
1. Firma de apps de Google Play: acepta la opción recomendada (Google guarda la llave final; la nuestra es la "llave de subida").
2. Sube `app-release.aab`.
3. Nombre de la versión: 1.0. Notas: "Primera versión."
4. Guarda, revisa y lanza la prueba interna.
5. En **Testers**, crea una lista con tu correo y abre el enlace de participación desde tu móvil.

La prueba interna está disponible en minutos y sin revisión de Google.

## 5. Si la cuenta es personal y nueva (creada después de nov. 2023)

Google exige una **prueba cerrada con al menos 12 personas durante 14 días
seguidos** antes de poder pedir producción.

1. **Probar → Prueba cerrada → Crear canal**, sube el mismo `.aab`.
2. Añade los correos (Gmail) de al menos 12 personas y comparte el enlace.
3. Cada persona tiene que aceptar la invitación e instalar la app; deben
   seguir apuntadas los 14 días.
4. Al día 15: **Panel → Solicitar acceso a producción**.
