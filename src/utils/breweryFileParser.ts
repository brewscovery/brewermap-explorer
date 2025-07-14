import * as XLSX from 'xlsx';
import { BreweryImportData, FileParseResult } from '@/types/breweryImport';
import { supabase } from '@/integrations/supabase/client';

const generateId = () => Math.random().toString(36).substr(2, 9);

const normalizeColumnName = (name: string): string => {
  return name.toLowerCase().trim().replace(/[^a-z]/g, '');
};

const columnMapping: Record<string, string> = {
  'name': 'name',
  'breweryname': 'name',
  'address': 'address',
  'streetaddress': 'address',
  'street': 'address',
  'city': 'city',
  'state': 'state',
  'country': 'country',
  'postalcode': 'postalCode',
  'postal': 'postalCode',
  'zip': 'postalCode',
  'zipcode': 'postalCode',
  'phone': 'phone',
  'phonenumber': 'phone',
  'webpage': 'webPage',
  'website': 'webPage',
  'web': 'webPage',
  'url': 'webPage',
  'isindependent': 'isIndependent',
  'independent': 'isIndependent'
};

export const parseFile = async (file: File): Promise<FileParseResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (jsonData.length === 0) {
      return { data: [], errors: ['File is empty'] };
    }

    const headers = jsonData[0].map((header: string) => normalizeColumnName(header));
    const rows = jsonData.slice(1);

    const data: BreweryImportData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every(cell => !cell)) continue; // Skip empty rows

      const brewery: Partial<BreweryImportData> = {
        id: generateId(),
        selected: true,
        existingStatus: 'new',
        errors: []
      };

      // Map columns to brewery properties
      headers.forEach((header, index) => {
        const value = row[index];
        if (!value) return;

        const mappedField = columnMapping[header];
        if (mappedField) {
          if (mappedField === 'isIndependent') {
            brewery[mappedField] = value.toString().toLowerCase() === 'true' || value.toString().toLowerCase() === 'yes';
          } else {
            (brewery as any)[mappedField] = value.toString().trim();
          }
        }
      });

      // Validate required fields
      const rowErrors: string[] = [];
      if (!brewery.name) rowErrors.push('Name is required');
      if (!brewery.address && !brewery.city) rowErrors.push('Address or City is required');

      if (rowErrors.length > 0) {
        errors.push(`Row ${i + 2}: ${rowErrors.join(', ')}`);
        brewery.errors = rowErrors;
      }

      data.push(brewery as BreweryImportData);
    }

    // Check for existing breweries
    await checkExistingBreweries(data);

    return { data, errors };
  } catch (error) {
    console.error('Error parsing file:', error);
    return { data: [], errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`] };
  }
};

const checkExistingBreweries = async (breweries: BreweryImportData[]) => {
  try {
    const breweryNames = breweries.map(b => b.name).filter(Boolean);
    
    // Get existing breweries
    const { data: existingBreweries } = await supabase
      .from('breweries')
      .select(`
        id,
        name,
        venues (id, name)
      `)
      .in('name', breweryNames);

    if (existingBreweries) {
      breweries.forEach(brewery => {
        const existing = existingBreweries.find(
          eb => eb.name.toLowerCase() === brewery.name.toLowerCase()
        );
        
        if (existing) {
          brewery.existingStatus = existing.venues && existing.venues.length > 0 
            ? 'has_venues' 
            : 'no_venues';
        }
      });
    }
  } catch (error) {
    console.error('Error checking existing breweries:', error);
  }
};