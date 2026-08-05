import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfirmDelete from "./ConfirmDelete";

const AdminDemoRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: demos, isLoading } = useQuery({
    queryKey: ["admin-demo-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("demo_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("demo_requests").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-demo-requests"] }),
  });

  const deleteDemo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("demo_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-demo-requests"] });
      toast({ title: "Demo request deleted" });
    },
  });

  const unreadCount = demos?.filter((d) => !d.is_read).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Demo Requests
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount} new</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demos?.map((d) => (
                  <TableRow key={d.id} className={!d.is_read ? "bg-accent/5" : ""}>
                    <TableCell>
                      <Badge variant={d.is_read ? "secondary" : "default"}>
                        {d.is_read ? "Read" : "New"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.hospital}</TableCell>
                    <TableCell>{d.city}</TableCell>
                    <TableCell>{d.email}</TableCell>
                    <TableCell>{d.phone}</TableCell>
                    <TableCell>{d.product}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString() : ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!d.is_read && (
                          <Button variant="ghost" size="sm" onClick={() => markRead.mutate(d.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <ConfirmDelete
                          title={`Delete demo request from ${d.name}?`}
                          description="This request will be permanently removed."
                          onConfirm={() => deleteDemo.mutate(d.id)}
                        >
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </ConfirmDelete>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!demos?.length && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No demo requests yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDemoRequests;
