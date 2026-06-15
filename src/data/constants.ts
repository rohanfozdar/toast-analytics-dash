// @ts-nocheck
export const SERVICES = ['Breakfast', 'Lunch', 'Dinner', 'Late Night'];
export const DINING_OPTIONS = ['Dine-in', 'Take Out', 'Delivery', 'Curbside'];
export const TENDERS = ['Credit Card', 'Cash', 'Gift Card', 'Third Party'];
export const DINING_AREAS = ['Main Floor', 'Bar', 'Patio'];
export const STATIONS = ['Hot Line', 'Cold Station', 'Bar'];
export const CARD_TYPES = ['Visa', 'Mastercard', 'Amex', 'Discover'];
export const CARD_TYPE_WEIGHTS = [0.45, 0.35, 0.12, 0.08];
export const PROCESSING_FEE_RATE = 0.028;
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
  { name: 'Drip Coffee',        group: 'Coffee & Drinks', salesCategory: 'Beverage (N/A)',                          price: 3.50,  avgDailyQty: 38 },
  { name: 'Latte',              group: 'Coffee & Drinks', salesCategory: 'Beverage (N/A)',                          price: 5.50,  avgDailyQty: 29 },
  { name: 'Cold Brew',          group: 'Coffee & Drinks', salesCategory: 'Beverage (N/A)',                          price: 6.00,  avgDailyQty: 18 },
  { name: 'Fresh Juice',        group: 'Coffee & Drinks', salesCategory: 'Beverage (N/A)',                          price: 7.00,  avgDailyQty: 12 },
  { name: 'Avocado Toast',      group: 'Breakfast',       salesCategory: 'Food',                                    price: 14.00, avgDailyQty: 22 },
  { name: 'Eggs Benedict',      group: 'Breakfast',       salesCategory: 'Food',                                    price: 16.00, avgDailyQty: 15 },
  { name: 'Granola Bowl',       group: 'Breakfast',       salesCategory: 'Food',                                    price: 12.00, avgDailyQty: 14 },
  { name: 'Smash Burger',       group: 'Lunch',           salesCategory: 'Food',                                    price: 18.00, avgDailyQty: 28 },
  { name: 'Chicken Caesar',     group: 'Lunch',           salesCategory: 'Food',                                    price: 16.00, avgDailyQty: 21 },
  { name: 'BLT Sandwich',       group: 'Lunch',           salesCategory: 'Food',                                    price: 14.00, avgDailyQty: 19 },
  { name: 'Soup of the Day',    group: 'Lunch',           salesCategory: 'Food',                                    price: 9.00,  avgDailyQty: 16 },
  { name: 'Pasta Arrabiata',    group: 'Dinner',          salesCategory: 'Food',                                    price: 22.00, avgDailyQty: 18 },
  { name: 'Pan-Seared Salmon',  group: 'Dinner',          salesCategory: 'Food',                                    price: 28.00, avgDailyQty: 12 },
  { name: 'Ribeye Steak',       group: 'Dinner',          salesCategory: 'Food',                                    price: 42.00, avgDailyQty: 7  },
  { name: 'Mushroom Risotto',   group: 'Dinner',          salesCategory: 'Food',                                    price: 24.00, avgDailyQty: 14 },
  { name: 'Draft IPA',          group: 'Bar',             salesCategory: 'Alcohol', subgroup: 'Beer',               price: 8.00,  avgDailyQty: 24 },
  { name: 'House Wine',         group: 'Bar',             salesCategory: 'Alcohol', subgroup: 'Wine',               price: 10.00, avgDailyQty: 18 },
  { name: 'Classic Margarita',  group: 'Bar',             salesCategory: 'Alcohol', subgroup: 'Cocktails',          price: 13.00, avgDailyQty: 16 },
  { name: 'NY Cheesecake',      group: 'Desserts',        salesCategory: 'Food',                                    price: 9.00,  avgDailyQty: 11 },
  { name: 'Chocolate Lava',     group: 'Desserts',        salesCategory: 'Food',                                    price: 11.00, avgDailyQty: 9  },
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
  { name: 'Ella W.',    jobTitle: 'Host',      wage: 13 },
];
export const MODIFIER_CATALOG = {
  'Coffee & Drinks': [
    { name: 'Oat milk',          optionGroup: 'Milk',    price: 0.75 },
    { name: 'Almond milk',       optionGroup: 'Milk',    price: 0.75 },
    { name: 'Extra shot',        optionGroup: 'Espresso', price: 1.00 },
    { name: 'Sugar-free syrup',  optionGroup: 'Syrup',   price: 0 },
    { name: 'Vanilla syrup',     optionGroup: 'Syrup',   price: 0.50 },
  ],
  'Breakfast': [
    { name: 'Add bacon',         optionGroup: 'Add-ons', price: 3.00 },
    { name: 'Add avocado',       optionGroup: 'Add-ons', price: 2.50 },
    { name: 'Sub egg whites',    optionGroup: 'Sub',     price: 1.00 },
    { name: 'No onions',         optionGroup: 'Prep',    price: 0 },
  ],
  'Lunch': [
    { name: 'Add avocado',       optionGroup: 'Add-ons', price: 2.50 },
    { name: 'Add bacon',         optionGroup: 'Add-ons', price: 3.00 },
    { name: 'Add cheese',        optionGroup: 'Add-ons', price: 1.50 },
    { name: 'Sub side salad',    optionGroup: 'Side',    price: 2.00 },
    { name: 'No onions',         optionGroup: 'Prep',    price: 0 },
  ],
  'Dinner': [
    { name: 'Add shrimp',        optionGroup: 'Protein', price: 6.00 },
    { name: 'Add chicken',       optionGroup: 'Protein', price: 5.00 },
    { name: 'Truffle butter',    optionGroup: 'Sauce',   price: 3.50 },
    { name: 'Extra sauce',       optionGroup: 'Sauce',   price: 1.00 },
    { name: 'Cook temp: med',    optionGroup: 'Prep',    price: 0 },
  ],
  'Bar': [
    { name: 'Top-shelf upgrade', optionGroup: 'Upgrade', price: 4.00 },
    { name: 'Extra shot',        optionGroup: 'Liquor',  price: 3.00 },
    { name: 'Salt rim',          optionGroup: 'Prep',    price: 0 },
  ],
  'Desserts': [
    { name: 'Add ice cream',     optionGroup: 'Add-ons', price: 2.50 },
    { name: 'Whipped cream',     optionGroup: 'Add-ons', price: 1.00 },
    { name: 'Berry compote',     optionGroup: 'Add-ons', price: 1.50 },
  ],
};
