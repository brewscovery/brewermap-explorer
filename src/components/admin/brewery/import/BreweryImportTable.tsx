import { useState } from 'react';
import { Check, X, Edit3, AlertCircle } from 'lucide-react';
import { BreweryImportData } from '@/types/breweryImport';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BreweryImportTableProps {
  breweries: BreweryImportData[];
  onBreweriesUpdate: (breweries: BreweryImportData[]) => void;
  onImport: () => void;
  isImporting?: boolean;
}

export const BreweryImportTable = ({ 
  breweries, 
  onBreweriesUpdate, 
  onImport, 
  isImporting 
}: BreweryImportTableProps) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const selectedCount = breweries.filter(b => b.selected).length;
  const allSelected = selectedCount === breweries.length;
  const someSelected = selectedCount > 0 && selectedCount < breweries.length;

  const handleSelectAll = (checked: boolean) => {
    const updated = breweries.map(brewery => ({
      ...brewery,
      selected: checked
    }));
    onBreweriesUpdate(updated);
  };

  const handleSelectBrewery = (id: string, checked: boolean) => {
    const updated = breweries.map(brewery =>
      brewery.id === id ? { ...brewery, selected: checked } : brewery
    );
    onBreweriesUpdate(updated);
  };

  const handleStartEdit = (id: string, field: string, currentValue: any) => {
    setEditingCell({ id, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const updated = breweries.map(brewery => {
      if (brewery.id === editingCell.id) {
        const updatedBrewery = { ...brewery };
        if (editingCell.field === 'isIndependent') {
          (updatedBrewery as any)[editingCell.field] = editValue.toLowerCase() === 'true';
        } else {
          (updatedBrewery as any)[editingCell.field] = editValue;
        }
        return updatedBrewery;
      }
      return brewery;
    });

    onBreweriesUpdate(updated);
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getStatusBadge = (status: BreweryImportData['existingStatus']) => {
    switch (status) {
      case 'has_venues':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Has Venues</Badge>;
      case 'no_venues':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">No Venues</Badge>;
      default:
        return <Badge variant="secondary">New</Badge>;
    }
  };

  const getRowClassName = (brewery: BreweryImportData) => {
    if (brewery.existingStatus === 'has_venues') {
      return 'bg-green-50/50 border-green-200';
    } else if (brewery.existingStatus === 'no_venues') {
      return 'bg-orange-50/50 border-orange-200';
    }
    return '';
  };

  const EditableCell = ({ 
    brewery, 
    field, 
    value, 
    className = '' 
  }: { 
    brewery: BreweryImportData; 
    field: string; 
    value: any;
    className?: string;
  }) => {
    const isEditing = editingCell?.id === brewery.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <TableCell className={className}>
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      );
    }

    return (
      <TableCell 
        className={`${className} cursor-pointer hover:bg-accent/50`}
        onClick={() => handleStartEdit(brewery.id, field, value)}
      >
        <div className="flex items-center gap-2">
          <span>{value?.toString() || '-'}</span>
          <Edit3 className="h-3 w-3 opacity-50" />
        </div>
      </TableCell>
    );
  };

  if (breweries.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Brewery Import Preview ({breweries.length} breweries)</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedCount} of {breweries.length} selected
            </span>
            <Button 
              onClick={onImport}
              disabled={selectedCount === 0 || isImporting}
              className="bg-primary hover:bg-primary/90"
            >
              {isImporting ? 'Importing...' : `Import ${selectedCount} Breweries`}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Existing with venues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
            <span>Existing without venues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
            <span>New brewery</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                  />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Postal Code</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Independent</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breweries.map((brewery) => (
                <TableRow key={brewery.id} className={getRowClassName(brewery)}>
                  <TableCell>
                    <Checkbox
                      checked={brewery.selected}
                      onCheckedChange={(checked) => 
                        handleSelectBrewery(brewery.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(brewery.existingStatus)}
                  </TableCell>
                  <EditableCell brewery={brewery} field="name" value={brewery.name} />
                  <EditableCell brewery={brewery} field="address" value={brewery.address} />
                  <EditableCell brewery={brewery} field="city" value={brewery.city} />
                  <EditableCell brewery={brewery} field="state" value={brewery.state} />
                  <EditableCell brewery={brewery} field="country" value={brewery.country} />
                  <EditableCell brewery={brewery} field="postalCode" value={brewery.postalCode} />
                  <EditableCell brewery={brewery} field="phone" value={brewery.phone} />
                  <EditableCell brewery={brewery} field="webPage" value={brewery.webPage} />
                  <EditableCell 
                    brewery={brewery} 
                    field="isIndependent" 
                    value={brewery.isIndependent ? 'Yes' : 'No'} 
                  />
                  <TableCell>
                    {brewery.errors && brewery.errors.length > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs">{brewery.errors.length} error(s)</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};