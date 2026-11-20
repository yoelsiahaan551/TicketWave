import * as WebBrowser from 'expo-web-browser';
import { Booking, PaymentMethodId, User } from '../types';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  {
    id: 'transfer_bank',
    label: 'Transfer Bank',
    description: 'Melalui Midtrans Payment Gateway',
  },
  {
    id: 'virtual_account',
    label: 'Virtual Account',
    description: 'Konfirmasi otomatis via Midtrans',
  },
  {
    id: 'qris',
    label: 'QRIS',
    description: 'Scan dari e-wallet pilihan Anda',
  },
];

export type MidtransBrowserOutcome = {
  status: 'opened' | 'dismissed' | 'cancelled' | 'error';
  message?: string;
};

export function isMidtransProductionClient(): boolean {
  return process.env.EXPO_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
}

export function getPaymentMethodLabel(method?: string | null): string {
  if (!method) return '-';
  const raw = method.trim();
  const lower = raw.toLowerCase();

  switch (lower) {
    case 'transfer_bank':
      return 'Transfer Bank';
    case 'virtual_account':
      return 'Virtual Account';
    case 'qris':
    case 'other_qris':
      return 'QRIS';
    case 'gopay':
      return 'GoPay';
    case 'shopeepay':
      return 'ShopeePay';
    case 'echannel':
      return 'Mandiri Bill / Virtual Account';
    case 'permata':
    case 'permata_va':
      return 'Virtual Account Permata';
    case 'bca_va':
      return 'Virtual Account BCA';
    case 'bni_va':
      return 'Virtual Account BNI';
    case 'bri_va':
      return 'Virtual Account BRI';
    case 'cimb_va':
      return 'Virtual Account CIMB Niaga';
    case 'credit_card':
      return 'Kartu Kredit / Debit';
    case 'cstore':
      return 'Gerai Retail (Indomaret / Alfamart)';
    case 'akulaku':
      return 'Akulaku';
    case 'kredivo':
      return 'Kredivo';
    default: {
      if (lower.startsWith('bank_transfer:')) {
        const bankRaw = lower.split(':')[1] || '';
        if (bankRaw === 'permata') return 'Virtual Account Permata';
        if (bankRaw === 'cimb') return 'Virtual Account CIMB Niaga';
        const bank = bankRaw.toUpperCase();
        return bank ? `Virtual Account ${bank}` : 'Transfer Bank';
      }
      if (lower.startsWith('cstore:')) {
        const store = lower.split(':')[1];
        return store ? `Retail (${store.toUpperCase()})` : 'Gerai Retail';
      }
      return raw;
    }
  }
}

/**
 * Validates that payment_url is a real Midtrans Snap session URL returned by Backend
 * for the active environment (app.sandbox.midtrans.com for Sandbox).
 * Never constructs URLs client-side and rejects dummy booking_code URLs.
 */
export function getOfficialPaymentUrl(
  booking:
    | {
        status?: string | null;
        payment_url?: string | null;
        booking_code?: string | null;
      }
    | null
    | undefined
): string | null {
  if (booking?.status !== 'pending_payment' || typeof booking.payment_url !== 'string') {
    return null;
  }

  try {
    const url = new URL(booking.payment_url);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) {
      return null;
    }

    const allowedHosts = isMidtransProductionClient()
      ? ['app.midtrans.com']
      : ['app.sandbox.midtrans.com'];

    if (!allowedHosts.includes(url.hostname)) {
      return null;
    }

    const match = url.pathname.match(
      /^\/snap\/v[1-4]\/(?:vtweb|redirection)\/([^/]+)\/?$/
    );
    if (!match) {
      return null;
    }

    const session = decodeURIComponent(match[1]);
    const hasControlChars = [...session].some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127
    );

    if (
      !session.trim() ||
      /[\s/\\?#]/.test(session) ||
      hasControlChars ||
      session === booking.booking_code
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

/**
 * Opens an already-validated official Midtrans Snap URL via expo-web-browser
 * (SFSafariViewController on iOS, Chrome Custom Tabs on Android).
 * Never treats closing/opening the browser as payment settlement.
 */
export async function openMidtransPaymentBrowser(
  officialUrl: string
): Promise<MidtransBrowserOutcome> {
  try {
    const result = await WebBrowser.openBrowserAsync(officialUrl, {
      toolbarColor: '#0B0F17',
      controlsColor: '#06B6D4',
      dismissButtonStyle: 'close',
      showTitle: true,
      enableBarCollapsing: true,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      windowName: '_blank',
    });

    switch (result.type) {
      case WebBrowser.WebBrowserResultType.OPENED:
        return { status: 'opened' };
      case WebBrowser.WebBrowserResultType.DISMISS:
        return { status: 'dismissed' };
      case WebBrowser.WebBrowserResultType.CANCEL:
        return { status: 'cancelled' };
      case WebBrowser.WebBrowserResultType.LOCKED:
        return {
          status: 'error',
          message:
            'Browser pembayaran sedang terkunci atau sudah terbuka. Silakan lanjutkan dari detail pesanan.',
        };
      default:
        return { status: 'dismissed' };
    }
  } catch {
    return {
      status: 'error',
      message:
        'Gagal membuka halaman pembayaran Midtrans. Anda dapat membuka kembali tautan dari detail pesanan.',
    };
  }
}

/**
 * Determines whether the authenticated user can invoke POST /api/checkout/<code>/sync-payment-status
 * in Sandbox mode, matching Backend ownership rules (ISSUE-04 compatibility).
 */
export function canUserSyncBookingPayment(
  booking: Booking | null | undefined,
  user: User | null | undefined,
  isAuthenticated: boolean
): boolean {
  if (!booking || booking.status !== 'pending_payment') {
    return false;
  }
  if (isMidtransProductionClient()) {
    return false;
  }
  if (!isAuthenticated || !user) {
    return false;
  }
  if (user.role === 'admin') {
    return true;
  }
  if (booking.user_id != null) {
    return Number(booking.user_id) === Number(user.id);
  }
  return Boolean(
    user.email &&
      booking.buyer_email &&
      user.email.trim().toLowerCase() === booking.buyer_email.trim().toLowerCase()
  );
}
