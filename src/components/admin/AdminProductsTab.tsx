import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2, CheckCircle2, DollarSign, Calendar, Clock } from 'lucide-react';
import { Product } from '../../types';

interface AdminProductsTabProps {
  products: Product[];
  onAddProduct: (prod: Product) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (prodId: string) => void;
  usdNairaRate?: number;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  usdNairaRate = 1500
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Public IPO' | 'Petrochemical' | 'VIP Institutional'>('Public IPO');
  const [price, setPrice] = useState('20000');
  const [dailyIncome, setDailyIncome] = useState('1800');
  const [cycleDays, setCycleDays] = useState('60');
  const [quota, setQuota] = useState('5');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');

  const openAdd = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Public IPO');
    setPrice('20000');
    setDailyIncome('1800');
    setCycleDays('60');
    setQuota('5');
    setImageUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
    setShowModal(true);
  };

  const openEdit = (prod: Product) => {
    setEditingId(prod.id);
    setTitle(prod.title);
    setCategory(prod.category as any);
    setPrice(prod.price.toString());
    setDailyIncome(prod.dailyIncome.toString());
    setCycleDays(prod.cycleDays.toString());
    setQuota(prod.quota.toString());
    setImageUrl(prod.imageUrl);
    setShowModal(true);
  };

  const handleSave = () => {
    const pVal = parseFloat(price) || 0;
    const dVal = parseFloat(dailyIncome) || 0;
    const cVal = parseInt(cycleDays) || 1;
    const qVal = parseInt(quota) || 1;

    const prodData: Product = {
      id: editingId || `prod-${Date.now()}`,
      title: title || 'Dangote Equity Tranche',
      category: category as any,
      price: pVal,
      dailyIncome: dVal,
      totalIncome: dVal * cVal,
      cycleDays: cVal,
      quota: qVal,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      countdown: { hours: 24, minutes: 0, seconds: 0 }
    };

    if (editingId) {
      onUpdateProduct(prodData);
    } else {
      onAddProduct(prodData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-[#07132e]/90 border border-blue-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <span>Active Asset Catalog ({products.length} Items)</span>
          </h3>
          <p className="text-[11px] text-slate-400">Manage pricing, daily yields, and investment contracts.</p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Share</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...products].sort((a, b) => (a.price || 0) - (b.price || 0)).map((prod, idx) => (
          <div
            key={prod.id}
            className="bg-[#07132e]/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition group"
          >
            <div>
              {/* Image Banner */}
              <div className="h-40 relative overflow-hidden bg-slate-950">
                <img
                  src={prod.imageUrl}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07132e] via-transparent to-black/40"></div>
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white font-black text-[10px] uppercase">
                    {prod.category}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-900/90 text-amber-300 font-bold text-[10px]">
                    #{idx + 1}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-base font-black text-white drop-shadow-md">{prod.title}</h4>
                </div>
              </div>

              {/* Specs */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Subscription Price:</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    ₦{prod.price.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Daily Yield</span>
                    <span className="font-mono font-bold text-amber-300">₦{prod.dailyIncome.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Cycle Duration</span>
                    <span className="font-mono font-bold text-white">{prod.cycleDays} Days</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Total Return: <b className="text-emerald-300">₦{prod.totalIncome.toLocaleString()}</b></span>
                  <span>Quota: <b className="text-white">{prod.quota} Max</b></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-end gap-2">
              <button
                onClick={() => openEdit(prod)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete product ${prod.title}?`)) onDeleteProduct(prod.id);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span>{editingId ? 'Edit Share Tranche' : 'Create New Share Tranche'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dangote Petrochemical Phase 2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Price (₦)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Daily Yield (₦)</label>
                <input
                  type="number"
                  value={dailyIncome}
                  onChange={(e) => setDailyIncome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Cycle Days</label>
                <input
                  type="number"
                  value={cycleDays}
                  onChange={(e) => setCycleDays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Purchase Quota</label>
                <input
                  type="number"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
