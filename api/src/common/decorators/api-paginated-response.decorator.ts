import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/** Describe the Paginated<T> wrapper, whose generic type is erased at runtime. */
export const ApiPaginatedResponse = (model: Type<unknown>) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        required: ['items', 'total', 'page', 'limit', 'totalPages'],
        properties: {
          items: { type: 'array', items: { $ref: getSchemaPath(model) } },
          total: { type: 'integer', example: 42 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
    }),
  );
