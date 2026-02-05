"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import "./calculator.css";

const defaultQualities = {
  "Chandari 63": { ends: 7200, count: 63, weftCount: "", pick: 92, panno: 46 },
  "Berlin 58": { ends: 6800, count: 58, weftCount: "", pick: 88, panno: 44 },
  "Cotton 40": { ends: 6400, count: 40, weftCount: "", pick: 72, panno: 40 }
};


export default function Calculator() {
  const { userData, logout } = useAuth();
  const isAdmin = userData?.role === 'admin';

  const [activeQuality, setActiveQuality] = useState("");
  const [qualities, setQualities] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qualities");
      return saved ? JSON.parse(saved) : defaultQualities;
    }
    return defaultQualities;
  });

  const [showAddQuality, setShowAddQuality] = useState(false);
  const [newQuality, setNewQuality] = useState({ name: "", ends: "", count: "", warpType: "C", weftCount: "", weftType: "C", pick: "", panno: "" });

  // Warp State
  const [warpEnds, setWarpEnds] = useState("");
  const [warpType, setWarpType] = useState("C"); // 'D' or 'C'
  const [warpCount, setWarpCount] = useState("");
  const [warpRate, setWarpRate] = useState("");
  const [warpShortage, setWarpShortage] = useState(10);

  // Weft State
  const [pick, setPick] = useState("");
  const [panno, setPanno] = useState("");
  const [weftShortage, setWeftShortage] = useState(10);
  const [wefts, setWefts] = useState([{ name: "", type: "C", value: "", rate: "" }]);

  // Additional
  const [khataKharch, setKhataKharch] = useState(10);
  const [salePrice, setSalePrice] = useState("");

  // Load State from LocalStorage on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("calculatorState");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setWarpEnds(parsed.warpEnds || "");
        setWarpType(parsed.warpType || "C");
        setWarpCount(parsed.warpCount || "");
        setWarpRate(parsed.warpRate || "");
        setWarpShortage(parsed.warpShortage || 10);
        setPick(parsed.pick || "");
        setPanno(parsed.panno || "");
        setWeftShortage(parsed.weftShortage || 10);
        setWefts(parsed.wefts || [{ name: "", type: "C", value: "", rate: "" }]);
        setKhataKharch(parsed.khataKharch || 10);
        setSalePrice(parsed.salePrice || "");
        setActiveQuality(parsed.activeQuality || "");
      }
    }
  }, []);

  // Save State to LocalStorage on Change
  useEffect(() => {
    const state = {
      warpEnds, warpType, warpCount, warpRate, warpShortage,
      pick, panno, weftShortage, wefts,
      khataKharch, salePrice, activeQuality
    };
    localStorage.setItem("calculatorState", JSON.stringify(state));
  }, [warpEnds, warpType, warpCount, warpRate, warpShortage, pick, panno, weftShortage, wefts, khataKharch, salePrice, activeQuality]);


  const selectQuality = (name) => {
    const q = qualities[name];
    setActiveQuality(name);
    setWarpEnds(q.ends || "");
    setWarpCount(q.count || "");
    setWarpType(q.warpType || "C");
    setPick(q.pick || "");
    setPanno(q.panno || "");

    // Prepare wefts from preset (Handle single weft preset mapping to array)
    // If preset has weft info, use it for the first yarn, keep others empty or reset?
    // Usually selecting a preset resets the "wefts" structure to match the preset's definition.
    // Since presets currently only seem to hold one weft layer structure in the `defaultQualities` (weftCount, weftType), 
    // we will map that to the first weft and reset the list.
    const newWefts = [{
      name: "",
      type: q.weftType || "C",
      value: q.weftCount || "",
      rate: ""
    }];
    setWefts(newWefts);
  };

  const addWeft = () => setWefts([...wefts, { name: "", type: "C", value: "", rate: "" }]);
  const removeWeft = (index) => setWefts(wefts.filter((_, i) => i !== index));

  const resetCalculator = () => {
    setActiveQuality("");
    setWarpEnds("");
    setWarpCount("");
    setWarpRate("");
    setPick("");
    setPanno("");
    setWefts([{ name: "", type: "C", value: "", rate: "" }]);
    setSalePrice("");
    // We don't verify 'khataKharch' reset? Keeping it as persisted or default 10 seems fine.
    // Let's reset it to 10 to be clean.
    setKhataKharch(10);
    setWarpShortage(10);
    setWeftShortage(10);
    localStorage.removeItem("calculatorState"); // Clear saved state
  };

  // --- FORMULAS ---
  const calculateWarp = () => {
    // Denier Conversion: If 'Count' is selected: Denier = 5315 / Count.
    const denierUsed = warpType === "C" && warpCount ? 5315 / Number(warpCount) : Number(warpCount || 0);

    // Warp Weight (per 100m): (Ends * Denier * 100) / 9,000,000 * (1 + Shortage / 100)
    const weight100m = (Number(warpEnds || 0) * denierUsed * 100) / 9000000 * (1 + Number(warpShortage || 0) / 100);

    // Cost per Meter: (Warp Weight / 100) * Warp Rate
    const costPerM = (weight100m / 100) * Number(warpRate || 0);

    return { denierUsed, weight100m, costPerM };
  };

  const calculateWeft = (w) => {
    // Denier Conversion: If 'Count' is selected: Denier = 5315 / Count.
    const denier = w.type === "C" && w.value ? 5315 / Number(w.value) : Number(w.value || 0);

    // Effective Pick: Pick * (1 + Shortage / 100).
    const effectivePick = Number(pick || 0) * (1 + Number(weftShortage || 10) / 100);

    // Weft Weight (per 100m): (Effective Pick * Panno * Denier * 100) / 9,000,000
    const weight100m = (effectivePick * Number(panno || 0) * denier * 100) / 9000000;

    // Cost per Meter: (Weft Weight / 100) * Weft Rate
    const costPerM = (weight100m / 100) * Number(w.rate || 0);

    return { denier, weight100m, costPerM, effectivePick };
  };

  const wp = calculateWarp();
  let totalWeftCost = 0;
  let totalWeight100m = wp.weight100m;

  const weftResults = wefts.map(w => {
    const res = calculateWeft(w);
    totalWeftCost += res.costPerM;
    totalWeight100m += res.weight100m;
    return res;
  });

  const yarnCost = wp.costPerM + totalWeftCost;
  const netCost = yarnCost + Number(khataKharch || 0);
  const gstCredit = yarnCost * 0.05;
  const cashCost = netCost + gstCredit;

  // Pricing & Profit Formulas
  const totalCostForProfit = yarnCost + Number(khataKharch || 0);
  const profit = Number(salePrice || 0) - totalCostForProfit;
  const margin = salePrice && Number(salePrice) !== 0 ? (profit / Number(salePrice)) * 100 : 0;
  const perPick = Number(pick) && Number(pick) !== 0 ? profit / Number(pick) : 0;

  return (
    <div className="container" style={{ paddingBottom: "120px" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="text-gradient" style={{ margin: 0, fontSize: "20px" }}>SAHJANAND</h2>
          <p style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>{isAdmin ? "Admin Console" : "Calculator User"}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {isAdmin && (
            <button
              onClick={() => window.location.href = "/admin/dashboard"}
              className="btn-primary"
              style={{ padding: "8px 12px", fontSize: "12px", background: "rgba(100, 255, 218, 0.1)", border: "1px solid var(--accent-cyan)", color: "var(--accent-cyan)" }}
            >
              👥 Manage Users
            </button>
          )}
          <button onClick={logout} className="btn-secondary" style={{ padding: "8px 12px", fontSize: "12px" }}>Logout</button>
        </div>
      </div>

      {/* Quality Presets */}
      <div className="glass-panel" style={{ padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "16px", color: "var(--accent-cyan)", marginBottom: "15px" }}>⚡ Presets</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {Object.keys(qualities).map(q => (
            <div key={q} style={{ position: "relative" }}>
              <button
                onClick={() => selectQuality(q)}
                style={{
                  background: activeQuality === q ? "rgba(100, 255, 218, 0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${activeQuality === q ? "var(--accent-cyan)" : "rgba(255,255,255,0.1)"}`,
                  color: activeQuality === q ? "var(--accent-cyan)" : "white",
                  padding: "10px 18px",
                  borderRadius: "20px",
                  fontSize: "13px"
                }}
              >
                {q}
              </button>
              <span
                onClick={() => {
                  const c = { ...qualities }; delete c[q]; setQualities(c);
                }}
                style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ff4d4d", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >✕</span>
            </div>
          ))}
          <button
            onClick={() => setShowAddQuality(true)}
            style={{ padding: "10px 18px", borderRadius: "20px", border: "1px dashed var(--accent-cyan)", background: "transparent", color: "var(--accent-cyan)", fontSize: "13px" }}
          >+ Add New</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Warp Section */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", color: "var(--accent-cyan)", marginBottom: "15px" }}>🧵 Warp Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Total Ends (Taar)</label>
              <input value={warpEnds} onChange={e => setWarpEnds(e.target.value)} type="number" placeholder="0" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Type</label>
                <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "4px" }}>
                  <button onClick={() => setWarpType("D")} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: warpType === "D" ? "var(--accent-cyan)" : "transparent", color: warpType === "D" ? "var(--bg-deep)" : "white", fontSize: "14px", fontWeight: "600" }}>D (Denier)</button>
                  <button onClick={() => setWarpType("C")} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: warpType === "C" ? "var(--accent-cyan)" : "transparent", color: warpType === "C" ? "var(--bg-deep)" : "white", fontSize: "14px", fontWeight: "600" }}>C (Count)</button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>{warpType === 'D' ? 'Denier' : 'Count'}</label>
                <input value={warpCount} onChange={e => setWarpCount(e.target.value)} type="number" placeholder="0" />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Rate (₹/kg)</label>
                <input value={warpRate} onChange={e => setWarpRate(e.target.value)} type="number" placeholder="0" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Shortage %</label>
                <input value={warpShortage} onChange={e => setWarpShortage(e.target.value)} type="number" placeholder="10" />
              </div>
            </div>

            {/* Warp Weight Display (Above Cost) */}
            <div style={{ padding: "10px 15px", background: "rgba(100, 255, 218, 0.03)", borderRadius: "10px", border: "1px solid rgba(100, 255, 218, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Warp Weight (100m)</span>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{wp.weight100m.toFixed(3)} kg</span>
            </div>

            {/* Warp Cost Display */}
            <div style={{ padding: "10px 15px", background: "rgba(100, 255, 218, 0.03)", borderRadius: "10px", border: "1px solid rgba(100, 255, 218, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Warp Cost per Meter</span>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>₹ {wp.costPerM.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Weft Section */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", color: "var(--accent-cyan)", marginBottom: "15px" }}>🧶 Weft Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Pick</label>
              <input value={pick} onChange={e => setPick(e.target.value)} type="number" placeholder="0" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Panno (Inch)</label>
              <input value={panno} onChange={e => setPanno(e.target.value)} type="number" placeholder="0" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {wefts.map((w, i) => (
              <div key={i} className="glass-panel" style={{ padding: "15px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--accent-blue)" }}>Yarn {i + 1}</span>
                  {wefts.length > 1 && <span onClick={() => removeWeft(i)} style={{ color: "#ff4d4d", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>✕ Remove</span>}
                </div>
                <input
                  placeholder="Yarn Name (Optional)"
                  value={w.name}
                  onChange={e => { const c = [...wefts]; c[i].name = e.target.value; setWefts(c); }}
                  style={{ fontSize: "13px", marginBottom: "12px" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "3px", marginBottom: "8px" }}>
                      <button onClick={() => { const c = [...wefts]; c[i].type = "D"; setWefts(c) }} style={{ flex: 1, padding: "10px", borderRadius: "6px", background: w.type === "D" ? "var(--accent-cyan)" : "transparent", color: w.type === "D" ? "var(--bg-deep)" : "white", fontSize: "12px", fontWeight: "700" }}>D (Denier)</button>
                      <button onClick={() => { const c = [...wefts]; c[i].type = "C"; setWefts(c) }} style={{ flex: 1, padding: "10px", borderRadius: "6px", background: w.type === "C" ? "var(--accent-cyan)" : "transparent", color: w.type === "C" ? "var(--bg-deep)" : "white", fontSize: "12px", fontWeight: "700" }}>C (Count)</button>
                    </div>
                    <label style={{ fontSize: "10px", color: "var(--text-secondary)", display: "block", marginBottom: "4px", marginLeft: "2px" }}>{w.type === 'D' ? 'Denier' : 'Count'}</label>
                    <input value={w.value} onChange={e => { const c = [...wefts]; c[i].value = e.target.value; setWefts(c); }} style={{ fontSize: "14px", marginTop: "0" }} type="number" />
                  </div>

                  <div>
                    <label style={{ fontSize: "10px", color: "var(--text-secondary)", display: "block", marginBottom: "4px", marginLeft: "2px" }}>Rate</label>
                    <input value={w.rate} onChange={e => { const c = [...wefts]; c[i].rate = e.target.value; setWefts(c); }} style={{ fontSize: "14px", marginTop: "0" }} type="number" />
                  </div>
                </div>

                {/* Individual Weft Results */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
                  <div style={{ padding: "8px 12px", background: "rgba(0, 210, 255, 0.03)", borderRadius: "8px", border: "1px solid rgba(0, 210, 255, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Weft Weight (100m)</span>
                    <span style={{ color: "var(--accent-blue)", fontWeight: "700", fontSize: "12px" }}>{weftResults[i].weight100m.toFixed(3)} kg</span>
                  </div>
                  <div style={{ padding: "8px 12px", background: "rgba(0, 210, 255, 0.03)", borderRadius: "8px", border: "1px solid rgba(0, 210, 255, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Weft Cost per Meter</span>
                    <span style={{ color: "var(--accent-blue)", fontWeight: "700", fontSize: "12px" }}>₹ {weftResults[i].costPerM.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addWeft} style={{ width: "100%", marginTop: "15px", padding: "12px", background: "transparent", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "12px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>+ Add Weft Yarn</button>

          <div style={{ marginTop: "15px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Weft Shortage %</label>
            <input value={weftShortage} onChange={e => setWeftShortage(e.target.value)} type="number" placeholder="10" />
          </div>
        </div>

        {/* Khata Kharch Section */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", color: "var(--accent-cyan)", marginBottom: "15px" }}>💰 Additional Costs</h3>
          <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Khata Kharch (₹ / meter)</label>
          <input value={khataKharch} onChange={e => setKhataKharch(e.target.value)} type="number" placeholder="10" />
        </div>


        {/* Calculation Results Panel */}
        <div className="glass-panel" style={{ padding: "24px", background: "rgba(10, 25, 47, 0.9)", border: "2px solid var(--accent-cyan)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, padding: "8px 15px", background: "var(--accent-cyan)", color: "var(--bg-deep)", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", borderBottomLeftRadius: "12px" }}>Live Results</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Total Weight (100m)</span>
              <span style={{ fontWeight: "700", fontSize: "16px", color: "white" }}>{totalWeight100m.toFixed(3)} kg</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Net Cost / Meter</span>
              <span style={{ fontWeight: "700", fontSize: "16px", color: "white" }}>₹ {netCost.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>GST Yarn Credit</span>
              <span style={{ fontWeight: "700", fontSize: "16px", color: "white" }}>₹ {gstCredit.toFixed(2)}</span>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "5px 0" }}></div>

            <div style={{ textAlign: "center", padding: "15px", background: "rgba(100, 255, 218, 0.05)", borderRadius: "16px", border: "1px solid rgba(100, 255, 218, 0.1)" }}>
              <p style={{ fontSize: "11px", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>Cash Cost per Meter</p>
              <h2 style={{ fontSize: "48px", margin: "10px 0", color: "var(--accent-cyan)", fontWeight: "800", textShadow: "0 0 20px rgba(100, 255, 218, 0.3)" }}>₹ {netCost.toFixed(2)}</h2>
            </div>

            {/* Price & Profit Integrated Into Results */}
            <div style={{ marginTop: "15px", padding: "18px", background: "rgba(46, 204, 113, 0.05)", borderRadius: "20px", border: "1px solid rgba(46, 204, 113, 0.15)" }}>
              <label style={{ fontSize: "11px", color: "#2ecc71", textTransform: "uppercase", fontWeight: "900", display: "block", marginBottom: "8px", letterSpacing: "1px" }}>Sale Price per Meter (₹)</label>
              <input
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                type="number"
                placeholder="Enter Sale Price"
                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2ecc71", color: "white", borderRadius: "12px", fontSize: "15px", fontWeight: "600" }}
              />

              {salePrice && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px", borderTop: "1px solid rgba(46, 204, 113, 0.1)", paddingTop: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Profit per Meter</span>
                    <span style={{ fontWeight: "900", fontSize: "20px", color: profit >= 0 ? "#2ecc71" : "#ff4d4d", textShadow: "0 0 10px rgba(46, 204, 113, 0.2)" }}>₹ {profit.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Margin (%)</span>
                    <span style={{ fontWeight: "700", color: "#2ecc71" }}>{margin.toFixed(2)}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Profit per Pick</span>
                    <span style={{ fontWeight: "700", color: "#2ecc71" }}>₹ {perPick.toFixed(4)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Buttons */}
      <div style={{ position: "fixed", bottom: "25px", left: "20px", right: "20px", display: "flex", gap: "12px", zIndex: 100 }}>
        <button onClick={resetCalculator} className="btn-secondary" style={{ width: "100%", boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}>Reset</button>
      </div>

      {/* Admin Add Quality Modal */}
      {showAddQuality && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", padding: "20px", zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: "100%", padding: "25px", border: "1px solid var(--accent-cyan)" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--accent-cyan)" }}>Add New Preset</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input placeholder="Quality Name" value={newQuality.name} onChange={e => setNewQuality({ ...newQuality, name: e.target.value })} />

              <div style={{ display: "flex", gap: "12px" }}>
                <input placeholder="Taar" value={newQuality.ends} onChange={e => setNewQuality({ ...newQuality, ends: e.target.value })} type="number" style={{ flex: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "2px", marginBottom: "5px" }}>
                    {['D', 'C'].map(t => (
                      <button key={t} onClick={() => setNewQuality({ ...newQuality, warpType: t })} style={{ flex: 1, padding: "4px", fontSize: "10px", borderRadius: "6px", background: newQuality.warpType === t ? "var(--accent-cyan)" : "transparent", color: newQuality.warpType === t ? "#0a192f" : "white", border: "none" }}>{t}</button>
                    ))}
                  </div>
                  <input placeholder={newQuality.warpType === 'D' ? "Warp Denier" : "Warp Count"} value={newQuality.count} onChange={e => setNewQuality({ ...newQuality, count: e.target.value })} type="number" />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "2px", marginBottom: "5px" }}>
                    {['D', 'C'].map(t => (
                      <button key={t} onClick={() => setNewQuality({ ...newQuality, weftType: t })} style={{ flex: 1, padding: "4px", fontSize: "10px", borderRadius: "6px", background: newQuality.weftType === t ? "var(--accent-cyan)" : "transparent", color: newQuality.weftType === t ? "#0a192f" : "white", border: "none" }}>{t}</button>
                    ))}
                  </div>
                  <input placeholder={newQuality.weftType === 'D' ? "Weft Denier" : "Weft Count"} value={newQuality.weftCount} onChange={e => setNewQuality({ ...newQuality, weftCount: e.target.value })} type="number" />
                </div>
                <input placeholder="Pick" value={newQuality.pick} onChange={e => setNewQuality({ ...newQuality, pick: e.target.value })} type="number" style={{ flex: 1, alignSelf: "flex-end" }} />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <input placeholder="Panno" value={newQuality.panno} onChange={e => setNewQuality({ ...newQuality, panno: e.target.value })} type="number" style={{ width: "48%" }} />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
                <button onClick={() => setShowAddQuality(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button
                  onClick={() => {
                    if (newQuality.name) {
                      setQualities({ ...qualities, [newQuality.name]: { ...newQuality } });
                      setShowAddQuality(false);
                      setNewQuality({ name: "", ends: "", count: "", warpType: "C", weftCount: "", weftType: "C", pick: "", panno: "" });
                    }
                  }}
                  className="btn-primary" style={{ flex: 2 }}
                >Save Preset</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "12px", color: "#00d2ff", fontWeight: "600", letterSpacing: "1px", paddingBottom: "20px", textShadow: "0 0 10px rgba(0, 210, 255, 0.6)" }}>
        Powered by :- Sahjanand Automation
      </div>
    </div>
  );
}
