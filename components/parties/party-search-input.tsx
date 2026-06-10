"use client";

import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
        setResults(found.filter((r) => !excludeIds.includes(r.partyId)));
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

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        value={query}
        placeholder={placeholder ?? "Search…"}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-brand-sm border border-brand-border bg-white shadow-lg">
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
            <div className="px-3 py-2.5 text-[13px] text-brand-text-3">
              No matches found
            </div>
          ) : (
            results.map((r) => (
              <button
                key={r.partyId}
                type="button"
                className="block w-full cursor-pointer px-3 py-2 text-left hover:bg-brand-surface"
                onClick={() => handleSelect(r)}
              >
                <div className="text-[13px] font-medium">{r.name}</div>
                {r.detail && (
                  <div className="text-[11px] text-brand-text-3">{r.detail}</div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
