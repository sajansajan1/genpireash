"use client";

import type React from "react";

import { useState } from "react";
import { Check, ChevronsUpDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProductIdeasStore } from "@/lib/zustand/techpacks/getAllTechPacks";

interface TechPackFiltersProps {
  onFilterChange: (filters: { search: string; status: string[]; sortBy: string }) => void;
}

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

const sortOptions = [
  { value: "created_desc", label: "Sort by Newest" },
  { value: "created_asc", label: "Sort by Oldest" },
  { value: "name_asc", label: "Sort by Name (A-Z)" },
  { value: "name_desc", label: "Sort by Name (Z-A)" },
];

export function TechPackFilters({ onFilterChange }: TechPackFiltersProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("created_desc");
  const [openStatus, setOpenStatus] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const {
    productIdeas,
    loadingProductIdeas,
    errorProductIdeas,
    refreshProductIdeas,
    fetchMoreProductIdeas,
    loadingMore,
    pagination,
  } = useProductIdeasStore();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    fetchMoreProductIdeas();
    const newSearch = e.target.value;
    setSearch(newSearch);
    onFilterChange({ search: newSearch, status: statusFilter, sortBy });
  };

  const toggleStatus = (value: string) => {
    const newStatusFilter = statusFilter.includes(value)
      ? statusFilter.filter((status) => status !== value)
      : [...statusFilter, value];

    setStatusFilter(newStatusFilter);
    onFilterChange({ search, status: newStatusFilter, sortBy });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setOpenSort(false);
    onFilterChange({ search, status: statusFilter, sortBy: value });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setSortBy("created_desc");
    onFilterChange({ search: "", status: [], sortBy: "created_desc" });
  };

  const hasActiveFilters = search || statusFilter.length > 0 || sortBy !== "created_desc";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 w-full md:flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#1C1917]" />
          <Input placeholder="Search Product" className="pl-9" value={search} onChange={handleSearchChange} />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => {
                setSearch("");
                onFilterChange({ search: "", status: statusFilter, sortBy });
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Filter button - now on same line as search on mobile */}
        <DropdownMenu open={openSort} onOpenChange={setOpenSort}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => handleSortChange(option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusFilter.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {statusFilter.map((status) => {
              const statusOption = statusOptions.find((opt) => opt.value === status);
              return (
                <Badge key={status} variant="secondary" className="gap-1">
                  {statusOption?.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 p-0 hover:bg-transparent"
                    onClick={() => toggleStatus(status)}
                  >
                    <X className="h-2 w-2" />
                    <span className="sr-only">Remove {statusOption?.label} filter</span>
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* <Popover open={openStatus} onOpenChange={setOpenStatus}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Status
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <Command>
              <CommandList>
                <CommandGroup>
                  {statusOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleStatus(option.value)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          statusFilter.includes(option.value) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover> */}

        {/* Commented out old sort/filter buttons */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
