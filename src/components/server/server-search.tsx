// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Search } from "lucide-react";
// import {
//   CommandDialog,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import { DialogTitle } from "@/components/ui/dialog";

// interface ServerSearchProps {
//   data: {
//     label: string;
//     type: "channel" | "member";
//     data:
//       | {
//           icon: React.ReactNode | null;
//           name: string | null;
//           id: string;
//         }[]
//       | undefined;
//   }[];
// }
// export const ServerSearch = ({ data }: ServerSearchProps) => {
//   const [open, setOpen] = useState(false);
//   const router = useRouter();
//   const params = useParams();

//   useEffect(() => {
//     const down = (e: KeyboardEvent) => {
//       if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
//         e.preventDefault();
//         setOpen((open) => !open);
//       }
//     };
//     document.addEventListener("keydown", down);
//     return () => document.removeEventListener("keydown", down);
//   }, []);

//   const onClick = ({
//     id,
//     type,
//   }: {
//     id: string;
//     type: "channel" | "member";
//   }) => {
//     setOpen(false);
//     if (type === "member") {
//       return router.push(`/servers/${params.serverId}/conversations/${id}`);
//     }
//     if (type === "channel") {
//       return router.push(`/servers/${params.serverId}/channels/${id}`);
//     }
//   };

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
//       >
//         <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
//         <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
//           Search
//         </p>
//         <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
//           <span className="text-xs">CTRL K</span>
//         </kbd>
//       </button>
//       <CommandDialog open={open} onOpenChange={setOpen}>
//         <DialogTitle className="sr-only">
//           Search channels and members
//         </DialogTitle>

//         <CommandInput placeholder="Search all channels and members" />
//         <CommandList>
//           <CommandEmpty>No Results found</CommandEmpty>
//           {data.map(({ label, type, data }) => {
//             if (!data?.length) return null;
//             return (
//               <CommandGroup key={label} heading={label}>
//                 {data.map(({ id, icon, name }) => {
//                   return (
//                     <CommandItem
//                       onSelect={() => onClick({ id, type })}
//                       key={id}
//                     >
//                       {icon}
//                       <span>{name}</span>
//                     </CommandItem>
//                   );
//                 })}
//               </CommandGroup>
//             );
//           })}
//         </CommandList>
//       </CommandDialog>
//     </>
//   );
// };
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface ServerSearchProps {
  data: {
    label: string;
    type: "channel" | "member";
    data:
      | {
          icon: React.ReactNode | null;
          name: string | null;
          id: string;
        }[]
      | undefined;
  }[];
}

export const ServerSearch = ({ data }: ServerSearchProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const params = useParams();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onClick = ({
    id,
    type,
  }: {
    id: string;
    type: "channel" | "member";
  }) => {
    setOpen(false);
    if (type === "member") {
      return router.push(`/servers/${params.serverId}/conversations/${id}`);
    }
    if (type === "channel") {
      return router.push(`/servers/${params.serverId}/channels/${id}`);
    }
  };

  const filteredData = data.map((group) => ({
    ...group,
    data: group.data?.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  const toggleOpen = () => setOpen(!open);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleOpen}
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
      >
        <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          <span className="text-xs">CTRL K</span>
        </kbd>
      </button>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search all channels and members"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 bg-transparent border-none outline-none text-sm truncate"
              style={{ minWidth: "200px" }}
              autoFocus
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredData.map(({ label, type, data }) => {
              if (!data?.length) return null;
              return (
                <div key={label} className="px-2 pb-2">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                    {label}
                  </div>
                  {data.map(({ id, icon, name }) => (
                    <button
                      key={id}
                      onClick={() => onClick({ id, type })}
                      className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition flex items-center gap-x-2"
                    >
                      {icon}
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              );
            })}
            {!filteredData.some((group) => group.data?.length) && (
              <div className="px-4 py-2 text-sm text-zinc-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
