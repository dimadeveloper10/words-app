# Modules and dependency injection

## Shape of a feature

```
src/modules/lessons/
  lessons.module.ts
  lessons.controller.ts
  lessons.service.ts
  lessons.service.spec.ts
  entities/lesson.entity.ts
  dto/create-lesson.dto.ts
  dto/update-lesson.dto.ts
  dto/query-lessons.dto.ts
```

Cross-cutting code that several modules use lives in `src/common/` (decorators, DTOs such as `PaginationQueryDto` and `Paginated<T>`, enums, guards, pipes). Configuration lives in `src/config/`, database wiring and migrations in `src/database/`. Register every new module in `src/app.module.ts`.

## A module declares what it owns and what it shares

```ts
@Module({
  imports: [ImagesModule, TypeOrmModule.forFeature([Lesson, Topic, Word])],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
```

- `TypeOrmModule.forFeature([...])` makes `Repository<Entity>` injectable in this module. List only the entities this module queries.
- To use another feature's **behaviour**, import its module and inject its exported service (`ImagesModule` → `ImagesService`). Don't re-implement it with that feature's repository.
- Export a service only when another module needs it. Never export repositories: the owning service is the only place that knows the rules for that table.

## Injection

- Inject through the constructor with `private readonly`. Use `@InjectRepository(Entity)` for repositories.
- Providers are singletons by default. Don't keep per-request state in fields of a service; pass it as arguments.
- Request-scoped providers (`Scope.REQUEST`) make the whole dependency chain request-scoped and slower. Avoid them; pass the user or request data explicitly.

## Circular dependencies

If module A needs B and B needs A, the responsibility is usually in the wrong place. Move the shared logic into a third module or into the one that owns the data. `forwardRef()` is a last resort, not a fix.

## Global things stay global

Global guards (`ThrottlerGuard` → `JwtAuthGuard` → `RolesGuard`, in that order), the `ClassSerializerInterceptor`, `ConfigModule` and the logger are registered once in `AppModule`. Feature modules don't re-register them.
