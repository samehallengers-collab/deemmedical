import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminInquiries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });

  const deleteInquiry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast({ title: "Inquiry deleted" });
    },
  });

  const deleteMany = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("inquiries").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      setSelected([]);
      toast({ title: `${ids.length} inquiries deleted` });
    },
  });

  const unreadCount = inquiries?.filter((i) => !i.is_read).length || 0;
  const allSelected = !!inquiries?.length && selected.length === inquiries.length;

  const toggleOne = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const toggleAll = () => setSelected(allSelected ? [] : (inquiries || []).map((i) => i.id));

  const exportCsv = () => {
    const rows = (inquiries || []).filter((i) => !selected.length || selected.includes(i.id));
    if (!rows.length) return;
    const headers = ["Status", "Name", "Organization", "Email", "Phone", "Interest", "Message", "Date"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.map(esc).join(","),
      ...rows.map((i) =>
        [
          i.is_read ? "Read" : "New",
          i.name,
          i.organization,
          i.email,
          i.phone,
          i.interest,
          i.message,
          i.created_at ? new Date(i.created_at).toLocaleString() : "",
        ].map(esc).join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            Inquiries
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} new</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            {selected.length > 0 && (
              <ConfirmDelete
                title={`Delete ${selected.length} selected inquir${selected.length === 1 ? "y" : "ies"}?`}
                description="The selected inquiries will be permanently removed."
                confirmLabel="Delete selected"
                onConfirm={() => deleteMany.mutate(selected)}
              >
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete ({selected.length})
                </Button>
              </ConfirmDelete>
            )}
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-1.5" />
              Export {selected.length > 0 ? "selected" : "all"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <TooltipProvider delayDuration={150}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries?.map((inq) => (
                  <TableRow key={inq.id} className={!inq.is_read ? "bg-accent/5" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(inq.id)}
                        onCheckedChange={() => toggleOne(inq.id)}
                        aria-label={`Select inquiry from ${inq.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={inq.is_read ? "secondary" : "default"}>
                        {inq.is_read ? "Read" : "New"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{inq.name}</TableCell>
                    <TableCell>{inq.organization}</TableCell>
                    <TableCell>{inq.email}</TableCell>
                    <TableCell>{inq.phone}</TableCell>
                    <TableCell>{inq.interest}</TableCell>
                    <TableCell className="max-w-xs">
                      {inq.message ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-help">{inq.message}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-md">
                            <p className="whitespace-pre-wrap break-words text-sm">{inq.message}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!inq.is_read && (
                          <Button variant="ghost" size="sm" onClick={() => markRead.mutate(inq.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <ConfirmDelete
                          title={`Delete inquiry from ${inq.name}?`}
                          description="This inquiry will be permanently removed."
                          onConfirm={() => deleteInquiry.mutate(inq.id)}
                        >
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </ConfirmDelete>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!inquiries?.length && (
                  <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No inquiries yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminInquiries;
