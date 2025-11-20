import { User } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const getUserId = (user: User): string | undefined => {
  return user.ID ?? user.id;
};

export const formatUserDate = (user: User): string => {
  const dateStr = user.created_at || user.CreatedAt;
  if (!dateStr) return "-";
  
  try {
    return format(new Date(dateStr), "dd MMMM yyyy", { locale: id });
  } catch (e) {
    return "-";
  }
};