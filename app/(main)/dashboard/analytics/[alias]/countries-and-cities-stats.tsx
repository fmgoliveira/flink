"use client";

import BarList from "./_components/bar-list";

type CountriesAndCitiesStatsProps = {
  countriesRecords: Record<string, number>;
  citiesRecords: Record<string, number>;
  continentsRecords: Record<string, number>;
  totalClicks: number;
};

export function CountriesAndCitiesStats({
  countriesRecords,
  citiesRecords,
  continentsRecords,
  totalClicks,
}: CountriesAndCitiesStatsProps) {
  const countryRecordsAsArray = converRecordToArray(countriesRecords);
  const cityRecordsAsArray = converRecordToArray(citiesRecords);
  const continentRecordsAsArray = converRecordToArray(continentsRecords);

  const recordsMap = [
    {
      name: "countries",
      records: countryRecordsAsArray,
    },
    {
      name: "cities",
      records: cityRecordsAsArray,
    },
    {
      name: "continents",
      records: continentRecordsAsArray,
    },
  ];

  return (
    <BarList.BarListTitle
      title="Top Locations"
      description="Top countries, cities and continents"
    >
      <BarList views={recordsMap} totalClicks={totalClicks} />
    </BarList.BarListTitle>
  );
}

function converRecordToArray(records: Record<string, number>) {
  return Object.entries(records).map(([name, clicks]) => ({
    name,
    clicks: +clicks,
  }));
}
