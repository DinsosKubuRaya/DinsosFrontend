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
    <div className="md:hidden space-y-4 p-4">
      {users.map((user) => {
        const userId = getUserId(user);

        if (!userId) {
          console.warn("User tanpa ID:", user);
          return null;
        }

        return (
          <Card key={userId} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{user.name || "-"}</p>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.role === "admin" ? (
                        <ShieldCheck className="mr-1 h-2.5 w-2.5" />
                      ) : (
                        <UserIcon className="mr-1 h-2.5 w-2.5" />
                      )}
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    @{user.username || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">ID: {userId}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  Dibuat: {formatUserDate(user)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(user)}
                    disabled={loading}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Hapus
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
