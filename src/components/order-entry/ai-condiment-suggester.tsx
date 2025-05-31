
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { suggestCondiments, SuggestCondimentsInput } from '@/ai/flows/suggest-condiments'; // Assuming this path
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


interface AiCondimentSuggesterProps {
  orderDescription: string; // e.g., "1x Hamburger, 2x Fries, 1x Coke"
}

export default function AiCondimentSuggester({ orderDescription }: AiCondimentSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    if (!orderDescription.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const input: SuggestCondimentsInput = { orderDescription };
      const result = await suggestCondiments(input);
      setSuggestions(result.condimentSuggestions);
    } catch (err) {
      console.error("Error fetching condiment suggestions:", err);
      setError("Failed to fetch suggestions. Please try again.");
      toast({
        title: "AI Error",
        description: "Could not fetch condiment suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch suggestions when order description changes and is not empty
  useEffect(() => {
    if (orderDescription && orderDescription.trim().length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]); // Clear suggestions if order is empty
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDescription]);


  if (!orderDescription || orderDescription.trim().length === 0) {
    return (
        <div className="text-sm text-muted-foreground p-3 rounded-md border border-dashed">
            Add items to the order to get AI condiment suggestions.
        </div>
    );
  }

  return (
    <div className="p-3 rounded-md border bg-card/50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold flex items-center">
          <Wand2 className="h-4 w-4 mr-2 text-primary" />
          AI Condiment Ideas
        </h4>
        <Button variant="ghost" size="sm" onClick={fetchSuggestions} disabled={isLoading || !orderDescription.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>
      
      {error && <p className="text-xs text-destructive">{error}</p>}
      
      {!isLoading && !error && suggestions.length === 0 && orderDescription.trim() && (
        <p className="text-xs text-muted-foreground">No specific suggestions for this order. Try adding more items.</p>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {suggestions.map((condiment, index) => (
            <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20">
              {condiment}
            </Badge>
          ))}
        </div>
      )}
      {!isLoading && suggestions.length > 0 && (
         <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6">
                <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
                <ThumbsDown className="h-3 w-3" />
            </Button>
         </div>
      )}
    </div>
  );
}
