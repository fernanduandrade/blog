---
title: Notas sobre arquitetura limpa
description: Algumas ideias e princípios que me ajudam a escrever software mais manutenível.
date: 2026-05-10
category: Engineering
readingTime: 6
---

Arquitetura de software é um daqueles tópicos que todo mundo tem uma opinião forte, mas raramente concorda. Aqui estão algumas ideias que me ajudam no dia a dia.

## Separação de responsabilidades

O princípio mais fundamental: cada parte do seu código deve ter uma responsabilidade clara e bem definida. Se você não consegue descrever o que um módulo faz em uma frase, provavelmente ele faz coisas demais.

## Dependências apontam para dentro

Em arquitetura limpa, as dependências sempre apontam em direção às regras de negócio. Frameworks, bancos de dados e interfaces de usuário são detalhes de implementação.

```typescript
// ✅ Bom: regra de negócio independente de framework
class CreateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(data: CreateUserDTO): Promise<User> {
    const user = User.create(data)
    return this.userRepository.save(user)
  }
}
```

## Testabilidade como métrica de design

Se algo é difícil de testar, o design provavelmente está errado. Código bem arquitetado é naturalmente testável.

## Não over-engineer

O maior erro que vejo é aplicar padrões complexos antes da necessidade. Comece simples, evolua quando a dor aparecer.
