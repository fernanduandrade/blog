---
title: Como usar uma classe Fixture com xUnit
description: Entenda como utilizar Fixtures no xUnit para compartilhar contexto, reduzir duplicação de código e organizar melhor seus testes automatizados.
date: 2022-02-13
category: Testing
tags: 
    - tutorial
    - dotnet
    - testing
    - csharp
readingTime: 6
---


Oi pessoal, tudo certo? Gostaria de compartilhar uma dica que acho interessante para quem escreve testes utilizando o xUnit, que é o uso de Fixture. Para quem está iniciando nessa jornada de testes unitários assim como eu é normal escrevemos dessa forma:

``` cs
[Fact]
public void TesteAreaDoQuadrado()
{
    Area area = new();
    int result = area.Quadrado(5);
    Assert.Equal(25, result);
}

[Fact]
public void TesteAreaDoTriangulo()
{
    Area area = new();
    int result = area.Triangulo(10, 5);
    Assert.Equal(25, result);
}

[Fact]
public void TesteAreaDoRetangulo()
{
    Area area = new();
    int result = area.Retangulo(5, 3);
    Assert.Equal(15, result);
}
```

O que é normal no início, mas podemos que notar que para cada teste estamos instanciando a classe **Area** repetidamente para podermos utilizar os métodos nos casos de teste, isso significa que toda vez que um de nossos testes na mesma classe precisa ser executado, uma nova instância dessa classe é criada e ter uma Fixture resolve essa necessidade. Fixture é uma classe que compartilha todos os métodos de teste, nessa classe você pode configurar tudo que for necessário, assim, evitamos de instanciar classes para cada teste individual e melhorando o tempo de execução dos testes.

## Criando a Fixture

Dentro da classe de teste, criamos uma outra classe, no meu caso AreaFixture que irá ter como propriedade a classe Area já sendo instanciada:

``` cs
public class AreaFixture
{
    public Area Area => new();
}
```

Após isso para compartilhar essa instância entre todos os nossos testes adicionamos uma interface para nossa classe de teste usando o *IClasseFixture*, a interface IClasseFixture espera receber a uma classe Fixture nesse caso a AreaFixture:


``` cs
public class AreasTest : IClassFixture<AreaFixture>
```

Ultimo passo é via injeção de dependência adicionamos ao construtor da classe AreaTest a classe AreaFixture

``` cs
public class AreasTest : IClassFixture<AreaFixture>
    {
        private readonly AreaFixture _areaFixture;
        public AreasTest(AreaFixture areaFixture)
        {
            _areaFixture = areaFixture;
        }
```

Agora quando o xUnit executar os testes irá ser criado uma instância apenas e todos os nossos testes agora possuem acesso aos métodos da classe Area atráves do campo  _areaFixture.Area .

```cs
[Fact]
public void TesteAreaDoQuadrado()
{
    Area area = _areaFixture.Area;
    int result = area.Quadrado(5);
    Assert.Equal(25, result);
}

[Fact]
public void TesteAreaDoTriangulo()
{
    Area area = _areaFixture.Area;
    int result = area.Triangulo(10, 5);
    Assert.Equal(25, result);
}

[Fact]
public void TesteAreaDoRetangulo()
{
    Area area = _areaFixture.Area;
    int result = area.Retangulo(5, 3);
    Assert.Equal(15, result);
}
```

[Código completo](https://gist.github.com/fernanduandrade/9901165cfb1bb66a1d8483cc9823d4ff)

