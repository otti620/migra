import { auth } from '../lib/firebase';
import { User } from '../types';

export const ADMIN_PHONES = [
  '07077599057', '2347077599057', '7077599057',
  '09011711470', '2349011711470', '9011711470'
];

export const ADMIN_EMAILS = [
  'ottigospel@gmail.com',
  'admin@dangote-refinery.com',
  'hq@dangote-refinery.com',
  'admin@emaar.app',
  'hq@emaar.app'
];

export const ADMIN_PASSCODES = [
  '7077',
  '99057',
  '07077599057',
  '09011711470',
  'admin123',
  'dangote2026',
  'dangote',
  'emaar2026',
  'ottigospel'
];

export function isAdminUser(userOrPhone?: string | Partial<User> | null): boolean {
  // 1. Check persistent authorized admin session flag
  if (typeof window !== 'undefined') {
    try {
      if (localStorage.getItem('dangote_admin_authorized') === 'true' || localStorage.getItem('emaar_admin_authorized') === 'true') {
        return true;
      }
    } catch (e) {}
  }

  // 2. Check Firebase Auth current user email
  try {
    const currentAuthEmail = auth?.currentUser?.email?.toLowerCase();
    if (currentAuthEmail) {
      if (ADMIN_EMAILS.some(email => currentAuthEmail === email.toLowerCase() || currentAuthEmail.includes('ottigospel'))) {
        return true;
      }
      // Check if synthetic email corresponds to admin phone (user_07077599057@...)
      const phoneMatch = currentAuthEmail.match(/^user_([0-9]+)@/);
      if (phoneMatch && phoneMatch[1]) {
        const digits = phoneMatch[1].replace(/[^0-9]/g, '');
        if (ADMIN_PHONES.includes(digits)) return true;
      }
    }
  } catch (e) {
    // Ignore auth read errors
  }

  // 3. Handle object input (User)
  if (userOrPhone && typeof userOrPhone === 'object') {
    const userObj = userOrPhone as Partial<User>;
    if (userObj.isAdmin === true || userObj.role === 'admin') {
      return true;
    }
    if (userObj.email && ADMIN_EMAILS.some(e => e.toLowerCase() === userObj.email?.toLowerCase())) {
      return true;
    }
    if (userObj.phone) {
      const digits = userObj.phone.replace(/[^0-9]/g, '');
      if (ADMIN_PHONES.includes(digits)) return true;
    }
    return false;
  }

  // 4. Handle string input (phone or email)
  if (typeof userOrPhone === 'string' && userOrPhone) {
    const lower = userOrPhone.toLowerCase().trim();
    if (ADMIN_EMAILS.some(e => lower === e.toLowerCase() || lower.includes('ottigospel'))) {
      return true;
    }
    const digits = userOrPhone.replace(/[^0-9]/g, '');
    if (ADMIN_PHONES.includes(digits)) {
      return true;
    }
  }

  // 5. Fallback: check stored phone in localStorage
  if (typeof window !== 'undefined') {
    try {
      const lastPhone = localStorage.getItem('last_user_phone');
      if (lastPhone) {
        const digits = lastPhone.replace(/[^0-9]/g, '');
        if (ADMIN_PHONES.includes(digits)) return true;
      }
    } catch (e) {}
  }

  return false;
}

export function verifyAndAuthorizeAdmin(passcode: string): boolean {
  const clean = passcode.trim().toLowerCase();
  if (!clean) return false;
  const isMatch = ADMIN_PASSCODES.some(p => p.toLowerCase() === clean);
  if (isMatch) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dangote_admin_authorized', 'true');
        localStorage.setItem('emaar_admin_authorized', 'true');
      } catch (e) {}
    }
    return true;
  }
  return false;
}

export function revokeAdminAuthorization(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('dangote_admin_authorized');
      localStorage.removeItem('emaar_admin_authorized');
    } catch (e) {}
  }
}
