
import { getName, getNames, getCode } from 'country-list';

// Get an array of all countries with value/label format for dropdowns
export const getAllCountries = () => {
  const countryNames = getNames();
  return countryNames.map(name => ({
    value: name,
    label: name
  })).sort((a, b) => a.label.localeCompare(b.label));
};

// Get country code from name
export const getCountryCode = (countryName: string): string | undefined => {
  return getCode(countryName);
};

// Get country name from code
export const getCountryName = (countryCode: string): string | undefined => {
  return getName(countryCode);
};

// Default country to use when none is selected
export const DEFAULT_COUNTRY = 'Australia';
