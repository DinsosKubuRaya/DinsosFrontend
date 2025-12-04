import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import { User } from "@/types";
import { getUserId, formatUserDate } from "@/lib/userHelpers";

interface UserMobileCardProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  loading?: boolean;
}

export function UserMobileCard({
  users,
  onEdit,
  onDelete,
  loading = false,
}: UserMobileCardProps) {
  return (
    <div className="md:hidden space-y-4 pb-20">
      {users.map((user) => {
        const userId = getUserId(user);
        if (!userId) return null;

        return (
          <Card
            key={userId}
            className="overflow-hidden rounded-xl border border-border/60 shadow-sm"
          >
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {user.name || "-"}
                    </p>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    @{user.username || "-"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Bergabung: {formatUserDate(user)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    disabled={loading}
                    className="flex-1 rounded-lg"
                  >
                    <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user)}
                    disabled={loading}
                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
