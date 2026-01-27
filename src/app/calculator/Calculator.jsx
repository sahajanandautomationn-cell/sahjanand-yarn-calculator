"use client";
import { useState, useEffect } from "react";
import "./calculator.css";

const defaultQualities = {
  "Chandari 63": { ends: 7200, count: 63, pick: 92, panno: 46 },
  "Berlin 58": { ends: 6800, count: 58, pick: 88, panno: 44 },
  "Cotton 40": { ends: 6400, count: 40, pick: 72, panno: 40 }
};
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}


export default function Calculator() {
  
  const [quality, setQuality] = useState("");
  const [qualities, setQualities] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qualities");
      return saved ? JSON.parse(saved) : defaultQualities;
    }
    return defaultQualities;
  });
  const [deviceBlocked, setDeviceBlocked] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddQuality, setShowAddQuality] = useState(false);
  const [newQuality, setNewQuality] = useState({
    name: "",
    ends: "",
    wrapCount: "",
    weftCount: "",
    pick: "",
    panno: ""
  });

  const [warpEnds, setWarpEnds] = useState("");
  const [warpType, setWarpType] = useState("Count");
  const [warpCount, setWarpCount] = useState("");
  const [weftCount, setweftCount] = useState("");
  const [warpRate, setWarpRate] = useState("");
  const [warpShortage, setWarpShortage] = useState(10);

  const [pick, setPick] = useState("");
  const [panno, setPanno] = useState("");
  const [weftShortage, setWeftShortage] = useState(10);

  const [wefts, setWefts] = useState([
    { name: "", type: "Count", value: "", rate: "" }
  ]);

  const [khataKharch, setKhataKharch] = useState(10);
  const [pricingMode, setPricingMode] = useState("none");
  const [salePrice, setSalePrice] = useState("");
  useEffect(() => {
  localStorage.setItem("qualities", JSON.stringify(qualities));
  }, [qualities]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []); 

  
  useEffect(() => {
    const currentDevice = getDeviceId();
    const savedDevice = localStorage.getItem("licensed_device");

    if (!savedDevice) {
      localStorage.setItem("licensed_device", currentDevice);
    } else if (savedDevice !== currentDevice) {
      setDeviceBlocked(true);
    }
  }, []);
  if (deviceBlocked) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>🔒 Access Restricted</h2>
        <p>This calculator is licensed to one device only.</p>
        <p>Contact <b>Sahjanand Automation</b> for activation.</p>
      </div>
    );
  }



  function selectQuality(name) {
    const q = qualities[name];
    setQuality(name);
    setWarpEnds(q.ends);
    setWarpCount(q.wrapCount);
    setWeftCount(q.weftCount);
    setPick(q.pick);
    setPanno(q.panno);
  }

  function addWeft() {
    setWefts([...wefts, { name: "", type: "Count", value: "", rate: "" }]);
  }

  function removeWeft(index) {
    const copy = [...wefts];
    copy.splice(index, 1);
    setWefts(copy);
  }
  function resetCalculator() {
    setQuality("");
    setWarpEnds("");
    setWarpType("Count");
    setWarpCount("");
    setWarpRate("");
    setWarpShortage(10);

    setPick("");
    setPanno("");
    setWeftShortage(10);

    setWefts([{ name: "", type: "Count", value: "", rate: "" }]);

    setKhataKharch(10);

    // If pricing section exists
    setPricingMode("none");
    setSalePrice("");
  }

  return (
    <div className="page">
      <div className="title-card">
        <div className="title-main">SAHJANAND</div>
        <div className="title-sub">Yarn Calculator</div>
      </div>


      <div className="card">
        <h2>⚡ Quick Select Quality</h2>
        <div className="quality-grid">

          {Object.keys(qualities).map(q => (
            <div key={q} className="quality-chip">
              <button onClick={() => selectQuality(q)}>
                {q}
              </button>

              <span
                className="quality-delete"
                onClick={() => {
                  if (confirmDelete === q) {
                    const copy = { ...qualities };
                    delete copy[q];
                    setQualities(copy);
                    setConfirmDelete(null);
                  } else {
                    setConfirmDelete(q);
                    setTimeout(() => setConfirmDelete(null), 3000);
                  }
                }}
              >
                {confirmDelete === q ? "!" : "✕"}
              </span>
            </div>
          ))}

          {/* ➕ ADD BUTTON – ADD THIS */}
          <div
            className="quality-chip add-chip"
            onClick={() => setShowAddQuality(true)}
          >
            +
          </div>

        </div>



      </div>
      {showAddQuality && (
        <div className="quality-modal">
          <div className="quality-modal-box">
            <h3>Add New Quality</h3>

            <input
              placeholder="Quality Name"
              value={newQuality.name}
              onChange={e => setNewQuality({ ...newQuality, name: e.target.value })}
            />

            <input
              placeholder="Total Ends"
              value={newQuality.ends}
              onChange={e => setNewQuality({ ...newQuality, ends: e.target.value })}
            />

            <input
              placeholder="Wrap Count"
              value={newQuality.WrapCount}
              onChange={e => setNewQuality({ ...newQuality, wrapcount: e.target.value })}
            />

            <input
              placeholder="weft Count"
              value={newQuality.WeftCount}
              onChange={e => setNewQuality({ ...newQuality, weftcount: e.target.value })}
            />

            <input
              placeholder="Pick"
              value={newQuality.pick}
              onChange={e => setNewQuality({ ...newQuality, pick: e.target.value })}
            />

            <input
              placeholder="Panno"
              value={newQuality.panno}
              onChange={e => setNewQuality({ ...newQuality, panno: e.target.value })}
            />

            <div className="modal-buttons">
              <button
                onClick={() => {
                  if (!newQuality.name) return;

                  setQualities({
                    ...qualities,
                    [newQuality.name]: {
                      ends: Number(newQuality.ends),
                      count: Number(newQuality.count),
                      pick: Number(newQuality.pick),
                      panno: Number(newQuality.panno),
                    },
                  });

                  setShowAddQuality(false);
                  setNewQuality({ name: "", ends: "", count: "", pick: "", panno: "" });
                }}
              >
                Save
              </button>

              <button onClick={() => setShowAddQuality(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="quality-box">
          <h2>✨ Quality Name</h2>
          <input value={quality} placeholder="Selected from Quick Quality" readOnly />
        </div>

        <h2>Warp Details</h2>

        <label>Total Ends (Taar)</label>
        <input value={warpEnds} onChange={e => setWarpEnds(e.target.value)} />

        <label>Denier / Count</label>
        <div className="toggle-row">
          <div className="toggle">
            <button className={warpType === "D" ? "active" : ""} onClick={() => setWarpType("D")}>D</button>
            <button className={warpType === "Count" ? "active" : ""} onClick={() => setWarpType("Count")}>Count</button>
          </div>
          <input
            placeholder={warpType === "D" ? "Enter Denier" : "Enter Count"}
            value={warpCount}
            onChange={e => setWarpCount(e.target.value)}
          />
        </div>

        <label>Warp Rate (₹ / kg)</label>
        <input value={warpRate} onChange={e => setWarpRate(e.target.value)} />

        <div className="shortage-box">
          <label>Warp Shortage (%)</label>
          <input value={warpShortage} onChange={e => setWarpShortage(e.target.value)} />
          <small>Default 10% – adjusts warp yarn waste</small>
        </div>
      </div>

      <div className="card">
        <h2>Weft Details</h2>

        <label>Pick (per inch)</label>
        <input value={pick} onChange={e => setPick(e.target.value)} />

        <label>Panno (inch)</label>
        <input value={panno} onChange={e => setPanno(e.target.value)} />

        {wefts.map((w, i) => (
          <div className="weft-box" key={i}>
            <div className="weft-head">
              Weft {i + 1}
              {wefts.length > 1 && (
                <button className="remove" onClick={() => removeWeft(i)}>✕</button>
              )}
            </div>

            <label>Weft Name (Optional)</label>
            <input
              placeholder="e.g. 30 Staple, 150 Lychee"
              value={w.name}
              onChange={e => {
                const copy = [...wefts];
                copy[i].name = e.target.value;
                setWefts(copy);
              }}
            />

            <label>Denier / Count</label>
            <div className="toggle-row">
              <div className="toggle">
                <button className={w.type === "D" ? "active" : ""} onClick={() => {
                  const copy = [...wefts];
                  copy[i].type = "D";
                  setWefts(copy);
                }}>D</button>

                <button className={w.type === "Count" ? "active" : ""} onClick={() => {
                  const copy = [...wefts];
                  copy[i].type = "Count";
                  setWefts(copy);
                }}>Count</button>
              </div>

              <input
                placeholder="Enter value"
                value={w.value}
                onChange={e => {
                  const copy = [...wefts];
                  copy[i].value = e.target.value;
                  setWefts(copy);
                }}
              />
            </div>

            <label>Rate (₹ / kg)</label>
            <input
              placeholder="Enter rate"
              value={w.rate}
              onChange={e => {
                const copy = [...wefts];
                copy[i].rate = e.target.value;
                setWefts(copy);
              }}
            />
          </div>
        ))}

        <button className="add-weft" onClick={addWeft}>+ Add Weft Yarn</button>

        <div className="shortage-box">
          <label>Weft Shortage (%)</label>
          <input value={weftShortage} onChange={e => setWeftShortage(e.target.value)} />
          <small>Default 10% – adjusts weft yarn waste</small>
        </div>
      </div>

      {/* 🔥 ADDITIONAL COSTS */}
      <div className="card additional">
        <h2>💰 Additional Costs</h2>
        <label>Khata Kharch (₹ / meter)</label>
        <input value={khataKharch} onChange={e => setKhataKharch(e.target.value)} />
      </div>

      {/* ================= CALCULATION RESULTS ================= */}
      <div className="card results">

        <h2>📊 Calculation Results</h2>
        <div className="result-quality">Quality: {quality || "—"}</div>

        {/* -------- WARP -------- */}
        <div className="result-section">
          <h3>🧵 WARP</h3>

          {(() => {
            const denierUsed = warpType === "Count" && warpCount
              ? 5315 / warpCount
              : Number(warpCount || 0);

            const warpWeight100m =
              (warpEnds * denierUsed * 100) / 9000000 *
              (1 + warpShortage / 100);

            const warpCostPerM =
              warpRate && warpWeight100m
                ? (warpWeight100m / 100) * warpRate
                : 0;

            return (
              <>
                <div className="row"><span>Denier Used</span><span>{denierUsed.toFixed(2)} D</span></div>
                <div className="row"><span>Warp Yarn Weight (per 100m)</span><span>{warpWeight100m.toFixed(3)} kg</span></div>
                <div className="row"><span>Cost per Meter</span><span>₹{warpCostPerM.toFixed(3)}</span></div>
              </>
            );
          })()}
        </div>

        {/* -------- WEFTS -------- */}
        {wefts.map((w, i) => {
          const weftDenier = w.type === "Count" && w.value
            ? 5315 / w.value
            : Number(w.value || 0);

          const effectivePick = pick * (1 + weftShortage / 100);

          const weftWeight100m =
            (effectivePick * panno * weftDenier * 100) / 9000000;

          const weftCostPerM =
            w.rate && weftWeight100m
              ? (weftWeight100m / 100) * w.rate
              : 0;

          return (
            <div className="result-section" key={i}>
              <h3>🧶 {w.name || `Weft ${i + 1}`}</h3>

              <div className="row"><span>Denier Used</span><span>{weftDenier.toFixed(2)} D</span></div>
              <div className="row"><span>Effective Pick (per inch)</span><span>{effectivePick.toFixed(2)}</span></div>
              <div className="row"><span>Weft Yarn Weight (per 100m)</span><span>{weftWeight100m.toFixed(3)} kg</span></div>
              <div className="row"><span>Cost per Meter</span><span>₹{weftCostPerM.toFixed(3)}</span></div>
            </div>
          );
        })}

        {/* -------- SUMMARY -------- */}
        {(() => {
          const warpDenier = warpType === "Count" && warpCount
            ? 5315 / warpCount
            : Number(warpCount || 0);

          const warpWeight100m =
            (warpEnds * warpDenier * 100) / 9000000 *
            (1 + warpShortage / 100);

          let totalWeftWeight100m = 0;
          let totalWeftCostPerM = 0;

          wefts.forEach(w => {
            const d = w.type === "Count" && w.value ? 5315 / w.value : Number(w.value || 0);
            const ew = (pick * (1 + weftShortage / 100) * panno * d * 100) / 9000000;
            totalWeftWeight100m += ew;
            totalWeftCostPerM += w.rate ? (ew / 100) * w.rate : 0;
          });

          const warpCostPerM =
            warpRate ? (warpWeight100m / 100) * warpRate : 0;

          const totalWeight100m = warpWeight100m + totalWeftWeight100m;
          const yarnCost = warpCostPerM + totalWeftCostPerM;
          const netCost = yarnCost + Number(khataKharch || 0);
          const gstCredit = yarnCost * 0.05;
          const exGST = netCost - gstCredit;

          return (
            <>
              <div className="result-section">
                <h3>📦 PER METER SUMMARY</h3>
                <div className="row"><span>Total Weight (per 100m)</span><span>{totalWeight100m.toFixed(3)} kg</span></div>
                <div className="row bold"><span>Total Yarn Cost</span><span>₹{yarnCost.toFixed(3)}</span></div>
                <div className="row"><span>Khata Kharch</span><span>₹{Number(khataKharch).toFixed(2)}</span></div>
                <div className="row bold"><span>Net Cost per Meter</span><span>₹{netCost.toFixed(3)}</span></div>
              </div>

              <div className="result-section">
                <h3>💸 GST SUMMARY</h3>
                <div className="row"><span>Yarn Cost (ex GST)</span><span>₹{(yarnCost - gstCredit).toFixed(3)}</span></div>
                <div className="row"><span>GST Credit on Yarn</span><span>₹{gstCredit.toFixed(3)}</span></div>
                <div className="row bold"><span>Total Cost ex GST(Yarn + Khata)</span><span>₹{exGST.toFixed(3)}</span></div>
              </div>

              <div className="final-box">
                <div className="final-title">Cash Cost Per Meter</div>
                <div className="final-value">{netCost.toFixed(2)}</div>
              </div>
            </>
          );
        })()}
      </div>
      {/* ================= PRICING & PROFIT ================= */}
      {(() => {
        const warpDenier = warpType === "Count" && warpCount
          ? 5315 / warpCount
          : Number(warpCount || 0);

        const warpWeight100m =
          (warpEnds * warpDenier * 100) / 9000000 * (1 + warpShortage / 100);

        let totalWeftCostPerM = 0;

        wefts.forEach(w => {
          const d = w.type === "Count" && w.value ? 5315 / w.value : Number(w.value || 0);
          const wgt = (pick * (1 + weftShortage / 100) * panno * d * 100) / 9000000;
          totalWeftCostPerM += w.rate ? (wgt / 100) * w.rate : 0;
        });

        const warpCostPerM = warpRate ? (warpWeight100m / 100) * warpRate : 0;
        const yarnCost = warpCostPerM + totalWeftCostPerM;
        const netCost = yarnCost + Number(khataKharch || 0);
        const gstCredit = yarnCost * 0.05;

        return (
          <div className="card pricing">
            <h2>💵 Pricing & Profit (Optional)</h2>

            <div className="pricing-toggle">
              <button
                className={pricingMode === "none" ? "active" : ""}
                onClick={() => setPricingMode("none")}
              >
                None
              </button>
              <button
                className={pricingMode === "sale" ? "active" : ""}
                onClick={() => setPricingMode("sale")}
              >
                Sale Price
              </button>
            </div>

            {pricingMode === "sale" && (
              <>
                <label>Sale Price per Meter (₹)</label>
                <input
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                />

                {(() => {
                  const saleExGST = Number(salePrice || 0);
                  const gstOnSale = saleExGST * 0.05;
                  const invoiceAmount = saleExGST + gstOnSale;

                  const cost = yarnCost + Number(khataKharch || 0);

                  const profit = saleExGST - cost;
                  const margin = saleExGST ? (profit / saleExGST) * 100 : 0;
                  const perPick = pick ? profit / pick : 0;

                  return (
                    <div className="profit-box">
                      <div>Sale Price (ex GST): ₹{saleExGST.toFixed(2)}</div>
                      <div>Invoice Amount (incl GST): ₹{invoiceAmount.toFixed(2)}</div>
                      <div>GST on Sale (5%): ₹{gstOnSale.toFixed(2)}</div>
                      <div>GST Credit on Yarn: ₹0.00</div>
                      <div>Net GST Payable: ₹{gstOnSale.toFixed(2)}</div>
                      <div>Cost (Yarn + Khata): ₹{cost.toFixed(2)}</div>

                      <div className="final-profit">₹ {profit.toFixed(2)}</div>
                      <div>Final Profit per Meter</div>

                      <div className="profit-footer">
                        Per Pick: {perPick.toFixed(2)} paisa | Margin: {margin.toFixed(2)}%
                      </div>
                    </div>
                  );
                })()}

              </>
            )}
          </div>
        );
      })()}
      <button className="reset-btn"onClick={resetCalculator}> 🔄 Reset Calculator</button>

    </div>
  );
}
