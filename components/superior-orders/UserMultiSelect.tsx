"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface UserMultiSelectProps {
  users: User[];
  selectedUserIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export function UserMultiSelect({
  users,
  selectedUserIds,
  onChange,
}: UserMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedUsers = users.filter((u) =>
    selectedUserIds.includes(u.id || u.ID || "")
  );

  const handleSelect = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const handleRemove = (userId: string) => {
    onChange(selectedUserIds.filter((id) => id !== userId));
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            <div className="flex flex-wrap gap-1">
              {selectedUsers.length === 0 && "Pilih Staff..."}
              {selectedUsers.map((user) => (
                <Badge
                  variant="secondary"
                  key={user.id || user.ID}
                  className="mr-1"
                >
                  {user.name}
                  <span
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleRemove(user.id || user.ID || "")}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </Badge>
              ))}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Cari staff..." />
            <CommandList>
              <CommandEmpty>Staff tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id || user.ID}
                    value={user.name}
                    onSelect={() => handleSelect(user.id || user.ID || "")}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUserIds.includes(user.id || user.ID || "")
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        @{user.username}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
