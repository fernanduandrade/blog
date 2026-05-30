---
title: Testes de integração com containers
description: Veja como criar testes de integração mais confiáveis utilizando containers para simular ambientes reais durante a execução dos testes.
date: 2023-03-02
category: Testing
tags: 
    - csharp
    - dotnet
    - tutorial
    - tdd
readingTime: 8
---

<h1 id="1-intro">1. Introdução</h1>
Durante o desenvolvimento de software é essencial realizamos testes. Testes de integração permite que todo fluxo da aplicação seja testada, desde da sua infraestutura até as chamadas da suas APIs, dessa forma garantindo que entregue o que seja esperado e tornando-se mais fácil de identificar erros que podem existir durante as chamadas de suas APIs. 

Geralmente quando realizamos testes de integração é utilizado um **DbInMemory**(Um banco de dados na memória funciona como um banco de dados comum, mas o conteúdo é armazenado na memória em vez de no disco), porém, injetar dados em memória não nos traz um cenário real de uma aplicação rodando. Utilizar um container docker nos permite subir um banco de dados temporariamente para execução dos casos de teste e com isso conseguimos replicar um cenário real de uma aplicação rodando em conjunto com um banco de dados.

Este artigo será um pouquinho longo. Assumindo que você já tenha um conhecimento básico com .NET. Este é um tutorial de como configurar uma aplicação em .NET 6 ou superior para subir uma instância do docker e os testes serem capazes de interagir com um banco de dados, fazendo uso do package [Testcontainers](https://github.com/testcontainers/testcontainers-dotnet) para subir a instância. Para este exemplo não foi utilizado nenhum padrão de projeto popular, mantendo o mais simples possível. Você pode encontrar o source do código neste [link](https://github.com/fernanduandrade/TodoApiSample)

<h1 id="2-requirements">2. Requisitos</h1>
Para este tutorial você precisa ter
- [.NET 6 ou superior](https://dotnet.microsoft.com/en-us/download)
- [Docker](https://docs.docker.com/engine/install/ubuntu/)

<h1 id="3-content">3. Conteúdo</h1>
Considerando que já tenha uma experiência prévia com C# e .NET o código está simples para entendimento. Temos uma solução com dois projetos, sendo um a webapi e o outro projeto de teste, com a seguinte estrutura:
### TodoApi
```bash
├── appsettings.Development.json
├── appsettings.json
├── Context
│   ├── AppContext.cs
│   └── IAppContext.cs
├── Controllers
│   └── TodoController.cs
├── Models
│   └── Todo.cs
├── Program.cs
├── Properties
│   └── launchSettings.json
└── TodoApi.csproj
```

### TodoApiIntegrationTest
```bash
├── Setup
│   ├── ClientFixture.cs
│   ├── SeedCreator.cs
│   └── WebApiFactoryConfig.cs
├── TodoApiIntegrationTest.csproj
├── TodoControllerTest.cs
└── Usings.cs
```

## Entendo a webapi
Iniciando pela webapi temos:
- **Models/Todo.cs**: Entidade que é representada no banco de dados.
```cs
public class Todo
{
    public int Id {get; set;}
    public string? Title {get; set;}
    public bool Done {get; set;}
}
```

- **Context/IAppContext.cs**: O *IAppContext.cs* representa o contrato para a nossa classe abstrata *AppContext*.
```cs
public interface IAppContext
{
    DbSet<Todo> Todos {get; set;}
}
```

- **Context/AppContext.cs**: O *AppContext.cs* representa a definição da classe abstrata da nossa interface *IAppContext*.
```cs
public class AppDbContext : DbContext, IAppContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Todo> Todos {get; set;}
}
```

- **Controller/TodoController.cs**: Nele contém os endpoints, e estamos injetando por dependência o Context do banco diretamente pela simplicidade.
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
 
**Program.cs**: Responsável por registrar e resolver as dependências do projeto. A partir do .NET 6 não há a necessidade de uma class statup e a aplicação é iniciada atráves do [top level statements](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/top-level-statements).
No *Program.cs* é implementado o context, passando a conexão com o banco e usando para este exemplo o provedor Npgsql e o registro do *IAppContext* para conseguirmos utilizar injeção de dependência, e, além do Context é adicionado uma classe **partial**, fazemos isso porque a aplicação está sendo iniciada por top level statement, para os testes de integração é utilizado o WebApplicationFactory que receber um classe Program, utilizar uma class partial permite expor o conteúdo do Program.cs
```cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connection = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connection).UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
        
builder.Services.AddScoped<IAppContext>(provider => provider.GetRequiredService<AppDbContext>());
var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();

public partial class Program { }
```
## Entendo o projeto de teste
Agora iremos configurar o projeto de testes, neste exemplo faço uso de Fixture(abordagem de subir uma instância da classe de teste para cada teste executado, dessa forma qualquer código inserido no construtor da classe de teste será executado para cada teste individual) afim de evitar repetição de código e deixar mais limpo possível.

### WebApiFactoryConfig.cs
No WebApiFactoryConfig.cs vamos utilizar o WebApplicationFactory para criar uma instância da nossa classe Program
Para classe é criado dois types genericos <TProgram, TDbContext> para facilitar a criação da Fixture. Utilizando o TestContainer é temos uma propriedade **_container** que irá ser responsável por criar a instância do banco de dados utilizando uma imagem docker. Em seguida fazemos uma nova implementação do método ConfigureWebHost através do *override* para implementar nossa conexão da imagem docker, além disso é adicionado também o *SeedCreator* para adicionar alguns dados para os testes.

```cs
public class WebApiFactoryConfig<TProgram, TDbContext> :
    WebApplicationFactory<TProgram>, IAsyncLifetime where TProgram :
        class where TDbContext : DbContext
{
    private readonly TestcontainerDatabase _container =
        new TestcontainersBuilder<PostgreSqlTestcontainer>()
            .WithDatabase(new PostgreSqlTestcontainerConfiguration
            {
                Database = "todo_db",
                Password = "supersecuritypassword",
                Username = "postgres"
            })
            .WithImage("postgres:11")
            .WithCleanUp(true)
            .Build();
    
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault( d => d.ServiceType == typeof(DbContextOptions<TDbContext>));
            if (descriptor != null) services.Remove(descriptor);
            services.AddDbContext<TDbContext>(options => { options.UseNpgsql(_container.ConnectionString); });
            

            var serviceProvider = services.BuildServiceProvider();

            using var scope = serviceProvider.CreateScope();
            var scopedServices = scope.ServiceProvider;
            var context = scopedServices.GetRequiredService<TDbContext>();
            context.Database.EnsureCreated();
            
            services.AddTransient<SeedCreator>();
        });
    }

    public async Task InitializeAsync() => await _container.StartAsync();

    public new async Task DisposeAsync() => await _container.DisposeAsync();
}
```

### SeedWork.cs
O SeedWork.cs é uma classe que há alguns métodos para adicionar dados no database da imagem docker
```cs
private readonly AppDbContext _context;

    public SeedCreator(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddTodo()
    {
        var todos = new List<Todo>
        {
            new Todo { Done = false, Title = "Fazer Compras" },
            new Todo { Done = false, Title = "Areia para caixinha dos gatos" },
            new Todo { Done = false, Title = "Lavar as roupas" },
            new Todo { Done = true, Title = "Ir ao shopping" },
        };

        await _context.Todos.AddRangeAsync(todos);
        await _context.SaveChangesAsync();
    }
```

### ClientFixture
Essa classe é responsável por disponibilizar algumas propriedades e métodos de chamadas HTTP para nossos controler de teste, como também instanciar o WebAppFactory recebendo a classe *Program* e a classe do context *AppDbContext*
```cs
public class ClientFixture : IClassFixture<WebApiFactoryConfig<Program, AppDbContext>>
{
    private readonly WebApiFactoryConfig<Program, AppDbContext> Factory;
    public readonly HttpClient Client;
    public readonly SeedCreator SeedWork;
    public readonly AppDbContext dbContext;

    public ClientFixture(WebApiFactoryConfig<Program, AppDbContext> factory)
    {
        Factory = factory;
        var scope = factory.Services.CreateScope();
        dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Client = factory.CreateClient();
        SeedWork = scope.ServiceProvider.GetRequiredService<SeedCreator>();
    }

    public async Task<HttpResponseMessage> AsPostAsync<T>(string url, T body)
    {
        var json = JsonSerializer.Serialize(body);
        var buffer = System.Text.Encoding.UTF8.GetBytes(json);
        var byteContent = new ByteArrayContent(buffer);
        byteContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        return await Client.PostAsync(url, byteContent);
    }

    public async Task<HttpResponseMessage> AsPutAsync<T>(string url, T body)
    {
        var json = JsonSerializer.Serialize(body);
        var buffer = System.Text.Encoding.UTF8.GetBytes(json);
        var byteContent = new ByteArrayContent(buffer);
        byteContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        return await Client.PutAsync(url, byteContent);
    }

    public async Task<HttpResponseMessage> AsGetAsync(string url)
        => await Client.GetAsync(url);

    public async Task<HttpResponseMessage> AsDeleteAsync(string url)
        => await Client.DeleteAsync(url);
}
```

###TodoApiIntegrationTest.cs
No TodoApiIntegrationTest.cs herda o *ClientFixture*, é passado no construtor a classe Program e AppDbContext para instanciar o WebAppFactory. Temos dois casos de teste, com os métodos de chamada HTTP criado no ClienFixture e com isto conseguimos chamar as rotas da API, em seguida é garantir que o resultado da chamada esteja como esperado fazendo uso dos Asserts.

```cs
public class TodoControllerTest : ClientFixture
{
    public TodoControllerTest(WebApiFactoryConfig<Program, AppDbContext> factory) : base(factory) {}


    [Fact]
    public async Task Create_New_Todo_Return_200OK()
    {
        // Arrange
        Todo @todo = new()
        {
            Done= false,
            Title = "Novo todo",
        };

        // Act
        var response = await AsPostAsync("api/Todo/", todo);
        var resultId = Int32.Parse(await response.Content.ReadAsStringAsync());
        // Assert
        Assert.True(resultId > 0);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Get_Todo_Return_200OK()
    {
        // Arrange
        await SeedWork.AddTodo();
        
        // Act
        var response = await AsGetAsync("api/Todo/");
        var result = await response.Content.ReadAsStringAsync();
        
        // Assert
        List<Todo>? todos =  JsonSerializer.Deserialize<List<Todo>>(result);
        var assertresult = todos?.Count == 5;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(assertresult);
    }
}
```
Neste caso de teste foi realizado chamada do SeedWork e logo em seguida é possível obter os dados que foram adicionados no container 😁.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zpidlhh259vocazsyb0b.png)

<h1 id="4-final-thoughts">4. Consideração final</h1>
Testes de integração com container facilita a inicialização de um banco de dados completo para fins de teste, tornando-se perfeito para testes de integração!

Espero que este artigo tenha sido útil e básico para o entendimento de todos, obrigado se você leu até aqui.