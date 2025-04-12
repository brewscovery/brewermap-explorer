
import { Button } from "@/components/ui/button";

interface BreweryFormActionsProps {
  isLoading: boolean;
  isEditMode: boolean;
}

const BreweryFormActions = ({ isLoading, isEditMode }: BreweryFormActionsProps) => {
  return (
    <Button type="submit" disabled={isLoading}>
      {isLoading ? 'Submitting...' : isEditMode ? 'Update Brewery' : 'Create Brewery'}
    </Button>
  );
};

export default BreweryFormActions;
