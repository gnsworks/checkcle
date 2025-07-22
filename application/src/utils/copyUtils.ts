
import { toast } from "@/hooks/use-toast";

export const copyToClipboard = async (text: string) => {
  console.log('copyToClipboard called with text:', text); // Debug log
  
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      console.log('Using modern clipboard API'); // Debug log
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard successfully.",
      });
      return;
    }

    console.log('Using fallback clipboard method'); // Debug log
    
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    textArea.style.zIndex = "-1";
    document.body.appendChild(textArea);
    
    // Focus and select the text
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    
    // Use execCommand as fallback
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      console.log('Copy successful with execCommand'); // Debug log
      toast({
        title: "Copied!",
        description: "Content copied to clipboard successfully.",
      });
    } else {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    
    // Show error toast
    toast({
      title: "Copy Failed",
      description: "Unable to copy automatically. Please select and copy the text manually.",
      variant: "destructive",
    });
  }
};