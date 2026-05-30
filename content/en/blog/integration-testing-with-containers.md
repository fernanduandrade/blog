---
title: Integration Testing with Containers
description: Learn how to create more reliable integration tests using containers to simulate real environments during test execution.
date: 2023-03-02
category: Testing
tags:
  - csharp
  - dotnet
  - tutorial
  - tdd
readingTime: 8
---

<h1 id="1-intro">1. Introduction</h1>

During software development, testing is essential. Integration tests allow the entire application flow to be tested, from its infrastructure to API calls, ensuring that everything behaves as expected and making it easier to identify issues that may occur during API interactions.

Usually, when running integration tests, an **InMemoryDb** is used (an in-memory database works like a regular database, but its contents are stored in memory instead of on disk). However, injecting in-memory data does not provide a realistic scenario of an application running in production.

Using a Docker container allows us to temporarily spin up a database for test execution, enabling us to replicate a real-world scenario where the application runs alongside a database.

This article will be a bit long. Assuming you already have some basic knowledge of .NET, this tutorial demonstrates how to configure a .NET 6 (or later) application to start a Docker instance and allow tests to interact with a database using the :contentReference[oaicite:0]{index=0} package.

For this example, no popular design pattern was used in order to keep things as simple as possible. You can find the source code in this :contentReference[oaicite:1]{index=1}.

<h1 id="2-requirements">2. Requirements</h1>

For this tutorial you will need:

- [.NET 6 or later](https://dotnet.microsoft.com/en-us/download)
- [Docker](https://docs.docker.com/engine/install/ubuntu/)

<h1 id="3-content">3. Content</h1>

Assuming you already have previous experience with C# and .NET, the code is intentionally simple to understand.

We have a solution with two projects: one Web API project and one test project, with the following structure:

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

## Understanding the Web API

Starting with the Web API:

- **Models/Todo.cs**: Entity represented in the database.

```cs
public class Todo
{
    public int Id {get; set;}
    public string? Title {get; set;}
    public bool Done {get; set;}
}
```

- **Context/IAppContext.cs**: Represents the contract for our abstract `AppContext` class.

```cs
public interface IAppContext
{
    DbSet<Todo> Todos {get; set;}
}
```

- **Context/AppContext.cs**: Represents the implementation of the `IAppContext` interface.

```cs
public class AppDbContext : DbContext, IAppContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Todo> Todos {get; set;}
}
```

- **Controller/TodoController.cs**: Contains the endpoints, and for simplicity we inject the database context directly.

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

    [HttpGet("{id}")]
    public async Task<ActionResult<int>> GetTodoById(int id)
    {
       var result = await _context.Todos
        .AsNoTracking()
        .FirstOrDefaultAsync(todo => todo.Id == id);

       return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> CreateTodo(Todo todo)
    {
        try
        {
            await _context.Todos.AddAsync(todo);
            await _context.SaveChangesAsync();
            return Created("", todo.Id);
        }
        catch(Exception ex)
        {
            return Ok(ex);
        }
    }
}
```

**Program.cs**: Responsible for registering and resolving project dependencies.

Starting with .NET 6, there is no need for a `Startup` class anymore, since the application is initialized using :contentReference[oaicite:2]{index=2}.

In `Program.cs`, the database context is configured using the Npgsql provider, and `IAppContext` is registered for dependency injection.

Additionally, a `partial` class is added because the application uses top-level statements. Integration tests use `WebApplicationFactory`, which expects a `Program` class. Declaring a partial class allows the contents of `Program.cs` to be exposed.

```cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connection = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connection)
           .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));

builder.Services.AddScoped<IAppContext>(provider =>
    provider.GetRequiredService<AppDbContext>());

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();

public partial class Program { }
```