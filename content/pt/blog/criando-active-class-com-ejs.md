---
title: Criando active classes com EJS
description: Aprenda como criar navegação dinâmica utilizando classes ativas no EJS para destacar a página atual em aplicações Node.js.
date: 2021-05-29
category: WebDevelopment
tags: 
    - csharp
    - dotnet
    - tutorial
    - testing
readingTime: 4
---

[EJS](https://ejs.co/) é uma linguagem de template que utiliza javascript para gerar HTML, além de compartilhar templates e dados com outras páginas. Este post é para demonstrar como utilizar uma class **active** para demonstrar ao user a página que está sendo acessada no momento em uma aplicação Node utilizando EJS como template engine.

## Boilerplate
[Clicando aqui](https://github.com/fernanduandrade/ejs-boilerplate) você pode clonar um boilerplate com a configuração mínina para a aplicação funcionar.

## Primeiros passos e estrutura 
Com a aplicação rodando vamos lá... Apenas para entender, olhando o projeto podemos notar a seguinte estrutura:
<ul>
<li>Views - diretório que a aplicação olha para encontrar os arquivos ejs.</li>
<li>Public - diretório que olha para os arquivos estáticos.</li>
<li>Routes - diretório para definir qual rota irá redenrizar o template.</li>
</ul>

Iremos mexer apenas na **public** e **views**. Adicione no `style.css` o seguinte css:

```
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

## Obtendo active class dinâmico

Em seguida para obtermos o resultado de um active class dinâmico no EJS vamos fazer o uso de variáveis e **partials**, partials é o conceito de criar templates reutilizáveis para evitar repetição de código e usar em outras views. No diretório `views` dentro de `partials` crie um arquivo chamado **nav.ejs** com o seguinte código:
```
<nav>
    <a class="<%= active === 'Home' ? 'nav-link active' : 'nav-link'%>" href="/">Home</a>
    <a class="<%= active === 'Sobre' ? 'nav-link active' : 'nav-link'%>" href="/sobre">Sobre</a>
    <a class="<%= active === 'Contato' ? 'nav-link active' : 'nav-link'%>" href="/contato">Contato</a>
</nav>
```
Criamos um arquivo .ejs que é um template reusável. A sintaxe do EJS faz uso do `<%= %>` para definir suas variáveis e criar condicionais dentro do campo, loops e output de variáveis, então dentro do atributo `class` fazendo o uso da sintaxe do ejs nós criamos uma variável chamada `active` e estamos comparando o valor dela com **Home, Sobre e Contato** usando uma condicional ternária, se um for verdadeiro irá mostrar qual link está ativo e os restantes estaram normais.

## Finalizando

Agora que temos o nosso template reutilizavél com as condições definidas vamos incluir nas nossas páginas. Para incluir um template EJS em uma página utilizamos o `<%- include(caminho/relativo/do/arquivo) %>` então agora adicionaremos o template para cada página dentro do diretório `pages`, dentro de cada página adicione logo acima da tag `h2`:
```
<%- include('../partials/nav', {active: 'Sobre' }); %>
```
Note que após passar o caminho relativo da partial estamos passando para a variável active definida no **nav.ejs** um valor, essa é a forma de definir um valor a uma variável no EJS quando importado em outra view.

Por fim depois de ter incluido para todas as páginas o template e definido o para a variável `active` seu respectivo valor iremos obter o seguinte resultado final.

![Resultado final](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2skzyw70zvpodpoojiqf.png)

Espero que tenham gostado, esse foi o meu primeiro post então dicas de como eu possa estar melhorando e melhorando este código são bem vindas e até breve pessoal :purple_heart:. 


