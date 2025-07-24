import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIImportModal({ open, onOpenChange }: AIImportModalProps) {
  const [text, setText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const aiImportMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/ai-import", { text });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      toast({
        title: "Success",
        description: `Imported ${data.count} transaction${data.count !== 1 ? 's' : ''} successfully`,
      });
      setText("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to import transactions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some transaction text",
        variant: "destructive",
      });
      return;
    }
    aiImportMutation.mutate(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto" aria-describedby="ai-import-description">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-robot text-secondary text-2xl"></i>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-dark">AI Smart Import</DialogTitle>
          </DialogHeader>
          <p className="text-gray text-sm mt-2">
            Paste your transaction text and let AI categorize it automatically
          </p>
        </div>
        <div id="ai-import-description" className="sr-only">
          Dialog for importing transactions using AI to parse and categorize transaction text automatically.
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="transaction-text" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Text
            </Label>
            <Textarea
              id="transaction-text"
              className="h-32 resize-none"
              placeholder="Example: Spent $25 on coffee at Starbucks this morning, then $12 for lunch at McDonald's"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="bg-light-gray p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <i className="fas fa-magic text-secondary"></i>
              <span className="text-sm font-medium text-dark">AI Processing</span>
            </div>
            <p className="text-xs text-gray">
              Our AI will analyze your text and create structured transactions with appropriate categories.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
              onClick={handleSubmit}
              disabled={aiImportMutation.isPending}
            >
              {aiImportMutation.isPending && (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              )}
              {aiImportMutation.isPending ? "Processing..." : "Process"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
