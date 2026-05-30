---
title: Cómo usar una clase Fixture con xUnit
description: Aprende cómo utilizar Fixtures en xUnit para compartir contexto, reducir la duplicación de código y organizar mejor tus pruebas automatizadas.
date: 2022-02-13
category: Testing
tags:
  - tutorial
  - dotnet
  - testing
  - csharp
readingTime: 6
---

Hola a todos, ¿cómo están? Me gustaría compartir un consejo que considero muy útil para quienes escriben pruebas utilizando xUnit: el uso de Fixtures.

Para quienes están comenzando en el mundo de las pruebas unitarias, como me pasó a mí, es muy común escribir pruebas de esta manera:

```cs
[Fact]
public void PruebaAreaCuadrado()
{
    Area area = new();
    int result = area.Cuadrado(5);
    Assert.Equal(25, result);
}

[Fact]
public void PruebaAreaTriangulo()
{
    Area area = new();
    int result = area.Triangulo(10, 5);
    Assert.Equal(25, result);
}

[Fact]
public void PruebaAreaRectangulo()
{
    Area area = new();
    int result = area.Rectangulo(5, 3);
    Assert.Equal(15, result);
}
```

Lo cual es completamente normal al principio, pero podemos notar que en cada prueba estamos instanciando repetidamente la clase **Area** para poder utilizar sus métodos en los casos de prueba.

Esto significa que cada vez que una prueba de la misma clase necesita ejecutarse, se crea una nueva instancia de esa clase, y utilizar una Fixture resuelve esta necesidad.

Una Fixture es una clase compartida entre todos los métodos de prueba. Dentro de esta clase puedes configurar todo lo necesario para las pruebas, evitando instanciar clases en cada prueba individual y mejorando el tiempo de ejecución.

## Creando la Fixture

Dentro de la clase de pruebas, creamos otra clase — en mi caso `AreaFixture` — que tendrá como propiedad la clase `Area` ya instanciada:

```cs
public class AreaFixture
{
    public Area Area => new();
}
```

Después de eso, para compartir esta instancia entre todas nuestras pruebas, agregamos una interfaz a la clase de pruebas utilizando `IClassFixture`.

La interfaz `IClassFixture` espera recibir una clase Fixture, en este caso `AreaFixture`:

```cs
public class AreasTest : IClassFixture<AreaFixture>
```

El último paso es agregar `AreaFixture` al constructor de la clase `AreasTest` mediante inyección de dependencias:

```cs
public class AreasTest : IClassFixture<AreaFixture>
{
    private readonly AreaFixture _areaFixture;

    public AreasTest(AreaFixture areaFixture)
    {
        _areaFixture = areaFixture;
    }
}
```

Ahora, cuando xUnit ejecute las pruebas, se creará solo una instancia y todas las pruebas tendrán acceso a los métodos de la clase `Area` a través de `_areaFixture.Area`.

```cs
[Fact]
public void PruebaAreaCuadrado()
{
    Area area = _areaFixture.Area;
    int result = area.Cuadrado(5);
    Assert.Equal(25, result);
}

[Fact]
public void PruebaAreaTriangulo()
{
    Area area = _areaFixture.Area;
    int result = area.Triangulo(10, 5);
    Assert.Equal(25, result);
}

[Fact]
public void PruebaAreaRectangulo()
{
    Area area = _areaFixture.Area;
    int result = area.Rectangulo(5, 3);
    Assert.Equal(15, result);
}
```

[Código completo](https://gist.github.com/fernanduandrade/9901165cfb1bb66a1d8483cc9823d4ff)