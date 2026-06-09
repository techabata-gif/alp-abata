"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { formatRupiah } from "@/lib/utils";
import { Calculator, AlertCircle, CheckCircle2, Package, SearchX, Plus, Trash2, Minus, Download, FileSpreadsheet, FileText, RotateCcw, Cloud, CloudOff, Loader2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type Campaign = {
  id: string;
  title: string;
  collectedAmount: number;
  isQuantity: boolean;
  quantityPrice: number | null;
  categoryId: string | null;
  category: string;
};

type CustomPackage = {
  id: string;
  title: string;
  quantityPrice: number;
};

type Program = {
  id: string;
  title: string;
  categories: Category[];
  campaigns: Campaign[];
};

type Props = {
  programs: Program[];
  initialState?: any;
};

export function BuyingPowerClient({ programs, initialState }: Props) {
  const isValidInitialProgram = initialState?.selectedProgramId && programs.find(p => p.id === initialState.selectedProgramId);
  const defaultProgramId = isValidInitialProgram ? initialState.selectedProgramId : (programs[0]?.id || "");

  const [selectedProgramId, setSelectedProgramId] = useState<string>(defaultProgramId);
  const [activePackages, setActivePackages] = useState<Record<string, boolean>>(initialState?.activePackages || {});
  const [quantities, setQuantities] = useState<Record<string, number>>(initialState?.quantities || {});
  const [customPackagesByProgram, setCustomPackagesByProgram] = useState<Record<string, CustomPackage[]>>(initialState?.customPackagesByProgram || {});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  
  const isFirstLoad = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    setSyncStatus('syncing');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/buying-power/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedProgramId,
            activePackages,
            quantities,
            customPackagesByProgram
          })
        });
        if (res.ok) {
          setSyncStatus('saved');
          setTimeout(() => setSyncStatus('idle'), 2000);
        } else {
          setSyncStatus('error');
        }
      } catch (e) {
        setSyncStatus('error');
      }
    }, 1500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [selectedProgramId, activePackages, quantities, customPackagesByProgram]);

  const customPackages = useMemo(() => {
    if (!selectedProgramId) return [];
    return customPackagesByProgram[selectedProgramId] || [];
  }, [customPackagesByProgram, selectedProgramId]);

  const selectedProgram = useMemo(() => {
    return programs.find(p => p.id === selectedProgramId);
  }, [programs, selectedProgramId]);

  // Calculate Buying Power (Total Collected Amount of the Program)
  const buyingPower = useMemo(() => {
    if (!selectedProgram) return 0;
    return selectedProgram.campaigns.reduce((sum, camp) => sum + camp.collectedAmount, 0);
  }, [selectedProgram]);

  // Filter campaigns that can be purchased (isQuantity true and has price)
  const purchasableCampaigns = useMemo(() => {
    if (!selectedProgram) return [];
    return selectedProgram.campaigns.filter(c => c.isQuantity && c.quantityPrice && c.quantityPrice > 0);
  }, [selectedProgram]);

  // Removed state-mutating initialization. Using sparse dictionary with defaults (isActive ?? true, qty ?? 0) instead.

  // Group by category
  const groupedCampaigns = useMemo(() => {
    const groups: Record<string, Array<Campaign | CustomPackage>> = {};
    if (!selectedProgram) return groups;

    const categoryMap = new Map<string, string>();
    selectedProgram.categories.forEach(c => categoryMap.set(c.id, c.name));

    purchasableCampaigns.forEach(camp => {
      const catName = camp.categoryId && categoryMap.has(camp.categoryId) 
        ? categoryMap.get(camp.categoryId)! 
        : (camp.category || "Tanpa Kategori");
        
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(camp);
    });

    if (customPackages.length > 0) {
      groups["Paket Kustom Manual"] = [...customPackages];
    }

    return groups;
  }, [selectedProgram, purchasableCampaigns, customPackages]);

  // Calculate total investment
  const totalInvestment = useMemo(() => {
    let sum = 0;
    purchasableCampaigns.forEach(camp => {
      const isActive = activePackages[camp.id] ?? true;
      if (isActive) {
        const qty = quantities[camp.id] ?? 0;
        sum += qty * (camp.quantityPrice || 0);
      }
    });
    customPackages.forEach(camp => {
      const isActive = activePackages[camp.id] ?? true;
      if (isActive) {
        const qty = quantities[camp.id] ?? 0;
        sum += qty * camp.quantityPrice;
      }
    });
    return sum;
  }, [purchasableCampaigns, customPackages, activePackages, quantities]);

  const remainingBalance = buyingPower - totalInvestment;
  const isSufficient = remainingBalance >= 0;

  const selectedItemsSummary = useMemo(() => {
    const items: Array<{ title: string; qty: number; subtotal: number; price: number }> = [];
    purchasableCampaigns.forEach(c => {
      const isActive = activePackages[c.id] ?? true;
      const qty = quantities[c.id] ?? 0;
      if (isActive && qty > 0) {
        items.push({ title: c.title, qty, subtotal: qty * (c.quantityPrice || 0), price: c.quantityPrice || 0 });
      }
    });
    customPackages.forEach(c => {
      const isActive = activePackages[c.id] ?? true;
      const qty = quantities[c.id] ?? 0;
      if (isActive && qty > 0) {
        items.push({ title: c.title || "Paket Kustom", qty, subtotal: qty * c.quantityPrice, price: c.quantityPrice });
      }
    });
    return items;
  }, [purchasableCampaigns, customPackages, activePackages, quantities]);

  function handleToggle(campaignId: string) {
    setActivePackages(prev => ({ ...prev, [campaignId]: !prev[campaignId] }));
  }

  function handleQuantityChange(campaignId: string, value: number) {
    if (value < 0) value = 0;
    setQuantities(prev => ({ ...prev, [campaignId]: value }));
  }

  function handleAddCustomPackage() {
    if (!selectedProgramId) return;
    const newId = `custom-${Date.now()}`;
    setCustomPackagesByProgram(prev => ({
      ...prev,
      [selectedProgramId]: [
        ...(prev[selectedProgramId] || []),
        { id: newId, title: "Nama Paket Manual", quantityPrice: 1000000 }
      ]
    }));
    setActivePackages(prev => ({ ...prev, [newId]: true }));
    setQuantities(prev => ({ ...prev, [newId]: 0 }));
  }

  function handleUpdateCustomPackage(id: string, field: keyof CustomPackage, value: string | number) {
    if (!selectedProgramId) return;
    setCustomPackagesByProgram(prev => ({
      ...prev,
      [selectedProgramId]: (prev[selectedProgramId] || []).map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  }

  function handleRemoveCustomPackage(id: string) {
    if (!selectedProgramId) return;
    setCustomPackagesByProgram(prev => ({
      ...prev,
      [selectedProgramId]: (prev[selectedProgramId] || []).filter(p => p.id !== id)
    }));
  }

  async function handleResetAll() {
    if (!confirm("Apakah Anda yakin ingin mereset SELURUH data simulasi ke setelan awal? Data yang dihapus tidak dapat dikembalikan.")) return;
    setActivePackages({});
    setQuantities({});
    setCustomPackagesByProgram({});
    
    try {
      await fetch("/api/admin/buying-power/state", { method: "DELETE" });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (e) {
      console.error("Gagal mereset data di awan", e);
    }
  }

  function getExportDataGrouped() {
    if (!selectedProgram) return { groups: [], totalQty: 0, totalInvest: 0 };
    
    let totalQty = 0;
    let totalInvest = 0;
    const groups: Array<{
      categoryName: string;
      categoryQty: number;
      categoryInvest: number;
      items: Array<{
        title: string;
        price: number;
        qty: number;
        subtotal: number;
      }>;
    }> = [];

    Object.entries(groupedCampaigns).forEach(([categoryName, items]) => {
      let catQty = 0;
      let catInvest = 0;
      const catItems: any[] = [];
      
      items.forEach(camp => {
        const isActive = activePackages[camp.id] ?? true;
        if (isActive) {
          const qty = quantities[camp.id] ?? 0;
          if (qty > 0) {
            const price = 'categoryId' in camp ? camp.quantityPrice || 0 : camp.quantityPrice;
            const subtotal = qty * price;
            catQty += qty;
            catInvest += subtotal;
            
            catItems.push({
              title: camp.title || 'Paket Kustom',
              price,
              qty,
              subtotal
            });
          }
        }
      });

      if (catItems.length > 0) {
        groups.push({
          categoryName,
          categoryQty: catQty,
          categoryInvest: catInvest,
          items: catItems
        });
        totalQty += catQty;
        totalInvest += catInvest;
      }
    });

    return { groups, totalQty, totalInvest };
  }

  function getExportTimestamp() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  }

  async function handleExportExcel() {
    if (!selectedProgram) return;
    const XLSX = await import('xlsx');
    const { groups, totalQty, totalInvest } = getExportDataGrouped();
    if (groups.length === 0) return alert("Belum ada paket yang dipilih untuk diexport.");

    const flatData: any[] = [];

    groups.forEach(group => {
      // Add a header row for the category
      flatData.push({
        "Kategori": group.categoryName,
        "Nama Paket": "TOTAL " + group.categoryName.toUpperCase(),
        "Harga Satuan (Rp)": "",
        "Kuantitas": group.categoryQty,
        "Subtotal (Rp)": group.categoryInvest
      });
      // Add items
      group.items.forEach(item => {
        flatData.push({
          "Kategori": "", // empty to visually nest
          "Nama Paket": "  - " + item.title,
          "Harga Satuan (Rp)": item.price,
          "Kuantitas": item.qty,
          "Subtotal (Rp)": item.subtotal
        });
      });
      // Add empty row
      flatData.push({});
    });

    // Add Grand Totals
    flatData.push({
      "Kategori": "",
      "Nama Paket": "TOTAL KESELURUHAN",
      "Harga Satuan (Rp)": "",
      "Kuantitas": totalQty,
      "Subtotal (Rp)": totalInvest
    });
    flatData.push({
      "Kategori": "",
      "Nama Paket": "SISA BUYING POWER",
      "Harga Satuan (Rp)": "",
      "Kuantitas": "",
      "Subtotal (Rp)": remainingBalance
    });

    const ws = XLSX.utils.json_to_sheet([]);
    
    // Add title and timestamp at top
    XLSX.utils.sheet_add_aoa(ws, [
      [`Simulasi Buying Power - ${selectedProgram.title}`],
      [`Waktu Export: ${getExportTimestamp()}`],
      []
    ], { origin: "A1" });

    // Add JSON data starting from row 4
    XLSX.utils.sheet_add_json(ws, flatData, { origin: "A4", skipHeader: false });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Simulasi");
    
    XLSX.writeFile(wb, `BuyingPower_${selectedProgram.title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`);
  }

  async function handleExportPDF() {
    if (!selectedProgram) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { groups, totalQty, totalInvest } = getExportDataGrouped();
    if (groups.length === 0) return alert("Belum ada paket yang dipilih untuk diexport.");

    const doc = new jsPDF();
    const timestamp = getExportTimestamp();

    // Title
    doc.setFontSize(16);
    doc.text(`Simulasi Buying Power`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Program: ${selectedProgram.title}`, 14, 28);
    doc.setFontSize(10);
    doc.text(`Waktu Export: ${timestamp}`, 14, 34);

    const tableColumn = ["Kategori", "Nama Paket", "Harga Satuan", "Qty", "Subtotal"];
    const tableRows: any[] = [];
    const headerRowIndices: number[] = [];

    groups.forEach(group => {
      headerRowIndices.push(tableRows.length); // save index of the header row for styling
      tableRows.push([
        group.categoryName, 
        `TOTAL ${group.categoryName.toUpperCase()}`, 
        "", 
        group.categoryQty.toString(), 
        formatRupiah(group.categoryInvest)
      ]);

      group.items.forEach(item => {
        tableRows.push([
          "", 
          `  • ${item.title}`, 
          formatRupiah(item.price), 
          item.qty.toString(), 
          formatRupiah(item.subtotal)
        ]);
      });
    });

    const grandTotalIndex1 = tableRows.length;
    tableRows.push(["", "TOTAL KESELURUHAN", "", totalQty.toString(), formatRupiah(totalInvest)]);
    const grandTotalIndex2 = tableRows.length;
    tableRows.push(["", "SISA BUYING POWER", "", "", formatRupiah(remainingBalance)]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 46] },
      alternateRowStyles: { fillColor: [255, 255, 255] }, // Turn off alternate row colors to avoid weird grouping visuals
      didParseCell: function (data: any) {
        // If it's a category header row
        if (data.section === 'body' && headerRowIndices.includes(data.row.index)) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 245, 243]; // light mint/gray
        }
        // If it's the grand total rows
        if (data.section === 'body' && (data.row.index === grandTotalIndex1 || data.row.index === grandTotalIndex2)) {
          data.cell.styles.fontStyle = 'bold';
          if (data.row.index === grandTotalIndex1) {
            data.cell.styles.fillColor = [220, 235, 230];
          } else {
            // Sisa buying power logic
            if (remainingBalance < 0) {
              data.cell.styles.fillColor = [254, 226, 226]; // red-100
              data.cell.styles.textColor = [220, 38, 38]; // red-600
            } else {
              data.cell.styles.fillColor = [220, 252, 231]; // green-100
              data.cell.styles.textColor = [22, 163, 74]; // green-600
            }
          }
        }
      }
    });

    doc.save(`BuyingPower_${selectedProgram.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  }

  // No render blocking! UI is immediately rendered using sparse dictionary defaults, then hydration snaps it to saved values instantly.

  return (
    <div className="grid gap-6">
      {/* HEADER & SELECTOR */}
      <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 max-w-sm">
            <label className="mb-2 block text-sm font-semibold text-ink">
              Pilih Program
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => {
                setSelectedProgramId(e.target.value);
              }}
              className="w-full rounded-lg border border-ink/15 bg-cloud px-3 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
            >
              {programs.length === 0 && <option value="">Belum ada program</option>}
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg bg-mint/50 px-4 py-3 sm:w-auto min-w-[240px]">
            <Calculator className="text-leaf shrink-0" size={28} />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase text-ink/60">Total Dana (Buying Power)</p>
                {syncStatus === 'syncing' && <span title="Menyinkronkan ke awan..."><Loader2 size={12} className="animate-spin text-leaf" /></span>}
                {syncStatus === 'saved' && <span title="Tersimpan di awan"><Cloud size={12} className="text-leaf" /></span>}
                {syncStatus === 'error' && <span title="Gagal menyinkronkan"><CloudOff size={12} className="text-red-500" /></span>}
              </div>
              <p className="text-xl font-bold text-leaf leading-tight">{formatRupiah(buyingPower)}</p>
            </div>
          </div>
        </div>
      </div>

      {selectedProgram && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* CALCULATOR MAIN AREA */}
          <div className="lg:col-span-2 grid gap-6">
            {Object.keys(groupedCampaigns).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-ink/10 border-dashed bg-white py-12 text-center shadow-sm">
                <SearchX size={48} className="text-ink/20" />
                <h3 className="mt-4 text-sm font-bold text-ink">Tidak ada paket (bertipe Kuantitas)</h3>
                <p className="mt-1 text-sm text-ink/50">Buat setidaknya satu campaign dengan opsi kuantitas dan harga (misal Sapi/Kambing).</p>
                <button
                  onClick={handleAddCustomPackage}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
                >
                  <Plus size={16} />
                  Tambah Paket Manual
                </button>
              </div>
            ) : (
              <>
                {Object.entries(groupedCampaigns).map(([categoryName, items]) => {
                  let categoryTotalItems = 0;
                  const categorySubtotal = items.reduce((sum, camp) => {
                    const isActive = activePackages[camp.id] ?? true;
                    if (isActive) {
                      const qty = quantities[camp.id] ?? 0;
                      categoryTotalItems += qty;
                      const price = 'categoryId' in camp ? camp.quantityPrice || 0 : camp.quantityPrice;
                      return sum + (qty * price);
                    }
                    return sum;
                  }, 0);

                  return (
                    <div key={categoryName} className="rounded-xl border border-ink/10 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between border-b border-ink/10 bg-cloud px-5 py-3">
                        <h3 className="font-bold text-ink flex items-center gap-2">
                          <Package size={16} className="text-leaf" />
                          {categoryName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-bold text-ink/70" title="Total item">
                            {categoryTotalItems} item
                          </span>
                          <span className="rounded-full bg-ink/10 px-2.5 py-1 text-xs font-bold text-ink" title="Total akumulasi kategori ini">
                            {formatRupiah(categorySubtotal)}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-ink/5">
                        {items.map(camp => {
                          const isActive = activePackages[camp.id] ?? true;
                          const qty = quantities[camp.id] ?? 0;
                          const price = 'categoryId' in camp ? camp.quantityPrice || 0 : camp.quantityPrice;
                          const isCustom = !('categoryId' in camp);
                          
                          return (
                            <div key={camp.id} className={`p-5 transition-colors ${!isActive ? 'opacity-60 bg-cloud/30' : ''}`}>
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                  {isCustom ? (
                                    <div className="grid gap-2 sm:flex sm:items-center">
                                      <input
                                        type="text"
                                        value={camp.title}
                                        onChange={(e) => handleUpdateCustomPackage(camp.id, 'title', e.target.value)}
                                        className="rounded-md border border-ink/20 px-2 py-1 text-sm font-semibold outline-none focus:border-leaf"
                                        placeholder="Nama Paket"
                                      />
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium text-ink/50">@ Rp</span>
                                        <input
                                          type="number"
                                          value={camp.quantityPrice}
                                          onChange={(e) => handleUpdateCustomPackage(camp.id, 'quantityPrice', Number(e.target.value))}
                                          className="w-32 rounded-md border border-ink/20 px-2 py-1 text-sm font-semibold outline-none focus:border-leaf"
                                        />
                                        <button
                                          onClick={() => handleRemoveCustomPackage(camp.id)}
                                          className="ml-2 rounded p-1 text-red-500 hover:bg-red-50"
                                          title="Hapus paket manual"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <h4 className="font-semibold text-ink leading-tight">{camp.title}</h4>
                                      <p className="text-xs font-medium text-ink/50 mt-1">
                                        {formatRupiah(price)} / objek
                                      </p>
                                    </>
                                  )}
                                </div>
                                
                                {/* PREMIUM IOS-STYLE TOGGLE */}
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isActive}
                                  onClick={() => handleToggle(camp.id)}
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-leaf focus:ring-offset-2 ${
                                    isActive ? "bg-leaf" : "bg-ink/20"
                                  }`}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      isActive ? "translate-x-5" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>

                              {/* SLIDER & INPUT */}
                              <div className="flex items-center gap-4">
                                <div className="flex flex-1 items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={!isActive}
                                    onClick={() => handleQuantityChange(camp.id, qty - 1)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/20 bg-white text-ink transition hover:border-leaf hover:text-leaf hover:bg-cloud/50 focus:outline-none focus:ring-2 focus:ring-leaf disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-ink/20 disabled:hover:text-ink disabled:hover:bg-white"
                                    title="Kurangi Kuantitas"
                                  >
                                    <Minus size={14} className="stroke-[2.5]" />
                                  </button>

                                  <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={qty}
                                    disabled={!isActive}
                                    onChange={(e) => handleQuantityChange(camp.id, parseInt(e.target.value))}
                                    className="w-full h-2 bg-cloud rounded-lg appearance-none cursor-pointer accent-leaf disabled:cursor-not-allowed"
                                  />

                                  <button
                                    type="button"
                                    disabled={!isActive}
                                    onClick={() => handleQuantityChange(camp.id, qty + 1)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/20 bg-white text-ink transition hover:border-leaf hover:text-leaf hover:bg-cloud/50 focus:outline-none focus:ring-2 focus:ring-leaf disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-ink/20 disabled:hover:text-ink disabled:hover:bg-white"
                                    title="Tambah Kuantitas"
                                  >
                                    <Plus size={14} className="stroke-[2.5]" />
                                  </button>
                                </div>

                                <input
                                  type="number"
                                  min="0"
                                  value={qty}
                                  disabled={!isActive}
                                  onChange={(e) => handleQuantityChange(camp.id, parseInt(e.target.value) || 0)}
                                  className="w-20 rounded-md border border-ink/20 px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-leaf focus:ring-2 focus:ring-mint disabled:bg-cloud disabled:cursor-not-allowed"
                                />
                              </div>
                              
                              {/* SUBTOTAL INFO */}
                              <div className="mt-3 flex justify-end text-sm">
                                <span className="font-medium text-ink/60 mr-2">Subtotal:</span>
                                <span className="font-bold text-ink">
                                  {isActive ? formatRupiah(qty * price) : 'Rp 0'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-center mt-2">
                  <button
                    onClick={handleAddCustomPackage}
                    className="inline-flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf shadow-sm"
                  >
                    <Plus size={16} />
                    Tambah Paket Manual
                  </button>
                </div>
              </>
            )}
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4">
              <div className="rounded-xl border border-ink/10 bg-white shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-12rem)]">
                {/* SUMMARY HEADER */}
                <div className="bg-ink p-5 text-white shrink-0">
                  <h3 className="text-sm font-medium opacity-80 uppercase tracking-wide">Total Investment</h3>
                  <p className="mt-1 text-3xl font-bold">{formatRupiah(totalInvestment)}</p>
                </div>
                
                {/* STATUS BOX */}
                <div className="p-5 pb-0 shrink-0">
                  <div className={`flex items-start gap-3 rounded-lg p-4 border ${isSufficient ? 'border-leaf/20 bg-mint/30' : 'border-red-500/20 bg-red-50'}`}>
                    {isSufficient ? (
                      <CheckCircle2 size={20} className="text-leaf shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`text-sm font-bold ${isSufficient ? 'text-leaf' : 'text-red-600'}`}>
                        {isSufficient ? 'Buying Power Cukup' : 'Buying Power Kurang!'}
                      </h4>
                      <p className={`mt-1 font-mono text-sm font-medium ${isSufficient ? 'text-leaf/80' : 'text-red-600'}`}>
                        {isSufficient ? `Sisa: ${formatRupiah(remainingBalance)}` : `Kurang: ${formatRupiah(Math.abs(remainingBalance))}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DETAILED BREAKDOWN LIST */}
                <div className="p-5 flex-1 overflow-y-auto">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-3">Rincian Paket Terpilih</h4>
                  {selectedItemsSummary.length === 0 ? (
                    <p className="text-sm text-ink/50 italic text-center py-4 bg-cloud rounded-lg">Belum ada paket yang dipilih</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedItemsSummary.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-3 text-sm">
                          <div className="flex gap-2 min-w-0">
                            <span className="font-bold text-leaf shrink-0">{item.qty}x</span>
                            <div className="flex flex-col min-w-0 mt-[-1px]">
                              <span className="font-medium text-ink truncate" title={item.title}>{item.title}</span>
                              <span className="text-xs text-ink/50 mt-0.5">@ {formatRupiah(item.price)}</span>
                            </div>
                          </div>
                          <span className="font-semibold text-ink shrink-0">{formatRupiah(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="border-t border-ink/10 mt-5 pt-4 text-xs text-ink/50">
                    * Kalkulasi ini hanya simulasi dan tidak memotong dana aktual. Geser slider pada paket untuk mengatur perencanaan donasi Anda.
                  </div>
                </div>
              </div>

              {/* EXPORT BUTTONS */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white p-3 font-bold text-ink shadow-sm transition hover:border-leaf hover:text-leaf hover:bg-cloud/50 active:scale-[0.98]"
                >
                  <FileSpreadsheet size={18} className="text-emerald-600" />
                  <span className="text-sm">Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white p-3 font-bold text-ink shadow-sm transition hover:border-leaf hover:text-leaf hover:bg-cloud/50 active:scale-[0.98]"
                >
                  <FileText size={18} className="text-rose-600" />
                  <span className="text-sm">PDF</span>
                </button>
              </div>

              {/* RESET BUTTON */}
              <button
                onClick={handleResetAll}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-50 p-3 font-bold text-red-600 shadow-sm transition hover:border-red-500 hover:bg-red-100 active:scale-[0.98] mt-2"
              >
                <RotateCcw size={18} />
                <span className="text-sm">Reset Semua Data</span>
              </button>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
