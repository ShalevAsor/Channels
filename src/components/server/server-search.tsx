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

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

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

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const onClick = (id: string, type: "channel" | "member") => {
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <input
                className="w-full bg-transparent border-none outline-none text-sm"
                placeholder="Search all channels and members"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!filteredData.some((group) => group.data?.length) && (
                <p className="text-sm text-center py-4 text-muted-foreground">
                  No results found
                </p>
              )}

              {filteredData.map(({ label, type, data }) => {
                if (!data?.length) return null;
                return (
                  <div key={label} className="px-2 py-1">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                      {label}
                    </div>
                    {data.map(({ id, icon, name }) => (
                      <button
                        key={id}
                        onClick={() => onClick(id, type)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
                      >
                        {icon}
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
