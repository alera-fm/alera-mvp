"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, User, Music, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/types/admin";

export function AdminQuickSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "user") {
      router.push(`/admin/dashboard/users/${result.id}`);
    } else if (result.type === "release") {
      router.push(`/admin/dashboard/release-management`);
    }
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for users or releases..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 h-11"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}-${index}`}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left border-b border-border last:border-b-0"
            >
              <div className="mt-1">
                {result.type === "user" ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Music className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {result.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {result.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen &&
        results.length === 0 &&
        !isLoading &&
        query.trim().length >= 2 && (
          <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">No results found</p>
          </div>
        )}
    </div>
  );
}
