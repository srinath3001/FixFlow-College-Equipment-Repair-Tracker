// FixFlow - All Complaints List Page
// Demonstrates useReducer for filter state, useDebounce for search, backend pagination, and cursor pagination.

import React, { useReducer, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  RotateCcw,
  PlusCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Compass,
} from "lucide-react";
import { useComplaints } from "../hooks/useComplaints.js";
import { useDebounce } from "../hooks/useDebounce.js";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import PriorityBadge from "../components/ui/PriorityBadge.jsx";
import { SkeletonTable } from "../components/feedback/LoadingSkeleton.jsx";
import complaintService from "../services/complaintService.js";

// Initial state for useReducer
const initialFilterState = {
  search: "",
  status: "ALL",
  priority: "ALL",
  category: "ALL",
  sort: "newest",
  page: 1,
  limit: 8,
};

// Reducer function handling state transitions
function filterReducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload, page: 1 };
    case "SET_STATUS":
      return { ...state, status: action.payload, page: 1 };
    case "SET_PRIORITY":
      return { ...state, priority: action.payload, page: 1 };
    case "SET_CATEGORY":
      return { ...state, category: action.payload, page: 1 };
    case "SET_SORT":
      return { ...state, sort: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "RESET_FILTERS":
      return { ...initialFilterState };
    default:
      return state;
  }
}

export function ComplaintsListPage() {
  // 1. useReducer for comprehensive filter & pagination state
  const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);

  // 2. useDebounce hook for non-blocking search typing
  const debouncedSearch = useDebounce(filterState.search, 400);

  // 3. Optional cursor-based pagination demo toggle (Section 15 syllabus requirement)
  const [showCursorDemo, setShowCursorDemo] = useState(false);
  const [cursorData, setCursorData] = useState(null);
  const [cursorLoading, setCursorLoading] = useState(false);

  // Fetch complaints using custom React Query hook with background polling
  const { data, isLoading, isError, error } = useComplaints(
    {
      page: filterState.page,
      limit: filterState.limit,
      search: debouncedSearch,
      status: filterState.status,
      priority: filterState.priority,
      category: filterState.category,
      sort: filterState.sort,
    },
    { polling: true }
  );

  const complaints = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 8,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Cursor pagination trigger
  const handleFetchCursor = async (cursor = null) => {
    setCursorLoading(true);
    try {
      const res = await complaintService.getComplaintsCursor({ limit: 5, cursor });
      setCursorData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCursorLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Controls: Search and Filters */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Search
              size={17}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 38 }}
              placeholder="Search by reference, equipment name, title, room..."
              value={filterState.search}
              onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {/* Status Filter */}
            <select
              className="form-control"
              style={{ width: "auto", minWidth: 130 }}
              value={filterState.status}
              onChange={(e) => dispatch({ type: "SET_STATUS", payload: e.target.value })}
              aria-label="Filter by status"
            >
              <option value="ALL">Status: All</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              className="form-control"
              style={{ width: "auto", minWidth: 130 }}
              value={filterState.priority}
              onChange={(e) => dispatch({ type: "SET_PRIORITY", payload: e.target.value })}
              aria-label="Filter by priority"
            >
              <option value="ALL">Priority: All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            {/* Category Filter */}
            <select
              className="form-control"
              style={{ width: "auto", minWidth: 140 }}
              value={filterState.category}
              onChange={(e) => dispatch({ type: "SET_CATEGORY", payload: e.target.value })}
              aria-label="Filter by category"
            >
              <option value="ALL">Category: All</option>
              <option value="LAPTOP">Laptop</option>
              <option value="PROJECTOR">Projector</option>
              <option value="PRINTER">Printer</option>
              <option value="COMPUTER">Computer</option>
              <option value="ROUTER">Router</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Sort Order */}
            <select
              className="form-control"
              style={{ width: "auto", minWidth: 130 }}
              value={filterState.sort}
              onChange={(e) => dispatch({ type: "SET_SORT", payload: e.target.value })}
              aria-label="Sort order"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => dispatch({ type: "RESET_FILTERS" })}
              className="btn btn-secondary btn-sm"
              title="Reset all filters"
            >
              <RotateCcw size={14} /> Clear
            </button>

            {/* Cursor Demo Toggle Button */}
            <button
              onClick={() => {
                setShowCursorDemo(!showCursorDemo);
                if (!cursorData) handleFetchCursor();
              }}
              className="btn btn-ghost btn-sm"
              title="Demonstrate cursor pagination endpoint"
              style={{ color: "var(--accent-secondary)" }}
            >
              <Compass size={14} /> {showCursorDemo ? "Hide Cursor Demo" : "Cursor API Demo"}
            </button>
          </div>
        </div>

        {/* Cursor Pagination Drawer (Section 15 syllabus feature) */}
        {showCursorDemo && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(6, 182, 212, 0.06)",
              border: "1px dashed var(--accent-secondary)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent-secondary)" }}>
                ⚡ Syllabus Concept Demo: Cursor-Based Pagination (`GET /api/complaints/cursor`)
              </div>
              <button
                onClick={() => handleFetchCursor(cursorData?.nextCursor)}
                disabled={!cursorData?.hasMore || cursorLoading}
                className="btn btn-cyan btn-sm"
              >
                {cursorLoading ? "Loading..." : cursorData?.hasMore ? "Fetch Next Cursor Batch" : "No More Cursors"}
              </button>
            </div>

            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 8 }}>
              Cursor pagination relies on a unique index pointer (ID) instead of OFFSET, preventing duplicate/skipped items in rapid real-time feeds.
            </p>

            {cursorData && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Next Cursor ID: <code style={{ color: "#A78BFA" }}>{cursorData.nextCursor || "null"}</code> | Loaded items: {cursorData.data?.length || 0}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Complaints Table */}
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : isError ? (
          <div style={{ padding: 36, textAlign: "center" }}>
            <div style={{ color: "#F87171", fontWeight: 600, marginBottom: 8 }}>
              Unable to load complaints from server
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {error?.message || "Please check that PostgreSQL is running and server/.env credentials are set."}
            </p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Filter size={24} />
            </div>
            <div className="empty-state-title">No matching complaints found</div>
            <div className="empty-state-desc">
              Try adjusting your search query, status filters, or clear all filters to see existing complaints.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => dispatch({ type: "RESET_FILTERS" })}
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
              <Link to="/complaints/new" className="btn btn-primary btn-sm">
                <PlusCircle size={15} /> Report New Fault
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket Reference</th>
                  <th>Equipment & Fault</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link
                        to={`/complaints/${c.id}`}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          color: "var(--accent-primary-light)",
                        }}
                      >
                        {c.reference}
                      </Link>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {new Date(c.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {c.equipmentName} {c.assetLabel ? `[${c.assetLabel}]` : ""}
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {c.equipmentCategory}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                        {c.room}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {c.building}
                      </div>
                    </td>

                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td>
                      <StatusBadge status={c.status} />
                    </td>

                    <td>
                      {c.technician ? (
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                            {c.technician.name}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {c.technician.specialization}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/complaints/${c.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "5px 10px" }}
                      >
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && complaints.length > 0 && (
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid var(--border-subtle)",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Showing page <strong style={{ color: "#FFFFFF" }}>{pagination.page}</strong> of{" "}
              <strong style={{ color: "#FFFFFF" }}>{pagination.totalPages}</strong> (
              {pagination.totalRecords} total complaints)
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => dispatch({ type: "SET_PAGE", payload: pagination.page - 1 })}
                disabled={!pagination.hasPrevPage}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                onClick={() => dispatch({ type: "SET_PAGE", payload: pagination.page + 1 })}
                disabled={!pagination.hasNextPage}
                className="btn btn-secondary btn-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintsListPage;
