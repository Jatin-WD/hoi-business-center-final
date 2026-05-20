import { EVENTS, PACKAGE_DETAILS, SERVICE_PACKAGES, VENUE_DETAILS } from '../scripts/init-db.js';

export function fallbackServices() {
  return Object.values(SERVICE_PACKAGES).map((service, index) => ({
    id: index + 1,
    service_id: service.id,
    label: service.label,
    packages: service.packages,
  }));
}

export function fallbackVenues() {
  return VENUE_DETAILS.map((venue, index) => ({
    id: index + 1,
    location_id: venue.locationId,
    sub_venue_id: venue.subVenueId,
    name: venue.name,
    address: venue.address,
    city: venue.city,
    state: venue.state,
    description: venue.description,
    about: venue.about,
    total_area: venue.totalArea,
    halls: venue.halls,
    capacity: venue.capacity,
    established: venue.established,
    website: venue.website || '',
    specialities: venue.specialities,
    image: venue.image,
  }));
}

export function fallbackPackages() {
  let id = 1;
  return Object.entries(PACKAGE_DETAILS).flatMap(([category, subcategories]) =>
    Object.entries(subcategories).map(([subcategory, pkg]) => ({
      id: id++,
      category,
      subcategory,
      title: pkg.title,
      subtitle: pkg.subtitle,
      price: pkg.price,
      price_note: pkg.priceNote,
      description: pkg.description,
      includes: pkg.includes,
      notIncludes: pkg.notIncludes,
      duration: pkg.duration,
    }))
  );
}

export function fallbackEvents() {
  return EVENTS.map(([name, date, venue, locationId, category], index) => ({
    id: index + 1,
    name,
    date,
    venue,
    location_id: locationId,
    locationId,
    category,
    status: 'Upcoming',
  }));
}
