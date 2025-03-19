
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Brewery } from "@/types/brewery";
import BreweryCard from "./BreweryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import BreweryForm from "@/components/BreweryForm";

interface BreweryListProps {
  breweries: Brewery[];
  selectedBrewery: Brewery | null;
  isLoading: boolean;
  onBrewerySelect: (brewery: Brewery) => void;
  onAddBrewery?: () => void;
}

const BreweryList = ({ 
  breweries, 
  selectedBrewery, 
  isLoading, 
  onBrewerySelect,
  onAddBrewery 
}: BreweryListProps) => {
  const [editingBrewery, setEditingBrewery] = useState<Brewery | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Update editing brewery when the selected brewery changes or when breweries array updates
  useEffect(() => {
    if (editingBrewery) {
      const updatedBrewery = breweries.find(b => b.id === editingBrewery.id);
      if (updatedBrewery && JSON.stringify(updatedBrewery) !== JSON.stringify(editingBrewery)) {
        console.log('Updating editing brewery with latest data:', updatedBrewery);
        setEditingBrewery(updatedBrewery);
      }
    }
  }, [breweries, editingBrewery]);

  // Also update the selected brewery when breweries change (real-time updates)
  useEffect(() => {
    if (selectedBrewery) {
      const updatedSelectedBrewery = breweries.find(b => b.id === selectedBrewery.id);
      if (updatedSelectedBrewery && JSON.stringify(updatedSelectedBrewery) !== JSON.stringify(selectedBrewery)) {
        console.log('Updating selected brewery with latest data:', updatedSelectedBrewery);
        onBrewerySelect(updatedSelectedBrewery);
      }
    }
  }, [breweries, selectedBrewery, onBrewerySelect]);

  const handleEditBrewery = (brewery: Brewery) => {
    console.log('Starting to edit brewery:', brewery);
    setEditingBrewery(brewery);
    setIsEditSheetOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditSheetOpen(false);
    // The brewery list will update automatically via the real-time subscription
    console.log('Edit successful, closing sheet');
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-52 w-full" />
        ))}
      </div>
    );
  }

  if (breweries.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon icon={Plus} />
        <EmptyPlaceholder.Title>No breweries</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          You don't have any breweries yet. Add one to get started.
        </EmptyPlaceholder.Description>
        {onAddBrewery && (
          <Button onClick={onAddBrewery}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brewery
          </Button>
        )}
      </EmptyPlaceholder>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {breweries.map((brewery) => (
          <BreweryCard
            key={brewery.id}
            brewery={brewery}
            isSelected={selectedBrewery?.id === brewery.id}
            onClick={() => onBrewerySelect(brewery)}
            onEdit={() => handleEditBrewery(brewery)}
          />
        ))}
      </div>

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Brewery</SheetTitle>
            <SheetDescription>
              Update your brewery details. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          {editingBrewery && (
            <div className="py-4">
              <BreweryForm 
                initialData={editingBrewery}
                onSubmitSuccess={handleEditSuccess}
                isEditing={true}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BreweryList;
