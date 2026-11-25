import { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Users,
  Eye,
  Check
} from "lucide-react";
import { API_BASE } from "../config/api";

export default function AdminBulkUploadModal({ token, onClose, onImportSuccess }) {
  const [activeTab, setActiveTab] = useState("csv"); // 'csv' or 'pdf'
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState("");
  const [defaultStatus, setDefaultStatus] = useState("approved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  // PDF specific state
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfBase64, setPdfBase64] = useState("");
  const [pdfForm, setPdfForm] = useState({
    name: "",
    gender: "Bride",
    age: "24",
    height: "5'5\"",
    religion: "Hindu",
    caste: "",
    star: "",
    education: "",
    profession: "",
    location: "Kerala, India",
    phone: "",
    email: ""
  });

  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  // ==========================================
  // CSV PARSING UTILITIES
  // ==========================================
  const parseCSVText = (text) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error("CSV file must contain a header row and at least one data row.");
    }

    // Split CSV line respecting double quotes
    const splitLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map((col) => col.replace(/^"(.*)"$/, "$1").trim());
    };

    const rawHeaders = splitLine(lines[0]);
    // Standardize header names
    const headers = rawHeaders.map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, "")
    );

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = splitLine(lines[i]);
      if (values.every((v) => !v)) continue;

      const rowObj = {};
      rawHeaders.forEach((rawHeader, idx) => {
        rowObj[rawHeader] = values[idx] || "";
      });

      // Normalize key aliases
      const name =
        rowObj.name ||
        rowObj["Full Name"] ||
        rowObj.Name ||
        rowObj["Candidate Name"] ||
        "";
      const gender =
        rowObj.gender || rowObj.Gender || rowObj.Sex || "Bride";
      const age = rowObj.age || rowObj.Age || "25";
      const height = rowObj.height || rowObj.Height || "5'5\"";
      const marriageType =
        rowObj.marriageType ||
        rowObj["Marital Status"] ||
        rowObj.maritalStatus ||
        "Never Married";
      const religion = rowObj.religion || rowObj.Religion || "Hindu";
      const caste = rowObj.caste || rowObj.Caste || rowObj.Community || "";
      const star =
        rowObj.star || rowObj.Star || rowObj.nakshatra || rowObj.Nakshatra || "";
      const motherTongue =
        rowObj.motherTongue || rowObj["Mother Tongue"] || "Malayalam";
      const education =
        rowObj.education ||
        rowObj.Education ||
        rowObj.Qualification ||
        "Graduate";
      const profession =
        rowObj.profession || rowObj.Profession || rowObj.Occupation || "Professional";
      const location =
        rowObj.location || rowObj.Location || rowObj.City || "Kerala, India";
      const district =
        rowObj.district || rowObj.District || location.split(",")[0] || "";
      const phone =
        rowObj.phone ||
        rowObj.Phone ||
        rowObj.Mobile ||
        rowObj["Phone Number"] ||
        "";
      const email =
        rowObj.email || rowObj.Email || rowObj["Email Address"] || "";
      const photo = rowObj.photo || rowObj.Photo || rowObj.photoUrl || "";

      if (name.trim()) {
        rows.push({
          name: name.trim(),
          gender: /groom|male|man/i.test(gender) ? "Groom" : "Bride",
          age: Number(age) || 25,
          height: height.trim(),
          marriageType: marriageType.trim(),
          religion: religion.trim(),
          caste: caste.trim(),
          star: star.trim(),
          motherTongue: motherTongue.trim(),
          education: education.trim(),
          profession: profession.trim(),
          location: location.trim(),
          district: district.trim(),
          phone: phone.trim(),
          email: email.trim(),
          photo: photo.trim()
        });
      }
    }

    return rows;
  };

  const handleCSVFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setParseError("Please select a valid .csv spreadsheet file.");
      return;
    }

    setSelectedFile(file);
    setParseError("");
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVText(text);
        if (rows.length === 0) {
          setParseError("No valid candidate rows with names found in the CSV.");
          setParsedRows([]);
        } else {
          setParsedRows(rows);
        }
      } catch (err) {
        setParseError("Failed to parse CSV file: " + err.message);
        setParsedRows([]);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent =
      "name,gender,age,height,marriageType,religion,caste,star,motherTongue,education,profession,location,phone,email,photo\n" +
      'Ananya Menon,Bride,25,5\'5",Never Married,Hindu,Menon,Aswathy,Malayalam,M.Sc Biotechnology,Clinical Research Associate,Thrissur,9876543210,ananya.sample@keralakalyans.internal,\n' +
      'Rahul Nair,Groom,28,5\'10",Never Married,Hindu,Nair,Rohini,Malayalam,B.Tech Computer Science,Software Architect,Kochi,9876543211,rahul.sample@keralakalyans.internal,\n' +
      'Dr. Gopika Krishnan,Bride,26,5\'6",Never Married,Hindu,Ezhava,Makayiram,Malayalam,MBBS MD,Physician,Kottayam,9876543212,gopika.sample@keralakalyans.internal,\n' +
      'Arun Varma,Groom,29,5\'11",Never Married,Hindu,Kshatriya,Thiruvonam,Malayalam,MBA Finance,Investment Banker,Thiruvananthapuram,9876543213,arun.sample@keralakalyans.internal,\n' +
      'Deepa Pillai,Bride,24,5\'4",Never Married,Hindu,Nair,Ayilyam,Malayalam,Chartered Accountant (CA),Senior Financial Auditor,Kozhikode,9876543214,deepa.sample@keralakalyans.internal,\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "kerala_kalyans_profiles_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmCSVImport = async () => {
    if (parsedRows.length === 0) return;
    setIsSubmitting(true);
    setParseError("");

    try {
      const res = await fetch(`${API_BASE}/profiles/bulk-import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profiles: parsedRows,
          defaultStatus
        })
      });

      const data = await res.json();
      if (res.ok) {
        setImportSummary({
          success: true,
          count: data.importedCount,
          failed: data.failedCount || 0,
          message: data.message
        });
        if (onImportSuccess) onImportSuccess();
      } else {
        setParseError(data.error || "Failed to import profiles.");
      }
    } catch {
      setParseError("Network error while connecting to import service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // PDF PARSING & UPLOAD
  // ==========================================
  const handlePDFFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      setParseError("Please select a valid .pdf document.");
      return;
    }

    setPdfFileName(file.name);
    setParseError("");
    setImportSummary(null);

    // Derive name from filename (e.g. "Ananya_Menon_Biodata.pdf" -> "Ananya Menon")
    const cleanName = file.name
      .replace(/\.pdf$/i, "")
      .replace(/[_-]/g, " ")
      .replace(/\b(biodata|resume|profile|cv|matrimony)\b/gi, "")
      .trim();

    setPdfForm((prev) => ({
      ...prev,
      name: cleanName || prev.name
    }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPDFUpload = async (e) => {
    e.preventDefault();
    if (!pdfForm.name.trim()) {
      setParseError("Candidate full name is required.");
      return;
    }

    setIsSubmitting(true);
    setParseError("");

    try {
      const res = await fetch(`${API_BASE}/profiles/upload-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          pdfBase64,
          fileName: pdfFileName,
          candidateData: pdfForm
        })
      });

      const data = await res.json();
      if (res.ok) {
        setImportSummary({
          success: true,
          count: 1,
          message: `Candidate profile for "${data.profile?.name || pdfForm.name}" created and verified.`
        });
        if (onImportSuccess) onImportSuccess();
      } else {
        setParseError(data.error || "Failed to create profile from PDF.");
      }
    } catch {
      setParseError("Network error while submitting PDF biodata.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-[var(--admin-border)] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--admin-border)] flex items-center justify-between bg-[var(--admin-surface)]/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[var(--admin-gold-strong)] text-white flex items-center justify-center shadow-xs">
              <Upload size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--admin-gold-ink)]">
                Upload &amp; Bulk Import Profiles
              </h2>
              <p className="text-xs text-[var(--admin-gold-text)]">
                Import candidates in bulk via CSV spreadsheet or single PDF biodata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-[var(--admin-border)] bg-gray-50/70 px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => {
              setActiveTab("csv");
              setParseError("");
              setImportSummary(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
              activeTab === "csv"
                ? "border-[var(--admin-gold-strong)] text-[var(--admin-gold-strong)] bg-white rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>CSV Spreadsheet (Bulk Import)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("pdf");
              setParseError("");
              setImportSummary(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
              activeTab === "pdf"
                ? "border-[var(--admin-gold-strong)] text-[var(--admin-gold-strong)] bg-white rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileText size={15} />
            <span>PDF Biodata Document</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Error Message */}
          {parseError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Success Summary */}
          {importSummary && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">
                    Import Successful!
                  </p>
                  <p className="text-[12px]">{importSummary.message}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: CSV BULK IMPORT */}
          {/* ============================================================ */}
          {activeTab === "csv" && !importSummary && (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleCSVFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
                  isDragging
                    ? "border-[var(--admin-gold-strong)] bg-amber-50/50"
                    : "border-gray-300 hover:border-[var(--admin-gold)] bg-gray-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCSVFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                  <FileSpreadsheet size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {selectedFile
                    ? selectedFile.name
                    : "Drag and drop your CSV file here"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  or <span className="text-[var(--admin-gold-strong)] font-semibold underline">browse computer</span> to select .csv file
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="text-[11px] text-gray-400">
                    Supports columns: Name, Gender, Age, Height, Religion, Caste, Education, Phone...
                  </span>
                </div>
              </div>

              {/* Sample Template Download Pill */}
              <div className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <FileSpreadsheet size={15} />
                  <span>Need the standard CSV template format?</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold cursor-pointer shadow-2xs"
                >
                  <Download size={13} />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Preview Table if rows parsed */}
              {parsedRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Users size={15} className="text-[var(--admin-gold-strong)]" />
                      <span>{parsedRows.length} Candidate Profiles Detected</span>
                    </span>

                    {/* Status configuration */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Import Status:</span>
                      <select
                        value={defaultStatus}
                        onChange={(e) => setDefaultStatus(e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-300 bg-white font-semibold text-xs"
                      >
                        <option value="approved">Approved &amp; Active</option>
                        <option value="pending">Pending Approval</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-700 sticky top-0 border-b border-gray-200 text-[11px]">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Gender</th>
                          <th className="px-3 py-2">Age</th>
                          <th className="px-3 py-2">Community</th>
                          <th className="px-3 py-2">Profession</th>
                          <th className="px-3 py-2">Location</th>
                          <th className="px-3 py-2">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {parsedRows.slice(0, 10).map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50/70">
                            <td className="px-3 py-1.5 text-gray-400 font-mono text-[10px]">
                              {i + 1}
                            </td>
                            <td className="px-3 py-1.5 font-bold text-gray-900 whitespace-nowrap">
                              {r.name}
                            </td>
                            <td className="px-3 py-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  r.gender === "Groom"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-pink-100 text-pink-800"
                                }`}
                              >
                                {r.gender}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap">{r.age} yrs</td>
                            <td className="px-3 py-1.5 whitespace-nowrap">
                              {r.religion} {r.caste ? `· ${r.caste}` : ""}
                            </td>
                            <td className="px-3 py-1.5 truncate max-w-[120px]">
                              {r.profession}
                            </td>
                            <td className="px-3 py-1.5 truncate max-w-[100px]">
                              {r.location}
                            </td>
                            <td className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap">
                              {r.phone || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {parsedRows.length > 10 && (
                    <p className="text-[11px] text-gray-400 text-right">
                      ...and {parsedRows.length - 10} more rows
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: PDF BIODATA UPLOAD */}
          {/* ============================================================ */}
          {activeTab === "pdf" && !importSummary && (
            <div className="space-y-4">
              {/* PDF Dropzone */}
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[var(--admin-gold)] rounded-2xl p-6 text-center cursor-pointer transition bg-gray-50/40"
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePDFFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mb-2">
                  <FileText size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {pdfFileName ? pdfFileName : "Select or drag Biodata PDF file"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload customer biodata sheet, horoscope or matrimonial profile PDF
                </p>
              </div>

              {/* Pre-fill / Verification Form */}
              <form onSubmit={handleConfirmPDFUpload} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Candidate Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={pdfForm.name}
                      onChange={(e) =>
                        setPdfForm({ ...pdfForm, name: e.target.value })
                      }
                      placeholder="e.g. Anjali Nair"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[var(--admin-gold-strong)] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Gender *
                    </label>
                    <select
                      value={pdfForm.gender}
                      onChange={(e) =>
                        setPdfForm({ ...pdfForm, gender: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none text-xs"
                    >
                      <option value="Bride">Bride (Female)</option>
                      <option value="Groom">Groom (Male)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Age &amp; Height
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={pdfForm.age}
                        onChange={(e) =>
                          setPdfForm({ ...pdfForm, age: e.target.value })
                        }
                        placeholder="Age"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                      />
                      <input
                        type="text"
                        value={pdfForm.height}
                        onChange={(e) =>
                          setPdfForm({ ...pdfForm, height: e.target.value })
                        }
                        placeholder="Height"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Religion &amp; Caste
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pdfForm.religion}
                        onChange={(e) =>
                          setPdfForm({ ...pdfForm, religion: e.target.value })
                        }
                        placeholder="Religion"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                      />
                      <input
                        type="text"
                        value={pdfForm.caste}
                        onChange={(e) =>
                          setPdfForm({ ...pdfForm, caste: e.target.value })
                        }
                        placeholder="Caste"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Education &amp; Profession
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pdfForm.education}
                        onChange={(e) =>
                          setPdfForm({ ...pdfForm, education: e.target.value })
                        }
                        placeholder="Degree / Qualification"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                      />
                      <input
                        type="text"
                        value={pdfForm.profession}
                        onChange={(e) =>
                          setPdfForm({ ...pdfForm, profession: e.target.value })
                        }
                        placeholder="Occupation"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Phone &amp; Location
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pdfForm.phone}
                        onChange={(e) =>
                          setPdfForm({ ...pdfForm, phone: e.target.value })
                        }
                        placeholder="Phone Number"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                      />
                      <input
                        type="text"
                        value={pdfForm.location}
                        onChange={(e) =>
                          setPdfForm({ ...pdfForm, location: e.target.value })
                        }
                        placeholder="District / City"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !pdfForm.name.trim()}
                    className="w-full py-2.5 rounded-xl bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Creating Profile from PDF...</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        <span>Save Candidate Profile from PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer Actions for CSV */}
        {activeTab === "csv" && !importSummary && (
          <div className="px-5 py-3.5 border-t border-[var(--admin-border)] bg-gray-50 flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-500">
              {parsedRows.length > 0
                ? `${parsedRows.length} candidates ready to import`
                : "Select a CSV file to begin"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmCSVImport}
                disabled={isSubmitting || parsedRows.length === 0}
                className="px-5 py-2 rounded-xl bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Confirm &amp; Import {parsedRows.length > 0 ? `(${parsedRows.length})` : ""}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
