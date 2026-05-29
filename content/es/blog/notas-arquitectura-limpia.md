---
title: Notas sobre arquitectura limpia
description: Algunas ideas y principios que me ayudan a escribir software más mantenible.
date: 2026-05-10
category: Engineering
readingTime: 6
---

La arquitectura de software es uno de esos temas donde todos tienen una opinión fuerte pero rara vez están de acuerdo. Aquí hay algunas ideas que me ayudan día a día.

## Separación de responsabilidades

El principio más fundamental: cada parte de tu código debe tener una responsabilidad clara y bien definida. Si no puedes describir lo que hace un módulo en una frase, probablemente hace demasiado.

## Las dependencias apuntan hacia adentro

En la arquitectura limpia, las dependencias siempre apuntan hacia las reglas de negocio. Los frameworks, bases de datos e interfaces de usuario son detalles de implementación.

## La testabilidad como métrica de diseño

Si algo es difícil de probar, el diseño probablemente está mal. El código bien arquitectado es naturalmente testeable.

## No sobre-ingenierices

El mayor error que veo es aplicar patrones complejos antes de la necesidad. Empieza simple, evoluciona cuando aparezca el dolor.
