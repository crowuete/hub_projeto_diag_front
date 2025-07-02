'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DropdownMenuProps {
  item: { id: number | string };
  handleDownload: (id: string) => void;
}

export default function DropdownMenu({ item, handleDownload }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:royal-blue"
        aria-label="Abrir menu"
      >
        {/* Três pontinhos verticais */}
        <span className="text-2xl select-none">⋮</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <button
            onClick={() => {
              handleDownload(item.id.toString());
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-gray-700 text-center hover:bg-gray-100 border-b-2 border-blue-darknut"
          >
            Baixar
          </button>
          <button
            onClick={() => {
              router.push(`/dashboard/${item.id}`);
            }}
            className="block w-full text-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Visualizar
          </button>
        </div>
      )}
    </div>
  );
}
