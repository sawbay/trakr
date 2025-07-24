import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIImportModal({ open, onOpenChange }: AIImportModalProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const aiImageImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/ai-import-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      toast({
        title: "Success",
        description: `Imported ${data.count} transaction${data.count !== 1 ? 's' : ''} from image`,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to import transactions from image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: "Error",
          description: "Please select a valid image file (JPEG, PNG, WebP)",
          variant: "destructive",
        });
      }
    }
  };

  const handleTextSubmit = () => {
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

  const handleImageSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    aiImageImportMutation.mutate(selectedFile);
  };

  const resetModal = () => {
    setText("");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetModal();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md mx-auto" aria-describedby="ai-import-description">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-robot text-secondary text-2xl"></i>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-dark">AI Smart Import</DialogTitle>
          </DialogHeader>
          <p className="text-gray text-sm mt-2">
            Import transactions from text or receipt images
          </p>
        </div>
        <div id="ai-import-description" className="sr-only">
          Dialog for importing transactions using AI to parse and categorize transaction text or images automatically.
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="image">Receipt Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4 mt-4">
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
                <span className="text-sm font-medium text-dark">AI Text Processing</span>
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
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
                onClick={handleTextSubmit}
                disabled={aiImportMutation.isPending}
              >
                {aiImportMutation.isPending && (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                )}
                {aiImportMutation.isPending ? "Processing..." : "Process Text"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="receipt-image" className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Image
              </Label>
              <Input
                id="receipt-image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="cursor-pointer"
              />
              {previewUrl && (
                <div className="mt-3">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="w-full h-32 object-contain border rounded-lg bg-gray-50"
                  />
                </div>
              )}
            </div>

            <div className="bg-light-gray p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <i className="fas fa-image text-secondary"></i>
                <span className="text-sm font-medium text-dark">AI Image Processing</span>
              </div>
              <p className="text-xs text-gray">
                Upload a receipt or transaction image. AI will extract transaction details automatically.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
                onClick={handleImageSubmit}
                disabled={aiImageImportMutation.isPending}
              >
                {aiImageImportMutation.isPending && (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                )}
                {aiImageImportMutation.isPending ? "Processing..." : "Process Image"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
