import React, { useState } from 'react';
import { ActiveScreen, User, Product, Order, Transaction, PendingDeposit, PendingWithdrawalReq, AnnouncementItem, RedemptionCode, BalanceAuditLog, AdminActivityLog, PaymentConfig } from '../types';
import { AdminSidebar, AdminTab } from './admin/AdminSidebar';
import { AdminHeader } from './admin/AdminHeader';
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminDepositsTab } from './admin/AdminDepositsTab';
import { AdminWithdrawalsTab } from './admin/AdminWithdrawalsTab';
import { AdminOrdersTab } from './admin/AdminOrdersTab';
import { AdminProductsTab } from './admin/AdminProductsTab';
import { AdminCodesTab } from './admin/AdminCodesTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';
import { AdminAuditTab } from './admin/AdminAuditTab';
import { AdminSecurityLogsTab } from './admin/AdminSecurityLogsTab';
import { QuickCreditModal, RejectWithdrawalModal } from './admin/AdminModals';

interface AdminPanelScreenProps {
  user: User;
  onUpdateUser: (updater: (prev: User) => User) => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransactionStatus: (txId: string, status: 'success' | 'failed') => void;
  onNavigate: (screen: ActiveScreen) => void;
  
  // Payment Config Prop
  paymentConfig?: PaymentConfig;
  onUpdatePaymentConfig?: (config: Partial<PaymentConfig>) => void;
  
  // Real Firestore Admin Props
  allUsers: User[];
  allOrders?: Order[];
  pendingDeposits: PendingDeposit[];
  pendingWithdrawals: PendingWithdrawalReq[];
  announcements: AnnouncementItem[];
  allTransactions: Transaction[];
  redemptionCodes?: RedemptionCode[];
  onAddRedemptionCode?: (code: RedemptionCode) => void;
  onDeleteRedemptionCode?: (codeId: string) => void;
  onApproveDeposit: (dep: PendingDeposit) => void;
  onRejectDeposit: (depId: string) => void;
  onApproveWithdrawal: (wd: PendingWithdrawalReq) => void;
  onRejectWithdrawal: (wd: PendingWithdrawalReq) => void;
  onCreditUser: (userPhone: string, amount: number) => void;
  onSetUserVip: (userPhone: string, vipLevel: number) => void;
  onAddAnnouncement: (text: string) => void;
  onDeleteAnnouncement: (id: string) => void;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder?: (orderId: string) => void;
  onUpdateUserBank?: (phone: string, bank: { bankName: string; accountNumber: string; accountName: string }) => void;
  onToggleUserBan?: (phone: string, isBanned: boolean) => void;
  onToggleUserFreeze?: (phone: string, isFrozen: boolean) => void;
  onBanAndDeleteUser?: (phone: string) => void;
  onAllocateProduct?: (userPhone: string, product: Product, quantity: number) => void;
  onUpdateUserTeam?: (phone: string, teamSize: number, referralDepositsCount: number, referredBy: string, totalCommissions: number, referralCount: number, newPhone: string, teamTotalInvestment: number, referralDepositAmount: number, referralCode: string) => void;
  onUpdateUserPhone?: (oldPhone: string, newPhone: string) => void;
  onAddDownlineUser?: (referrerPhone: string, referrerCode: string, newDownlinePhone: string, registrationAmount: number) => void;
  onUpdateUserReferredBy?: (userPhone: string, newReferredBy: string) => void;
  onUpdateUserInvestmentAmount?: (userPhone: string, amount: number) => void;
  balanceAuditLogs?: BalanceAuditLog[];
  securityLogs?: AdminActivityLog[];
  onFetchAdminData?: () => void;
  isFetchingAdminData?: boolean;
  lastFetchedAt?: Date | null;
}

export function AdminPanelScreen({
  user,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onNavigate,
  allUsers = [],
  allOrders = [],
  pendingDeposits = [],
  pendingWithdrawals = [],
  announcements = [],
  allTransactions = [],
  redemptionCodes = [],
  balanceAuditLogs = [],
  securityLogs = [],
  onAddRedemptionCode,
  onDeleteRedemptionCode,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onCreditUser,
  onSetUserVip,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onUpdateOrder,
  onDeleteOrder,
  onUpdateUserBank,
  onToggleUserBan,
  onToggleUserFreeze,
  onBanAndDeleteUser,
  onAllocateProduct,
  onUpdateUserTeam,
  paymentConfig,
  onUpdatePaymentConfig,
  onAddDownlineUser,
  onFetchAdminData,
  isFetchingAdminData = false,
  lastFetchedAt,
}: AdminPanelScreenProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedUserPhone, setSelectedUserPhone] = useState<string>(allUsers[0]?.phone || user.phone || '');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Modals
  const [showQuickCreditModal, setShowQuickCreditModal] = useState(false);
  const [rejectWdTarget, setRejectWdTarget] = useState<PendingWithdrawalReq | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [processingDepIds, setProcessingDepIds] = useState<string[]>([]);
  const [processingWdIds, setProcessingWdIds] = useState<string[]>([]);

  const triggerStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleApproveDep = async (dep: PendingDeposit) => {
    if (processingDepIds.includes(dep.id)) return;
    setProcessingDepIds((prev) => [...prev, dep.id]);
    try {
      await onApproveDeposit(dep);
      triggerStatus(`Deposit of ₦${dep.amount.toLocaleString()} approved for ${dep.userPhone}!`);
    } finally {
      setTimeout(() => {
        onFetchAdminData?.();
        setProcessingDepIds((prev) => prev.filter((id) => id !== dep.id));
      }, 600);
    }
  };

  const handleRejectDep = async (depId: string) => {
    if (processingDepIds.includes(depId)) return;
    setProcessingDepIds((prev) => [...prev, depId]);
    try {
      await onRejectDeposit(depId);
      triggerStatus('Deposit request rejected.');
    } finally {
      setTimeout(() => {
        onFetchAdminData?.();
        setProcessingDepIds((prev) => prev.filter((id) => id !== depId));
      }, 600);
    }
  };

  const handleApproveWd = async (wd: PendingWithdrawalReq) => {
    if (processingWdIds.includes(wd.id)) return;
    setProcessingWdIds((prev) => [...prev, wd.id]);
    try {
      await onApproveWithdrawal(wd);
      const netPayout = Math.floor(wd.amount * 0.89);
      triggerStatus(`Payout of ₦${netPayout.toLocaleString()} dispatched to ${wd.userPhone}!`);
    } finally {
      setTimeout(() => {
        onFetchAdminData?.();
        setProcessingWdIds((prev) => prev.filter((id) => id !== wd.id));
      }, 600);
    }
  };

  const handleConfirmRejectWd = async (wd: PendingWithdrawalReq, reason: string) => {
    if (processingWdIds.includes(wd.id)) return;
    setProcessingWdIds((prev) => [...prev, wd.id]);
    try {
      await onRejectWithdrawal(wd);
      setRejectWdTarget(null);
      triggerStatus(`Withdrawal for ${wd.userPhone} rejected (${reason}). ₦${wd.amount.toLocaleString()} refunded.`);
    } finally {
      setTimeout(() => {
        onFetchAdminData?.();
        setProcessingWdIds((prev) => prev.filter((id) => id !== wd.id));
      }, 600);
    }
  };

  const pendingDepositsCount = pendingDeposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawalsCount = pendingWithdrawals.filter(w => w.status === 'pending').length;

  return (
    <div className="min-h-screen w-full bg-[#040817] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      {/* Desktop Master Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:sticky top-0 z-40 h-screen`}>
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          pendingDepositsCount={pendingDepositsCount}
          pendingWithdrawalsCount={pendingWithdrawalsCount}
          totalUsersCount={allUsers.length}
          onNavigate={onNavigate}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          activeTab={activeTab}
          user={user}
          onOpenQuickCredit={() => setShowQuickCreditModal(true)}
          onOpenAddProduct={() => setActiveTab('products')}
          onOpenGenCode={() => setActiveTab('codes')}
          onOpenBroadcast={() => setActiveTab('announcements')}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          statusMessage={statusMessage}
          usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
          onFetchData={onFetchAdminData}
          isFetching={isFetchingAdminData}
          lastFetchedAt={lastFetchedAt}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              allUsers={allUsers}
              allOrders={allOrders}
              pendingDeposits={pendingDeposits}
              pendingWithdrawals={pendingWithdrawals}
              allTransactions={allTransactions}
              onApproveDeposit={handleApproveDep}
              onRejectDeposit={handleRejectDep}
              onApproveWithdrawal={handleApproveWd}
              onOpenRejectWdModal={setRejectWdTarget}
              onSelectTab={setActiveTab}
              usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              onRefresh={onFetchAdminData}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              allUsers={allUsers}
              allOrders={allOrders}
              allTransactions={allTransactions}
              pendingDeposits={pendingDeposits}
              pendingWithdrawals={pendingWithdrawals}
              products={products}
              selectedUserPhone={selectedUserPhone}
              onSelectUserPhone={setSelectedUserPhone}
              onCreditUser={onCreditUser}
              onSetUserVip={onSetUserVip}
              onToggleUserBan={onToggleUserBan}
              onToggleUserFreeze={onToggleUserFreeze}
              onBanAndDeleteUser={onBanAndDeleteUser}
              onUpdateUserBank={onUpdateUserBank}
              onUpdateUserTeam={onUpdateUserTeam}
              onAddDownlineUser={onAddDownlineUser}
              onAllocateProduct={onAllocateProduct}
              usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              onRefresh={onFetchAdminData}
            />
          )}

          {activeTab === 'deposits' && (
            <AdminDepositsTab
              pendingDeposits={pendingDeposits}
              onApproveDeposit={handleApproveDep}
              onRejectDeposit={handleRejectDep}
              usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              onRefresh={onFetchAdminData}
            />
          )}

          {activeTab === 'withdrawals' && (
            <AdminWithdrawalsTab
              pendingWithdrawals={pendingWithdrawals}
              onApproveWithdrawal={handleApproveWd}
              onOpenRejectModal={setRejectWdTarget}
              usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              onRefresh={onFetchAdminData}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersTab
              allOrders={allOrders}
              onUpdateOrder={onUpdateOrder}
              onDeleteOrder={onDeleteOrder}
              usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              onRefresh={onFetchAdminData}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              onAddProduct={onAddProduct}
              onUpdateProduct={onUpdateProduct}
              onDeleteProduct={onDeleteProduct}
              usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
            />
          )}

          {activeTab === 'codes' && (
            <AdminCodesTab
              redemptionCodes={redemptionCodes}
              onAddCode={onAddRedemptionCode}
              onDeleteCode={onDeleteRedemptionCode}
              usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              onRefresh={onFetchAdminData}
            />
          )}

          {activeTab === 'announcements' && (
            <AdminSettingsTab
              paymentConfig={paymentConfig}
              onUpdatePaymentConfig={onUpdatePaymentConfig}
              announcements={announcements}
              onAddAnnouncement={onAddAnnouncement}
              onDeleteAnnouncement={onDeleteAnnouncement}
            />
          )}

          {activeTab === 'usdt_settings' && (
            <AdminSettingsTab
              paymentConfig={paymentConfig}
              onUpdatePaymentConfig={onUpdatePaymentConfig}
              announcements={announcements}
              onAddAnnouncement={onAddAnnouncement}
              onDeleteAnnouncement={onDeleteAnnouncement}
            />
          )}

          {activeTab === 'balance_audit' && (
            <AdminAuditTab
              balanceAuditLogs={balanceAuditLogs}
              onRefresh={onFetchAdminData}
            />
          )}

          {activeTab === 'security_logs' && (
            <AdminSecurityLogsTab
              securityLogs={securityLogs}
              onRefresh={onFetchAdminData}
            />
          )}
        </main>
      </div>

      {/* Global Admin Modals */}
      <QuickCreditModal
        isOpen={showQuickCreditModal}
        onClose={() => setShowQuickCreditModal(false)}
        allUsers={allUsers}
        onCreditUser={onCreditUser}
      />

      <RejectWithdrawalModal
        target={rejectWdTarget}
        onClose={() => setRejectWdTarget(null)}
        onConfirmReject={handleConfirmRejectWd}
      />
    </div>
  );
}
