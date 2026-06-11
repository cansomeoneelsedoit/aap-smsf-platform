import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CardEditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="xs" onClick={onClick}>
      <Pencil className="size-3.5" />
      Edit
    </Button>
  );
}
