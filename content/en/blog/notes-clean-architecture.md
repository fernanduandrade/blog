---
title: Notes on clean architecture
description: Some ideas and principles that help me write more maintainable software.
date: 2026-05-10
category: Engineering
readingTime: 6
---

Software architecture is one of those topics where everyone has a strong opinion but rarely agrees. Here are some ideas that help me day to day.

## Separation of concerns

The most fundamental principle: each part of your code should have a clear, well-defined responsibility. If you can't describe what a module does in one sentence, it's probably doing too much.

## Dependencies point inward

In clean architecture, dependencies always point toward the business rules. Frameworks, databases and user interfaces are implementation details.

```typescript
// ✅ Good: business rule independent of framework
class CreateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(data: CreateUserDTO): Promise<User> {
    const user = User.create(data)
    return this.userRepository.save(user)
  }
}
```

## Testability as a design metric

If something is hard to test, the design is probably wrong. Well-architected code is naturally testable.

## Don't over-engineer

The biggest mistake I see is applying complex patterns before the need arises. Start simple, evolve when the pain appears.
