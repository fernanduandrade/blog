---
title: How to Use a Fixture Class with xUnit
description: Learn how to use Fixtures in xUnit to share context, reduce code duplication, and better organize your automated tests.
date: 2022-02-13
category: Testing
tags:
  - tutorial
  - dotnet
  - testing
  - csharp
---

Hey everyone, hope you're doing well! I’d like to share a tip that I find very useful for people writing tests with xUnit: using Fixtures.

For those just starting their journey with unit testing, just like I was, it’s very common to write tests like this:

```cs
[Fact]
public void SquareAreaTest()
{
    Area area = new();
    int result = area.Square(5);
    Assert.Equal(25, result);
}

[Fact]
public void TriangleAreaTest()
{
    Area area = new();
    int result = area.Triangle(10, 5);
    Assert.Equal(25, result);
}

[Fact]
public void RectangleAreaTest()
{
    Area area = new();
    int result = area.Rectangle(5, 3);
    Assert.Equal(15, result);
}
```

Which is completely normal at the beginning, but we can notice that for every test we are repeatedly instantiating the **Area** class in order to use its methods in our test cases.

This means that every time one of our tests in the same class needs to run, a new instance of that class is created — and having a Fixture solves this problem.

A Fixture is a class shared across all test methods. Inside this class, you can configure everything needed for your tests, avoiding class instantiation for every individual test and improving execution time.

## Creating the Fixture

Inside the test class, we create another class — in my case, `AreaFixture` — which will expose the already instantiated `Area` class as a property:

```cs
public class AreaFixture
{
    public Area Area => new();
}
```

After that, to share this instance among all our tests, we add an interface to our test class using `IClassFixture`.

The `IClassFixture` interface expects a Fixture class as its generic parameter, in this case `AreaFixture`:

```cs
public class AreasTest : IClassFixture<AreaFixture>
```

The last step is to inject `AreaFixture` into the constructor of the `AreasTest` class using dependency injection:

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

Now, when xUnit runs the tests, only one instance will be created, and all our tests will have access to the methods of the `Area` class through `_areaFixture.Area`.

```cs
[Fact]
public void SquareAreaTest()
{
    Area area = _areaFixture.Area;
    int result = area.Square(5);
    Assert.Equal(25, result);
}

[Fact]
public void TriangleAreaTest()
{
    Area area = _areaFixture.Area;
    int result = area.Triangle(10, 5);
    Assert.Equal(25, result);
}

[Fact]
public void RectangleAreaTest()
{
    Area area = _areaFixture.Area;
    int result = area.Rectangle(5, 3);
    Assert.Equal(15, result);
}
```

[Full source code](https://gist.github.com/fernanduandrade/9901165cfb1bb66a1d8483cc9823d4ff)