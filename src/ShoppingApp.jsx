import React, { useState, useMemo } from 'react';
import { ShoppingCart, Wallet, History as HistoryIcon, BarChart2, Plus, Trash2, CheckCircle, Circle, AlertTriangle, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- DATA & CONSTANTS ---
const CATEGORIES = {
  fruits_legumes: { id: 'fruits_legumes', label: 'Fruits & Légumes', emoji: '🥦', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  viande_poisson: { id: 'viande_poisson', label: 'Viande & Poisson', emoji: '🥩', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  produits_laitiers: { id: 'produits_laitiers', label: 'Produits Laitiers', emoji: '🧀', color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
  hygiene_beaute: { id: 'hygiene_beaute', label: 'Hygiène & Beauté', emoji: '🧴', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
  entretien: { id: 'entretien', label: 'Entretien', emoji: '🧹', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  boulangerie: { id: 'boulangerie', label: 'Boulangerie', emoji: '🍞', color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' },
  epicerie: { id: 'epicerie', label: 'Épicerie', emoji: '🥫', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  boissons: { id: 'boissons', label: 'Boissons', emoji: '🧃', color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
  autre: { id: 'autre', label: 'Autre', emoji: '❓', color: 'bg-zinc-800 text-zinc-300 border border-zinc-700' }
};

const CHART_COLORS = ['#a3e635', '#fbbf24', '#f87171', '#c084fc', '#60a5fa', '#fb923c', '#2dd4bf', '#a1a1aa'];

const DEMO_ITEMS = [
  { id: 1, name: 'Pommes Gala', category: 'fruits_legumes', quantity: 6, price: 0.5, checked: false },
  { id: 2, name: 'Poulet rôti', category: 'viande_poisson', quantity: 1, price: 8.5, checked: true },
  { id: 3, name: 'Lait demi-écrémé', category: 'produits_laitiers', quantity: 6, price: 1.1, checked: false },
  { id: 4, name: 'Baguette', category: 'boulangerie', quantity: 2, price: 1.2, checked: false },
];

const DEMO_HISTORY = [
  { id: 101, date: new Date(Date.now() - 2 * 86400000).toISOString(), total: 45.5, items: [{ name: 'Pommes', quantity: 1, price: 3.5, category: 'fruits_legumes' }, { name: 'Viande hachée', quantity: 2, price: 5, category: 'viande_poisson' }, { name: 'Shampooing', quantity: 1, price: 6, category: 'hygiene_beaute' }] },
  { id: 102, date: new Date(Date.now() - 8 * 86400000).toISOString(), total: 125.0, items: [{ name: 'Courses du mois', quantity: 1, price: 125.0, category: 'epicerie' }] },
  { id: 103, date: new Date(Date.now() - 15 * 86400000).toISOString(), total: 85.2, items: [] },
  { id: 104, date: new Date(Date.now() - 22 * 86400000).toISOString(), total: 55.0, items: [] },
  { id: 105, date: new Date(Date.now() - 30 * 86400000).toISOString(), total: 95.8, items: [] },
];

const ShoppingListItem = ({ item, toggleItem, deleteItem, updateItem, categories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [offsetX, setOffsetX] = useState(0);

  const [editName, setEditName] = useState(item.name);
  const [editQty, setEditQty] = useState(item.quantity);
  const [editPrice, setEditPrice] = useState(item.price);

  const touchStartRef = React.useRef(0);
  const longPressTimerRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);

  const triggerDelete = (skipConfirm) => {
    if (skipConfirm || window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
      setIsDeleting(true);
      setTimeout(() => {
        deleteItem(item.id, true);
      }, 300);
    }
  };
  
  const handlePointerDown = (clientX) => {
    touchStartRef.current = clientX;
    isDraggingRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setIsEditing(true);
        if (window.navigator?.vibrate) navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePointerMove = (clientX) => {
    const diff = clientX - touchStartRef.current;
    if (Math.abs(diff) > 10) {
      isDraggingRef.current = true;
      clearTimeout(longPressTimerRef.current);
    }
    if (diff < 0 && !isEditing && isDraggingRef.current) {
      setOffsetX(diff);
    }
  };

  const handlePointerUp = () => {
    clearTimeout(longPressTimerRef.current);
    if (!isEditing && offsetX < 0) {
      if (offsetX < -80) {
        setOffsetX(-window.innerWidth); // Animate all the way out instantly
        triggerDelete(true);
      } else {
        setOffsetX(0);
      }
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateItem(item.id, { name: editName, quantity: Number(editQty), price: Number(editPrice) });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSaveEdit} className="bg-zinc-900 border-2 border-lime-400 p-4 shadow-[4px_4px_0px_0px_#a3e635] flex flex-col gap-3 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <label className="text-[10px] font-black text-lime-400 uppercase tracking-widest block">Mode Édition</label>
        <input 
          autoFocus className="bg-zinc-950 border border-zinc-700 focus:border-lime-400 text-zinc-50 p-3 font-bold uppercase tracking-wider text-sm outline-none" 
          value={editName} onChange={e=>setEditName(e.target.value)} 
        />
        <div className="flex gap-2">
           <input type="number" min="1" className="w-1/3 bg-zinc-950 border border-zinc-700 p-3 text-zinc-50 text-center font-bold" value={editQty} onChange={e=>setEditQty(e.target.value)} />
           <input type="number" min="0" step="0.01" className="w-2/3 bg-zinc-950 border border-zinc-700 p-3 text-zinc-50 text-center font-bold" value={editPrice} onChange={e=>setEditPrice(e.target.value)} />
        </div>
        <div className="flex gap-2 mt-2">
          <button type="submit" className="flex-1 bg-lime-400 text-zinc-950 font-black uppercase tracking-widest p-3">Valider</button>
          <button type="button" onClick={()=>setIsEditing(false)} className="bg-zinc-800 text-zinc-300 font-black uppercase p-3 px-5 hover:bg-zinc-700">X</button>
        </div>
      </form>
    );
  }

  return (
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isDeleting ? 'max-h-0 opacity-0 -translate-x-full mb-0' : 'max-h-[200px] opacity-100 translate-x-0'}`}>
      <div className="relative overflow-hidden group border border-zinc-800 bg-red-500">
        <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end px-4 text-white font-black tracking-widest text-xs uppercase z-0">
          <Trash2 size={24} strokeWidth={2.5} />
        </div>
        <div 
          className={`relative z-10 flex items-center p-4 transition-transform duration-200 ease-out cursor-pointer ${item.checked ? 'bg-zinc-950/90' : 'bg-zinc-900'} ${offsetX === 0 && 'hover:bg-zinc-800/50'}`}
          style={{ transform: `translateX(${offsetX}px)` }}
          onTouchStart={e => handlePointerDown(e.touches[0].clientX)}
          onTouchMove={e => handlePointerMove(e.touches[0].clientX)}
          onTouchEnd={handlePointerUp}
          onMouseDown={e => handlePointerDown(e.clientX)}
          onMouseMove={e => { if (e.buttons === 1) handlePointerMove(e.clientX); }}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
        >
          <div className="flex items-center gap-4 flex-1" onClick={() => offsetX === 0 && toggleItem(item.id)}>
            {item.checked ? <CheckCircle className="text-lime-400 flex-shrink-0" size={22} strokeWidth={2.5}/> : <Circle className="text-zinc-600 flex-shrink-0" size={22} />}
            <div className={`flex-1 transition-all ${item.checked ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              <p className="font-bold text-[15px] tracking-wide uppercase">{item.name}</p>
              <p className="text-[11px] mt-1 text-zinc-500 font-bold tracking-widest uppercase">
                {item.quantity} UNITÉS <span className="text-lime-400/50 mx-1">/</span> {(item.price || 0).toFixed(2)}€
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 pl-4 border-l border-zinc-800 ml-2">
            <span className={`font-black tracking-tighter ${item.checked ? 'text-zinc-600' : 'text-zinc-50'}`}>{((item.price || 0) * item.quantity).toFixed(2)}€</span>
            <button onClick={() => triggerDelete(false)} className="text-zinc-600 hover:text-red-400 p-2 transition-colors"><Trash2 size={18} strokeWidth={2.5} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
export default function ShoppingApp() {
  const [activeTab, setActiveTab] = useState('list');
  const [items, setItems] = useState(DEMO_ITEMS);
  const [budget, setBudget] = useState(100);
  const [history, setHistory] = useState(DEMO_HISTORY);

  // States for adding item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState('autre');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Stats selection
  const [statPeriod, setStatPeriod] = useState('month');

  // --- ACTIONS : LIST & BUDGET ---
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const item = {
      id: Date.now(),
      name: newItemName.trim(),
      category: newItemCat,
      quantity: Number(newItemQty) || 1,
      price: Number(newItemPrice) || 0,
      checked: false
    };
    setItems([item, ...items]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQty(1);
    setNewItemCat('autre');
    setShowAddForm(false);
  };

  const toggleItem = (id) => {
    setItems(items.map(it => it.id === id ? { ...it, checked: !it.checked } : it));
  };

  const updateItem = (id, updatedFields) => {
    setItems(items.map(it => it.id === id ? { ...it, ...updatedFields } : it));
  };

  const deleteItem = (id, skipConfirm = false) => {
    if (skipConfirm || window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
      setItems(items.filter(it => it.id !== id));
    }
  };

  const validateShopping = () => {
    if (items.length === 0) return;
    const total = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const session = {
      id: Date.now(),
      date: new Date().toISOString(),
      total,
      items: [...items]
    };
    setHistory([session, ...history]);
    setItems([]);
    setActiveTab('history');
  };

  // --- DERIVED DATA ---
  const totalList = useMemo(() => items.reduce((acc, it) => acc + (it.price * it.quantity), 0), [items]);
  const totalChecked = useMemo(() => items.filter(it => it.checked).reduce((acc, it) => acc + (it.price * it.quantity), 0), [items]);
  const budgetPercent = budget > 0 ? (totalList / budget) * 100 : 0;

  const groupedItems = useMemo(() => {
    const groups = {};
    items.forEach(it => {
      if (!groups[it.category]) groups[it.category] = { category: CATEGORIES[it.category] || CATEGORIES.autre, items: [] };
      groups[it.category].items.push(it);
    });
    return Object.values(groups).sort((a, b) => b.items.length - a.items.length);
  }, [items]);

  const groupedHistory = useMemo(() => {
    const g = {};
    history.forEach(h => {
      const d = new Date(h.date);
      const key = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (!g[key]) g[key] = [];
      g[key].push(h);
    });
    return g;
  }, [history]);

  const totalDepense = useMemo(() => history.reduce((acc, h) => acc + h.total, 0), [history]);
  const depenseMoy = useMemo(() => history.length > 0 ? totalDepense / history.length : 0, [history, totalDepense]);

  // --- RENDERS ---
  const renderList = () => (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header List */}
      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-none border-l-4 border-lime-400 border-t border-r border-b border-zinc-800">
        <div>
          <h2 className="font-bold text-xl text-zinc-50 tracking-tight uppercase">Ma Liste</h2>
          <p className="text-sm text-zinc-400 mb-0 font-medium">{items.length} ITEM(S)</p>
        </div>
        <div className="bg-lime-400/10 text-lime-400 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest border border-lime-400/20">
          En cours
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="bg-zinc-900 p-5 rounded-none border border-zinc-800 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <input
            type="text" autoFocus placeholder="NOUVEL ARTICLE..."
            className="w-full p-4 rounded-none bg-zinc-950 border border-zinc-800 focus:border-lime-400 text-zinc-50 placeholder-zinc-600 transition-all outline-none uppercase text-sm font-bold tracking-wider"
            value={newItemName} onChange={e => setNewItemName(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number" min="1" placeholder="QTÉ"
              className="w-full p-4 rounded-none bg-zinc-950 border border-zinc-800 focus:border-lime-400 text-zinc-50 placeholder-zinc-600 text-center outline-none font-bold"
              value={newItemQty} onChange={e => setNewItemQty(e.target.value)}
            />
            <input
              type="number" min="0" step="0.01" placeholder="PRIX U. (€)"
              className="col-span-2 w-full p-4 rounded-none bg-zinc-950 border border-zinc-800 focus:border-lime-400 text-zinc-50 placeholder-zinc-600 outline-none font-bold"
              value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)}
            />
          </div>
          <select
            className="w-full p-4 rounded-none bg-zinc-950 border border-zinc-800 focus:border-lime-400 text-zinc-50 outline-none cursor-pointer font-bold text-sm tracking-wide uppercase"
            value={newItemCat} onChange={e => setNewItemCat(e.target.value)}
          >
            {Object.values(CATEGORIES).map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
          <button type="submit" className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black tracking-widest uppercase p-4 rounded-none transition-colors border-2 border-lime-400 hover:border-lime-500">
            Enregistrer
          </button>
        </form>
      )}

      {/* Items Grouped */}
      {groupedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
          <ShoppingCart size={48} className="mb-4 opacity-50 text-zinc-500" />
          <p className="font-bold tracking-widest uppercase text-sm">Base de données vide</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedItems.map(group => (
            <div key={group.category.id} className="space-y-3 animate-in fade-in">
              <h3 className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 w-max rounded-none border ${group.category.color}`}>
                {group.category.emoji} {group.category.label}
              </h3>
              <div className="space-y-2">
                {group.items.map(item => (
                  <ShoppingListItem 
                    key={item.id} 
                    item={item} 
                    toggleItem={toggleItem} 
                    deleteItem={deleteItem} 
                    updateItem={updateItem} 
                    categories={CATEGORIES} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Validation moved directly inside the scrollable list */}
      {renderFooterValidation()}
    </div>
  );

  const renderFooterValidation = () => {
    if (activeTab !== 'list' || items.length === 0) return null;
    return (
      <div className="bg-zinc-900 p-5 mt-8 border-2 border-zinc-800 rounded-none relative">
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Acquis : <span className="text-lime-400">{totalChecked.toFixed(2)}€</span></p>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Projection : {totalList.toFixed(2)}€</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Net</p>
            <span className="text-3xl font-black text-zinc-50 tracking-tighter">{totalList.toFixed(2)}<span className="text-lime-400 ml-1">€</span></span>
          </div>
        </div>
        <button onClick={validateShopping} className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 p-4 rounded-none font-black tracking-widest uppercase flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
          <CheckCircle size={20} /> Valider la session
        </button>
      </div>
    );
  };

  const renderBudget = () => {
    let barColor = 'bg-lime-400';
    let alertColor = '';
    if (budgetPercent > 100) { barColor = 'bg-red-500'; alertColor = 'text-red-400 border-red-500/30 bg-red-500/10'; }
    else if (budgetPercent > 90) { barColor = 'bg-orange-500'; alertColor = 'text-orange-400 border-orange-500/30 bg-orange-500/10'; }
    else if (budgetPercent > 70) { barColor = 'bg-yellow-400'; alertColor = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'; }

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-zinc-900 p-8 rounded-none border border-zinc-800 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
            <div className="h-full bg-lime-400 w-1/3"></div>
          </div>

          <div className="w-20 h-20 rounded-none flex items-center justify-center mx-auto mb-6 border border-zinc-800 bg-zinc-950">
            <Wallet className="h-8 w-8 text-lime-400" strokeWidth={1.5} />
          </div>

          <h2 className="font-black text-2xl text-zinc-50 mb-2 uppercase tracking-tight">Budget Alloué</h2>
          <p className="text-zinc-500 text-xs mb-8 font-bold uppercase tracking-widest">Limite opérationnelle</p>

          <div className="flex items-center justify-center gap-2 mb-12">
            <input
              type="number" min="1" value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="text-5xl font-black text-center w-36 border-b-4 border-zinc-800 focus:border-lime-400 hover:border-zinc-700 outline-none pb-2 bg-transparent transition-colors text-zinc-50"
            />
            <span className="text-4xl font-black text-lime-400 mb-2">€</span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Consommé</span>
                <p className="font-black text-2xl text-zinc-50">{totalList.toFixed(2)}<span className="text-lime-400 ml-1">€</span></p>
              </div>
              <span className={`font-black text-2xl ${budgetPercent > 100 ? 'text-red-500' : 'text-lime-400'}`}>
                {budgetPercent.toFixed(0)}%
              </span>
            </div>

            <div className="h-2 w-full bg-zinc-950 rounded-none overflow-hidden border border-zinc-800">
              <div className={`h-full transition-all duration-700 ease-out ${barColor}`} style={{ width: `${Math.min(budgetPercent, 100)}%` }}></div>
            </div>
          </div>

          {budgetPercent >= 90 && (
            <div className={`flex items-start text-left gap-3 p-4 rounded-none border-l-4 font-bold text-xs uppercase tracking-wider animate-in slide-in-from-bottom-2 ${alertColor}`}>
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
              {budgetPercent > 100
                ? `Budget dépassé de ${(totalList - budget).toFixed(2)}€`
                : "Seuil critique atteint."}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const deleteHistory = (id) => {
      if (window.confirm('Supprimer cet enregistrement ?')) setHistory(history.filter(h => h.id !== id));
    };

    return (
      <div className="space-y-8 animate-in fade-in">
        <h2 className="font-black text-2xl text-zinc-50 px-2 uppercase tracking-tight">Archives</h2>

        {Object.keys(groupedHistory).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <HistoryIcon size={48} className="mb-4 opacity-50 text-zinc-500" />
            <p className="font-bold tracking-widest uppercase text-sm">Aucune archive</p>
          </div>
        ) : (
          Object.keys(groupedHistory).map(monthKey => (
            <div key={monthKey} className="space-y-4">
              <h3 className="text-[10px] font-black tracking-widest text-lime-400 uppercase px-2 border-b-2 border-zinc-800 pb-2">
                {monthKey}
              </h3>
              <div className="space-y-3">
                {groupedHistory[monthKey].map(session => {
                  const date = new Date(session.date);
                  return (
                    <details key={session.id} className="group bg-zinc-900 rounded-none border border-zinc-800 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex justify-between items-center p-5 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                        <div>
                          <p className="font-bold text-zinc-100 text-[14px] uppercase tracking-wide">
                            {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-lime-400/50 mx-2">/</span>
                            {session.items?.length || 0} ITEM(S)
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-lg text-zinc-50 tracking-tighter">{session.total.toFixed(2)}€</span>
                          <button onClick={(e) => { e.preventDefault(); deleteHistory(session.id); }} className="text-zinc-600 hover:text-red-400 p-2 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </summary>

                      {session.items && session.items.length > 0 && (
                        <div className="bg-zinc-950 px-5 py-4 border-t border-zinc-800 space-y-3">
                          {session.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <div className="flex items-center gap-3 text-zinc-300">
                                <span className="text-[10px] font-black text-lime-400">{it.quantity}X</span>
                                <span className="font-bold text-sm tracking-wide">{it.name}</span>
                              </div>
                              <span className="text-zinc-500 font-bold text-sm">{((it.price || 0) * it.quantity).toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderStats = () => {
    const chartData = [
      { name: '1', total: 45 }, { name: '5', total: 10 }, { name: '10', total: 120 },
      { name: '15', total: 30 }, { name: '20', total: 85 }, { name: '25', total: 55 }, { name: '30', total: 95 }
    ];

    const pieData = [
      { name: 'FRUITS', value: 30 },
      { name: 'VIANDE', value: 45 },
      { name: 'LAITIER', value: 15 },
      { name: 'ÉPICERIE', value: 10 },
    ];

    return (
      <div className="space-y-6 animate-in fade-in pb-10">
        <h2 className="font-black text-2xl text-zinc-50 px-2 mb-2 uppercase tracking-tight">Métriques</h2>

        {/* Tabs Period */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1">
          {['Jour', 'Semaine', 'Mois'].map(p => {
            const mappedVal = p === 'Jour' ? 'day' : p === 'Semaine' ? 'week' : 'month';
            return (
              <button key={p} onClick={() => setStatPeriod(mappedVal)} className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black transition-all ${statPeriod === mappedVal ? 'bg-lime-400 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {p}
              </button>
            )
          })}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 p-5 border border-zinc-800 border-l-4 border-l-lime-400">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total</p>
            <p className="text-3xl font-black text-zinc-50 tracking-tighter">{totalDepense.toFixed(2)}<span className="text-lg text-lime-400">€</span></p>
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 border-l-4 border-l-zinc-700">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Moyenne</p>
            <p className="text-3xl font-black text-zinc-50 tracking-tighter">{depenseMoy.toFixed(2)}<span className="text-lg text-lime-400">€</span></p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-zinc-900 p-5 border border-zinc-800">
          <h3 className="font-black text-xs text-zinc-50 mb-8 uppercase tracking-widest flex items-center gap-2">
            <BarChart2 className="text-lime-400" size={16} />
            Volume ({statPeriod === 'month' ? 'Mensuel' : statPeriod === 'week' ? 'Hebdo' : 'Journalier'})
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900 }} dy={10} />
                <RechartsTooltip cursor={{ fill: '#18181b' }} contentStyle={{ backgroundColor: '#09090b', borderRadius: '0px', border: '1px solid #3f3f46', fontWeight: 'bold', color: '#fff' }} itemStyle={{ color: '#a3e635' }} />
                <Bar dataKey="total" fill="#a3e635" radius={[0, 0, 0, 0]} maxBarSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#a3e635' : '#3f3f46'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-zinc-900 p-5 border border-zinc-800">
          <h3 className="font-black text-xs text-zinc-50 mb-6 uppercase tracking-widest">Distribution</h3>
          <div className="h-56 flex flex-col items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#09090b', borderRadius: '0px', border: '1px solid #3f3f46', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center">
              <span className="block text-2xl font-black text-lime-400">{pieData[0].value}%</span>
              <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest">{pieData[0].name}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  <span className="w-2 h-2 rounded-none" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-zinc-950 flex justify-center font-sans tracking-tight text-zinc-50 selection:bg-lime-400/30 overflow-hidden">
      <div className="w-full max-w-[480px] bg-zinc-950 h-full relative flex flex-col border-x border-zinc-900 overflow-hidden">

        {/* Header Global */}
        <header className="bg-zinc-950 p-6 sticky top-0 z-20 border-b-2 border-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-lime-400 flex items-center justify-center">
                <ShoppingCart className="text-zinc-950" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-zinc-50 uppercase tracking-tighter leading-none">ShopList<span className="text-lime-400">.</span></h1>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">SYS ONLINE - {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
              </div>
            </div>

            <div className="border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 bg-lime-400"></span>
              </span>
              <span className="text-[9px] font-black text-lime-400 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </header>

        {/* Content Flow */}
        <main className="flex-1 p-4 overflow-y-auto w-full custom-scrollbar">
          {activeTab === 'list' && renderList()}
          {activeTab === 'budget' && renderBudget()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'stats' && renderStats()}
        </main>

        {/* Bottom Bar Navigation */}
        <nav className="bg-zinc-950 border-t-2 border-zinc-900 px-4 py-3 pb-8 flex justify-between items-center z-30">
          {[
            { id: 'list', icon: ShoppingCart, label: 'Liste' },
            { id: 'budget', icon: Wallet, label: 'Budget' },
            { id: 'add', icon: Plus, label: 'Add', isSpecial: true },
            { id: 'history', icon: HistoryIcon, label: 'Histo' },
            { id: 'stats', icon: BarChart2, label: 'Stats' },
          ].map(tab => {
            if (tab.isSpecial) {
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab('list');
                    setShowAddForm(!showAddForm);
                  }}
                  className={`relative -top-6 text-zinc-950 p-4 shadow-lg transition-all active:scale-95 duration-200 border-2 ${showAddForm ? 'bg-red-500 border-red-500 rotate-90 shadow-red-500/20' : 'bg-lime-400 border-lime-400 hover:bg-lime-300 shadow-lime-400/10'}`}
                >
                  {showAddForm ? <X size={28} strokeWidth={3} /> : <Plus size={28} strokeWidth={3} />}
                </button>
              )
            }

            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'list') setShowAddForm(false);
                }}
                className={`relative flex flex-col items-center gap-1.5 transition-colors duration-200 ${isActive ? 'text-lime-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-2 w-1 h-1 bg-lime-400 rounded-none"></span>
                )}
              </button>
            )
          })}
        </nav>

      </div>
    </div>
  );
}
