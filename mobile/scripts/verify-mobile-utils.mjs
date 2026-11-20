import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mobileRoot = path.resolve(__dirname, '..');

function loadTsModuleWithMocks(relPath, mocks = {}) {
  const fullPath = path.join(mobileRoot, relPath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });

  const mod = { exports: {} };
  const localRequire = (specifier) => {
    if (Object.prototype.hasOwnProperty.call(mocks, specifier)) {
      return mocks[specifier];
    }
    if (specifier.startsWith('.')) {
      const resolvedTs = path.resolve(path.dirname(fullPath), `${specifier}.ts`);
      if (fs.existsSync(resolvedTs)) {
        return loadTsModuleWithMocks(path.relative(mobileRoot, resolvedTs), mocks);
      }
    }
    return Module.createRequire(fullPath)(specifier);
  };

  const fn = new Function('require', 'module', 'exports', transpiled.outputText);
  fn(localRequire, mod, mod.exports);
  return mod.exports;
}

const formatters = loadTsModuleWithMocks('src/utils/formatters.ts');
const apiUrlResolver = loadTsModuleWithMocks('src/constants/apiUrlResolver.ts');
const payment = loadTsModuleWithMocks('src/utils/payment.ts', {
  'expo-web-browser': {
    WebBrowserResultType: {
      OPENED: 'opened',
      DISMISS: 'dismissed',
      CANCEL: 'cancel',
      LOCKED: 'locked',
    },
    WebBrowserPresentationStyle: { FULL_SCREEN: 'fullScreen' },
    openBrowserAsync: async () => ({ type: 'dismissed' }),
  },
});

test('apiUrlResolver resolves LAN host for Expo Go, fallback for Android emulator & Web, and honors override', () => {
  assert.equal(
    apiUrlResolver.resolveDefaultApiBaseUrl({
      envUrl: undefined,
      isDev: true,
      platformOS: 'ios',
      devServerUris: ['exp://172.20.10.4:8081'],
    }),
    'http://172.20.10.4:5000/api'
  );

  assert.equal(
    apiUrlResolver.resolveDefaultApiBaseUrl({
      envUrl: undefined,
      isDev: true,
      platformOS: 'android',
      devServerUris: [],
    }),
    'http://10.0.2.2:5000/api'
  );

  assert.equal(
    apiUrlResolver.resolveDefaultApiBaseUrl({
      envUrl: undefined,
      isDev: true,
      platformOS: 'web',
      devServerUris: [],
      webHostname: 'localhost',
    }),
    'http://127.0.0.1:5000/api'
  );

  assert.equal(
    apiUrlResolver.resolveDefaultApiBaseUrl({
      envUrl: 'https://api.ticketwave.id/api/',
      isDev: false,
      platformOS: 'android',
      devServerUris: ['exp://192.168.1.9:8081'],
    }),
    'https://api.ticketwave.id/api'
  );

  assert.equal(apiUrlResolver.isTunnelDevServerUri('https://abc.exp.direct:80'), true);
  assert.equal(apiUrlResolver.extractLanDevHost('exp://abc.exp.direct:80'), null);
});

test('formatters compute effectiveTicketPrice with ISSUE-08 fallback and event past guards', () => {
  assert.equal(
    formatters.effectiveTicketPrice({
      base_price: 200000,
      final_price: null,
      active_phase: { discount_percent: 15 },
    }),
    170000
  );

  assert.equal(
    formatters.effectiveTicketPrice({
      base_price: 350000,
      final_price: 350000,
      active_phase: null,
    }),
    350000
  );

  assert.equal(
    formatters.isEventPast({ event_date: '2026-11-19', status: 'on_sale' }, '2026-11-20'),
    true
  );
  assert.equal(
    formatters.isEventPurchasable({ event_date: '2026-11-19', status: 'on_sale' }, '2026-11-20'),
    false
  );
  assert.equal(
    formatters.isEventPurchasable({ event_date: '2026-11-25', status: 'on_sale' }, '2026-11-20'),
    true
  );
  assert.equal(
    formatters.isEventPast({ event_type: 'festival', event_date: null, status: 'on_sale' }, '2026-11-20'),
    false
  );
  assert.equal(
    formatters.formatEventSchedule({ event_type: 'festival', event_date: null, days_count: 3 }),
    'Festival 3 Hari'
  );
});

test('isTicketQrEligible enforces strict paid + valid + qr_token rules', () => {
  assert.equal(
    formatters.isTicketQrEligible('paid', { status: 'valid', qr_token: 'AbCdEf12345' }),
    true
  );
  assert.equal(
    formatters.isTicketQrEligible(undefined, { status: 'valid', qr_token: 'AbCdEf12345' }),
    false
  );
  assert.equal(
    formatters.isTicketQrEligible('pending_payment', { status: 'valid', qr_token: 'AbCdEf12345' }),
    false
  );
  assert.equal(
    formatters.isTicketQrEligible('paid', { status: 'used', qr_token: 'AbCdEf12345' }),
    false
  );
  assert.equal(
    formatters.isTicketQrEligible('paid', { status: 'valid', qr_token: '' }),
    false
  );
});

test('getOfficerStatusBadgeVariant maps TIDAK VALID to danger and VALID to success', () => {
  assert.equal(formatters.getOfficerStatusBadgeVariant('TIDAK VALID'), 'danger');
  assert.equal(formatters.getOfficerStatusBadgeVariant('DIBATALKAN'), 'danger');
  assert.equal(formatters.getOfficerStatusBadgeVariant('CHECK-IN BELUM TERKONFIRMASI'), 'danger');
  assert.equal(formatters.getOfficerStatusBadgeVariant('SUDAH DIGUNAKAN'), 'warning');
  assert.equal(formatters.getOfficerStatusBadgeVariant('VALID'), 'success');
  assert.equal(formatters.getOfficerStatusBadgeVariant('CHECK-IN SELESAI'), 'success');
});

test('formatWibDateTime converts naive UTC timestamps from Flask to Asia/Jakarta WIB', () => {
  const formatted = formatters.formatWibDateTime('2026-11-20T10:30:00');
  assert.match(formatted, /17[.:]30[.:]00\s*WIB/);
});

test('payment utilities validate official Midtrans Sandbox Snap URLs and ownership', () => {
  assert.equal(
    payment.getOfficialPaymentUrl({
      status: 'pending_payment',
      booking_code: 'TKTW-123',
      payment_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/tok-999',
    }),
    'https://app.sandbox.midtrans.com/snap/v4/redirection/tok-999'
  );

  assert.equal(
    payment.getOfficialPaymentUrl({
      status: 'pending_payment',
      booking_code: 'TKTW-123',
      payment_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/TKTW-123',
    }),
    null
  );

  assert.equal(
    payment.getOfficialPaymentUrl({
      status: 'paid',
      booking_code: 'TKTW-123',
      payment_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/tok-999',
    }),
    null
  );

  assert.equal(payment.getPaymentMethodLabel('bank_transfer:permata'), 'Virtual Account Permata');
  assert.equal(payment.getPaymentMethodLabel('other_qris'), 'QRIS');

  assert.equal(
    payment.canUserSyncBookingPayment(
      { status: 'pending_payment', user_id: 7, buyer_email: 'a@example.com' },
      { id: 7, email: 'a@example.com', role: 'user' },
      true
    ),
    true
  );
  assert.equal(
    payment.canUserSyncBookingPayment(
      { status: 'pending_payment', user_id: 7, buyer_email: 'a@example.com' },
      { id: 9, email: 'b@example.com', role: 'user' },
      true
    ),
    false
  );
});
