---
title: From 6 Hours to 40 Seconds - How a Database Index Saved a Critical Production Job
slug: from-6-hours-to-40-seconds-how-a-database-index-saved-a-critical-production-job
description: A scheduled job that should finish in 4 hours started taking 12 — and the culprit was a query with no index scanning a table that never stopped growing. See how a single composite index cut processing time from 6h18min down to 40 seconds, and finally understand what indexes are, when to use them, and why they make such a difference in practice.
date: 2026-06-06
category: Databases
tags:
    - database
    - sql
    - performance
    - backend
    - postgresql
    - indexes
    - optimization
    - career
readingTime: 7
---

# From 6 Hours to 40 Seconds: How a Database Index Saved a Critical Production Job

> *"Sometimes the most elegant solution isn't in the code — it's in teaching the database to find what it already has."*

---

## The scenario: a nightly job that became a daytime problem

Every system that deals with continuous monitoring eventually faces the same challenge: **the more data accumulates, the slower the analysis gets**. That's exactly what happened in a project I worked on.

The architecture was simple in theory: a scheduled job ran overnight, firing **N parallel processes** — each one individually registered by the client. The logic of each process was to compare the result of the current day (**D+0**) with the result of the previous day (**D-1**), something like:

> *"What changed since yesterday?"*

To do that, each process needed to fetch **its most recent recorded result**, using a query with `ORDER BY last_execution DESC` filtered by the process identifier. Seems trivial. And for a long time, it was.

---

## The problem grew alongside the table

Over time, the results table grew naturally — after all, each process registers a new result on every execution. What once took milliseconds started taking seconds. Then tens of seconds. Until one day we noticed:

**The job's execution window, which should be at most 4 hours, was stretching to 12 hours.**

This meant a job that should finish before business hours was still running when users started their workday — causing inconsistencies, locks, and complaints.

The question was: **where was the bottleneck?**

---

## The diagnosis: Azure Application Insights pointed the way

When analyzing performance metrics on **Azure Application Insights**, it became clear that the problem was concentrated in a single operation: the query that fetched the latest result for each process.

Internally, the results table had grown large enough that an `ORDER BY last_execution DESC` **without index support** forced the database to perform a **full scan** — scanning row by row until it found the most recent record. Multiply that by dozens (or hundreds) of processes running in parallel and you have a recipe for chaos.

### Before the fix

```
1 row(s) retrieved — 1.754s, on 2025-08-11 at 09:19:01
```

Nearly **2 seconds per query**. For a single process, tolerable. For N simultaneous processes, catastrophic.

---

## The solution: a well-placed index

The fix was to apply a composite index on the results table, covering exactly the fields used in the critical query:

```sql
CREATE INDEX idx_job_result_process_date
  ON app_schema.job_results (fk_process_id, date_created DESC)
  INCLUDE (id, final_result, report_id, result_payload);
```

This index was created directly in the production environment (it can also be created locally, depending on team policy) and the result was immediate.

### After the fix

```
1 row(s) retrieved — 0.003s, on 2025-08-11 at 09:32:00
```

From **1.754 seconds** to **0.003 seconds** per query. A reduction of **99.8%** in response time.

---

## The real impact: total daily time saved

| Scenario | Accumulated processing time/day |
|---|---|
| ❌ Before the index | ~6 hours and 18 minutes |
| ✅ After the index | ~40 seconds |

The job went back to finishing well before business hours. Daytime processes stopped being impacted. And all of this without rewriting a single line of business code.

---

## But what exactly is a database index?

If you've made it this far and never stopped to truly understand what an index does, now is the time.

### The book analogy

Imagine you have a 10,000-page encyclopedia and need to find everything about "photosynthesis." You have two options:

1. **Without an index:** Read page by page from start to finish. It works, but it takes forever.
2. **With an index:** Go to the index at the back of the book, find "photosynthesis" in seconds, and jump straight to the right pages.

A database index works exactly like that. It is a **separate data structure** (usually a B-Tree) that maintains a sorted copy of one or more columns, with pointers to the actual rows in the table.

### What does an index solve?

- **Equality lookups:** `WHERE id = 42` → the index finds the value directly, without scanning the table
- **Range queries:** `WHERE date_created BETWEEN '2025-01-01' AND '2025-12-31'`
- **Sorting:** `ORDER BY last_execution DESC` → if the index is already sorted in that direction, the database doesn't even need to sort
- **Covered queries (covering index):** With the `INCLUDE` clause, the database can answer the entire query using only the index, without ever touching the original table

### What an index is *not* (and when it hurts)

An index is not free. It has costs:

- **Disk space:** the index occupies additional storage
- **Write cost:** every time an `INSERT`, `UPDATE`, or `DELETE` happens, the affected indexes also need to be updated
- **Maintenance:** fragmented indexes need to be reorganized periodically

That's why creating indexes without criteria can be just as harmful as having none. The golden rule is:

> *Create indexes on columns that frequently appear in `WHERE`, `JOIN`, `ORDER BY`, and `GROUP BY` clauses of slow queries — especially on large tables.*

---

## How to identify when you need an index

Some warning signs:

- **Queries that get slower as the table grows** (like our case)
- **Full table scans** appearing in execution plans (`EXPLAIN` / `Query Execution Plan`)
- **Timeouts on operations that used to be fast**
- **Consistently high database CPU** during query periods

Tools like **Azure Application Insights**, **pg_stat_statements** (PostgreSQL), **slow query log** (MySQL), and **Query Store** (SQL Server) are invaluable allies in this diagnosis.

---

## Anatomy of the index that solved the problem

Back to the index that was created:

```sql
CREATE INDEX idx_job_result_process_date
  ON app_schema.job_results (fk_process_id, date_created DESC)
  INCLUDE (id, final_result, report_id, result_payload);
```

**Why this design?**

| Component | Reason |
|---|---|
| `fk_process_id` | Main query filter (each process has its own identifier) |
| `date_created DESC` | The query needs the most recent result first |
| `INCLUDE (...)` | Columns returned by the query — including them avoids a second table lookup |

The result is a **covering index**: the database answers the entire query by consulting only the index, without needing to fetch data from the main table. It's the most efficient form of read optimization possible.

---

## Conclusion

Performance isn't just about algorithms or microservice architecture. Sometimes the bottleneck is in a seemingly simple operation that the database needs to execute thousands of times a day — and that no one notices until the accumulated cost becomes a real problem.

In this case, **a single well-thought-out index** turned 6 hours of processing into 40 seconds. No refactoring. No architecture changes. No downtime.

If you don't yet have the habit of reviewing the execution plans of your critical queries, start now. The database has a lot to tell you — you just need to know how to listen.

---

*Suggestions for further reading: B-Tree indexes, covering indexes, query execution plans, composite indexes, and profiling tools like EXPLAIN ANALYZE.*