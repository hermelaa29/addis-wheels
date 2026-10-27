"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCarsSWR, useDebounce } from "@/lib/useSWRData";
import { useFilterStore } from "@/lib/store";
import { useIsMounted } from "@/lib/useStorage";
import { CarCard } from "@/components/CarCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeafletMap } from "@/components/LeafletMap";
import {
  Search,
  MapPin,
  X,
  Map,
  Grid,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CarCataloguePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMounted = useIsMounted();

  // Search & Filter State initialized from URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [neighbourhood, setNeighbourhood] = useState(searchParams.get("neighbourhood") || "all");
  const [transmission, setTransmission] = useState(searchParams.get("transmission") || "all");
  const [seats, setSeats] = useState<number>(Number(searchParams.get("seats")) || 0);
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Sync state to URL
  const updateUrlParams = (updates: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === "all" || val === 0) {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });
    router.replace(`/cars?${current.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setNeighbourhood("all");
    setTransmission("all");
    setSeats(0);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setCurrentPage(1);
    router.replace("/cars", { scroll: false });
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // SWR Caching & Debounced Search
  const { cars: allCars, isLoading: isCarsLoading } = useCarsSWR();
  const debouncedSearch = useDebounce(searchTerm, 250);

  // Filter approved cars from SWR cache
  const allApprovedCars = useMemo(() => {
    return allCars.filter((c) => c.status === "approved");
  }, [allCars]);

  // Filter & sort
  const filteredCars = useMemo(() => {
    let result = [...allApprovedCars];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.make.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.neighbourhood.toLowerCase().includes(q)
      );
    }

    if (neighbourhood !== "all") {
      result = result.filter(
        (c) => c.neighbourhood.toLowerCase() === neighbourhood.toLowerCase()
      );
    }

    if (transmission !== "all") {
      result = result.filter((c) => c.transmission === transmission);
    }

    if (seats > 0) {
      result = result.filter((c) => c.seats >= seats);
    }

    if (minPrice && Number(minPrice) > 0) {
      result = result.filter((c) => c.pricePerDay >= Number(minPrice));
    }

    if (maxPrice && Number(maxPrice) > 0) {
      result = result.filter((c) => c.pricePerDay <= Number(maxPrice));
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price_desc":
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "seats":
        result.sort((a, b) => b.seats - a.seats);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [allApprovedCars, debouncedSearch, neighbourhood, transmission, seats, minPrice, maxPrice, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Markers for map
  const mapMarkers = useMemo(() => {
    return filteredCars.map((c) => ({
      id: c.id,
      lat: c.latitude,
      lng: c.longitude,
      title: `${c.make} ${c.model}`,
      subtitle: `${c.neighbourhood} • ${c.transmission}`,
      price: c.pricePerDay,
    }));
  }, [filteredCars]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <Breadcrumbs items={[{ label: "Fleet Catalogue" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Cars for Rent in Addis Ababa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredCars.length}</strong> verified {filteredCars.length === 1 ? "vehicle" : "vehicles"} available for direct booking
          </p>
        </div>

        {/* View Mode Toggle Pill */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-full self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Grid View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition ${
              viewMode === "map"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Map View
          </button>
        </div>
      </div>

      {/* Quick Location Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 text-xs scrollbar-none">
        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
          Quick Hubs:
        </span>
        {["all", "Bole", "Kazanchis", "Sarbet", "Piassa", "CMC", "Old Airport"].map((hub) => (
          <button
            key={hub}
            onClick={() => {
              setNeighbourhood(hub);
              handleFilterChange();
              updateUrlParams({ neighbourhood: hub });
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              neighbourhood.toLowerCase() === hub.toLowerCase()
                ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {hub === "all" ? "All Addis" : hub}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label htmlFor="filter-search" className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Search Model / Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                id="filter-search"
                type="text"
                placeholder="e.g. Rav4, Tucson, Prado..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                  updateUrlParams({ search: e.target.value });
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Neighbourhood */}
          <div>
            <label htmlFor="filter-neighbourhood" className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Neighbourhood
            </label>
            <Select
              value={neighbourhood}
              onValueChange={(val) => {
                setNeighbourhood(val);
                handleFilterChange();
                updateUrlParams({ neighbourhood: val });
              }}
            >
              <SelectTrigger id="filter-neighbourhood" className="h-9 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="All Addis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Addis</SelectItem>
                <SelectItem value="Bole">Bole</SelectItem>
                <SelectItem value="Kazanchis">Kazanchis</SelectItem>
                <SelectItem value="Sarbet">Sarbet</SelectItem>
                <SelectItem value="Piassa">Piassa</SelectItem>
                <SelectItem value="CMC">CMC</SelectItem>
                <SelectItem value="Old Airport">Old Airport</SelectItem>
                <SelectItem value="Megenagna">Megenagna</SelectItem>
                <SelectItem value="Mexico">Mexico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transmission */}
          <div>
            <label htmlFor="filter-transmission" className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Transmission
            </label>
            <Select
              value={transmission}
              onValueChange={(val) => {
                setTransmission(val);
                handleFilterChange();
                updateUrlParams({ transmission: val });
              }}
            >
              <SelectTrigger id="filter-transmission" className="h-9 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Any Gearbox" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Gearbox</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seats */}
          <div>
            <label htmlFor="filter-seats" className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Min Seats
            </label>
            <Select
              value={String(seats)}
              onValueChange={(val) => {
                const s = Number(val);
                setSeats(s);
                handleFilterChange();
                updateUrlParams({ seats: s });
              }}
            >
              <SelectTrigger id="filter-seats" className="h-9 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Any Capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Capacity</SelectItem>
                <SelectItem value="4">4+ Seats</SelectItem>
                <SelectItem value="5">5+ Seats</SelectItem>
                <SelectItem value="7">7+ Seats</SelectItem>
                <SelectItem value="10">10+ Seats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="filter-sort" className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                updateUrlParams({ sort: val });
              }}
            >
              <SelectTrigger id="filter-sort" className="h-9 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest Listed</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="seats">Most Seats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter secondary row: Price Range & Clear */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Price Range (ETB/day):</span>
            <label htmlFor="filter-min-price" className="sr-only">Minimum price per day</label>
            <input
              id="filter-min-price"
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                handleFilterChange();
                updateUrlParams({ minPrice: e.target.value });
              }}
              className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
            />
            <span className="text-slate-400">—</span>
            <label htmlFor="filter-max-price" className="sr-only">Maximum price per day</label>
            <input
              id="filter-max-price"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                handleFilterChange();
                updateUrlParams({ maxPrice: e.target.value });
              }}
              className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {(searchTerm || neighbourhood !== "all" || transmission !== "all" || seats > 0 || minPrice || maxPrice || sortBy !== "newest") && (
            <button
              onClick={resetFilters}
              aria-label="Reset all search filters"
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="mb-8">
          <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Interactive map of available vehicles across Addis Ababa. Click pins to see rates and details.
          </div>
          <LeafletMap markers={mapMarkers} height="480px" />
        </div>
      )}

      {/* Grid Results */}
      {paginatedCars.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Filter className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No vehicles matched your search</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            We couldn&apos;t find approved cars matching your filter combinations. Try resetting your filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedCars.map((car, index) => (
              <CarCard key={car.id} car={car} priority={index === 0} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Page <span className="font-bold text-slate-800 dark:text-slate-200">{currentPage}</span> of{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
