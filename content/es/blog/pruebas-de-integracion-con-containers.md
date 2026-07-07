---
title: Pruebas de integración con containers
description: Aprende cómo crear pruebas de integración más confiables utilizando containers para simular entornos reales durante la ejecución de las pruebas.
date: 2023-03-02
category: Testing
tags:
  - csharp
  - dotnet
  - tutorial
  - tdd
---

<h1 id="1-intro">1. Introducción</h1>

Durante el desarrollo de software es esencial realizar pruebas. Las pruebas de integración permiten validar todo el flujo de la aplicación, desde su infraestructura hasta las llamadas a las APIs, garantizando que todo funcione como se espera y facilitando la identificación de errores durante las interacciones con las APIs.

Generalmente, al realizar pruebas de integración se utiliza un **DbInMemory** (una base de datos en memoria funciona como una base de datos común, pero su contenido se almacena en memoria en lugar de en disco). Sin embargo, inyectar datos en memoria no nos brinda un escenario real de una aplicación ejecutándose en producción.

Utilizar un container Docker nos permite levantar temporalmente una base de datos para ejecutar los casos de prueba, logrando así replicar un escenario real donde la aplicación funciona junto a una base de datos.

Este artículo será un poco largo. Asumiendo que ya tienes conocimientos básicos de .NET, este tutorial muestra cómo configurar una aplicación en .NET 6 o superior para iniciar una instancia Docker y permitir que las pruebas interactúen con una base de datos utilizando el paquete :contentReference[oaicite:3]{index=3}.

Para este ejemplo no se utilizó ningún patrón de diseño popular, manteniendo todo lo más simple posible. Puedes encontrar el código fuente en este :contentReference[oaicite:4]{index=4}.

<h1 id="2-requirements">2. Requisitos</h1>

Para este tutorial necesitas tener:

- [.NET 6 o superior](https://dotnet.microsoft.com/en-us/download)
- [Docker](https://docs.docker.com/engine/install/ubuntu/)

<h1 id="3-content">3. Contenido</h1>

Asumiendo que ya tienes experiencia previa con C# y .NET, el código fue mantenido simple para facilitar el entendimiento.

Tenemos una solución con dos proyectos: una Web API y un proyecto de pruebas, con la siguiente estructura:

### TodoApi

```bash
├── appsettings.Development.json
├── appsettings.json
├── Context
│   ├── AppContext.cs
│   └── IAppContext.cs
├── Controllers
│   └── TodoController.cs
├── Models
│   └── Todo.cs
├── Program.cs
├── Properties
│   └── launchSettings.json
└── TodoApi.csproj
```

### TodoApiIntegrationTest

```bash
├── Setup
│   ├── ClientFixture.cs
│   ├── SeedCreator.cs
│   └── WebApiFactoryConfig.cs
├── TodoApiIntegrationTest.csproj
├── TodoControllerTest.cs
└── Usings.cs
```

## Entendiendo la Web API

Comenzando por la Web API:

- **Models/Todo.cs**: Entidad representada en la base de datos.

```cs
public class Todo
{
    public int Id {get; set;}
    public string? Title {get; set;}
    public bool Done {get; set;}
}
```

- **Context/IAppContext.cs**: Representa el contrato de nuestra clase abstracta `AppContext`.

```cs
public interface IAppContext
{
    DbSet<Todo> Todos {get; set;}
}
```

- **Context/AppContext.cs**: Representa la implementación de la interfaz `IAppContext`.

```cs
public class AppDbContext : DbContext, IAppContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Todo> Todos {get; set;}
}
```

- **Controller/TodoController.cs**: Contiene los endpoints y, por simplicidad, inyectamos directamente el contexto de la base de datos.

```cs
[ApiController]
[Route("api/[controller]")]
public class TodoController : ControllerBase
{
    private readonly AppDbContext _context;

    public TodoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<int>> GetAllTodo()
    {
       var result = await _context.Todos
        .AsNoTracking()
        .ToListAsync();

       return Ok(result);
    }
}
```