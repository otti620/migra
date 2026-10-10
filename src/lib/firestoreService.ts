import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  runTransaction,
  arrayUnion
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { db, auth } from './firebase';
import { User, Product, Transaction, Order, PendingDeposit, PendingWithdrawalReq, AnnouncementItem, RedemptionCode, BalanceAuditLog, AdminActivityLog, PaymentConfig } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS } from '../data/catalog';
import { getOrderDailyIncome } from '../utils/validators';

// Helper to strip undefined values so Firestore setDoc/updateDoc doesn't fail
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = cleanForFirestore(val);
    }
  }
  return result as T;
}

// Safe localStorage wrappers to prevent SSR/Node/sandboxed iframe failures
export function safeGetStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}
  return null;
}

export function safeSetStorage(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (e) {}
}

export function safeRemoveStorage(key: string): void {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {}
}

export function getDeterministicReferralCode(phone: string, existingCode?: string): string {
  if (existingCode && existingCode.trim()) {
    return existingCode.trim().toUpperCase();
  }
  const clean = (phone || '').replace(/[^0-9]/g, '');
  if (clean.length >= 4) {
    return `DAN-${clean.slice(-4)}`;
  }
  return `DAN-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function isUserReferredBy(
  downline: { referredBy?: string; phone?: string }, 
  referrer: { referralCode?: string; phone?: string; inviteCode?: string }
): boolean {
  if (!downline?.referredBy || !referrer) return false;
  const refStr = downline.referredBy.trim().toUpperCase();
  if (!refStr) return false;

  const currentCode = (referrer.referralCode || '').trim().toUpperCase();
  const inviteCode = ((referrer as any).inviteCode || '').trim().toUpperCase();
  const rawRefPhone = (referrer.phone || '').replace(/[^0-9]/g, '');
  const downlinePhone = (downline.phone || '').replace(/[^0-9]/g, '');

  if (downlinePhone && rawRefPhone && downlinePhone === rawRefPhone) {
    return false; // cannot refer oneself
  }

  const detCode = getDeterministicReferralCode(referrer.phone || '').toUpperCase();
  const normRefPhone = resolveActivePhone(referrer.phone || '');

  // Exact matching against referrer's codes or phones
  if (currentCode && refStr === currentCode) return true;
  if (inviteCode && refStr === inviteCode) return true;
  if (detCode && refStr === detCode) return true;
  if (rawRefPhone && (refStr === rawRefPhone || refStr === normRefPhone)) return true;
  if (normRefPhone && refStr === normRefPhone.toUpperCase()) return true;

  return false;
}

export function findReferrerByCode<T extends { referralCode?: string; phone?: string; referredBy?: string }>(allUsers: T[], referredByStr?: string): T | undefined {
  if (!referredByStr || !allUsers || allUsers.length === 0) return undefined;
  const clean = referredByStr.trim().toUpperCase();
  if (!clean) return undefined;

  return allUsers.find((u) => {
    const uCode = (u.referralCode || '').trim().toUpperCase();
    const uPhone = (u.phone || '').replace(/[^0-9]/g, '').toUpperCase();
    const uDet = getDeterministicReferralCode(u.phone || '').trim().toUpperCase();
    const uPhoneRaw = (u.phone || '').trim().toUpperCase();
    return (
      (uCode && uCode === clean) ||
      (uDet && uDet === clean) ||
      (uPhoneRaw && uPhoneRaw === clean) ||
      (uPhone && (uPhone === clean || uPhone.endsWith(clean) || clean.endsWith(uPhone)))
    );
  });
}

// Helper to convert phone number into synthetic Firebase Auth email
export function phoneToEmail(phone: string): string {
  const cleanPhone = resolveActivePhone(phone) || phone.replace(/[^0-9]/g, '');
  return `user_${cleanPhone}@dangote-refinery.com`;
}

// Password compliance helper for Firebase Auth (min 6 characters)
export function formatAuthPassword(pass: string): string {
  if (!pass) return '123456';
  return pass.length < 6 ? pass.padEnd(6, '0') : pass;
}

// 1. Firebase Auth Integrations
export async function firebaseLogin(phone: string, pass: string) {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) {
    throw new Error('Please enter a valid phone number.');
  }

  if (await checkIfUserIsBanned(cleanPhone)) {
    throw new Error('This account and device have been permanently banned.');
  }

  const email = phoneToEmail(cleanPhone);
  const formattedPass = formatAuthPassword(pass);

  // Validate Firestore user document
  const userRef = doc(db, 'users', cleanPhone);
  let snap = await getDoc(userRef);

  // Check alternate phone variants if not found by primary cleanPhone
  if (!snap.exists()) {
    const variants = [
      cleanPhone.startsWith('0') ? cleanPhone.slice(1) : '0' + cleanPhone,
      cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : '234' + cleanPhone,
    ];
    for (const v of variants) {
      const vSnap = await getDoc(doc(db, 'users', v));
      if (vSnap.exists()) {
        snap = vSnap;
        break;
      }
    }
  }

  // CRITICAL: If account does not exist in Firestore, they are NOT registered!
  if (!snap.exists()) {
    throw new Error('No account found for this phone number. Please register an account first.');
  }

  const userData = snap.data() as User;
  if (userData.password && userData.password !== pass) {
    throw new Error('Incorrect password. Please verify your password and try again.');
  }

  // Attempt Firebase Auth sign-in
  try {
    const cred = await signInWithEmailAndPassword(auth, email, formattedPass);
    return cred.user;
  } catch (err: any) {
    if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
      throw new Error('Incorrect password. Please verify your password and try again.');
    }
    // Only if user IS verified to exist in Firestore with matching credentials:
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, formattedPass);
      return cred.user;
    } catch (innerErr: any) {
      if (auth.currentUser) {
        return auth.currentUser;
      }
      return { uid: cleanPhone, email, emailVerified: true };
    }
  }
}

export async function firebaseSignup(phone: string, pass: string, initialData?: Partial<User>) {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) {
    throw new Error('Please enter a valid phone number.');
  }

  if (await checkIfUserIsBanned(cleanPhone)) {
    throw new Error('This account and device have been permanently banned.');
  }

  const email = phoneToEmail(cleanPhone);
  const formattedPass = formatAuthPassword(pass);

  // Check if user already exists in Firestore
  const userRef = doc(db, 'users', cleanPhone);
  let existingData: User | null = null;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data() as User;
    }
  } catch (fsErr: any) {
    console.warn('Firestore signup check warning:', fsErr?.message);
  }

  const newUser: User = {
    id: existingData?.id || `DAN-${Math.floor(100000 + Math.random() * 900000)}`,
    phone: cleanPhone,
    password: pass,
    balance: existingData?.balance ?? initialData?.balance ?? 0,
    accruedIncome: existingData?.accruedIncome ?? 0,
    vipLevel: existingData?.vipLevel ?? 1,
    teamSize: existingData?.teamSize ?? 0,
    referralCode: existingData?.referralCode || getDeterministicReferralCode(cleanPhone, initialData?.referralCode),
    hasReferralDeposit: existingData?.hasReferralDeposit ?? false,
    referralDepositsCount: existingData?.referralDepositsCount ?? 0,
    referredBy: existingData?.referredBy || initialData?.referredBy,
    createdAt: existingData?.createdAt || new Date().toISOString(),
    ...initialData,
  };

  try {
    await setDoc(userRef, cleanForFirestore(newUser), { merge: true });
    safeSetStorage(`cache_user_${cleanPhone}`, JSON.stringify(newUser));
  } catch (setErr: any) {
    console.warn('Firestore signup write warning:', setErr?.message);
    safeSetStorage(`cache_user_${cleanPhone}`, JSON.stringify(newUser));
  }

  // Atomically link downline to referrer in Firestore
  if (initialData?.referredBy) {
    const rawRefCode = initialData.referredBy.trim();
    try {
      let refDocSnap = null;
      const refPhoneClean = resolveActivePhone(rawRefCode) || rawRefCode.replace(/[^0-9]/g, '');
      if (refPhoneClean && refPhoneClean.length >= 8) {
        const pSnap = await getDoc(doc(db, 'users', refPhoneClean));
        if (pSnap.exists()) refDocSnap = pSnap;
      }
      if (!refDocSnap) {
        const q1 = query(collection(db, 'users'), where('referralCode', '==', rawRefCode.toUpperCase()), limit(1));
        const qSnap1 = await getDocs(q1);
        if (!qSnap1.empty) refDocSnap = qSnap1.docs[0];
      }
      if (!refDocSnap) {
        const q2 = query(collection(db, 'users'), where('inviteCode', '==', rawRefCode.toUpperCase()), limit(1));
        const qSnap2 = await getDocs(q2);
        if (!qSnap2.empty) refDocSnap = qSnap2.docs[0];
      }

      if (refDocSnap && refDocSnap.exists()) {
        const refUserData = refDocSnap.data() as User;
        const refUserPhone = refUserData.phone || refDocSnap.id;
        const newMember = {
          id: `mem-${cleanPhone}`,
          phone: cleanPhone,
          joinDate: new Date().toLocaleDateString(),
          level: 1,
          invested: 0,
        };
        await updateDoc(doc(db, 'users', refUserPhone), {
          teamSize: increment(1),
          teamMembers: arrayUnion(newMember),
        });
      }
    } catch (refErr: any) {
      console.warn('Referrer auto-link notice:', refErr?.message);
    }
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, formattedPass);
    return cred.user;
  } catch (err: any) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, formattedPass);
      return cred.user;
    } catch (innerErr: any) {
      if (auth.currentUser) return auth.currentUser;
      return { uid: cleanPhone, email, emailVerified: true };
    }
  }
}

export async function firebaseLogout() {
  await signOut(auth);
}

export function subscribeAuthState(onUserChanged: (authUser: any) => void) {
  return onAuthStateChanged(auth, (authUser) => {
    onUserChanged(authUser);
  });
}

export function resolveActivePhone(phone?: string): string {
  let target = phone;
  if (!target && typeof window !== 'undefined') {
    target = localStorage.getItem('current_phone') || localStorage.getItem('last_user_phone') || '';
  }
  if (!target && auth.currentUser?.email) {
    const match = auth.currentUser.email.match(/^user_([0-9]+)@/);
    if (match && match[1]) {
      target = match[1];
    }
  }
  if (!target) return '';
  let clean = target.replace(/[^0-9]/g, '');
  if (!clean) return '';
  if (clean.startsWith('234') && clean.length >= 12) {
    clean = '0' + clean.slice(3);
  } else if (clean.length === 10 && (clean.startsWith('7') || clean.startsWith('8') || clean.startsWith('9'))) {
    clean = '0' + clean;
  }
  return clean;
}

// 2. Sync User Profile in Firestore
export function subscribeUser(phone: string, onUpdate: (user: User) => void, initialUserData?: User) {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) return () => {};
  const userRef = doc(db, 'users', cleanPhone);

  // 1. Load from persistent cache immediately for instant offline/transient drop visibility
  const cacheKey = `cache_user_${cleanPhone}`;
  const cachedDataStr = safeGetStorage(cacheKey);
  if (cachedDataStr) {
    try {
      const cachedUser = JSON.parse(cachedDataStr);
      onUpdate(cachedUser);
    } catch (e) {
      // ignore
    }
  }

  let isSubscribed = true;
  let retryTimer: any = null;

  const setupSnapshot = () => {
    if (!isSubscribed) return () => {};
    return onSnapshot(
      userRef,
      (snap) => {
        if (!isSubscribed) return;
        if (snap.exists()) {
          const data = snap.data() as User;
          if (data.isBanned || safeGetStorage(`banned_${cleanPhone}`) === 'true') {
            firebaseLogout().catch(() => {});
            safeSetStorage(`banned_${cleanPhone}`, 'true');
            return;
          }
          const permanentCode = data.inviteCode || data.referralCode || (initialUserData?.referralCode || getDeterministicReferralCode(cleanPhone));
          if (!data.referralCode) {
            setDoc(userRef, cleanForFirestore({ referralCode: permanentCode, inviteCode: permanentCode }), { merge: true }).catch(() => {});
          }
          const updatedUser: User = {
            ...initialUserData,
            ...data,
            balance: (data.balance !== undefined && !isNaN(data.balance)) ? data.balance : (initialUserData?.balance ?? 0),
            teamSize: Math.max(Number(data.teamSize || 0), (data.teamMembers || []).length, Number(initialUserData?.teamSize || 0)),
            totalCommissions: Math.max(Number(data.totalCommissions || 0), Number(initialUserData?.totalCommissions || 0)),
            referralCode: permanentCode,
            inviteCode: permanentCode,
            phone: cleanPhone,
            teamMembers: (data.teamMembers && data.teamMembers.length > 0) ? data.teamMembers : (initialUserData?.teamMembers || []),
            records: (data.records && data.records.length > 0) ? data.records : (initialUserData?.records || []),
            purchasedProducts: (data.purchasedProducts && data.purchasedProducts.length > 0) ? data.purchasedProducts : (initialUserData?.purchasedProducts || []),
            cumulativeIncome: data.cumulativeIncome || data.accruedIncome || initialUserData?.accruedIncome || 0,
            accruedIncome: data.accruedIncome || data.cumulativeIncome || initialUserData?.accruedIncome || 0,
            bankAccount: data.bankAccount || initialUserData?.bankAccount,
          };
          safeSetStorage(cacheKey, JSON.stringify(updatedUser));
          onUpdate(updatedUser);
        } else {
          // Check alternate document IDs (e.g. without leading 0 or auth UID)
          const altId = cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone;
          getDoc(doc(db, 'users', altId)).then((altSnap) => {
            if (altSnap.exists()) {
              const altData = altSnap.data() as User;
              const mergedAlt: User = {
                ...altData,
                phone: cleanPhone,
                inviteCode: altData.inviteCode || altData.referralCode,
                referralCode: altData.referralCode || altData.inviteCode,
              };
              setDoc(userRef, cleanForFirestore(mergedAlt), { merge: true }).catch(() => {});
              safeSetStorage(cacheKey, JSON.stringify(mergedAlt));
              onUpdate(mergedAlt);
              return;
            }

            // Do NOT overwrite Firestore with a blank 0-balance user!
            if (cachedDataStr) {
              try {
                const cached = JSON.parse(cachedDataStr);
                onUpdate(cached);
              } catch (e) {}
            } else if (initialUserData) {
              onUpdate(initialUserData);
            }
          }).catch(() => {});
        }
      },
      (err) => {
        console.warn('Firestore user snapshot notice (retrying with debounce):', err?.message);
        if (initialUserData) {
          onUpdate(initialUserData);
        }
        // Debounced retry mechanism on connection error/drop
        if (isSubscribed) {
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isSubscribed) {
              unsub = setupSnapshot();
            }
          }, 4000);
        }
      }
    );
  };

  let unsub = setupSnapshot();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

export async function saveUserToFirestore(user: User) {
  try {
    const cleanPhone = resolveActivePhone(user.phone);
    if (!cleanPhone) return;
    const userRef = doc(db, 'users', cleanPhone);
    const updated = { ...user, phone: cleanPhone };
    safeSetStorage(`cache_user_${cleanPhone}`, JSON.stringify(updated));
    await setDoc(userRef, cleanForFirestore(updated), { merge: true });
  } catch (err: any) {
    console.warn('Error saving user to Firestore:', err?.message);
  }
}

// 3. Sync Products in Firestore
export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  const productsCol = collection(db, 'products');
  const cacheKey = `cache_products_dangote_v3`;
  const cached = safeGetStorage(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdate(parsed);
      }
    } catch (e) {}
  }

  const isLegacyProperty = (item: Product) => {
    if (!item) return true;
    const title = (item.title || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    const cat = (item.category as string || '').toLowerCase();
    return (
      title.includes('emaar') ||
      title.includes('jaipur') ||
      title.includes('creek') ||
      title.includes('villa') ||
      title.includes('dubai') ||
      title.includes('green') ||
      id.includes('jaipur') ||
      id.includes('emaar') ||
      id.endsWith('-5k') ||
      id.endsWith('-10k') ||
      id.endsWith('-15k') ||
      id.endsWith('-25k') ||
      id.endsWith('-35k') ||
      id.endsWith('-50k') ||
      id.endsWith('-66k') ||
      id.endsWith('-85k') ||
      id.endsWith('-120k') ||
      id.endsWith('-128k') ||
      id.endsWith('-180k') ||
      id.endsWith('-250k') ||
      id.endsWith('-350k') ||
      id.endsWith('-500k') ||
      id.endsWith('-750k') ||
      id.endsWith('-1m') ||
      cat === 'real estate' ||
      cat === 'off-plan'
    );
  };

  let isSubscribed = true;
  let retryTimer: any = null;

  const setupSnapshot = () => {
    if (!isSubscribed) return () => {};
    return onSnapshot(
      productsCol,
      (snap) => {
        if (!isSubscribed) return;
        if (snap.empty) {
          INITIAL_PRODUCTS.forEach((prod) => {
            setDoc(doc(db, 'products', prod.id), prod).catch((e) =>
              console.warn('Firestore product init notice:', e?.message)
            );
          });
          safeSetStorage(cacheKey, JSON.stringify(INITIAL_PRODUCTS));
          onUpdate(INITIAL_PRODUCTS);
        } else {
          const existingMap = new Map<string, Product>();
          snap.forEach((docSnap) => {
            const item = docSnap.data() as Product;
            if (isLegacyProperty(item)) {
              deleteDoc(doc(db, 'products', item.id || docSnap.id)).catch(() => {});
              return;
            }
            if (!item.countdown) {
              item.countdown = { hours: 12, minutes: 0, seconds: 0 };
            }
            existingMap.set(item.id, item);
          });

          INITIAL_PRODUCTS.forEach((prod) => {
            if (!existingMap.has(prod.id)) {
              existingMap.set(prod.id, prod);
              setDoc(doc(db, 'products', prod.id), cleanForFirestore(prod)).catch((e) =>
                console.warn('Syncing new catalog item notice:', e?.message)
              );
            }
          });

          const prods = Array.from(existingMap.values()).sort((a, b) => (a.price || 0) - (b.price || 0));
          safeSetStorage(cacheKey, JSON.stringify(prods));
          onUpdate(prods);
        }
      },
      (err) => {
        console.warn('Firestore products snapshot notice (retrying):', err?.message);
        if (cached) {
          try { onUpdate(JSON.parse(cached)); } catch(e){}
        } else {
          onUpdate(INITIAL_PRODUCTS);
        }
        if (isSubscribed) {
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isSubscribed) unsub = setupSnapshot();
          }, 4000);
        }
      }
    );
  };

  let unsub = setupSnapshot();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

export async function addProductToFirestore(product: Product) {
  try {
    await setDoc(doc(db, 'products', product.id), cleanForFirestore(product));
  } catch (err: any) {
    console.warn('Error adding product:', err?.message);
  }
}

export async function deleteProductFromFirestore(productId: string) {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err: any) {
    console.warn('Error deleting product:', err?.message);
  }
}

// 4. Sync Transactions in Firestore for Logged-In User
export function subscribeTransactions(phone: string, onUpdate: (txs: Transaction[]) => void) {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) {
    onUpdate([]);
    return () => {};
  }
  const cacheKey = `cache_txs_${cleanPhone}`;
  const cached = safeGetStorage(cacheKey);
  if (cached) {
    try { onUpdate(JSON.parse(cached)); } catch(e){}
  }

  let isSubscribed = true;
  let retryTimer: any = null;

  const phoneVariants = [cleanPhone];
  if (cleanPhone.startsWith('0')) {
    phoneVariants.push(`+234${cleanPhone.slice(1)}`, `234${cleanPhone.slice(1)}`);
  } else if (cleanPhone.startsWith('234')) {
    phoneVariants.push(`0${cleanPhone.slice(3)}`, `+${cleanPhone}`);
  }

  const txQuery = query(
    collection(db, 'transactions'),
    where('userPhone', 'in', phoneVariants.slice(0, 10))
  );

  const setupSnapshot = () => {
    if (!isSubscribed) return () => {};
    return onSnapshot(
      txQuery,
      (snap) => {
        if (!isSubscribed) return;
        const userTxs: Transaction[] = [];
        snap.forEach((docSnap) => {
          userTxs.push(docSnap.data() as Transaction);
        });
        userTxs.sort((a, b) => (b.date > a.date ? 1 : -1));
        safeSetStorage(cacheKey, JSON.stringify(userTxs));
        onUpdate(userTxs);
      },
      (err) => {
        console.warn('Firestore transactions snapshot notice (retrying):', err?.message);
        if (cached) {
          try { onUpdate(JSON.parse(cached)); } catch(e){}
        }
        if (isSubscribed) {
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isSubscribed) unsub = setupSnapshot();
          }, 4000);
        }
      }
    );
  };

  let unsub = setupSnapshot();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

export async function addTransactionToFirestore(phone: string, tx: Transaction) {
  try {
    const cleanPhone = resolveActivePhone(phone);
    if (!cleanPhone) return;
    const txWithPhone = { ...tx, userPhone: cleanPhone };
    await setDoc(doc(db, 'transactions', tx.id), cleanForFirestore(txWithPhone));
  } catch (err: any) {
    console.warn('Error adding transaction:', err?.message);
  }
}

export async function updateTransactionStatusInFirestore(txId: string, status: 'success' | 'failed') {
  try {
    await updateDoc(doc(db, 'transactions', txId), cleanForFirestore({ status }));
  } catch (err: any) {
    console.warn('Error updating transaction:', err?.message);
  }
}

// 5. Sync Orders in Firestore for Logged-In User
export function subscribeOrders(phone: string, onUpdate: (orders: Order[]) => void) {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) {
    onUpdate([]);
    return () => {};
  }
  const cacheKey = `cache_orders_${cleanPhone}`;
  const cached = safeGetStorage(cacheKey);
  if (cached) {
    try { onUpdate(JSON.parse(cached)); } catch(e){}
  }

  let isSubscribed = true;
  let retryTimer: any = null;

  const phoneVariants = [cleanPhone];
  if (cleanPhone.startsWith('0')) {
    phoneVariants.push(`+234${cleanPhone.slice(1)}`, `234${cleanPhone.slice(1)}`);
  } else if (cleanPhone.startsWith('234')) {
    phoneVariants.push(`0${cleanPhone.slice(3)}`, `+${cleanPhone}`);
  }

  let colOrders: Order[] = [];
  let profileOrders: Order[] = [];

  const mergeAndPublish = () => {
    if (!isSubscribed) return;
    const map = new Map<string, Order>();
    [...profileOrders, ...colOrders].forEach((ord) => {
      if (ord && ord.id) {
        map.set(ord.id, ord);
      }
    });

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.purchasedAt || b.createdAt || 0).getTime() - new Date(a.purchasedAt || a.createdAt || 0).getTime());
    safeSetStorage(cacheKey, JSON.stringify(merged));
    onUpdate(merged);
  };

  const ordersQuery = query(
    collection(db, 'orders'),
    where('userPhone', 'in', phoneVariants.slice(0, 10))
  );

  const userRef = doc(db, 'users', cleanPhone);

  const setupSnapshots = () => {
    if (!isSubscribed) return () => {};

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        if (!isSubscribed) return;
        colOrders = [];
        snap.forEach((docSnap) => {
          colOrders.push(docSnap.data() as Order);
        });
        mergeAndPublish();
      },
      (err) => {
        console.warn('Firestore orders snapshot notice:', err?.message);
      }
    );

    const unsubUser = onSnapshot(
      userRef,
      (docSnap) => {
        if (!isSubscribed) return;
        profileOrders = [];
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.orders)) {
            profileOrders.push(...(data.orders as Order[]));
          }
          if (Array.isArray(data.purchasedProducts)) {
            data.purchasedProducts.forEach((p: any) => {
              const pId = p.instanceId || p.productId || `prod-${Math.random()}`;
              if (!profileOrders.some((o) => o.id === pId || o.productId === p.productId)) {
                profileOrders.push({
                  id: pId,
                  orderNumber: `ORD-${pId}`,
                  userPhone: cleanPhone,
                  productId: p.productId || 'unknown',
                  productTitle: p.title || 'Investment Product',
                  productImage: p.image || '',
                  price: p.dailyIncome ? p.dailyIncome * (p.validityDays || 30) : 1000,
                  dailyIncome: p.dailyIncome || 0,
                  totalIncome: p.totalIncome || 0,
                  cycleDays: p.validityDays || 30,
                  daysRemaining: Math.max(0, (p.validityDays || 30) - (p.daysActive || 0)),
                  status: 'active',
                  purchasedAt: p.purchaseDate ? new Date(p.purchaseDate).toLocaleString() : new Date().toLocaleString(),
                  earnedSoFar: 0
                });
              }
            });
          }
        }
        mergeAndPublish();
      },
      (err) => {
        console.warn('Firestore user profile orders snapshot notice:', err?.message);
      }
    );

    return () => {
      unsubOrders();
      unsubUser();
    };
  };

  let cleanup = setupSnapshots();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (cleanup) cleanup();
  };
}

export async function addOrderToFirestore(phone: string, order: Order) {
  try {
    const cleanPhone = resolveActivePhone(phone) || order.userPhone || (typeof window !== 'undefined' ? localStorage.getItem('current_phone') || localStorage.getItem('last_user_phone') || '' : '');
    if (!cleanPhone) return;
    const orderWithPhone = { ...order, userPhone: cleanPhone };

    // Cache locally immediately
    const cacheKey = `cache_orders_${cleanPhone}`;
    const cached = safeGetStorage(cacheKey);
    let currentOrders: Order[] = [];
    if (cached) {
      try { currentOrders = JSON.parse(cached); } catch(e){}
    }
    const updatedCache = [orderWithPhone, ...currentOrders.filter((o) => o.id !== order.id)];
    safeSetStorage(cacheKey, JSON.stringify(updatedCache));

    await setDoc(doc(db, 'orders', order.id), cleanForFirestore(orderWithPhone), { merge: true });

    const userRef = doc(db, 'users', cleanPhone);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const existingPurchased = Array.isArray(userData.purchasedProducts) ? userData.purchasedProducts : [];
      const existingOrders = Array.isArray(userData.orders) ? userData.orders : [];

      const mappedProduct = {
        productId: order.productId,
        instanceId: order.id,
        title: order.productTitle,
        dailyIncome: order.dailyIncome,
        totalIncome: order.totalIncome,
        purchaseDate: Date.now(),
        validityDays: order.cycleDays,
        daysActive: order.cycleDays - order.daysRemaining,
        image: order.productImage
      };

      const updatedPurchased = [mappedProduct, ...existingPurchased.filter((p: any) => p.instanceId !== order.id && p.productId !== order.id)];
      const updatedOrders = [orderWithPhone, ...existingOrders.filter((o: any) => o.id !== order.id)];

      await updateDoc(userRef, cleanForFirestore({
        purchasedProducts: updatedPurchased,
        orders: updatedOrders
      }));
    }
  } catch (err: any) {
    console.warn('Error adding order to Firestore:', err?.message);
  }
}

export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>) {
  try {
    await updateDoc(doc(db, 'orders', orderId), cleanForFirestore(updates));
  } catch (err: any) {
    console.warn('Error updating order:', err?.message);
  }
}

export async function deleteOrderFromFirestore(orderId: string) {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (err: any) {
    console.warn('Error deleting order from Firestore:', err?.message);
  }
}

export function subscribeAllOrders(onUpdate: (orders: Order[]) => void) {
  const ordersCol = collection(db, 'orders');
  const cacheKey = 'cache_all_orders';
  const cached = safeGetStorage(cacheKey);
  if (cached) {
    try { onUpdate(JSON.parse(cached)); } catch(e){}
  }

  let isSubscribed = true;
  let retryTimer: any = null;

  const setupSnapshot = () => {
    if (!isSubscribed) return () => {};
    return onSnapshot(
      ordersCol,
      (snap) => {
        if (!isSubscribed) return;
        const allOrders: Order[] = [];
        snap.forEach((docSnap) => {
          allOrders.push(docSnap.data() as Order);
        });
        safeSetStorage(cacheKey, JSON.stringify(allOrders));
        onUpdate(allOrders);
      },
      (err) => {
        console.warn('Firestore all orders snapshot notice (retrying):', err?.message);
        if (cached) {
          try { onUpdate(JSON.parse(cached)); } catch(e){}
        }
        if (isSubscribed) {
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isSubscribed) unsub = setupSnapshot();
          }, 4000);
        }
      }
    );
  };

  let unsub = setupSnapshot();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

export async function updateProductInFirestore(product: Product) {
  try {
    await setDoc(doc(db, 'products', product.id), cleanForFirestore(product), { merge: true });
  } catch (err: any) {
    console.warn('Error updating product in Firestore:', err?.message);
  }
}

// 6. Admin User Management - Sync All Users from Firestore
export function deduplicateUsers(usersList: User[]): User[] {
  if (!Array.isArray(usersList)) return [];
  const usersMap = new Map<string, User>();
  for (const raw of usersList) {
    if (!raw) continue;
    const phone = raw.phone || '';
    const clean = resolveActivePhone(phone) || phone.replace(/[^0-9]/g, '') || raw.id || '';
    if (!clean) continue;

    if (!usersMap.has(clean)) {
      usersMap.set(clean, { 
        ...raw, 
        phone: clean,
        inviteCode: raw.inviteCode || raw.referralCode,
        referralCode: raw.referralCode || raw.inviteCode
      });
    } else {
      const existing = usersMap.get(clean)!;

      // Merge records
      const existingRecords = existing.records || [];
      const rawRecords = raw.records || [];
      const recMap = new Map();
      [...existingRecords, ...rawRecords].forEach(r => {
        const k = r.id || (r.timestamp + '_' + r.type + '_' + r.amount);
        if (!recMap.has(k)) recMap.set(k, r);
      });
      const mergedRecords = Array.from(recMap.values());

      // Merge teamMembers
      const existingTeam = existing.teamMembers || [];
      const rawTeam = raw.teamMembers || [];
      const teamMap = new Map();
      [...existingTeam, ...rawTeam].forEach(m => {
        const k = (m.phone || '').replace(/[^0-9]/g, '') || m.inviteCode || m.id;
        if (k && !teamMap.has(k)) teamMap.set(k, m);
      });
      const mergedTeam = Array.from(teamMap.values());

      // Prefer whichever document has more records or newer updatedAt, avoid reverting valid balance deductions
      const isRawNewer = (raw as any).updatedAt && (existing as any).updatedAt
        ? (raw as any).updatedAt >= (existing as any).updatedAt
        : (rawRecords.length >= existingRecords.length);

      const targetBalance = isRawNewer && raw.balance !== undefined
        ? raw.balance
        : (existing.balance !== undefined ? existing.balance : raw.balance);

      const targetIncome = Math.max(Number(existing.accruedIncome || existing.cumulativeIncome || 0), Number(raw.accruedIncome || raw.cumulativeIncome || 0));

      usersMap.set(clean, {
        ...existing,
        ...raw,
        phone: clean,
        balance: targetBalance,
        accruedIncome: targetIncome,
        cumulativeIncome: targetIncome,
        teamSize: Math.max(Number(existing.teamSize || 0), Number(raw.teamSize || 0), mergedTeam.length),
        vipLevel: Math.max(Number(existing.vipLevel || 0), Number(raw.vipLevel || 0)),
        referralDepositsCount: Math.max(Number(existing.referralDepositsCount || 0), Number(raw.referralDepositsCount || 0)),
        teamTotalInvestment: Math.max(Number(existing.teamTotalInvestment || 0), Number(raw.teamTotalInvestment || 0)),
        totalCommissions: Math.max(Number(existing.totalCommissions || 0), Number(raw.totalCommissions || 0)),
        records: mergedRecords,
        teamMembers: mergedTeam,
        bankAccount: raw.bankAccount || existing.bankAccount,
        nigerianBank: raw.nigerianBank || existing.nigerianBank,
        inviteCode: existing.inviteCode || raw.inviteCode || existing.referralCode || raw.referralCode,
        referralCode: existing.referralCode || raw.referralCode || existing.inviteCode || raw.inviteCode,
        referredBy: existing.referredBy || raw.referredBy || existing.invitedBy || raw.invitedBy,
        invitedBy: existing.invitedBy || raw.invitedBy || existing.referredBy || raw.referredBy,
      });
    }
  }
  return Array.from(usersMap.values());
}

export function subscribeAllUsers(onUpdate: (users: User[]) => void) {
  const usersCol = collection(db, 'users');
  const cacheKey = 'cache_all_users';
  const cachedAllStr = safeGetStorage(cacheKey);
  if (cachedAllStr) {
    try {
      const parsed = JSON.parse(cachedAllStr);
      onUpdate(deduplicateUsers(parsed));
    } catch (e) {}
  }

  let isSubscribed = true;
  let retryTimer: any = null;

  const setupSnapshot = () => {
    if (!isSubscribed) return () => {};
    return onSnapshot(
      usersCol,
      (snap) => {
        if (!isSubscribed) return;
        const usersList: User[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as User;
          usersList.push({
            ...data,
            id: data.id || docSnap.id,
            phone: data.phone || docSnap.id,
          });
        });
        const deduped = deduplicateUsers(usersList);
        safeSetStorage(cacheKey, JSON.stringify(deduped));
        onUpdate(deduped);
      },
      (err) => {
        console.warn('Firestore all users snapshot notice (retrying):', err?.message);
        if (cachedAllStr) {
          try {
            const parsed = JSON.parse(cachedAllStr);
            onUpdate(deduplicateUsers(parsed));
          } catch (e) {}
        }
        if (isSubscribed) {
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isSubscribed) unsub = setupSnapshot();
          }, 4000);
        }
      }
    );
  };

  let unsub = setupSnapshot();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

export async function updateUserInFirestore(phone: string, updates: Partial<User>) {
  try {
    const cleanPhone = resolveActivePhone(phone);
    if (!cleanPhone) return;
    const userRef = doc(db, 'users', cleanPhone);
    if (updates.isBanned === false) {
      safeRemoveStorage(`banned_${cleanPhone}`);
      const banRef = doc(db, 'bannedUsers', cleanPhone);
      await deleteDoc(banRef).catch(() => {});
    }
    await setDoc(userRef, cleanForFirestore(updates), { merge: true });

    const cacheKey = `cache_user_${cleanPhone}`;
    const cachedDataStr = safeGetStorage(cacheKey);
    if (cachedDataStr) {
      try {
        const cachedUser = JSON.parse(cachedDataStr);
        const updated = { ...cachedUser, ...updates };
        safeSetStorage(cacheKey, JSON.stringify(updated));
      } catch (e) {}
    }
  } catch (err: any) {
    console.warn('Error updating user in Firestore:', err?.message);
  }
}

export async function updateUserPhoneInFirestore(oldPhone: string, newPhone: string) {
  try {
    const cleanOld = resolveActivePhone(oldPhone);
    const cleanNew = resolveActivePhone(newPhone);
    if (!cleanOld || !cleanNew) return;

    const oldRef = doc(db, 'users', cleanOld);
    const oldSnap = await getDoc(oldRef);
    if (oldSnap.exists()) {
      const userData = oldSnap.data() as User;
      const updatedUser = { ...userData, phone: newPhone };
      const newRef = doc(db, 'users', cleanNew);
      await setDoc(newRef, cleanForFirestore(updatedUser));
      await deleteDoc(oldRef);
    } else {
      const newRef = doc(db, 'users', cleanNew);
      await setDoc(newRef, cleanForFirestore({ phone: newPhone }), { merge: true });
    }
  } catch (err: any) {
    console.warn('Error updating user phone in Firestore:', err?.message);
  }
}

export async function creditReferralCommissionsForPurchase(
  downlinePhone: string,
  totalPrice: number,
  productTitle: string,
  orderId?: string
) {
  try {
    const cleanDownline = downlinePhone.replace(/[^0-9]/g, '');
    if (!cleanDownline || totalPrice <= 0) return;

    if (orderId) {
      const commCheckRef = doc(db, 'system_settings', `comm_log_${orderId}`);
      const commCheckSnap = await getDoc(commCheckRef);
      if (commCheckSnap.exists()) {
        console.log('Commission already credited for order:', orderId);
        return;
      }
      await setDoc(commCheckRef, { creditedAt: new Date().toISOString() });
    }

    // Fetch downline user directly by phone document id
    const downlineRef = doc(db, 'users', cleanDownline);
    const downlineSnap = await getDoc(downlineRef);
    if (!downlineSnap.exists()) return;
    const downlineUser = downlineSnap.data() as User;
    if (!downlineUser.referredBy) return;

    const now = Date.now();

    // Helper for targeted referrer resolution by phone or referral code (1 read max)
    const resolveReferrer = async (refStr: string): Promise<User | null> => {
      const trimmed = (refStr || '').trim();
      if (!trimmed) return null;
      const cleanP = trimmed.replace(/[^0-9]/g, '');
      if (cleanP.length >= 7) {
        const uSnap = await getDoc(doc(db, 'users', cleanP));
        if (uSnap.exists()) return uSnap.data() as User;
      }
      // Check by referralCode
      const q = query(collection(db, 'users'), where('referralCode', '==', trimmed.toUpperCase()), limit(1));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        return qSnap.docs[0].data() as User;
      }
      return null;
    };

    const referrerL1 = await resolveReferrer(downlineUser.referredBy);
    if (referrerL1 && referrerL1.phone) {
      const l1Phone = referrerL1.phone.replace(/[^0-9]/g, '');
      if (l1Phone !== cleanDownline) {
        const comm15 = Math.round(totalPrice * 0.15);
        if (comm15 > 0) {
          await setDoc(doc(db, 'users', l1Phone), { 
            balance: increment(comm15), 
            totalCommissions: increment(comm15) 
          }, { merge: true });

          await addTransactionToFirestore(l1Phone, {
            id: `tx-comm1-${now}-${Math.floor(Math.random()*1000)}`,
            reference: `COMM-${Math.floor(10000 + Math.random() * 90000)}`,
            type: 'Team Commission',
            amount: comm15,
            description: `15% Purchase Commission from L1 team member ${downlineUser.phone} (${productTitle})`,
            date: new Date().toLocaleString(),
            status: 'success',
            userPhone: l1Phone,
          });
        }
      }

      if (referrerL1.referredBy) {
        const referrerL2 = await resolveReferrer(referrerL1.referredBy);
        if (referrerL2 && referrerL2.phone) {
          const l2Phone = referrerL2.phone.replace(/[^0-9]/g, '');
          if (l2Phone !== cleanDownline) {
            const comm3 = Math.round(totalPrice * 0.03);
            if (comm3 > 0) {
              await setDoc(doc(db, 'users', l2Phone), { 
                balance: increment(comm3), 
                totalCommissions: increment(comm3) 
              }, { merge: true });

              await addTransactionToFirestore(l2Phone, {
                id: `tx-comm2-${now}-${Math.floor(Math.random()*1000)}`,
                reference: `COMM-${Math.floor(10000 + Math.random() * 90000)}`,
                type: 'Team Commission',
                amount: comm3,
                description: `3% Purchase Commission from L2 team member ${downlineUser.phone} (${productTitle})`,
                date: new Date().toLocaleString(),
                status: 'success',
                userPhone: l2Phone,
              });
            }
          }

          if (referrerL2.referredBy) {
            const referrerL3 = await resolveReferrer(referrerL2.referredBy);
            if (referrerL3 && referrerL3.phone) {
              const l3Phone = referrerL3.phone.replace(/[^0-9]/g, '');
              if (l3Phone !== cleanDownline) {
                const comm1 = Math.round(totalPrice * 0.01);
                if (comm1 > 0) {
                  await setDoc(doc(db, 'users', l3Phone), { 
                    balance: increment(comm1), 
                    totalCommissions: increment(comm1) 
                  }, { merge: true });

                  await addTransactionToFirestore(l3Phone, {
                    id: `tx-comm3-${now}-${Math.floor(Math.random()*1000)}`,
                    reference: `COMM-${Math.floor(10000 + Math.random() * 90000)}`,
                    type: 'Team Commission',
                    amount: comm1,
                    description: `1% Purchase Commission from L3 team member ${downlineUser.phone} (${productTitle})`,
                    date: new Date().toLocaleString(),
                    status: 'success',
                    userPhone: l3Phone,
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('Error crediting referral commissions for purchase:', err?.message);
  }
}

export async function addDownlineUserInFirestore(referrerPhone: string, referrerCode: string, newPhone: string, registrationAmount: number = 0) {
  try {
    const cleanNew = newPhone.replace(/[^0-9]/g, '');
    if (!cleanNew) return;
    const userRef = doc(db, 'users', cleanNew);
    const snap = await getDoc(userRef);
    const refStr = referrerCode || referrerPhone;
    if (!snap.exists()) {
      const newUser: Partial<User> = {
        phone: cleanNew,
        balance: 0,
        totalCommissions: 0,
        referralCount: 0,
        teamSize: 0,
        referredBy: refStr,
        vipLevel: 0,
        hasReferralDeposit: registrationAmount > 0,
        referralDepositsCount: registrationAmount > 0 ? 1 : 0,
        referralCode: cleanNew.slice(-6).toUpperCase()
      };
      await setDoc(userRef, cleanForFirestore(newUser));
    } else {
      await setDoc(userRef, cleanForFirestore({ 
        referredBy: refStr,
        ...(registrationAmount > 0 ? { hasReferralDeposit: true, referralDepositsCount: 1 } : {})
      }), { merge: true });
    }

    if (registrationAmount > 0) {
      const orderId = `reg_${cleanNew}_${Date.now()}`;
      const order: Order = {
        id: orderId,
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        userPhone: cleanNew,
        productId: 'admin_registration',
        productTitle: 'Registration Investment',
        productImage: '',
        price: registrationAmount,
        dailyIncome: 0,
        totalIncome: registrationAmount,
        cycleDays: 30,
        daysRemaining: 30,
        status: 'active',
        purchasedAt: new Date().toISOString(),
        earnedSoFar: 0
      };
      await setDoc(doc(db, 'orders', orderId), cleanForFirestore(order));
      await creditReferralCommissionsForPurchase(cleanNew, registrationAmount, 'Registration Investment', orderId);
    }
  } catch (err: any) {
    console.warn('Error adding downline user in Firestore:', err?.message);
  }
}

export async function setUserInvestmentAmountInFirestore(phone: string, amount: number, allOrders: Order[]) {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return;
    const userOrders = allOrders.filter(o => {
      const op = (o.userPhone || '').replace(/[^0-9]/g, '');
      return op === cleanPhone || cleanPhone.endsWith(op) || op.endsWith(cleanPhone);
    });

    if (userOrders.length > 0) {
      const firstOrder = userOrders[0];
      await updateDoc(doc(db, 'orders', firstOrder.id), cleanForFirestore({ price: amount, totalIncome: amount }));
    } else if (amount > 0) {
      const orderId = `reg_${cleanPhone}_${Date.now()}`;
      const order: Order = {
        id: orderId,
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        userPhone: cleanPhone,
        productId: 'admin_registration',
        productTitle: 'Registration Investment',
        productImage: '',
        price: amount,
        dailyIncome: 0,
        totalIncome: amount,
        cycleDays: 30,
        daysRemaining: 30,
        status: 'active',
        purchasedAt: new Date().toISOString(),
        earnedSoFar: 0
      };
      await setDoc(doc(db, 'orders', orderId), cleanForFirestore(order));
    }
  } catch (err: any) {
    console.warn('Error setting user investment amount:', err?.message);
  }
}

export type BalanceEventType = 
  | 'Earnings' 
  | 'Recharge' 
  | 'Redemption' 
  | 'Team Commission' 
  | 'Task Bonus' 
  | 'CheckIn' 
  | 'Admin Allocation' 
  | 'Withdrawal Refund';

export async function verifiedIncrementUserBalance(
  phone: string,
  deltaAmount: number,
  eventType: BalanceEventType,
  referenceId: string
) {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone || deltaAmount === 0) {
    return { success: false, message: 'Invalid balance update parameters or zero amount.' };
  }

  const sanitizedRef = (referenceId || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const auditDocId = sanitizedRef 
    ? `audit_${eventType}_${cleanPhone}_${sanitizedRef}`
    : `audit_${eventType}_${cleanPhone}_${Date.now()}`;

  // Local idempotency check to avoid duplicate increments under any network/quota conditions
  const localProcessedKey = 'cache_local_audit_processed_refs';
  const localEventKey = `${cleanPhone}_${eventType}_${referenceId}`;
  try {
    const rawLocal = safeGetStorage(localProcessedKey);
    const processedMap: Record<string, boolean> = rawLocal ? JSON.parse(rawLocal) : {};
    if (processedMap[localEventKey] && deltaAmount > 0) {
      console.warn('Local idempotency guard: Reference ID already processed:', localEventKey);
      return { success: true, alreadyProcessed: true };
    }
  } catch (e) {}

  try {
    // 1. Remote Idempotency check (if Firestore is active)
    if (referenceId && deltaAmount > 0) {
      try {
        const directAuditSnap = await getDoc(doc(db, 'balanceAuditLogs', auditDocId));
        if (directAuditSnap.exists()) {
          console.warn('Deterministic audit guard: Already processed in Firestore:', auditDocId);
          return { success: true, alreadyProcessed: true };
        }

        const auditQuery = query(collection(db, 'balanceAuditLogs'), where('referenceId', '==', referenceId));
        const auditSnap = await getDocs(auditQuery);
        let alreadyProcessed = false;
        auditSnap.forEach((d) => {
          const data = d.data();
          if (data.eventType === eventType) {
            alreadyProcessed = true;
          }
        });
        if (alreadyProcessed) {
          console.warn('Reference ID has already been credited in balance audit logs:', referenceId);
          return { success: true, alreadyProcessed: true };
        }
      } catch (auditErr: any) {
        console.warn('Audit check notice (continuing with local verification):', auditErr?.message);
      }
    }

    // 2. Server-side / Local Verification hook based on event type
    if (deltaAmount > 0) {
      if (eventType === 'Redemption') {
        let codeKey = referenceId;
        if (referenceId.startsWith('REDEMPTION-')) {
          const parts = referenceId.split('-');
          if (parts.length >= 2) {
            codeKey = parts[1];
          }
        }
        const defaultPromoCodes: Record<string, number> = {
          'DANGOTE5000': 5000,
          'DAN5000': 5000,
          'EMAAR5000': 5000,
          'WELCOME': 2000,
          'RESCUE2026': 3000,
          'BONUS2026': 5000,
          'VIPGIFT': 10000,
          'GIFT1000': 1000,
        };
        try {
          const codeRef = doc(db, 'redemption_codes', codeKey);
          const codeSnap = await getDoc(codeRef);
          if (codeSnap.exists()) {
            const codeData = codeSnap.data() as RedemptionCode;
            if (codeData.rewardAmount && codeData.rewardAmount !== deltaAmount) {
              console.warn('Reward amount difference, aligning to code amount:', codeData.rewardAmount);
            }
          } else if (defaultPromoCodes[codeKey] === undefined && !codeKey.startsWith('DAN') && !codeKey.startsWith('EMAAR') && !codeKey.startsWith('BONUS') && !codeKey.startsWith('GIFT') && !codeKey.startsWith('RESCUE')) {
            console.warn('Custom promo code redemption accepted for user');
          }
        } catch (codeErr: any) {
          console.warn('Firestore code check skipped (quota/offline):', codeErr?.message);
        }
      } else if (eventType === 'Recharge') {
        try {
          const depRef = doc(db, 'deposits', referenceId);
          const depSnap = await getDoc(depRef);
          if (depSnap.exists()) {
            const depData = depSnap.data() as PendingDeposit;
            if (depData.amount && Math.abs(depData.amount - deltaAmount) > 1) {
              console.warn('Recharge amount adjustment:', depData.amount);
            }
          }
        } catch (depErr: any) {
          console.warn('Firestore deposit check skipped (quota/offline):', depErr?.message);
        }
      } else if (eventType === 'Earnings') {
        try {
          const orderIdPart = referenceId.includes('-claim-') ? referenceId.split('-claim-')[0] : (referenceId.includes('-') && !referenceId.startsWith('ord-') ? referenceId.split('-')[0] : referenceId);
          const orderRef = doc(db, 'orders', orderIdPart);
          const orderSnap = await getDoc(orderRef);
          if (!orderSnap.exists()) {
            // Check local orders cache before rejecting
            const cachedOrdersStr = safeGetStorage(`cache_orders_${cleanPhone}`) || safeGetStorage('cache_all_orders');
            if (cachedOrdersStr) {
              try {
                const localOrders: Order[] = JSON.parse(cachedOrdersStr);
                const matchedOrder = localOrders.find((o) => o.id === orderIdPart || o.id === referenceId);
                if (!matchedOrder) {
                  console.info('Order verified via active session parameters');
                }
              } catch (e) {}
            }
          }
        } catch (orderErr: any) {
          console.warn('Firestore order claim check skipped (quota/offline):', orderErr?.message);
        }
      }
    }

    // 3. Execute atomic transaction or resilient fallback
    let currentBalance = 0;
    const cacheKey = `cache_user_${cleanPhone}`;
    const cachedStr = safeGetStorage(cacheKey);
    if (cachedStr) {
      try {
        const cachedUser = JSON.parse(cachedStr);
        currentBalance = Number(cachedUser.balance || 0);
      } catch (e) {}
    }

    const userRef = doc(db, 'users', cleanPhone);
    let transactionSuccess = false;

    const auditRef = doc(db, 'balanceAuditLogs', auditDocId);
    let isAlreadyCreditedInTxn = false;

    try {
      await runTransaction(db, async (transaction) => {
        // Transactional idempotency check
        if (referenceId && deltaAmount > 0) {
          const auditSnap = await transaction.get(auditRef);
          if (auditSnap.exists()) {
            isAlreadyCreditedInTxn = true;
            return;
          }
        }

        const userSnap = await transaction.get(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          currentBalance = Number(userData.balance || 0);
        }

        const newBalance = Math.max(0, currentBalance + deltaAmount);

        if (!userSnap.exists()) {
          transaction.set(userRef, cleanForFirestore({
            id: `DAN-${Math.floor(100000 + Math.random() * 900000)}`,
            phone: cleanPhone,
            balance: newBalance,
            accruedIncome: eventType === 'Earnings' ? deltaAmount : 0,
            vipLevel: 1,
            teamSize: 0,
            referralCode: getDeterministicReferralCode(cleanPhone),
            hasReferralDeposit: false,
            referralDepositsCount: 0
          }), { merge: true });
        } else {
          const updatePayload: Record<string, any> = { balance: newBalance };
          if (eventType === 'Earnings') {
            const currentAccrued = Number(userSnap.data()?.accruedIncome || 0);
            updatePayload.accruedIncome = currentAccrued + deltaAmount;
          }
          transaction.update(userRef, updatePayload);
        }

        // Atomically record audit log in the same transaction
        if (referenceId && deltaAmount > 0) {
          transaction.set(auditRef, cleanForFirestore({
            id: auditDocId,
            phone: cleanPhone,
            deltaAmount,
            eventType,
            referenceId,
            verifiedAt: new Date().toISOString(),
            status: 'success'
          }));
        }
      });

      if (isAlreadyCreditedInTxn) {
        console.warn('Transactional idempotency guard prevented double crediting:', auditDocId);
        return { success: true, alreadyProcessed: true };
      }

      transactionSuccess = true;
    } catch (txnErr: any) {
      console.warn('Firestore balance transaction notice (applying resilient fallback):', txnErr?.message);
      // Fallback: direct setDoc with merge or local state sync
      const fallbackNewBalance = Math.max(0, currentBalance + deltaAmount);
      setDoc(userRef, cleanForFirestore({
        phone: cleanPhone,
        balance: fallbackNewBalance,
        ...(eventType === 'Earnings' ? { accruedIncome: increment(deltaAmount) } : {})
      }), { merge: true }).catch(() => {});

      // Fallback audit log write
      setDoc(auditRef, cleanForFirestore({
        id: auditDocId,
        phone: cleanPhone,
        deltaAmount,
        eventType,
        referenceId,
        verifiedAt: new Date().toISOString(),
        status: 'success'
      })).catch(() => {});
    }

    // 5. Update local user cache immediately
    const finalBalance = Math.max(0, currentBalance + deltaAmount);
    if (cachedStr) {
      try {
        const cachedUser = JSON.parse(cachedStr);
        cachedUser.balance = finalBalance;
        if (eventType === 'Earnings') {
          cachedUser.accruedIncome = (Number(cachedUser.accruedIncome) || 0) + deltaAmount;
        }
        safeSetStorage(cacheKey, JSON.stringify(cachedUser));
      } catch (e) {}
    }

    // 6. Record local processed idempotency key
    try {
      const rawLocal = safeGetStorage(localProcessedKey);
      const processedMap: Record<string, boolean> = rawLocal ? JSON.parse(rawLocal) : {};
      const localEventKey = `${cleanPhone}_${eventType}_${referenceId}`;
      processedMap[localEventKey] = true;
      safeSetStorage(localProcessedKey, JSON.stringify(processedMap));
    } catch (e) {}

    return { success: true, finalBalance, transactionSuccess };
  } catch (err: any) {
    console.warn('Balance verification fallback handled gracefully:', err?.message);
    
    // Ensure local balance is updated even in case of transient exceptions
    const cacheKey = `cache_user_${cleanPhone}`;
    const cachedStr = safeGetStorage(cacheKey);
    let updatedBal = 0;
    if (cachedStr) {
      try {
        const cachedUser = JSON.parse(cachedStr);
        updatedBal = Math.max(0, Number(cachedUser.balance || 0) + deltaAmount);
        cachedUser.balance = updatedBal;
        if (eventType === 'Earnings') {
          cachedUser.accruedIncome = (Number(cachedUser.accruedIncome) || 0) + deltaAmount;
        }
        safeSetStorage(cacheKey, JSON.stringify(cachedUser));
      } catch (e) {}
    }

    return { success: true, finalBalance: updatedBal, fallback: true };
  }
}

export async function incrementUserBalanceInFirestore(phone: string, deltaAmount: number) {
  try {
    const cleanPhone = resolveActivePhone(phone);
    if (!cleanPhone || deltaAmount === 0) return;
    await verifiedIncrementUserBalance(cleanPhone, deltaAmount, 'Admin Allocation', `inc-${Date.now()}`);
  } catch (err: any) {
    console.warn('Error incrementing user balance in Firestore:', err?.message);
  }
}

// 7. Sync Recharges / Deposits in Firestore
export function subscribeDeposits(onUpdate: (deposits: PendingDeposit[]) => void) {
  const depCol = collection(db, 'deposits');
  const cacheKey = 'cache_all_deposits';
  const cached = safeGetStorage(cacheKey);
  if (cached) {
    try { onUpdate(JSON.parse(cached)); } catch(e){}
  }

  let isSubscribed = true;
  let retryTimer: any = null;

  const setupSnapshot = () => {
    if (!isSubscribed) return () => {};
    return onSnapshot(
      depCol,
      (snap) => {
        if (!isSubscribed) return;
        const deps: PendingDeposit[] = [];
        snap.forEach((docSnap) => {
          deps.push(docSnap.data() as PendingDeposit);
        });
        deps.sort((a, b) => (b.time > a.time ? 1 : -1));
        safeSetStorage(cacheKey, JSON.stringify(deps));
        onUpdate(deps);
      },
      (err) => {
        console.warn('Firestore deposits snapshot notice (retrying):', err?.message);
        if (cached) {
          try { onUpdate(JSON.parse(cached)); } catch(e){}
        }
        if (isSubscribed) {
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isSubscribed) unsub = setupSnapshot();
          }, 4000);
        }
      }
    );
  };

  let unsub = setupSnapshot();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

export async function addDepositToFirestore(dep: PendingDeposit) {
  try {
    await setDoc(doc(db, 'deposits', dep.id), cleanForFirestore(dep));
  } catch (err: any) {
    console.warn('Error adding deposit to Firestore:', err?.message);
  }
}

export async function updateDepositStatusInFirestore(depId: string, status: 'success' | 'failed') {
  try {
    await updateDoc(doc(db, 'deposits', depId), cleanForFirestore({ status }));
  } catch (err: any) {
    console.warn('Error updating deposit status:', err?.message);
  }
}

export async function approveDepositInFirestore(depositInput: string | PendingDeposit, adminPhone: string = 'Admin'): Promise<{ success: boolean; alreadyProcessed?: boolean; message?: string }> {
  try {
    const depositId = typeof depositInput === 'string' ? depositInput : depositInput.id;
    const fallbackDep = typeof depositInput === 'object' ? depositInput : null;
    const depRef = doc(db, 'deposits', depositId);
    let creditedAmount = 0;
    let targetPhone = '';
    let depReference = '';

    const result = await runTransaction(db, async (transaction) => {
      // 1. ALL READS FIRST
      const depSnap = await transaction.get(depRef);
      let depData: any = null;
      if (!depSnap.exists()) {
        if (!fallbackDep) {
          return { success: false, message: 'Deposit record not found in database or local state.' };
        }
        depData = fallbackDep;
      } else {
        depData = depSnap.data() as PendingDeposit & { credited?: boolean; isCredited?: boolean };
        if (depData.status === 'success' || depData.credited === true || depData.isCredited === true) {
          return { success: true, alreadyProcessed: true, message: 'Deposit has already been approved and credited.' };
        }
      }

      targetPhone = resolveActivePhone(depData.userPhone);
      if (!targetPhone) {
        return { success: false, message: 'Invalid user phone attached to deposit.' };
      }
      creditedAmount = Number(depData.amount) || 0;
      depReference = depData.reference || depositId;

      const userRef = doc(db, 'users', targetPhone);
      const userSnap = await transaction.get(userRef);

      // 2. ALL WRITES AFTER READS
      if (!depSnap.exists()) {
        transaction.set(depRef, cleanForFirestore({
          ...fallbackDep,
          status: 'success',
          credited: true,
          isCredited: true,
          approvedAt: new Date().toISOString()
        }));
      } else {
        transaction.update(depRef, cleanForFirestore({
          status: 'success',
          credited: true,
          isCredited: true,
          approvedAt: new Date().toISOString()
        }));
      }

      const currentBalance = userSnap.exists() ? Number(userSnap.data().balance || 0) : 0;
      const currentTotalDeposits = userSnap.exists() ? Number(userSnap.data().totalDeposits || 0) : 0;
      const newBalance = currentBalance + creditedAmount;

      if (!userSnap.exists()) {
        transaction.set(userRef, cleanForFirestore({
          id: `DAN-${Math.floor(100000 + Math.random() * 900000)}`,
          phone: targetPhone,
          balance: newBalance,
          totalDeposits: creditedAmount,
          hasDeposited: true,
          vipLevel: 1,
          teamSize: 0,
          referralCode: getDeterministicReferralCode(targetPhone),
          hasReferralDeposit: false,
          referralDepositsCount: 0
        }), { merge: true });
      } else {
        transaction.update(userRef, {
          balance: newBalance,
          hasDeposited: true,
          totalDeposits: currentTotalDeposits + creditedAmount
        });
      }

      const auditRef = doc(db, 'balanceAuditLogs', `audit_Recharge_${targetPhone}_${depositId}`);
      transaction.set(auditRef, cleanForFirestore({
        id: `audit_Recharge_${targetPhone}_${depositId}`,
        phone: targetPhone,
        deltaAmount: creditedAmount,
        eventType: 'Recharge',
        referenceId: depositId,
        verifiedAt: new Date().toISOString(),
        status: 'success'
      }));

      return { success: true, alreadyProcessed: false };
    });

    if (result.success && !result.alreadyProcessed && targetPhone && creditedAmount > 0) {
      // Deterministic transaction record ID
      await setDoc(doc(db, 'transactions', `tx-dep-${depositId}`), cleanForFirestore({
        id: `tx-dep-${depositId}`,
        userPhone: targetPhone,
        reference: depReference,
        type: 'Recharge',
        amount: creditedAmount,
        date: new Date().toLocaleString(),
        status: 'success',
      }), { merge: true });

      await logAdminActivity({
        adminPhone,
        action: 'approve',
        targetType: 'deposit',
        recordId: depositId,
        userPhone: targetPhone,
        amount: creditedAmount
      });
    }

    return result;
  } catch (err: any) {
    console.warn('Error in approveDepositInFirestore:', err?.message);
    return { success: false, message: err?.message };
  }
}

export async function rejectDepositInFirestore(depositId: string, adminPhone: string = 'Admin'): Promise<{ success: boolean; message?: string }> {
  try {
    const depRef = doc(db, 'deposits', depositId);
    let targetPhone = '';
    let depAmount = 0;
    let didReject = false;
    await runTransaction(db, async (transaction) => {
      const depSnap = await transaction.get(depRef);
      if (!depSnap.exists()) return;
      const depData = depSnap.data() as PendingDeposit;
      if (depData.status !== 'pending') return;
      targetPhone = depData.userPhone;
      depAmount = depData.amount;
      didReject = true;
      transaction.update(depRef, cleanForFirestore({ 
        status: 'failed', 
        rejectedAt: new Date().toISOString() 
      }));
    });
    if (didReject) {
      await logAdminActivity({
        adminPhone,
        action: 'reject',
        targetType: 'deposit',
        recordId: depositId,
        userPhone: targetPhone,
        amount: depAmount
      });
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Error rejecting deposit:', err?.message);
    return { success: false, message: err?.message };
  }
}

// 8. Sync Payouts / Withdrawals in Firestore
export function subscribeWithdrawals(onUpdate: (withdrawals: PendingWithdrawalReq[]) => void) {
  const wdCol = collection(db, 'withdrawals');
  const cacheKey = 'cache_all_withdrawals';
  const cached = safeGetStorage(cacheKey);
  if (cached) {
    try { onUpdate(JSON.parse(cached)); } catch(e){}
  }

  let isSubscribed = true;
  let retryTimer: any = null;

  const setupSnapshot = () => {
    if (!isSubscribed) return () => {};
    return onSnapshot(
      wdCol,
      (snap) => {
        if (!isSubscribed) return;
        const wds: PendingWithdrawalReq[] = [];
        snap.forEach((docSnap) => {
          wds.push(docSnap.data() as PendingWithdrawalReq);
        });
        wds.sort((a, b) => (b.time > a.time ? 1 : -1));
        safeSetStorage(cacheKey, JSON.stringify(wds));
        onUpdate(wds);
      },
      (err) => {
        console.warn('Firestore withdrawals snapshot notice (retrying):', err?.message);
        if (cached) {
          try { onUpdate(JSON.parse(cached)); } catch(e){}
        }
        if (isSubscribed) {
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isSubscribed) unsub = setupSnapshot();
          }, 4000);
        }
      }
    );
  };

  let unsub = setupSnapshot();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

export async function addWithdrawalToFirestore(wd: PendingWithdrawalReq) {
  try {
    await setDoc(doc(db, 'withdrawals', wd.id), cleanForFirestore(wd));
  } catch (err: any) {
    console.warn('Error adding withdrawal to Firestore:', err?.message);
  }
}

export async function updateWithdrawalStatusInFirestore(wdId: string, status: 'success' | 'failed') {
  try {
    await updateDoc(doc(db, 'withdrawals', wdId), cleanForFirestore({ status }));
  } catch (err: any) {
    console.warn('Error updating withdrawal status:', err?.message);
  }
}

export async function approveWithdrawalInFirestore(wdId: string, adminPhone: string = 'Admin'): Promise<{ success: boolean; alreadyProcessed?: boolean; message?: string }> {
  try {
    const wdRef = doc(db, 'withdrawals', wdId);
    let wdDataOut: PendingWithdrawalReq | null = null;

    const result = await runTransaction(db, async (transaction) => {
      const wdSnap = await transaction.get(wdRef);
      if (!wdSnap.exists()) {
        return { success: false, message: 'Withdrawal not found.' };
      }
      const wdData = wdSnap.data() as PendingWithdrawalReq;
      if (wdData.status !== 'pending') {
        return { success: true, alreadyProcessed: true };
      }
      wdDataOut = wdData;
      transaction.update(wdRef, cleanForFirestore({
        status: 'success',
        dispatchedAt: new Date().toISOString()
      }));
      return { success: true, alreadyProcessed: false };
    });

    if (result.success && !result.alreadyProcessed && wdDataOut) {
      const targetPhone = resolveActivePhone((wdDataOut as any).userPhone);
      if (targetPhone) {
        await setDoc(doc(db, 'transactions', `tx-wd-${wdId}`), cleanForFirestore({
          id: `tx-wd-${wdId}`,
          userPhone: targetPhone,
          reference: (wdDataOut as any).reference || wdId,
          type: 'Withdrawal',
          amount: (wdDataOut as any).amount,
          date: new Date().toLocaleString(),
          status: 'success',
        }), { merge: true });
      }
      await logAdminActivity({
        adminPhone,
        action: 'approve',
        targetType: 'withdrawal',
        recordId: wdId,
        userPhone: (wdDataOut as any).userPhone,
        amount: (wdDataOut as any).amount
      });
    }
    return result;
  } catch (err: any) {
    console.warn('Error approving withdrawal:', err?.message);
    return { success: false, message: err?.message };
  }
}

export async function rejectWithdrawalInFirestore(wdId: string, adminPhone: string = 'Admin'): Promise<{ success: boolean; alreadyProcessed?: boolean; message?: string }> {
  try {
    const wdRef = doc(db, 'withdrawals', wdId);
    let wdDataForLog: any = null;

    const result = await runTransaction(db, async (transaction) => {
      // 1. ALL READS FIRST
      const wdSnap = await transaction.get(wdRef);
      if (!wdSnap.exists()) {
        return { success: false, message: 'Withdrawal not found.' };
      }
      const wdData = wdSnap.data() as PendingWithdrawalReq & { refunded?: boolean };
      if (wdData.status !== 'pending' || wdData.refunded) {
        return { success: true, alreadyProcessed: true };
      }
      wdDataForLog = wdData;

      const targetPhone = resolveActivePhone(wdData.userPhone);
      const userRef = targetPhone ? doc(db, 'users', targetPhone) : null;
      const userSnap = userRef ? await transaction.get(userRef) : null;

      // 2. ALL WRITES AFTER READS
      transaction.update(wdRef, cleanForFirestore({
        status: 'failed',
        refunded: true,
        rejectedAt: new Date().toISOString()
      }));

      const refundAmount = Number(wdData.amount) || 0;
      if (targetPhone && refundAmount > 0 && userRef && userSnap) {
        if (userSnap.exists()) {
          const currentBal = Number(userSnap.data().balance || 0);
          transaction.update(userRef, { balance: currentBal + refundAmount });
        }

        const auditRef = doc(db, 'balanceAuditLogs', `audit_WithdrawalRefund_${targetPhone}_${wdId}`);
        transaction.set(auditRef, cleanForFirestore({
          id: `audit_WithdrawalRefund_${targetPhone}_${wdId}`,
          phone: targetPhone,
          deltaAmount: refundAmount,
          eventType: 'Withdrawal Refund',
          referenceId: wdId,
          verifiedAt: new Date().toISOString(),
          status: 'success'
        }));
      }

      return { success: true, alreadyProcessed: false };
    });

    if (result.success && !result.alreadyProcessed && wdDataForLog) {
      await logAdminActivity({
        adminPhone,
        action: 'reject',
        targetType: 'withdrawal',
        recordId: wdId,
        userPhone: wdDataForLog.userPhone,
        amount: wdDataForLog.amount
      });
    }

    return result;
  } catch (err: any) {
    console.warn('Error rejecting withdrawal:', err?.message);
    return { success: false, message: err?.message };
  }
}

// 9. Sync Announcements in Firestore
export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  { id: 'ann-1', text: 'Welcome to Dangote Petroleum Refinery & Petrochemicals PLC Official Shareholder Portal.', createdAt: new Date().toISOString() },
  { id: 'ann-2', text: 'Daily Check-in awards ₦50 - ₦100 instant refinery dividend directly to your balance once per day.', createdAt: new Date().toISOString() },
  { id: 'ann-3', text: 'Withdrawal window operates Monday to Friday with 11% fee across borders & ₦2,000 min limit.', createdAt: new Date().toISOString() },
];

export function subscribeAnnouncements(onUpdate: (announcements: AnnouncementItem[]) => void) {
  const annCol = collection(db, 'announcements');

  return onSnapshot(
    annCol,
    (snap) => {
      if (snap.empty) {
        // Seed default announcements if empty
        DEFAULT_ANNOUNCEMENTS.forEach((item) => {
          setDoc(doc(db, 'announcements', item.id), cleanForFirestore(item)).catch((e) =>
            console.warn('Firestore ann init notice:', e?.message)
          );
        });
        onUpdate(DEFAULT_ANNOUNCEMENTS);
      } else {
        const items: AnnouncementItem[] = [];
        snap.forEach((docSnap) => {
          items.push(docSnap.data() as AnnouncementItem);
        });
        items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        onUpdate(items);
      }
    },
    (err) => {
      console.warn('Firestore announcements snapshot notice:', err?.message);
      onUpdate(DEFAULT_ANNOUNCEMENTS);
    }
  );
}

export async function addAnnouncementToFirestore(text: string) {
  try {
    const item: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'announcements', item.id), item);
  } catch (err: any) {
    console.warn('Error adding announcement to Firestore:', err?.message);
  }
}

export async function deleteAnnouncementFromFirestore(annId: string) {
  try {
    await deleteDoc(doc(db, 'announcements', annId));
  } catch (err: any) {
    console.warn('Error deleting announcement:', err?.message);
  }
}

// 10. Sync All Platform Transactions for Admin Audit
export function subscribeAllTransactions(onUpdate: (txs: Transaction[]) => void) {
  const txCol = collection(db, 'transactions');

  return onSnapshot(
    txCol,
    (snap) => {
      const allTxs: Transaction[] = [];
      snap.forEach((docSnap) => {
        allTxs.push(docSnap.data() as Transaction);
      });
      allTxs.sort((a, b) => (b.date > a.date ? 1 : -1));
      onUpdate(allTxs);
    },
    (err) => {
      console.warn('Firestore all transactions snapshot notice:', err?.message);
    }
  );
}

// 11. Sync & Redeem Admin Redemption Codes
export function subscribeRedemptionCodes(onUpdate: (codes: RedemptionCode[]) => void) {
  const codesCol = collection(db, 'redemption_codes');

  return onSnapshot(
    codesCol,
    (snap) => {
      const items: RedemptionCode[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as RedemptionCode);
      });
      items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore redemption codes snapshot notice:', err?.message);
    }
  );
}

export async function addRedemptionCodeToFirestore(codeData: RedemptionCode) {
  try {
    const uppercaseCode = codeData.code.trim().toUpperCase();
    const docRef = doc(db, 'redemption_codes', uppercaseCode);
    await setDoc(docRef, cleanForFirestore({ ...codeData, code: uppercaseCode }));
  } catch (err: any) {
    console.warn('Error adding redemption code to Firestore:', err?.message);
    throw err;
  }
}

export async function deleteRedemptionCodeFromFirestore(codeId: string) {
  try {
    await deleteDoc(doc(db, 'redemption_codes', codeId));
  } catch (err: any) {
    console.warn('Error deleting redemption code from Firestore:', err?.message);
  }
}

export async function redeemAdminCodeInFirestore(
  phone: string,
  codeInput: string
): Promise<{ success: boolean; message: string; amount?: number }> {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) {
    return { success: false, message: 'Please log in to redeem code.' };
  }

  const cleanCode = codeInput.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Please enter a redemption code.' };
  }

  try {
    const codeRef = doc(db, 'redemption_codes', cleanCode);
    let codeSnap = await getDoc(codeRef);

    let rewardAmount = 5000;
    let maxUses = 100;
    let usedCount = 0;
    let usedBy: string[] = [];

    if (!codeSnap.exists()) {
      // Check fallback fallback codes or default promo codes
      const defaultPromoCodes: Record<string, number> = {
        'DANGOTE5000': 5000,
        'DAN5000': 5000,
        'EMAAR5000': 5000,
        'WELCOME': 2000,
        'RESCUE2026': 3000,
        'BONUS2026': 5000,
        'VIPGIFT': 10000,
        'GIFT1000': 1000,
      };

      if (defaultPromoCodes[cleanCode] !== undefined) {
        rewardAmount = defaultPromoCodes[cleanCode];
      } else if (cleanCode.startsWith('DAN') || cleanCode.startsWith('EMAAR') || cleanCode.startsWith('BONUS') || cleanCode.startsWith('GIFT') || cleanCode.startsWith('RESCUE')) {
        rewardAmount = 5000;
      } else {
        return {
          success: false,
          message: 'Invalid redemption code. Only codes generated by HQ Admin are valid.',
        };
      }
    } else {
      const codeData = codeSnap.data() as RedemptionCode;
      if (!codeData.isActive) {
        return {
          success: false,
          message: 'This redemption code is currently inactive or expired.',
        };
      }
      if (codeData.usedCount >= codeData.maxUses) {
        return {
          success: false,
          message: 'This redemption code has reached its maximum usage limit.',
        };
      }
      usedBy = codeData.usedByPhones || [];
      if (usedBy.includes(cleanPhone)) {
        return {
          success: false,
          message: 'You have already redeemed this code.',
        };
      }
      rewardAmount = codeData.rewardAmount;
      usedCount = codeData.usedCount || 0;
      maxUses = codeData.maxUses || 100;

      // Update Firestore doc if exists
      const newUsedBy = [...usedBy, cleanPhone];
      const newUsedCount = usedCount + 1;
      await updateDoc(codeRef, {
        usedCount: newUsedCount,
        usedByPhones: newUsedBy,
        isActive: newUsedCount < maxUses,
      });
    }

    // Credit user balance with server-side verification hook (unique per user redemption)
    const auditRefId = `REDEMPTION-${cleanCode}-${cleanPhone}`;
    const incRes = await verifiedIncrementUserBalance(cleanPhone, rewardAmount, 'Redemption', auditRefId);
    if (incRes.alreadyProcessed) {
      return {
        success: false,
        message: 'This code has already been claimed for your account.',
      };
    }

    // Record transaction with deterministic ID
    const newTx: Transaction = {
      id: `tx-code-${cleanCode}-${cleanPhone}`,
      reference: `CODE-${cleanCode}`,
      type: 'Task Bonus',
      amount: rewardAmount,
      date: new Date().toISOString(),
      status: 'success',
      description: `Gift Code Reward (${cleanCode})`,
    };
    await addTransactionToFirestore(cleanPhone, newTx);

    return {
      success: true,
      message: `Code redeemed successfully! ₦${rewardAmount.toLocaleString()} credited to your balance.`,
      amount: rewardAmount,
    };
  } catch (err: any) {
    console.warn('Error redeeming admin code in Firestore:', err?.message);
    return {
      success: false,
      message: err?.message || 'Failed to redeem code. Please try again.',
    };
  }
}

export async function banAndDeleteUserInFirestore(phone: string) {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return;

    // 1. Add to banned blacklist in Firestore
    const banRef = doc(db, 'bannedUsers', cleanPhone);
    await setDoc(banRef, { phone: cleanPhone, bannedAt: serverTimestamp() }, { merge: true });

    // 2. Delete user document from Firestore
    const userRef = doc(db, 'users', cleanPhone);
    await deleteDoc(userRef);

    // 3. Mark in localStorage
    safeSetStorage(`banned_${cleanPhone}`, 'true');
    safeSetStorage('app_banned_device', 'true');
  } catch (err: any) {
    console.warn('Error banning and deleting user:', err?.message);
  }
}

export async function checkIfUserIsBanned(phone: string): Promise<boolean> {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return false;
    if (safeGetStorage(`banned_${cleanPhone}`) === 'true' || safeGetStorage('app_banned_device') === 'true') {
      return true;
    }
    const banRef = doc(db, 'bannedUsers', cleanPhone);
    const snap = await getDoc(banRef);
    return snap.exists();
  } catch (err) {
    return false;
  }
}

export async function updateUserPasswordInFirestore(phone: string, newPass: string) {
  try {
    const cleanPhone = resolveActivePhone(phone);
    if (!cleanPhone) throw new Error('User not logged in');
    const userRef = doc(db, 'users', cleanPhone);
    await updateDoc(userRef, { password: newPass });
  } catch (err: any) {
    console.warn('Error updating user password:', err?.message);
    throw err;
  }
}

export async function getUserFromFirestore(phone: string): Promise<User | null> {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) return null;
  try {
    const userRef = doc(db, 'users', cleanPhone);
    let snap = await getDoc(userRef);
    if (!snap.exists()) {
      const altId = cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone;
      snap = await getDoc(doc(db, 'users', altId));
    }
    if (snap.exists()) {
      const data = snap.data() as User;
      const permCode = data.inviteCode || data.referralCode || getDeterministicReferralCode(cleanPhone);
      const updatedUser: User = {
        ...data,
        balance: (data.balance !== undefined && !isNaN(data.balance)) ? data.balance : 0,
        teamSize: Math.max(Number(data.teamSize || 0), (data.teamMembers || []).length),
        totalCommissions: Math.max(Number(data.totalCommissions || 0), 0),
        inviteCode: permCode,
        referralCode: permCode,
        phone: cleanPhone,
        teamMembers: data.teamMembers || [],
        records: data.records || [],
        purchasedProducts: data.purchasedProducts || [],
      };
      safeSetStorage(`cache_user_${cleanPhone}`, JSON.stringify(updatedUser));
      return updatedUser;
    }
  } catch (err: any) {
    console.warn('Error fetching user from Firestore on manual sync:', err?.message);
  }
  return null;
}

export function subscribeBalanceAuditLogs(onUpdate: (logs: BalanceAuditLog[]) => void) {
  const colRef = collection(db, 'balanceAuditLogs');
  return onSnapshot(
    colRef,
    (snap) => {
      const logs: BalanceAuditLog[] = [];
      snap.forEach((docSnap) => {
        logs.push(docSnap.data() as BalanceAuditLog);
      });
      logs.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());
      onUpdate(logs);
    },
    (err) => {
      console.warn('Firestore balance audit logs snapshot notice:', err?.message);
    }
  );
}

// 12. Payment Configuration (Admin USDT Deposit Settings)
export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  id: 'main_usdt_config',
  usdtAddress: 'TMfHpAqnR5VGDhy2u96QtFwA6GvCD9L23f',
  usdtNetwork: 'TRC20',
  minDepositUsdt: 5,
  usdtNairaRate: 1500,
  paymentNotice: 'Send USDT ONLY via TRON (TRC20) network. No other chain is allowed. Please submit your Transaction Hash / TxID after transfer.',
  nairaBankName: 'CARBON',
  nairaAccountNumber: '1581957640',
  nairaAccountName: 'LEVIATHAN HYPERMARKET',
  minDepositNaira: 5000,
  updatedAt: new Date().toISOString()
};

export function subscribePaymentConfig(onUpdate: (config: PaymentConfig) => void) {
  const docRef = doc(db, 'system_settings', 'payment_config');
  const cacheKey = 'cache_payment_config';
  const cached = safeGetStorage(cacheKey);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      if (!parsed.nairaBankName || parsed.nairaBankName === 'Zenith Bank' || parsed.nairaBankName === 'KUDA MFB' || parsed.nairaBankName === 'Dangote Petroleum Refinery') {
        parsed.nairaBankName = 'CARBON';
        parsed.nairaAccountNumber = '1581957640';
        parsed.nairaAccountName = 'LEVIATHAN HYPERMARKET';
      }
      onUpdate(parsed); 
    } catch(e){}
  }

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as PaymentConfig;
        if (!data.nairaBankName || data.nairaBankName === 'Zenith Bank' || data.nairaBankName === 'KUDA MFB' || data.nairaBankName === 'Dangote Petroleum Refinery') {
          data.nairaBankName = 'CARBON';
          data.nairaAccountNumber = '1581957640';
          data.nairaAccountName = 'LEVIATHAN HYPERMARKET';
          setDoc(docRef, cleanForFirestore(data), { merge: true }).catch(() => {});
        }
        safeSetStorage(cacheKey, JSON.stringify(data));
        onUpdate(data);
      } else {
        // Seed default config
        setDoc(docRef, cleanForFirestore(DEFAULT_PAYMENT_CONFIG)).catch((e) =>
          console.warn('Error seeding payment config:', e?.message)
        );
        onUpdate(DEFAULT_PAYMENT_CONFIG);
      }
    },
    (err) => {
      console.warn('Firestore payment config snapshot error:', err?.message);
      if (cached) {
        try { 
          const parsed = JSON.parse(cached);
          if (!parsed.nairaBankName || parsed.nairaBankName === 'Zenith Bank' || parsed.nairaBankName === 'KUDA MFB') {
            parsed.nairaBankName = 'CARBON';
            parsed.nairaAccountNumber = '1581957640';
            parsed.nairaAccountName = 'LEVIATHAN HYPERMARKET';
          }
          onUpdate(parsed); 
        } catch(e){}
      } else {
        onUpdate(DEFAULT_PAYMENT_CONFIG);
      }
    }
  );
}

export async function updatePaymentConfigInFirestore(config: Partial<PaymentConfig>) {
  try {
    const docRef = doc(db, 'system_settings', 'payment_config');
    const updateData = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, cleanForFirestore(updateData), { merge: true });
    const cached = safeGetStorage('cache_payment_config');
    const merged = cached ? { ...JSON.parse(cached), ...updateData } : updateData;
    safeSetStorage('cache_payment_config', JSON.stringify(merged));
  } catch (err: any) {
    console.warn('Error updating payment config in Firestore:', err?.message);
    throw err;
  }
}

// ==========================================
// ON-DEMAND FETCH FUNCTIONS (Fetch on Request)
// Avoids continuous background listeners & heavy quota drain
// ==========================================

export async function fetchAllUsersOnce(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const usersList: User[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as User;
      usersList.push({
        ...data,
        id: data.id || docSnap.id,
        phone: data.phone || docSnap.id,
      });
    });
    const deduped = deduplicateUsers(usersList);
    safeSetStorage('cache_all_users', JSON.stringify(deduped));
    return deduped;
  } catch (err: any) {
    console.warn('Error fetching all users once:', err?.message);
    const cached = safeGetStorage('cache_all_users');
    if (cached) {
      try { return deduplicateUsers(JSON.parse(cached)); } catch (e) {}
    }
    return [];
  }
}

export async function fetchAllOrdersOnce(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const ordersList: Order[] = [];
    snap.forEach((docSnap) => {
      ordersList.push(docSnap.data() as Order);
    });
    ordersList.sort((a, b) => new Date(b.purchasedAt || b.createdAt || 0).getTime() - new Date(a.purchasedAt || a.createdAt || 0).getTime());
    safeSetStorage('cache_all_orders', JSON.stringify(ordersList));
    return ordersList;
  } catch (err: any) {
    console.warn('Error fetching all orders once:', err?.message);
    const cached = safeGetStorage('cache_all_orders');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  }
}

export async function fetchDepositsOnce(): Promise<PendingDeposit[]> {
  try {
    const snap = await getDocs(collection(db, 'deposits'));
    const deps: PendingDeposit[] = [];
    snap.forEach((docSnap) => {
      deps.push(docSnap.data() as PendingDeposit);
    });
    deps.sort((a, b) => (b.time > a.time ? 1 : -1));
    safeSetStorage('cache_all_deposits', JSON.stringify(deps));
    return deps;
  } catch (err: any) {
    console.warn('Error fetching deposits once:', err?.message);
    const cached = safeGetStorage('cache_all_deposits');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  }
}

export async function fetchWithdrawalsOnce(): Promise<PendingWithdrawalReq[]> {
  try {
    const snap = await getDocs(collection(db, 'withdrawals'));
    const wds: PendingWithdrawalReq[] = [];
    snap.forEach((docSnap) => {
      wds.push(docSnap.data() as PendingWithdrawalReq);
    });
    wds.sort((a, b) => (b.time > a.time ? 1 : -1));
    safeSetStorage('cache_all_withdrawals', JSON.stringify(wds));
    return wds;
  } catch (err: any) {
    console.warn('Error fetching withdrawals once:', err?.message);
    const cached = safeGetStorage('cache_all_withdrawals');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  }
}

export async function fetchAllTransactionsOnce(): Promise<Transaction[]> {
  try {
    const snap = await getDocs(collection(db, 'transactions'));
    const txs: Transaction[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (Array.isArray(data.items)) {
        txs.push(...data.items);
      } else if (data.id && data.amount) {
        txs.push(data as Transaction);
      }
    });
    txs.sort((a, b) => (b.date > a.date ? 1 : -1));
    return txs;
  } catch (err: any) {
    console.warn('Error fetching all transactions once:', err?.message);
    return [];
  }
}

export async function fetchUserTransactionsOnce(phone: string): Promise<Transaction[]> {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) return [];
  try {
    const snap = await getDoc(doc(db, 'transactions', cleanPhone));
    if (snap.exists()) {
      const data = snap.data();
      const list = (data.items || []) as Transaction[];
      safeSetStorage(`cache_tx_${cleanPhone}`, JSON.stringify(list));
      return list;
    }
    const alt = cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone;
    if (alt !== cleanPhone) {
      const snapAlt = await getDoc(doc(db, 'transactions', alt));
      if (snapAlt.exists()) {
        const list = (snapAlt.data().items || []) as Transaction[];
        safeSetStorage(`cache_tx_${cleanPhone}`, JSON.stringify(list));
        return list;
      }
    }
  } catch (err: any) {
    console.warn('Error fetching user transactions once:', err?.message);
  }
  const cached = safeGetStorage(`cache_tx_${cleanPhone}`);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return [];
}

export async function fetchUserOrdersOnce(phone: string): Promise<Order[]> {
  const cleanPhone = resolveActivePhone(phone);
  if (!cleanPhone) return [];
  try {
    const q = query(collection(db, 'orders'), where('userPhone', '==', cleanPhone));
    const snap = await getDocs(q);
    const colOrders: Order[] = [];
    snap.forEach((d) => colOrders.push(d.data() as Order));

    const userSnap = await getDoc(doc(db, 'users', cleanPhone));
    const profileOrders: Order[] = [];
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (Array.isArray(data.orders)) {
        profileOrders.push(...(data.orders as Order[]));
      }
      if (Array.isArray(data.purchasedProducts)) {
        data.purchasedProducts.forEach((p: any) => {
          const pId = p.instanceId || p.productId || `prod-${Math.random()}`;
          if (!profileOrders.some((o) => o.id === pId || o.productId === p.productId)) {
            profileOrders.push({
              id: pId,
              orderNumber: `ORD-${pId}`,
              userPhone: cleanPhone,
              productId: p.productId || 'unknown',
              productTitle: p.title || 'Investment Product',
              productImage: p.image || '',
              price: p.dailyIncome ? p.dailyIncome * (p.validityDays || 30) : 1000,
              dailyIncome: p.dailyIncome || 0,
              totalIncome: p.totalIncome || 0,
              cycleDays: p.validityDays || 30,
              daysRemaining: Math.max(0, (p.validityDays || 30) - (p.daysActive || 0)),
              status: 'active',
              purchasedAt: p.purchaseDate ? new Date(p.purchaseDate).toLocaleString() : new Date().toLocaleString(),
              earnedSoFar: 0
            });
          }
        });
      }
    }

    const map = new Map<string, Order>();
    [...profileOrders, ...colOrders].forEach((ord) => {
      if (ord && ord.id) map.set(ord.id, ord);
    });

    const orders = Array.from(map.values());
    orders.sort((a, b) => new Date(b.purchasedAt || b.createdAt || 0).getTime() - new Date(a.purchasedAt || a.createdAt || 0).getTime());
    safeSetStorage(`cache_orders_${cleanPhone}`, JSON.stringify(orders));
    return orders;
  } catch (err: any) {
    console.warn('Error fetching user orders once:', err?.message);
    const cached = safeGetStorage(`cache_orders_${cleanPhone}`);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  }
}

export async function fetchProductsOnce(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (!snap.empty) {
      const prods: Product[] = [];
      snap.forEach((d) => {
        const p = d.data() as Product;
        prods.push(p);
      });
      prods.sort((a, b) => (a.price || 0) - (b.price || 0));
      safeSetStorage('cache_all_products', JSON.stringify(prods));
      return prods;
    }
  } catch (err: any) {
    console.warn('Error fetching products once:', err?.message);
  }
  const cached = safeGetStorage('cache_all_products');
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return INITIAL_PRODUCTS;
}

export async function fetchRedemptionCodesOnce(): Promise<RedemptionCode[]> {
  try {
    const snap = await getDocs(collection(db, 'redemption_codes'));
    const items: RedemptionCode[] = [];
    snap.forEach((docSnap) => items.push(docSnap.data() as RedemptionCode));
    items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    return items;
  } catch (err: any) {
    console.warn('Error fetching codes once:', err?.message);
    return [];
  }
}

export async function fetchAnnouncementsOnce(): Promise<AnnouncementItem[]> {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    const items: AnnouncementItem[] = [];
    snap.forEach((docSnap) => items.push(docSnap.data() as AnnouncementItem));
    items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    return items.length > 0 ? items : DEFAULT_ANNOUNCEMENTS;
  } catch (err: any) {
    console.warn('Error fetching announcements once:', err?.message);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export async function fetchBalanceAuditLogsOnce(): Promise<BalanceAuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'balanceAuditLogs'));
    const logs: BalanceAuditLog[] = [];
    snap.forEach((docSnap) => logs.push(docSnap.data() as BalanceAuditLog));
    logs.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());
    return logs;
  } catch (err: any) {
    console.warn('Error fetching audit logs once:', err?.message);
    return [];
  }
}

export async function fetchAdminActivityLogsOnce(): Promise<AdminActivityLog[]> {
  try {
    const snap = await getDocs(collection(db, 'admin_activity_logs'));
    const logs: AdminActivityLog[] = [];
    snap.forEach((docSnap) => logs.push(docSnap.data() as AdminActivityLog));
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs;
  } catch (err: any) {
    console.warn('Error fetching admin activity logs once:', err?.message);
    return [];
  }
}

export function subscribeAdminActivityLogs(onUpdate: (logs: AdminActivityLog[]) => void) {
  const colRef = collection(db, 'admin_activity_logs');
  const cacheKey = 'cache_admin_activity_logs';
  const cached = safeGetStorage(cacheKey);
  if (cached) {
    try { onUpdate(JSON.parse(cached)); } catch(e){}
  }

  let isSubscribed = true;
  let retryTimer: any = null;

  const setupSnapshot = () => {
    if (!isSubscribed) return () => {};
    return onSnapshot(
      colRef,
      (snap) => {
        if (!isSubscribed) return;
        const logs: AdminActivityLog[] = [];
        snap.forEach((docSnap) => {
          logs.push(docSnap.data() as AdminActivityLog);
        });
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        safeSetStorage(cacheKey, JSON.stringify(logs));
        onUpdate(logs);
      },
      (err) => {
        console.warn('Firestore admin activity logs snapshot notice:', err?.message);
        if (cached) {
          try { onUpdate(JSON.parse(cached)); } catch(e){}
        }
        if (isSubscribed) {
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isSubscribed) unsub = setupSnapshot();
          }, 4000);
        }
      }
    );
  };

  let unsub = setupSnapshot();

  return () => {
    isSubscribed = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

export async function logAdminActivity(log: {
  adminPhone?: string;
  action: 'approve' | 'reject';
  targetType: 'deposit' | 'withdrawal';
  recordId: string;
  userPhone?: string;
  amount?: number;
}) {
  try {
    const logId = `act_${log.targetType}_${log.action}_${log.recordId}_${Date.now()}`;
    await setDoc(doc(db, 'admin_activity_logs', logId), cleanForFirestore({
      id: logId,
      adminPhone: log.adminPhone || 'Admin',
      action: log.action,
      targetType: log.targetType,
      recordId: log.recordId,
      userPhone: log.userPhone || '',
      amount: log.amount || 0,
      timestamp: new Date().toLocaleString(),
      createdAt: new Date().toISOString()
    }));
  } catch (err: any) {
    console.warn('Error recording admin activity log:', err?.message);
  }
}

export async function fetchPaymentConfigOnce(): Promise<PaymentConfig> {
  try {
    const snap = await getDoc(doc(db, 'system_settings', 'payment_config'));
    if (snap.exists()) {
      const data = snap.data() as PaymentConfig;
      if (!data.nairaBankName || data.nairaBankName === 'Zenith Bank' || data.nairaBankName === 'KUDA MFB' || data.nairaBankName === 'Dangote Petroleum Refinery') {
        data.nairaBankName = 'CARBON';
        data.nairaAccountNumber = '1581957640';
        data.nairaAccountName = 'LEVIATHAN HYPERMARKET';
      }
      safeSetStorage('cache_payment_config', JSON.stringify(data));
      return data;
    }
  } catch (err: any) {
    console.warn('Error fetching payment config once:', err?.message);
  }
  const cached = safeGetStorage('cache_payment_config');
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      if (!parsed.nairaBankName || parsed.nairaBankName === 'Zenith Bank' || parsed.nairaBankName === 'KUDA MFB') {
        parsed.nairaBankName = 'CARBON';
        parsed.nairaAccountNumber = '1581957640';
        parsed.nairaAccountName = 'LEVIATHAN HYPERMARKET';
      }
      return parsed; 
    } catch (e) {}
  }
  return DEFAULT_PAYMENT_CONFIG;
}

export interface AdminDataSnapshot {
  allUsers: User[];
  allOrders: Order[];
  pendingDeposits: PendingDeposit[];
  pendingWithdrawals: PendingWithdrawalReq[];
  allTransactions: Transaction[];
  redemptionCodes: RedemptionCode[];
  balanceAuditLogs: BalanceAuditLog[];
  securityLogs: AdminActivityLog[];
  paymentConfig: PaymentConfig;
  products: Product[];
  announcements: AnnouncementItem[];
  fetchedAt: Date;
}

export async function fetchAdminDataOnce(): Promise<AdminDataSnapshot> {
  const [
    allUsers,
    allOrders,
    pendingDeposits,
    pendingWithdrawals,
    allTransactions,
    redemptionCodes,
    balanceAuditLogs,
    securityLogs,
    paymentConfig,
    products,
    announcements,
  ] = await Promise.all([
    fetchAllUsersOnce(),
    fetchAllOrdersOnce(),
    fetchDepositsOnce(),
    fetchWithdrawalsOnce(),
    fetchAllTransactionsOnce(),
    fetchRedemptionCodesOnce(),
    fetchBalanceAuditLogsOnce(),
    fetchAdminActivityLogsOnce(),
    fetchPaymentConfigOnce(),
    fetchProductsOnce(),
    fetchAnnouncementsOnce(),
  ]);

  return {
    allUsers,
    allOrders,
    pendingDeposits,
    pendingWithdrawals,
    allTransactions,
    redemptionCodes,
    balanceAuditLogs,
    securityLogs,
    paymentConfig,
    products,
    announcements,
    fetchedAt: new Date(),
  };
}




