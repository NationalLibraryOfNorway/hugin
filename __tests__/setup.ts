import {afterEach, beforeAll, vi} from 'vitest';
import {cleanup} from '@testing-library/react';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  vi.mock('next/navigation', async importOriginal => {
    const actual = await importOriginal<typeof import('next/navigation')>();
    const { useRouter } = await vi.importActual<typeof import('next-router-mock')>('next-router-mock');
    const usePathname = vi.fn().mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const router = useRouter();
      return router.pathname;
    });
    return {
      ...actual,
      useRouter: vi.fn().mockImplementation(useRouter),
      usePathname
    };
  });

  vi.mock('@/services/catalog.data', () => ({
    searchNewspaperTitlesInCatalog: vi.fn(),
    fetchNewspaperTitleFromCatalog: vi.fn(),
    getLinkToNewspaperInCatalog: vi.fn(),
    postItemToCatalog: vi.fn(),
    postMissingItemToCatalog: vi.fn()
  }));

  vi.mock('@/services/local.data', () => ({
    getLocalTitle: vi.fn(),
    postLocalTitle: vi.fn(),
    putLocalTitle: vi.fn(),
    updateActiveBoxForTitle: vi.fn(),
    updateNotesForTitle: vi.fn(),
    updateShelfForTitle: vi.fn(),
    getBoxById: vi.fn(),
    getBoxForTitle: vi.fn(),
    getNewspapersForBoxOnTitle: vi.fn(),
    postNewBoxForTitle: vi.fn(),
    postNewIssuesForTitle: vi.fn(),
    deleteIssue: vi.fn(),
    getContactInfoForTitle: vi.fn(),
  }));

  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
});

