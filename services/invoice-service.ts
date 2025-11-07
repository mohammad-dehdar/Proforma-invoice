import { Invoice } from '@/types/type';
import { InvoicePayload } from '@features/invoice/utils/invoice-payload';

interface BaseServiceResult {
  unauthorized?: boolean;
  message?: string;
}

export interface SaveInvoiceResult extends BaseServiceResult {
  invoice?: Invoice;
  conflict?: boolean;
  conflictInvoiceId?: string | null;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

const parseJson = async <T>(response: Response): Promise<T | undefined> => {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
};

export const saveInvoice = async (
  payload: InvoicePayload,
  invoiceId?: string
): Promise<SaveInvoiceResult> => {
  const endpoint = invoiceId ? `/api/invoices/${invoiceId}` : '/api/invoices';
  const method = invoiceId ? 'PUT' : 'POST';

  const response = await fetch(endpoint, {
    method,
    headers: JSON_HEADERS,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    return { unauthorized: true };
  }

  if (response.status === 409) {
    const data = await parseJson<{ invoiceId?: string }>(response);
    return { conflict: true, conflictInvoiceId: data?.invoiceId ?? null };
  }

  if (!response.ok) {
    const data = await parseJson<{ message?: string }>(response);
    throw new Error(data?.message ?? 'خطا در ذخیره فاکتور');
  }

  const data = await parseJson<{ invoice?: Invoice; message?: string }>(response);
  return { invoice: data?.invoice, message: data?.message };
};

export const replaceInvoice = async (
  invoiceId: string,
  payload: InvoicePayload
): Promise<SaveInvoiceResult> => {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    return { unauthorized: true };
  }

  if (!response.ok) {
    const data = await parseJson<{ message?: string }>(response);
    throw new Error(data?.message ?? 'خطا در بروزرسانی فاکتور');
  }

  const data = await parseJson<{ invoice?: Invoice; message?: string }>(response);
  return { invoice: data?.invoice, message: data?.message };
};

export interface InvoiceListResult extends BaseServiceResult {
  invoices: Invoice[];
}

export const fetchInvoices = async (): Promise<InvoiceListResult> => {
  const response = await fetch('/api/invoices', {
    credentials: 'include',
  });

  if (response.status === 401) {
    return { invoices: [], unauthorized: true };
  }

  if (!response.ok) {
    const data = await parseJson<{ message?: string }>(response);
    throw new Error(data?.message ?? 'خطا در بارگذاری تاریخچه فاکتورها');
  }

  const data = await parseJson<{ invoices?: Invoice[] }>(response);
  return { invoices: data?.invoices ?? [] };
};

export const deleteInvoice = async (invoiceId: string): Promise<BaseServiceResult> => {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (response.status === 401) {
    return { unauthorized: true };
  }

  if (!response.ok) {
    const data = await parseJson<{ message?: string }>(response);
    throw new Error(data?.message ?? 'خطا در حذف فاکتور');
  }

  return {};
};
