"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { searchPartiesAction } from "@/lib/actions/client-actions";
import type { PartySearchResult, UiPartyType } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Debounced search-as-you-type picker over existing parties of a given type. */
export function PartySearchInput({
  type,
  placeholder,
  onSelect,
  excludeIds = [],
  className,
}: {
  type: UiPartyType;
  placeholder?: string;
  onSelect: (result: PartySearchResult) => void;
  excludeIds?: string[];
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PartySearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const path = e.composedPath();
      const inside =
        path.some(
          (node) =>
            node instanceof Element &&
            (node.hasAttribute("data-party-search-dropdown") ||
              inputRef.current?.contains(node))
        ) ?? false;
      if (!inside) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      requestSeqRef.current += 1;
      setResults([]);
      setSearching(false);
      setOpen(false);
      return;
    }

    // Open immediately with a loading state so the user sees feedback while
    // the debounce and the search round-trip are in flight.
    setOpen(true);
    setSearching(true);

    debounceRef.current = setTimeout(async () => {
      const seq = ++requestSeqRef.current;
      try {
        const found = await searchPartiesAction(type, value);
        if (seq !== requestSeqRef.current) return; // stale response
        const seen = new Set<string>();
        setResults(
          found.filter((r) => {
            if (excludeIds.includes(r.partyId) || seen.has(r.partyId)) return false;
            seen.add(r.partyId);
            return true;
          })
        );
      } finally {
        if (seq === requestSeqRef.current) setSearching(false);
      }
    }, 200);
  };

  const handleSelect = (result: PartySearchResult) => {
    onSelect(result);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const selectResult = (e: React.PointerEvent, result: PartySearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelect(result);
  };

  const dropdown =
    open && position ? (
      <div
        ref={dropdownRef}
        data-party-search-dropdown
        className="pointer-events-auto fixed z-[200] max-h-48 overflow-y-auto rounded-brand-sm border border-brand-border bg-white shadow-lg"
        style={{ top: position.top, left: position.left, width: position.width }}
      >
        {searching ? (
          <div className="space-y-2.5 px-3 py-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="px-3 py-2.5 text-[13px] text-brand-text-3">No matches found</div>
        ) : (
          results.map((r) => (
            <button
              key={r.partyId}
              type="button"
              data-party-search-result
              className="pointer-events-auto block w-full cursor-pointer px-3 py-2 text-left hover:bg-brand-surface"
              onPointerDown={(e) => selectResult(e, r)}
            >
              <div className="text-[13px] font-medium">{r.name}</div>
              {r.detail && <div className="text-[11px] text-brand-text-3">{r.detail}</div>}
            </button>
          ))
        )}
      </div>
    ) : null;

  return (
    <div className={cn(className)}>
      <div ref={inputRef}>
        <Input
          value={query}
          placeholder={placeholder ?? "Search…"}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || searching) {
              setOpen(true);
              updatePosition();
            }
          }}
        />
      </div>
      {typeof document !== "undefined" && dropdown ? createPortal(dropdown, document.body) : null}
    </div>
  );
}
