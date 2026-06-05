"use client";

import { useEffect, useState, useCallback } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { salaryService } from "@/lib/services/salaryService";
import { departmentService } from "@/lib/services/departmentService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Save, FileSpreadsheet, FileText } from "lucide-react";
import { useToast } from "@/components/ui/toast-notification";

export default function SalariesPage() {
  const { showToast, ToastComponent } = useToast();
  const [departments, setDepartments] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [selectedDept, setSelectedDept] = useState("all");

  // Local inputs state for editing allowances and deductions
  const [inputs, setInputs] = useState({}); // { [user_id]: { allowances: string, deductions: string } }
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Fetch departments list
  useEffect(() => {
    departmentService.getDepartments()
      .then(setDepartments)
      .catch((err) => console.error("Error fetching departments:", err));
  }, []);

  // Fetch salaries matching filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { month, year };
      if (selectedDept && selectedDept !== "all") {
        filters.department_id = selectedDept;
      }
      const data = await salaryService.getSalaries(filters);
      setSalaries(data);

      // Initialize inputs state with retrieved values
      const initialInputs = {};
      for (const item of data) {
        initialInputs[item.user_id] = {
          allowances: item.allowances.toString(),
          deductions: item.deductions.toString()
        };
      }
      setInputs(initialInputs);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      showToast("Gagal mengambil data rekap gaji", "error");
    } finally {
      setLoading(false);
    }
  }, [month, year, selectedDept]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedSalaries = [...salaries].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA, valB;
    if (sortConfig.key === "allowances") {
      valA = parseFloat(inputs[a.user_id]?.allowances || 0);
      valB = parseFloat(inputs[b.user_id]?.allowances || 0);
    } else if (sortConfig.key === "deductions") {
      valA = parseFloat(inputs[a.user_id]?.deductions || 0);
      valB = parseFloat(inputs[b.user_id]?.deductions || 0);
    } else if (sortConfig.key === "net_salary") {
      valA = a.basic_salary + parseFloat(inputs[a.user_id]?.allowances || 0) - parseFloat(inputs[a.user_id]?.deductions || 0);
      valB = b.basic_salary + parseFloat(inputs[b.user_id]?.allowances || 0) - parseFloat(inputs[b.user_id]?.deductions || 0);
    } else if (sortConfig.key === "hadir") {
      valA = a.attendance_summary?.hadir || 0;
      valB = b.attendance_summary?.hadir || 0;
    } else {
      valA = a[sortConfig.key];
      valB = b[sortConfig.key];
    }
    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Handle local change in inputs
  const handleInputChange = (userId, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  // Handle saving individual employee salary
  const handleSave = async (item) => {
    const userInputs = inputs[item.user_id] || { allowances: "0", deductions: "0" };
    const payload = {
      user_id: item.user_id,
      month,
      year,
      basic_salary: item.basic_salary,
      allowances: parseFloat(userInputs.allowances || 0),
      deductions: parseFloat(userInputs.deductions || 0)
    };

    setSavingUserId(item.user_id);
    try {
      await salaryService.createSalary(payload);
      showToast(`Berhasil menyimpan gaji untuk ${item.user_name}`, "success");
      // Update the saved status locally
      setSalaries((prev) =>
        prev.map((s) =>
          s.user_id === item.user_id
            ? {
                ...s,
                allowances: payload.allowances,
                deductions: payload.deductions,
                net_salary: s.basic_salary + payload.allowances - payload.deductions,
                is_saved: true
              }
            : s
        )
      );
    } catch (error) {
      console.error("Error saving salary:", error);
      showToast("Gagal menyimpan data gaji", "error");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleExportExcel = async () => {
    // Filter only saved salaries
    const savedSalaries = salaries.filter((s) => s.is_saved);
    if (savedSalaries.length === 0) {
      showToast("Tidak ada data gaji yang sudah disimpan untuk diekspor", "warning");
      return;
    }

    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rekap Gaji");

      // Title row
      const titleRow = worksheet.addRow(["LAPORAN REKAPITULASI GAJI KARYAWAN"]);
      titleRow.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
      worksheet.mergeCells("A1:L1");
      titleRow.height = 30;
      titleRow.alignment = { vertical: "middle", horizontal: "center" };

      // Subtitle (Period and Department)
      const deptName = selectedDept === "all" ? "Semua Departemen" : (departments.find(d => d.id.toString() === selectedDept)?.name || "");
      const subtitleText = `Periode: ${months[month - 1]} ${year} | Departemen: ${deptName}`;
      const subtitleRow = worksheet.addRow([subtitleText]);
      subtitleRow.font = { name: "Arial", size: 11, italic: true, color: { argb: "FF4B5563" } };
      worksheet.mergeCells("A2:L2");
      subtitleRow.height = 20;
      subtitleRow.alignment = { vertical: "middle", horizontal: "center" };

      worksheet.addRow([]); // Blank spacer

      // Table Headers
      const headers = [
        "No",
        "Nama Karyawan",
        "Email",
        "Departemen",
        "Hadir",
        "Telat",
        "Alpha",
        "Izin",
        "Gaji Pokok",
        "Tunjangan",
        "Potongan",
        "Total Bersih"
      ];
      
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F46E5" } // Indigo background
        };
        cell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: "FFFFFFFF" }
        };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "medium", color: { argb: "FF1E3A8A" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } }
        };
      });

      // Data Rows
      let totalBasicSalary = 0;
      let totalAllowances = 0;
      let totalDeductions = 0;
      let totalNetSalary = 0;

      savedSalaries.forEach((item, index) => {
        const userInputs = inputs[item.user_id] || { allowances: "0", deductions: "0" };
        const allowance = parseFloat(userInputs.allowances || 0);
        const deduction = parseFloat(userInputs.deductions || 0);
        const netSalary = item.basic_salary + allowance - deduction;

        totalBasicSalary += item.basic_salary;
        totalAllowances += allowance;
        totalDeductions += deduction;
        totalNetSalary += netSalary;

        const rowData = [
          index + 1,
          item.user_name,
          item.email,
          item.department_name,
          item.attendance_summary.hadir,
          item.attendance_summary.terlambat,
          item.attendance_summary.alpha,
          item.attendance_summary.izin_sakit,
          item.basic_salary,
          allowance,
          deduction,
          netSalary
        ];

        const dataRow = worksheet.addRow(rowData);
        dataRow.height = 20;

        // Alignment & number formatting
        dataRow.eachCell((cell, colNumber) => {
          cell.font = { name: "Arial", size: 10 };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } }
          };

          if (colNumber === 1 || colNumber >= 5 && colNumber <= 8) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else if (colNumber === 2 || colNumber === 3 || colNumber === 4) {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          } else if (colNumber >= 9 && colNumber <= 12) {
            cell.alignment = { vertical: "middle", horizontal: "right" };
            cell.numFmt = '"Rp"#,##0'; // Format Rupiah
          }
        });
      });

      // Total Row
      const totalRowData = [
        "TOTAL",
        "", "", "", "", "", "", "",
        totalBasicSalary,
        totalAllowances,
        totalDeductions,
        totalNetSalary
      ];

      const totalRow = worksheet.addRow(totalRowData);
      totalRow.height = 24;
      
      // Merge cells for "TOTAL" text (A to H)
      worksheet.mergeCells(`A${totalRow.number}:H${totalRow.number}`);
      
      totalRow.getCell(1).font = { name: "Arial", size: 10, bold: true, color: { argb: "FF1F2937" } };
      totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

      totalRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" }
        };

        cell.border = {
          top: { style: "medium", color: { argb: "FF9CA3AF" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "double", color: { argb: "FF1F2937" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } }
        };

        if (colNumber >= 9 && colNumber <= 12) {
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF111827" } };
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.numFmt = '"Rp"#,##0';
        }
      });

      // Adjust column widths automatically
      worksheet.columns.forEach((column) => {
        let maxLen = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          if (cell.row.number === 1 || cell.row.number === 2) return;
          let val = cell.value ? cell.value.toString() : "";
          if (typeof cell.value === "number" && cell.numFmt) {
            val = "Rp " + cell.value.toLocaleString("id-ID");
          }
          if (val.length > maxLen) {
            maxLen = val.length;
          }
        });
        column.width = Math.max(maxLen + 4, 10);
      });

      // Specific overrides for column widths to look good
      worksheet.getColumn(1).width = 6;
      worksheet.getColumn(2).width = 25;
      worksheet.getColumn(3).width = 28;
      worksheet.getColumn(4).width = 18;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      
      const fileDeptName = deptName.replace(/\s+/g, "_");
      anchor.download = `Rekap_Gaji_${fileDeptName}_${months[month - 1]}_${year}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      
      showToast("Rekap gaji berhasil diekspor ke Excel!", "success");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showToast("Gagal mengekspor data ke Excel", "error");
    }
  };

  const handleExportPDF = async (item) => {
    if (!item.is_saved) {
      showToast(`Simpan gaji ${item.user_name} terlebih dahulu sebelum mengunduh PDF!`, "warning");
      return;
    }

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const userInputs = inputs[item.user_id] || { allowances: "0", deductions: "0" };
      const allowance = parseFloat(userInputs.allowances || 0);
      const deduction = parseFloat(userInputs.deductions || 0);
      const netSalary = item.basic_salary + allowance - deduction;

      const primaryColor = [30, 58, 138];
      const secondaryColor = [79, 70, 229];
      const textColor = [31, 41, 55];
      const mutedColor = [107, 114, 128];

      let y = 15;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("PT BASIKAL JAYA", 15, y);
      
      y += 6;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text("Gedung Rektorat Lt. 3, Jl. Raya Kampus, Sleman, Yogyakarta", 15, y);
      doc.text("Email: hrd@basikaljaya.co.id | Telp: (0274) 555-1234", 15, y + 4);

      y += 10;
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, y, 180, 1, "F");

      y += 10;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("SLIP GAJI KARYAWAN", 15, y);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Periode: ${months[month - 1]} ${year}`, 150, y);

      y += 8;
      doc.setFillColor(249, 250, 251);
      doc.rect(15, y, 180, 28, "F");
      doc.setDrawColor(229, 231, 235);
      doc.rect(15, y, 180, 28, "D");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("INFORMASI KARYAWAN", 20, y + 6);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Nama         : ${item.user_name}`, 20, y + 12);
      doc.text(`Departemen   : ${item.department_name}`, 20, y + 17);
      doc.text(`Email        : ${item.email}`, 20, y + 22);

      doc.setFont("Helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("RINGKASAN KEHADIRAN", 115, y + 6);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Hadir        : ${item.attendance_summary.hadir} Hari`, 115, y + 12);
      doc.text(`Terlambat    : ${item.attendance_summary.terlambat} Kali`, 115, y + 17);
      doc.text(`Absen / Alpha: ${item.attendance_summary.alpha} Hari`, 115, y + 22);
      doc.text(`Izin / Sakit : ${item.attendance_summary.izin_sakit} Hari`, 155, y + 12);

      y += 38;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("RINCIAN PENGHASILAN & POTONGAN", 15, y);

      y += 4;
      
      const formatCurrencyPDF = (val) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0
        }).format(val);
      };

      const tableData = [
        ["1", "Gaji Pokok", "Penerimaan", formatCurrencyPDF(item.basic_salary)],
        ["2", "Tunjangan", "Penerimaan", formatCurrencyPDF(allowance)],
        ["3", "Potongan Gaji / Absen", "Potongan", formatCurrencyPDF(deduction)]
      ];

      autoTable(doc, {
        startY: y,
        head: [["No", "Deskripsi", "Kategori", "Jumlah"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
          halign: "left"
        },
        bodyStyles: {
          fontSize: 9,
          textColor: textColor
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 85 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40, halign: "right" }
        },
        margin: { left: 15, right: 15 }
      });

      y = doc.lastAutoTable.finalY + 8;

      doc.setFillColor(243, 244, 246);
      doc.rect(115, y, 80, 16, "F");
      doc.setDrawColor(209, 213, 219);
      doc.rect(115, y, 80, 16, "D");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("TOTAL BERSIH (TAKE HOME PAY)", 120, y + 6);
      
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(formatCurrencyPDF(netSalary), 120, y + 12);

      const terbilang = (amount) => {
        const words = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        const spell = (n) => {
          if (n < 12) return words[n];
          if (n < 20) return spell(n - 10) + " Belas";
          if (n < 100) return spell(Math.floor(n / 10)) + " Puluh " + spell(n % 10);
          if (n < 200) return "Seratus " + spell(n - 100);
          if (n < 1000) return spell(Math.floor(n / 100)) + " Ratus " + spell(n % 100);
          if (n < 2000) return "Seribu " + spell(n - 1000);
          if (n < 1000000) return spell(Math.floor(n / 1000)) + " Ribu " + spell(n % 1000);
          if (n < 1000000000) return spell(Math.floor(n / 1000000)) + " Juta " + spell(n % 1000000);
          return "";
        };
        if (amount === 0) return "Nol Rupiah";
        return (spell(amount) + " Rupiah").replace(/\s+/g, " ").trim();
      };

      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(`Terbilang: "${terbilang(netSalary)}"`, 15, y + 22, { maxWidth: 90 });

      y += 35;

      const today = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Yogyakarta, ${today}`, 130, y);
      doc.text("Disetujui oleh,", 130, y + 5);
      
      doc.setFont("Helvetica", "bold");
      doc.text("HRD Department", 130, y + 25);
      
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text("Slip gaji ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah.", 15, 280);

      const fileName = `Slip_Gaji_${item.user_name.replace(/\s+/g, "_")}_${months[month - 1]}_${year}.pdf`;
      doc.save(fileName);
      showToast(`Berhasil mengunduh slip gaji untuk ${item.user_name}`, "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Gagal mengekspor slip gaji ke PDF", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rekap Gaji</h1>
          <p className="text-gray-500">Kelola, input tunjangan, potongan, serta hitung gaji bulanan karyawan.</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
          <div className="w-[140px]">
            <Select 
              value={month.toString()}
              onValueChange={(v) => setMonth(parseInt(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[100px]">
            <Select 
              value={year.toString()}
              onValueChange={(v) => setYear(parseInt(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <Select 
              value={selectedDept}
              onValueChange={setSelectedDept}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9"
          >
            <FileSpreadsheet size={16} />
            Ekspor Excel
          </Button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("user_name")}>Karyawan</TableHead>
              <TableHead className="font-semibold text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("department_name")}>Departemen</TableHead>
              <TableHead className="font-semibold text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("hadir")}>Kehadiran (Bulan Ini)</TableHead>
              <TableHead className="font-semibold text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("basic_salary")}>Gaji Pokok</TableHead>
              <TableHead className="font-semibold text-xs w-[130px] cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("allowances")}>Tunjangan (Rp)</TableHead>
              <TableHead className="font-semibold text-xs w-[130px] cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("deductions")}>Potongan (Rp)</TableHead>
              <TableHead className="font-semibold text-xs text-right cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("net_salary")}>Total Bersih</TableHead>
              <TableHead className="font-semibold text-xs text-center w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-gray-500 font-medium">Memuat rekap gaji karyawan...</div>
                </TableCell>
              </TableRow>
            ) : salaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  Tidak ditemukan karyawan pada kriteria filter ini.
                </TableCell>
              </TableRow>
            ) : (
              sortedSalaries.map((item) => {
                const userInputs = inputs[item.user_id] || { allowances: "0", deductions: "0" };
                const rawAllowances = parseFloat(userInputs.allowances || 0);
                const rawDeductions = parseFloat(userInputs.deductions || 0);
                const computedNetSalary = item.basic_salary + rawAllowances - rawDeductions;

                return (
                  <TableRow key={item.user_id} className="hover:bg-gray-50/50">
                    <TableCell className="py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{item.user_name}</p>
                        <p className="text-xs text-gray-400">{item.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-gray-600">
                      {item.department_name}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          {item.attendance_summary.hadir} Hadir
                        </span>
                        {item.attendance_summary.terlambat > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {item.attendance_summary.terlambat} Telat
                          </span>
                        )}
                        {item.attendance_summary.alpha > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            {item.attendance_summary.alpha} Alpha
                          </span>
                        )}
                        {item.attendance_summary.izin_sakit > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {item.attendance_summary.izin_sakit} Izin
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-gray-700">
                      {formatCurrency(item.basic_salary)}
                    </TableCell>
                    <TableCell className="py-4">
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={userInputs.allowances}
                        onChange={(e) => handleInputChange(item.user_id, "allowances", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={userInputs.deductions}
                        onChange={(e) => handleInputChange(item.user_id, "deductions", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="py-4 text-right font-bold text-primary text-base">
                      {formatCurrency(computedNetSalary)}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          className="h-8 gap-1 w-24"
                          onClick={() => handleSave(item)}
                          disabled={savingUserId === item.user_id}
                          variant={item.is_saved ? "outline" : "default"}
                        >
                          {item.is_saved ? (
                            <>
                              <Check size={14} className="text-green-600 font-bold" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Save size={14} />
                              Simpan
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-700 text-red-600 animate-fade-in"
                          onClick={() => handleExportPDF(item)}
                          title="Unduh Slip Gaji PDF"
                        >
                          <FileText size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {ToastComponent}
    </SidebarLayout>
  );
}
