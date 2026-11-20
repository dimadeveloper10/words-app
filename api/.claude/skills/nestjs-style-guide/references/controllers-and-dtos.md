# Controllers and DTOs

## Thin controllers

A handler reads the request, calls one service method and returns its result. It declares an explicit return type, so the contract is visible.

```ts
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() dto: CreateLessonDto,
    @CurrentUser() currentUser: User,
  ): Promise<Lesson> {
    return this.lessonsService.create(dto, currentUser);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.lessonsService.remove(id);
  }
}
```

- Resource names are plural nouns (`/lessons`, `/word-answers`). Nested reads use sub-paths (`/lessons/:id/words`); actions that aren't CRUD get a verb sub-path (`/word-answers/batch`).
- Parse ids with `ParseUUIDPipe`, so a malformed id is a 400, not a database error.
- Use `@CurrentUser()` instead of reading `req.user`, and don't inject `@Req()`/`@Res()` unless you truly need the raw objects. `@Res()` turns off Nest's response handling, including serialization.
- Status codes: 201 for create (default for POST), 204 for delete, 200 otherwise. Set them with `@HttpCode()`.

## DTOs validate the boundary

```ts
export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsInt()
  lessonNumber?: number | null;

  @IsUUID('4')
  topicId!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  wordIds?: string[];
}
```

- One DTO per use: `Create…Dto`, `Update…Dto`, `Query…Dto`. Query DTOs for lists extend `PaginationQueryDto`.
- Every property has validators. Optional properties need `@IsOptional()` first.
- Query strings arrive as strings: convert them with `@Type(() => Number)` (or `Boolean`) before `@IsInt()`.
- Nested objects need `@ValidateNested()` together with `@Type(() => ChildDto)`, otherwise the children are not validated.
- Never accept fields the client must not set (`id`, `createdAt`, `addedBy`, `role` on register). Leave them out of the DTO; the global validation pipe (`forbidNonWhitelisted`) then rejects them with 400.

### PATCH semantics

For updates, an **omitted** key means "leave unchanged", and `null` or `[]` means "clear it". Treat `undefined` and `null` differently in the service. A collection that is provided replaces the stored one as a whole.

## Responses

- Return entities or plain typed objects; the global `ClassSerializerInterceptor` applies `@Exclude()` and `@Expose()`.
- Lists return `Paginated<T>` built with `paginated(items, total, page, limit)`, and are documented with `@ApiPaginatedResponse(Entity)`.
- Don't return different shapes from the same route depending on the data.
