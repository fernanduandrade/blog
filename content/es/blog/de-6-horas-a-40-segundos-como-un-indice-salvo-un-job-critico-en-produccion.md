---
title: De 6 horas a 40 segundos - Cómo un índice salvó un job crítico en producción
slug: de-6-horas-a-40-segundos-como-un-indice-salvo-un-job-critico-en-produccion
description: Un job programado que debería terminar en 4 horas empezó a tardar 12 — y el culpable era una query sin índice recorriendo una tabla que nunca dejó de crecer. Descubre cómo un único índice compuesto redujo el tiempo de procesamiento de 6h18min a 40 segundos, y entiende de una vez qué son los índices, cuándo usarlos y por qué marcan tanta diferencia en la práctica.
date: 2026-06-06
category: Databases
tags:
    - base-de-datos
    - sql
    - performance
    - backend
    - postgresql
    - índices
    - optimización
    - carrera
readingTime: 7
---

# De 6 horas a 40 segundos: cómo un índice de base de datos salvó un job crítico en producción

> *"A veces la solución más elegante no está en el código — está en enseñarle a la base de datos a encontrar lo que ya tiene."*

---

## El escenario: un job nocturno que se convirtió en un problema diurno

Todo sistema que trabaja con monitoreo continuo eventualmente enfrenta el mismo desafío: **cuanto más datos se acumulan, más lenta se vuelve el análisis**. Eso fue exactamente lo que ocurrió en un proyecto en el que trabajé.

La arquitectura era simple en teoría: un job programado corría durante la madrugada, disparando **N procesos en paralelo** — cada uno registrado individualmente por el cliente. La lógica de cada proceso era comparar el resultado del día actual (**D+0**) con el resultado del día anterior (**D-1**), algo como:

> *"¿Qué cambió desde ayer?"*

Para eso, cada proceso necesitaba buscar **su resultado más reciente registrado**, usando una query con `ORDER BY last_execution DESC` filtrada por el identificador del proceso. Parece trivial. Y durante mucho tiempo, lo fue.

---

## El problema creció junto con la tabla

Con el tiempo, la tabla de resultados fue creciendo naturalmente — al fin y al cabo, cada proceso registra un nuevo resultado en cada ejecución. Lo que antes tardaba milisegundos empezó a tardar segundos. Luego, decenas de segundos. Hasta que un día notamos:

**La ventana de ejecución del job, que debería ser de máximo 4 horas, estaba llegando a 12 horas.**

Eso significaba que un job que debería terminar antes del horario laboral seguía ejecutándose cuando los usuarios comenzaban su jornada — generando inconsistencias, bloqueos y quejas.

La pregunta era: **¿dónde estaba el cuello de botella?**

---

## El diagnóstico: Azure Application Insights señaló el camino

Al analizar las métricas de rendimiento en **Azure Application Insights**, quedó claro que el problema estaba concentrado en una sola operación: la query que buscaba el último resultado de cada proceso.

Internamente, la tabla de resultados había crecido lo suficiente como para que un `ORDER BY last_execution DESC` **sin soporte de índice** obligara a la base de datos a realizar un **full scan** — es decir, recorrer fila por fila hasta encontrar el registro más reciente. Multiplica eso por decenas (o cientos) de procesos corriendo en paralelo y tienes una receta para el caos.

### Antes de la corrección

```
1 fila(s) recuperada(s) — 1.754s, el 2025-08-11 a las 09:19:01
```

Casi **2 segundos por consulta**. Para un único proceso, tolerable. Para N procesos simultáneos, catastrófico.

---

## La solución: un índice bien posicionado

La corrección fue aplicar un índice compuesto en la tabla de resultados, cubriendo exactamente los campos usados en la query crítica:

```sql
CREATE INDEX idx_job_result_process_date
  ON app_schema.job_results (fk_process_id, date_created DESC)
  INCLUDE (id, final_result, report_id, result_payload);
```

Este índice fue creado directamente en el entorno de producción (también puede generarse localmente, dependiendo de la política del equipo) y el resultado fue inmediato.

### Después de la corrección

```
1 fila(s) recuperada(s) — 0.003s, el 2025-08-11 a las 09:32:00
```

De **1,754 segundos** a **0,003 segundos** por consulta. Una reducción del **99,8%** en el tiempo de respuesta.

---

## El impacto real: tiempo total ahorrado por día

| Escenario | Tiempo acumulado de procesamiento/día |
|---|---|
| ❌ Antes del índice | ~6 horas y 18 minutos |
| ✅ Después del índice | ~40 segundos |

El job volvió a terminar mucho antes del horario laboral. Los procesos diurnos dejaron de verse afectados. Y todo esto sin reescribir una sola línea de código de negocio.

---

## Pero, ¿qué es exactamente un índice de base de datos?

Si llegaste hasta aquí y nunca te detuviste a entender de verdad qué hace un índice, este es el momento.

### La analogía del libro

Imagina que tienes una enciclopedia de 10.000 páginas y necesitas encontrar todo lo que habla sobre "fotosíntesis". Tienes dos opciones:

1. **Sin índice:** Leer página por página desde el principio. Funciona, pero lleva una eternidad.
2. **Con índice:** Ir al índice al final del libro, localizar "fotosíntesis" en segundos e ir directamente a las páginas correctas.

Un índice de base de datos funciona exactamente así. Es una **estructura de datos separada** (generalmente un B-Tree) que mantiene una copia ordenada de una o más columnas, con punteros hacia las filas reales de la tabla.

### ¿Qué resuelve un índice?

- **Búsquedas por igualdad:** `WHERE id = 42` → el índice encuentra el valor directamente, sin recorrer la tabla
- **Búsquedas por rango:** `WHERE date_created BETWEEN '2025-01-01' AND '2025-12-31'`
- **Ordenamiento:** `ORDER BY last_execution DESC` → si el índice ya está ordenado en esa dirección, la base de datos ni siquiera necesita ordenar
- **Queries cubiertas (covering index):** Con la cláusula `INCLUDE`, la base de datos puede responder la query completa usando solo el índice, sin tocar la tabla original

### Lo que un índice *no* es (y cuándo perjudica)

Un índice no es gratuito. Tiene costos:

- **Espacio en disco:** el índice ocupa almacenamiento adicional
- **Costo de escritura:** cada vez que ocurre un `INSERT`, `UPDATE` o `DELETE`, los índices afectados también deben actualizarse
- **Mantenimiento:** los índices fragmentados necesitan reorganizarse periódicamente

Por eso, crear índices sin criterio puede ser tan perjudicial como no tenerlos. La regla de oro es:

> *Crea índices en las columnas que aparecen frecuentemente en cláusulas `WHERE`, `JOIN`, `ORDER BY` y `GROUP BY` de queries lentas — especialmente en tablas grandes.*

---

## Cómo identificar cuándo necesitas un índice

Algunas señales de alerta:

- **Queries que tardan más a medida que la tabla crece** (como nuestro caso)
- **Full table scans** apareciendo en los planes de ejecución (`EXPLAIN` / `Query Execution Plan`)
- **Timeouts en operaciones que antes eran rápidas**
- **CPU de la base de datos consistentemente alta** durante períodos de consulta

Herramientas como **Azure Application Insights**, **pg_stat_statements** (PostgreSQL), **slow query log** (MySQL) y **Query Store** (SQL Server) son aliados invaluables en este diagnóstico.

---

## Anatomía del índice que resolvió el problema

Volviendo al índice creado:

```sql
CREATE INDEX idx_job_result_process_date
  ON app_schema.job_results (fk_process_id, date_created DESC)
  INCLUDE (id, final_result, report_id, result_payload);
```

**¿Por qué este diseño?**

| Componente | Motivo |
|---|---|
| `fk_process_id` | Filtro principal de la query (cada proceso tiene su identificador) |
| `date_created DESC` | La query necesita el resultado más reciente primero |
| `INCLUDE (...)` | Columnas devueltas por la query — incluirlas evita un segundo acceso a la tabla |

El resultado es un **covering index**: la base de datos responde la query completa consultando solo el índice, sin necesidad de buscar datos en la tabla principal. Es la forma más eficiente de optimización de lectura posible.

---

## Conclusión

El rendimiento no se trata solo de algoritmos o arquitectura de microservicios. A veces el cuello de botella está en una operación aparentemente simple que la base de datos necesita ejecutar miles de veces al día — y que nadie nota hasta que el costo acumulado se convierte en un problema real.

En este caso, **un único índice bien pensado** transformó 6 horas de procesamiento en 40 segundos. Sin refactorización. Sin cambios de arquitectura. Sin downtime.

Si todavía no tienes el hábito de revisar los planes de ejecución de tus queries críticas, empieza ahora. La base de datos tiene mucho que contarte — solo necesitas saber escuchar.

---

*Sugerencias para lecturas adicionales: B-Tree indexes, covering indexes, query execution plans, índices compuestos y herramientas de profiling como EXPLAIN ANALYZE.*