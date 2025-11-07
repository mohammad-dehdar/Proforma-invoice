import { Invoice } from '@/types/type';

interface BaseServiceResult {
  unauthorized?: boolean;
  message?: string;
}

export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  totalCustomers: number;
  thisMonth: number;
}

export interface DashboardResult extends BaseServiceResult {
  stats: DashboardStats;
  recentInvoices: Invoice[];
}

const parseJson = async <T>(response: Response): Promise<T | undefined> => {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
};

export const fetchDashboardOverview = async (): Promise<DashboardResult> => {
  const response = await fetch('/api/dashboard', { credentials: 'include' });

  if (response.status === 401) {
    return {
      unauthorized: true,
      stats: { totalInvoices: 0, totalRevenue: 0, totalCustomers: 0, thisMonth: 0 },
      recentInvoices: [],
    };
  }

  if (!response.ok) {
    const data = await parseJson<{ message?: string }>(response);
    throw new Error(data?.message ?? 'خطا در بارگذاری داشبورد');
  }

  const data = await parseJson<{ stats: DashboardStats; recentInvoices?: Invoice[] }>(response);

  return {
    stats: data?.stats ?? {
      totalInvoices: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      thisMonth: 0,
    },
    recentInvoices: data?.recentInvoices ?? [],
  };
};
