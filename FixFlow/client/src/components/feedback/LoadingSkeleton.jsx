// FixFlow - Loading Skeleton Placeholders
// Displays placeholder animations while data is being fetched.

import React from "react";

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 120, height: 16 }} />
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }} />
      </div>
      <div className="skeleton" style={{ width: 80, height: 32, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 160, height: 14 }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="skeleton" style={{ width: 70, height: 14 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div
                    className="skeleton"
                    style={{
                      width: c === 1 ? 160 : c === 0 ? 80 : 100,
                      height: 16,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="skeleton" style={{ width: 140, height: 24, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: "70%", height: 32, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: "40%", height: 16, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 80 }} />
        <div className="skeleton" style={{ height: 80 }} />
      </div>
      <div className="skeleton" style={{ height: 140 }} />
    </div>
  );
}
