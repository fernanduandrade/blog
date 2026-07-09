---
title: The Power of Graph Databases and How They Can Help You Understand Your Business
slug: the-power-of-graph-databases-and-how-they-can-help-you-understand-your-business
description: Discover how graph databases transform relationships into strategic insights.
date: 2026-07-08
category: Databases
tags:
  - tutorial
  - database
  - graph
  - neo4j
---

## The power of a graph database and how it can help you understand your business

### Intro

Have you heard about graph databases? Neo4j, AWS Neptune, and Dgraph are examples of databases focused on graph networks, but what exactly do they solve?

Nowadays, every piece of relevant information is stored in a database. But how do you turn that data into useful insights and visualizations? Understanding how one piece of information connects to another is a factor that lets a team develop and deliver even more value to its product.

### The concept of graphs

When we talk about graphs, more specifically in the world of technology, we're talking about a type of data structure made up of vertices and edges, connected by lines.

When we apply this concept to development, our simple CRUD and its RESTful operations become something more complex. In SQL and NoSQL databases it's possible to create graph representations, however, multiple joins and aggregations have a very high operational cost. Cross-referencing millions of records to identify, for example, possible fraud in a system, takes a long time, since you need to relate information and find similar patterns. There are approaches, like weight matrices, that make this similarity search more efficient. Even so, it's with graph databases that this search becomes even more performant.

### Putting it into practice: a small project

To move beyond theory, I decided to build a real pipeline: extract data from an open source organization on GitHub via the GraphQL API and transform that information into a graph in Neo4j. The goal was to learn the syntax of a new database, but using a concrete case, one capable of answering questions that, with a relational database, would be much more costly to solve.

**The pipeline architecture**

The project was built in .NET, split into layers that clearly separate responsibilities:

- **Domain**: the domain entities (Person, Repository, Contribution, Interaction, Module, Technology).
- **Providers.Github**: the collectors (`Collectors`) responsible for fetching data from GitHub's GraphQL API, one per entity type (`ContributorCollector`, `RepositoryCollector`, `ModuleCollector`, among others).
- **Graph**: the repositories (`Repositories`) that know how to persist each entity and each type of relationship in Neo4j, such as `ContributionGraphRepository`, `InteractionGraphRepository`, `ModuleContributionGraphRepository`, and `TechnologyGraphRepository`.

This separation by relationship type (contribution, interaction, module, technology) directly reflects the graph modeling: each graph repository is responsible for creating one specific type of edge.

**A code example: persisting a contribution**

The snippet below shows `ContributionGraphRepository`, responsible for creating the `CONTRIBUTED_TO` relationship between a person and a repository:

```csharp
public sealed class ContributionGraphRepository(Neo4jClient neo4j, ILogger<ContributionGraphRepository> logger)
{
    private const string MergeQuery = """
        MATCH (p:Person { login: $login })
        MATCH (r:Repository { fullName: $fullName })
        MERGE (p)-[c:CONTRIBUTED_TO]->(r)
        SET c.commits   = $commits,
            c.syncedAt  = $syncedAt
        """;

    public async Task SaveAsync(Contribution contribution, CancellationToken cancellationToken = default)
    {
        await neo4j.ExecuteAsync(MergeQuery, new
        {
            login = contribution.Contributor.Login,
            fullName = contribution.Repository.FullName,
            commits = contribution.Commits,
            syncedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
        }, cancellationToken);
    }
}
```

Notice the use of `MERGE` instead of `CREATE`: this guarantees idempotency. If the pipeline runs again for the same person/repository pair, the relationship isn't duplicated — only the `commits` and `syncedAt` fields get updated. This is a pattern repeated across all the graph repositories in the project, each one handling a different type of node or relationship.

**The graph model**

In the graph, each contributor is represented as a node, just like each repository. Edges connect contributors to repositories, indicating who contributes to which project, and also connect contributors to each other when they work on the same repository, revealing who interacts with whom within the organization.

**What this graph reveals**

With this structure in place, some questions that used to require manually cross-referencing several tables now have an immediate visual answer:

- **Who's carrying a project alone?** In the network, these cases show up in isolation: one or two contributors whose connections point to a repository that no other node also supports. Since this region of the graph sits visually apart from the rest, spotting this critical "bus factor" becomes almost immediate.
- **Who are the contributors with the most technical scope?** Nodes with many connections (to multiple repositories and other contributors) point to people central to the organization — potential go-to references for solving technical issues.
- **Which people work on the same modules?** Contributors connected to the same repositories form natural clusters, revealing affinities in how the team operates.

By assigning weights to edges — based, for example, on contribution frequency — these relationships become even clearer visually: the stronger the connection, the thicker (or closer) the line between nodes, making it possible to spot patterns just by looking at the graph, without running a single query.

### The result in practice

After running the full pipeline against the GitHub organization, you can query the graph directly in Neo4j Browser. A simple query already reveals the network of interactions among contributors:

```cypher
MATCH p=()-[:INTERACTED_WITH]->() RETURN p LIMIT 25;
```

![Graph of interactions among contributors](<Captura de tela 2026-07-08 205346-1.png>)

Each `INTERACTED_WITH` edge represents a real interaction between two people within a repository (comment, review, mention). Just by looking at the image you can already spot sub-networks: a more isolated group on the left and a much more connected core on the right, revolving around names like Gabriel Vieira, Daniel Reis, and Ranie.

Another interesting question is: who contributes to a specific repository? Filtering by a project (`4noobs`, in this case), the answer appears immediately:

```cypher
MATCH (p:Person)-[:CONTRIBUTED_TO]->(r:Repository { name: "4noobs" })
RETURN p, r;
```

![Graph of contributors to the 4noobs repository](<Captura de tela 2026-07-08 205324.png>)

This kind of visualization — a central node surrounded by everyone who has ever contributed — is exactly the kind of thing that, in SQL, would require a JOIN between `contributions` and `repositories` filtered by `repository_id`, and even then you'd still have to build the graph manually in some separate visualization tool. Here, it's born ready-made.

### Code and demo

The full project is open on GitHub, including the extraction pipeline, the graph modeling, and the persistence repositories:

🔗 [github.com/fernanduandrade/he4rt-discovery](https://github.com/fernanduandrade/he4rt-discovery)

And for anyone who wants to explore the graph without running anything locally, I put together a simple front end that consumes this data:

🔗 [he4rt-connections.vercel.app](https://he4rt-connections.vercel.app/)

### What this means for products and businesses

The GitHub example is just a simple showcase, but the same reasoning applies to practically any product that has people, entities, and interactions between them — which is practically every digital product.

Think of a marketplace: every user, every seller, every product, and every transaction becomes a node or an edge. Suddenly, questions like "which sellers are connected because they buy from the same suppliers?" or "is there a group of accounts that only interacts among itself, suggesting possible coordinated fraud?" stop being complex BI reports and become direct reads of the graph.

In a B2B product, the same model reveals who the key users are within a corporate account, which teams collaborate with each other, and where the risk points are — for example, a client whose only active user is the person who's about to leave the company. It's the same "bus factor" we identified among repository contributors, just applied to revenue.

The real gain isn't about swapping SQL for Cypher. It's about changing the question the team is able to ask of the data. Instead of "how many users did X," it becomes "how do these users connect, and what is this network telling me that a table doesn't." For product, that means identifying influential users before a launch. For business, it means seeing risks and opportunities that today stay hidden between lines of tables that never truly intersect.

In the end, a graph database isn't about having one more tool in the stack. It's about recognizing that, in many products, the most valuable information isn't in the data itself, but in the connections between it.