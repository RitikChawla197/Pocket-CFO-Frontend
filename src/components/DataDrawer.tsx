import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Wallet } from 'lucide-react';
import type { FinancialItem } from '../types/financial';
import { formatINR } from '../utils/formatters';

interface DataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sectionType: 'income' | 'expenses' | 'assets' | 'liabilities';
  categories: string[];
  items: FinancialItem[];
  onSave: (updatedItems: FinancialItem[]) => void;
}

export const DataDrawer: React.FC<DataDrawerProps> = ({
  isOpen,
  onClose,
  title,
  sectionType,
  categories,
  items,
  onSave,
}) => {
  const [draftItems, setDraftItems] = useState<FinancialItem[]>([]);

  useEffect(() => {
    setDraftItems(JSON.parse(JSON.stringify(items)));
  }, [items, isOpen]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof FinancialItem, value: any) => {
    const next = [...draftItems];
    next[index] = { ...next[index], [field]: value };
    setDraftItems(next);
  };

  const handleAddRow = () => {
    const newItem: FinancialItem = {
      id: `${sectionType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      label: `New ${sectionType.slice(0, -1)}`,
      category: categories[0] || 'Other',
      amount: 0,
    };
    setDraftItems([...draftItems, newItem]);
  };

  const handleDeleteRow = (index: number) => {
    const next = draftItems.filter((_, i) => i !== index);
    setDraftItems(next);
  };

  const runningTotal = draftItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSave = () => {
    const sanitized = draftItems.map(item => ({
      ...item,
      amount: Math.max(0, Number(item.amount) || 0),
    }));
    onSave(sanitized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E2E4DC] animate-in slide-in-from-right duration-300"
        data-testid={`drawer-${sectionType}`}
      >
        <div className="p-6 border-b border-[#E2E4DC] flex items-center justify-between bg-[#F7F7F4]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1A3B2B] text-white rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-[#1C2826]">{title}</h2>
              <p className="text-xs text-stone-500 font-body">Add, edit or remove your {sectionType} entries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200/60 rounded-full text-stone-500 transition-colors"
            data-testid={`close-drawer-${sectionType}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {draftItems.length === 0 ? (
            <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
              <p className="text-sm font-medium">No items added yet.</p>
              <button
                onClick={handleAddRow}
                className="mt-3 px-4 py-2 bg-[#1A3B2B] text-white text-xs font-semibold rounded-lg hover:bg-[#2A5440] transition-all"
              >
                + Add First Item
              </button>
            </div>
          ) : (
            draftItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-[#F7F7F4] rounded-xl border border-[#E2E4DC] hover:border-stone-300 transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Description</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                    placeholder="Item name"
                    className="w-full text-sm font-medium bg-white px-3 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:border-[#1A3B2B]"
                    data-testid={`input-label-${sectionType}-${idx}`}
                  />
                </div>

                <div className="w-full sm:w-40 space-y-1">
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Category</label>
                  <select
                    value={item.category}
                    onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                    className="w-full text-xs font-medium bg-white px-2.5 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#1A3B2B]"
                    data-testid={`select-category-${sectionType}-${idx}`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-36 space-y-1">
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                    placeholder="0"
                    className="w-full text-sm font-mono-num font-semibold bg-white px-3 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:border-[#1A3B2B]"
                    data-testid={`input-amount-${sectionType}-${idx}`}
                  />
                </div>

                <button
                  onClick={() => handleDeleteRow(idx)}
                  className="self-end sm:self-center p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete row"
                  data-testid={`delete-row-${sectionType}-${idx}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          <button
            onClick={handleAddRow}
            className="w-full py-3 border-2 border-dashed border-[#7E998A]/40 text-[#1A3B2B] hover:bg-[#E8EBE4]/50 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            data-testid={`add-row-${sectionType}`}
          >
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>

        <div className="p-6 border-t border-[#E2E4DC] bg-[#F7F7F4] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">Running Total</span>
            <span className="text-xl font-bold font-mono-num text-[#1A3B2B]">{formatINR(runningTotal)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              data-testid={`cancel-drawer-${sectionType}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#1A3B2B] hover:bg-[#2A5440] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              data-testid={`save-drawer-${sectionType}`}
            >
              <Save className="w-4 h-4" /> Save {title.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
