import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

const SearchableSelect = ({ options, value, onChange, placeholder = "Select...", label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={wrapperRef}>
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <div className="relative">
        <div
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            !selectedOption && "text-muted-foreground"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border-2 border-border bg-card dark:bg-gray-900 text-foreground shadow-2xl animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center border-b border-border px-3 sticky top-0 bg-card dark:bg-gray-900">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      value === option.value && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchableSelect;