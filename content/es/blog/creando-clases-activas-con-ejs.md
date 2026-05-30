---
title: Creando clases activas con EJS
description: 
date: 2021-05-29
category: WebDevelopment
tags:
  - tutorial
  - ejs
  - javascript
  - node
readingTime: 4
---

[EJS](https://ejs.co/) es un lenguaje de plantillas que utiliza JavaScript para generar HTML, además de permitir compartir plantillas y datos entre diferentes páginas. Este post demuestra cómo utilizar una clase **active** para mostrar al usuario qué página está siendo accedida actualmente en una aplicación Node.js usando EJS como motor de plantillas.

## Boilerplate

Haciendo [clic aquí](https://github.com/fernanduandrade/ejs-boilerplate) puedes clonar un boilerplate con la configuración mínima necesaria para que la aplicación funcione.

## Primeros pasos y estructura del proyecto

Con la aplicación en ejecución, vamos allá...  
Solo para entender mejor el proyecto, podemos notar la siguiente estructura:

<ul>
<li>Views - directorio donde la aplicación busca los archivos EJS.</li>
<li>Public - directorio para archivos estáticos.</li>
<li>Routes - directorio utilizado para definir qué ruta renderizará cada plantilla.</li>
</ul>

Solo vamos a modificar las carpetas **public** y **views**. Agrega el siguiente CSS en `style.css`:

```css
.nav-link {
    text-decoration: none;
    font-size: 20px;
    color: #fff;
    background: #333;
}

.nav-link:hover {
    background: purple;
}

.active {
    background: purple;
}
```

## Obteniendo clases activas dinámicas

A continuación, para obtener una clase activa dinámica en EJS, utilizaremos variables y **partials**. Los partials son plantillas reutilizables creadas para evitar la repetición de código y compartir componentes entre diferentes vistas.

Dentro del directorio `views/partials`, crea un archivo llamado **nav.ejs** con el siguiente código:

```html
<nav>
    <a class="<%= active === 'Home' ? 'nav-link active' : 'nav-link'%>" href="/">Home</a>
    <a class="<%= active === 'About' ? 'nav-link active' : 'nav-link'%>" href="/about">About</a>
    <a class="<%= active === 'Contact' ? 'nav-link active' : 'nav-link'%>" href="/contact">Contact</a>
</nav>
```

Creamos una plantilla `.ejs` reutilizable. La sintaxis de EJS utiliza `<%= %>` para definir variables, crear condicionales, bucles y mostrar valores de variables.

Dentro del atributo `class`, usando la sintaxis de EJS, creamos una variable llamada `active` y comparamos su valor con **Home, About y Contact** utilizando una condición ternaria. Si la condición es verdadera, el enlace activo será resaltado mientras que los demás permanecerán normales.

## Finalizando

Ahora que tenemos nuestra plantilla reutilizable con las condiciones definidas, podemos incluirla en nuestras páginas.

Para incluir una plantilla EJS dentro de otra página utilizamos:

```html
<%- include(relative/path/to/file) %>
```

Entonces, ahora agregaremos la plantilla a cada página dentro del directorio `pages`. Dentro de cada página, agrega el siguiente código justo encima de la etiqueta `h2`:

```html
<%- include('../partials/nav', {active: 'About' }); %>
```

Observa que, después de pasar la ruta relativa del partial, también estamos pasando un valor a la variable `active` definida en **nav.ejs**. Esta es la forma de asignar valores a variables en EJS cuando se importa una plantilla dentro de otra vista.

Finalmente, después de incluir la plantilla en todas las páginas y definir el valor correspondiente para la variable `active`, obtendremos el siguiente resultado final.

![Resultado final](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2skzyw70zvpodpoojiqf.png)

¡Espero que les haya gustado! Este fue mi primer post, así que cualquier consejo sobre cómo puedo mejorar tanto mi escritura como este código será muy bienvenido. ¡Hasta la próxima 💜