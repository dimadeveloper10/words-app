import type { Paginated } from '../types/pagination';
import { api } from './api';

const PAGE_SIZE = 100;

export async function fetchAllPages<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T[]> {
  const fetchPage = async (page: number) => {
    const { data } = await api.get<Paginated<T>>(url, {
      params: { page, limit: PAGE_SIZE },
      signal,
    });
    return data;
  };

  const firstPage = await fetchPage(1);
  const otherPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, i) =>
      fetchPage(i + 2),
    ),
  );

  return [firstPage, ...otherPages].flatMap((page) => page.items);
}
