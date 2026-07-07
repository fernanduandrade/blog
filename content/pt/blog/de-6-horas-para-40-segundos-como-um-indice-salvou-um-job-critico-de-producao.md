---
title: De 6 horas para 40 segundos - Como um índice salvou um job crítico de produção
slug: de-6-horas-para-40-segundos-como-um-indice-salvou-um-job-critico-de-producao
description: Um job agendado que deveria rodar em 4 horas passou a levar 12 e o culpado era uma query sem índice varrendo uma tabela que nunca parou de crescer. Veja como um único índice composto reduziu o tempo de processamento de 6h18min para 40 segundos, e entenda de vez o que são índices, quando usá-los e por que eles fazem tanta diferença na prática.
date: 2026-06-06
category: Databases
tags:
    - banco-de-dados
    - sql
    - performance
    - backend
    - postgresql
    - índices
    - otimização
    - carreira
---
 
# De 6 horas para 40 segundos: como um índice de banco de dados salvou um job crítico de produção
 
> *"Às vezes, a solução mais elegante não está no código está em ensinar o banco de dados a encontrar o que ele já tem."*
 
## O cenário: um job noturno que virou um problema diurno
 
Todo sistema que lida com monitoramento contínuo eventualmente enfrenta o mesmo desafio: **quanto mais dados acumulam, mais lenta fica a análise**. Foi exatamente isso que aconteceu em um projeto no qual trabalhei.
 
A arquitetura era simples na teoria: um job agendado rodava durante a madrugada, disparando **N processos paralelos** cada um cadastrado individualmente pelo cliente. A lógica de cada processo era fazer uma comparação entre o resultado do dia atual (**D+0**) com o resultado do dia anterior (**D-1**), algo como:
 
> *"O que mudou desde ontem?"*
 
Para isso, cada processo precisava buscar **seu último resultado registrado**, usando uma query com `ORDER BY last_execution DESC` filtrada pelo identificador do processo. Parece trivial. E durante um bom tempo, foi.
 
## O problema cresceu junto com a tabela
 
Com o tempo, a tabela de resultados foi crescendo naturalmente, afinal, cada processo registra um novo resultado a cada execução. O que antes demorava milissegundos começou a demorar segundos. Depois, dezenas de segundos. Até que um dia percebemos:
 
**A janela de execução do job, que deveria ser de até 4 horas, estava chegando a 12 horas.**
 
Isso significava que um job que deveria terminar antes do horário comercial estava ainda em execução quando os usuários começavam a trabalhar de manhã, gerando inconsistências, bloqueios e reclamações.
 
A pergunta era: **onde estava o gargalo?**
 
## O diagnóstico: o Azure Application Insights apontou o caminho
 
Ao analisar as métricas de performance no **Azure Application Insights**, ficou evidente que o problema estava concentrado em uma única operação: a query que buscava o último resultado de cada processo.
 
Internamente, a tabela de resultados tinha crescido o suficiente para que um `ORDER BY last_execution DESC` **sem suporte de índice** forçasse o banco a fazer um **full scan**, ou seja, varrer linha por linha até encontrar o registro mais recente. Multiplique isso por dezenas (ou centenas) de processos rodando em paralelo e você tem uma receita para o caos.
 
### Antes da correção
 
```
1 linha(s) recuperada(s) — 1.754s, em 2025-08-11 às 09:19:01
```
 
Quase **2 segundos por consulta**. Para um único processo, tolerável. Para N processos simultâneos, catastrófico.
 
## A solução: um índice bem posicionado
 
A correção foi aplicar um índice composto na tabela de resultados, cobrindo exatamente os campos usados na query crítica:
 
```sql
CREATE INDEX idx_job_result_process_date
  ON app_schema.job_results (fk_process_id, date_created DESC)
  INCLUDE (id, final_result, report_id, result_payload);
```
 
Esse índice foi criado diretamente no ambiente de produção (pode ser gerado localmente também, dependendo da política da equipe) e o resultado foi imediato.
 
### Depois da correção
 
```
1 linha(s) recuperada(s) — 0.003s, em 2025-08-11 às 09:32:00
```
 
De **1,754 segundos** para **0,003 segundos** por consulta. Uma redução de **99,8%** no tempo de resposta.
 
## O impacto real: economia de tempo total por dia
 
| Cenário | Tempo acumulado de processamento/dia |
|---|---|
| ❌ Antes do índice | ~6 horas e 18 minutos |
| ✅ Depois do índice | ~40 segundos |
 
O job voltou a terminar bem antes do horário comercial. Os processos diurnos pararam de ser impactados. E tudo isso sem reescrever uma linha de código de negócio.
 
## Mas afinal: o que é um índice de banco de dados?
 
Se você chegou até aqui e nunca parou para entender o que um índice faz de verdade, esse é o momento.
 
### A analogia do livro
 
Imagine que você tem um livro enciclopédico com 10.000 páginas e precisa encontrar tudo que fala sobre "fotossíntese". Você tem duas opções:
 
1. **Sem índice:** Ler página por página do início ao fim. Funciona, mas demora.
2. **Com índice:** Ir até o índice remissivo no final do livro, localizar "fotossíntese" em segundos e ir direto às páginas certas.
Um índice de banco de dados funciona exatamente assim. Ele é uma **estrutura de dados separada** (geralmente uma B-Tree) que mantém uma cópia ordenada de uma ou mais colunas, com ponteiros para as linhas reais da tabela.
 
### O que um índice resolve?
 
- **Buscas por igualdade:** `WHERE id = 42` o índice encontra o valor direto, sem varrer a tabela
- **Buscas por intervalo:** `WHERE date_created BETWEEN '2025-01-01' AND '2025-12-31'`
- **Ordenação:** `ORDER BY last_execution DESC` se o índice já estiver ordenado nessa direção, o banco nem precisa ordenar
- **Queries cobertas (covering index):** Com a cláusula `INCLUDE`, o banco pode responder à query inteira só pelo índice, sem nem tocar na tabela original
### O que um índice *não* é (e quando ele atrapalha)
 
Índice não é gratuito. Ele tem custos:
 
- **Espaço em disco:** o índice ocupa armazenamento adicional
- **Custo de escrita:** toda vez que um `INSERT`, `UPDATE` ou `DELETE` acontece, os índices afetados também precisam ser atualizados
- **Manutenção:** índices fragmentados precisam ser reorganizados periodicamente
Por isso, criar índices sem critério pode ser tão prejudicial quanto não tê-los. A regra de ouro é:
 
> *Crie índices nas colunas que aparecem frequentemente em cláusulas `WHERE`, `JOIN`, `ORDER BY` e `GROUP BY` de queries lentas, especialmente em tabelas grandes.*
 
## Como identificar quando você precisa de um índice
 
Alguns sinais de alerta:
 
- **Queries que demoram mais conforme a tabela cresce** (como o nosso caso)
- **Full table scans** aparecendo nos planos de execução (`EXPLAIN` / `Query Execution Plan`)
- **Timeouts em operações que antes eram rápidas**
- **CPU do banco de dados consistentemente alta** durante períodos de consulta
Ferramentas como o **Azure Application Insights**, **pg_stat_statements** (PostgreSQL), **slow query log** (MySQL) e o **Query Store** (SQL Server) são aliadas valiosas nesse diagnóstico.
 
## Anatomia do índice que resolveu o problema
 
Voltando ao índice criado:
 
```sql
CREATE INDEX idx_job_result_process_date
  ON app_schema.job_results (fk_process_id, date_created DESC)
  INCLUDE (id, final_result, report_id, result_payload);
```
 
**Por que esse design?**
 
| Componente | Motivo |
|---|---|
| `fk_process_id` | Filtro principal da query (cada processo tem seu identificador) |
| `date_created DESC` | A query precisa do resultado mais recente primeiro |
| `INCLUDE (...)` | Colunas retornadas pela query, incluí-las evita um segundo acesso à tabela |
 
O resultado é um **covering index**: o banco responde à query inteira consultando apenas o índice, sem precisar buscar dados na tabela principal. É a forma mais eficiente de otimização de leitura possível.
 
## Conclusão
 
Performance não é só sobre algoritmos ou arquitetura de microsserviços. Às vezes, o gargalo está numa operação aparentemente simples que o banco de dados precisa executar milhares de vezes por dia, e que ninguém percebe até que o custo acumulado se torne um problema real.
 
Nesse caso, **um único índice bem pensado** transformou 6 horas de processamento em 40 segundos. Sem refatoração. Sem mudança de arquitetura. Sem downtime.
 
Se você ainda não tem o hábito de revisar os planos de execução das suas queries críticas, comece agora. O banco de dados tem muito a te contar, basta saber ouvir.
 
*Sugestões de leitura para se aprofundar: B-Tree indexes, covering indexes, query execution plans, índices compostos e ferramentas de profiling como EXPLAIN ANALYZE.*