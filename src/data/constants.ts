// @ts-nocheck
export const SERVICES = ['Breakfast', 'Lunch', 'Dinner', 'Late Night'];
export const DINING_OPTIONS = ['Dine-in', 'Take Out', 'Delivery', 'Curbside'];
export const TENDERS = ['Credit Card', 'Cash', 'Gift Card', 'Third Party'];
export const DINING_AREAS = ['Main Floor', 'Bar', 'Patio'];
export const STATIONS = ['Hot Line', 'Cold Station', 'Bar'];
export const DISCOUNT_REASONS = [
  'Staff meal',
  'Manager comp',
  'Birthday discount',
  'Loyalty reward',
  'Wrong order corrected',
];
export const VOID_REASONS = [
  'Customer changed mind',
  'Sent in error',
  'Kitchen error',
  'Duplicate order',
];

export const COST_DEFAULTS = {
  foodCostPct: 32,
  fixedWeeklyCost: 3200,
  variableCostPct: 4,
};

export const MENU_ITEMS = [
  { name: 'Drip Coffee',        group: 'Coffee & Drinks', price: 3.50,  avgDailyQty: 38 },
  { name: 'Latte',              group: 'Coffee & Drinks', price: 5.50,  avgDailyQty: 29 },
  { name: 'Cold Brew',          group: 'Coffee & Drinks', price: 6.00,  avgDailyQty: 18 },
  { name: 'Fresh Juice',        group: 'Coffee & Drinks', price: 7.00,  avgDailyQty: 12 },
  { name: 'Avocado Toast',      group: 'Breakfast',       price: 14.00, avgDailyQty: 22 },
  { name: 'Eggs Benedict',      group: 'Breakfast',       price: 16.00, avgDailyQty: 15 },
  { name: 'Granola Bowl',       group: 'Breakfast',       price: 12.00, avgDailyQty: 14 },
  { name: 'Smash Burger',       group: 'Lunch',           price: 18.00, avgDailyQty: 28 },
  { name: 'Chicken Caesar',     group: 'Lunch',           price: 16.00, avgDailyQty: 21 },
  { name: 'BLT Sandwich',       group: 'Lunch',           price: 14.00, avgDailyQty: 19 },
  { name: 'Soup of the Day',    group: 'Lunch',           price: 9.00,  avgDailyQty: 16 },
  { name: 'Pasta Arrabiata',    group: 'Dinner',          price: 22.00, avgDailyQty: 18 },
  { name: 'Pan-Seared Salmon',  group: 'Dinner',          price: 28.00, avgDailyQty: 12 },
  { name: 'Ribeye Steak',       group: 'Dinner',          price: 42.00, avgDailyQty: 7  },
  { name: 'Mushroom Risotto',   group: 'Dinner',          price: 24.00, avgDailyQty: 14 },
  { name: 'Draft IPA',          group: 'Bar',             price: 8.00,  avgDailyQty: 24 },
  { name: 'House Wine',         group: 'Bar',             price: 10.00, avgDailyQty: 18 },
  { name: 'Classic Margarita',  group: 'Bar',             price: 13.00, avgDailyQty: 16 },
  { name: 'NY Cheesecake',      group: 'Desserts',        price: 9.00,  avgDailyQty: 11 },
  { name: 'Chocolate Lava',     group: 'Desserts',        price: 11.00, avgDailyQty: 9  },
];

export const STAFF = [
  { name: 'Marcus J.',  jobTitle: 'Server',    wage: 14 },
  { name: 'Priya K.',   jobTitle: 'Server',    wage: 14 },
  { name: 'Tom R.',     jobTitle: 'Bartender', wage: 16 },
  { name: 'Dana L.',    jobTitle: 'Host',      wage: 13 },
  { name: 'Chris M.',   jobTitle: 'Server',    wage: 14 },
  { name: 'Ama S.',     jobTitle: 'Cook',      wage: 18 },
  { name: 'Jake T.',    jobTitle: 'Cook',      wage: 18 },
  { name: 'Nina B.',    jobTitle: 'Server',    wage: 14 },
  { name: 'Sofia P.',   jobTitle: 'Server',    wage: 14 },
  { name: 'Daniel O.',  jobTitle: 'Server',    wage: 14 },
  { name: 'Maya H.',    jobTitle: 'Server',    wage: 14 },
  { name: 'Luis A.',    jobTitle: 'Cook',      wage: 18 },
  { name: 'Ravi N.',    jobTitle: 'Cook',      wage: 18 },
  { name: 'Ella W.',    jobTitle: 'Cook',      wage: 17 },
  { name: 'Owen G.',    jobTitle: 'Bartender', wage: 16 },
  { name: 'Hana Y.',    jobTitle: 'Host',      wage: 13 },
];