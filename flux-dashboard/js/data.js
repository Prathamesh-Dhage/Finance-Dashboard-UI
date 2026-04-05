// ─── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Housing", "Food & Dining", "Transport", "Health",
  "Entertainment", "Shopping", "Utilities",
  "Salary", "Freelance", "Investment Returns"
];

const CATEGORY_COLORS = {
  "Housing":            "#3d5a47",
  "Food & Dining":      "#2d7d6e",
  "Transport":          "#7c6f3d",
  "Health":             "#6d4a7c",
  "Entertainment":      "#b85c5c",
  "Shopping":           "#4a7fa5",
  "Utilities":          "#6b7f72",
  "Salary":             "#3d6e4a",
  "Freelance":          "#4e8c6e",
  "Investment Returns": "#c4843a",
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_TRANSACTIONS = [
  // Nov 2025
  { id: 1,  date: "2025-11-01", desc: "Monthly Salary",       category: "Salary",             type: "income",  amount: 5200 },
  { id: 2,  date: "2025-11-03", desc: "Apartment Rent",       category: "Housing",             type: "expense", amount: 1850 },
  { id: 3,  date: "2025-11-05", desc: "Weekly Groceries",     category: "Food & Dining",       type: "expense", amount: 128  },
  { id: 4,  date: "2025-11-07", desc: "Netflix Subscription", category: "Entertainment",       type: "expense", amount: 18   },
  { id: 5,  date: "2025-11-08", desc: "Metro Monthly Pass",   category: "Transport",           type: "expense", amount: 72   },
  { id: 6,  date: "2025-11-10", desc: "Freelance Design Job", category: "Freelance",           type: "income",  amount: 950  },
  { id: 7,  date: "2025-11-11", desc: "Doctor Consultation",  category: "Health",              type: "expense", amount: 85   },
  { id: 8,  date: "2025-11-12", desc: "Amazon Purchase",      category: "Shopping",            type: "expense", amount: 74   },
  { id: 9,  date: "2025-11-14", desc: "Electricity Bill",     category: "Utilities",           type: "expense", amount: 98   },
  { id: 10, date: "2025-11-15", desc: "Dinner Out",           category: "Food & Dining",       type: "expense", amount: 62   },
  { id: 11, date: "2025-11-17", desc: "Ride-share Rides",     category: "Transport",           type: "expense", amount: 38   },
  { id: 12, date: "2025-11-19", desc: "Stock Dividend",       category: "Investment Returns",  type: "income",  amount: 245  },
  { id: 13, date: "2025-11-20", desc: "Gym Membership",       category: "Health",              type: "expense", amount: 52   },
  { id: 14, date: "2025-11-22", desc: "Coffee Shops",         category: "Food & Dining",       type: "expense", amount: 36   },
  { id: 15, date: "2025-11-23", desc: "New Sneakers",         category: "Shopping",            type: "expense", amount: 115  },
  // Oct 2025
  { id: 16, date: "2025-10-01", desc: "Monthly Salary",       category: "Salary",             type: "income",  amount: 5200 },
  { id: 17, date: "2025-10-03", desc: "Apartment Rent",       category: "Housing",             type: "expense", amount: 1850 },
  { id: 18, date: "2025-10-07", desc: "Grocery Shopping",     category: "Food & Dining",       type: "expense", amount: 104  },
  { id: 19, date: "2025-10-10", desc: "Freelance Project",    category: "Freelance",           type: "income",  amount: 700  },
  { id: 20, date: "2025-10-13", desc: "Internet Bill",        category: "Utilities",           type: "expense", amount: 65   },
  { id: 21, date: "2025-10-18", desc: "Concert Tickets",      category: "Entertainment",       type: "expense", amount: 130  },
  { id: 22, date: "2025-10-22", desc: "Pharmacy",             category: "Health",              type: "expense", amount: 44   },
  { id: 23, date: "2025-10-27", desc: "Clothing Online",      category: "Shopping",            type: "expense", amount: 88   },
  // Sep 2025
  { id: 24, date: "2025-09-01", desc: "Monthly Salary",       category: "Salary",             type: "income",  amount: 5200 },
  { id: 25, date: "2025-09-03", desc: "Apartment Rent",       category: "Housing",             type: "expense", amount: 1850 },
  { id: 26, date: "2025-09-10", desc: "Stock Dividend",       category: "Investment Returns",  type: "income",  amount: 180  },
  { id: 27, date: "2025-09-14", desc: "Medical Checkup",      category: "Health",              type: "expense", amount: 145  },
  { id: 28, date: "2025-09-19", desc: "Grocery Shopping",     category: "Food & Dining",       type: "expense", amount: 119  },
  { id: 29, date: "2025-09-24", desc: "Streaming Services",   category: "Entertainment",       type: "expense", amount: 36   },
  // Aug 2025
  { id: 30, date: "2025-08-01", desc: "Monthly Salary",       category: "Salary",             type: "income",  amount: 5200 },
  { id: 31, date: "2025-08-03", desc: "Apartment Rent",       category: "Housing",             type: "expense", amount: 1850 },
  { id: 32, date: "2025-08-12", desc: "Summer Holiday Travel",category: "Transport",           type: "expense", amount: 420  },
  { id: 33, date: "2025-08-18", desc: "Freelance Big Project",category: "Freelance",           type: "income",  amount: 1400 },
  { id: 34, date: "2025-08-22", desc: "Home Supplies",        category: "Shopping",            type: "expense", amount: 92   },
  // Jul 2025
  { id: 35, date: "2025-07-01", desc: "Monthly Salary",       category: "Salary",             type: "income",  amount: 5000 },
  { id: 36, date: "2025-07-03", desc: "Apartment Rent",       category: "Housing",             type: "expense", amount: 1850 },
  { id: 37, date: "2025-07-09", desc: "Restaurant Week",      category: "Food & Dining",       type: "expense", amount: 180  },
  { id: 38, date: "2025-07-20", desc: "Investment Dividend",  category: "Investment Returns",  type: "income",  amount: 210  },
  { id: 39, date: "2025-07-25", desc: "Gas & Fuel",           category: "Transport",           type: "expense", amount: 55   },
  // Jun 2025
  { id: 40, date: "2025-06-01", desc: "Monthly Salary",       category: "Salary",             type: "income",  amount: 5000 },
  { id: 41, date: "2025-06-03", desc: "Apartment Rent",       category: "Housing",             type: "expense", amount: 1850 },
  { id: 42, date: "2025-06-15", desc: "Tech Gadget",          category: "Shopping",            type: "expense", amount: 299  },
  { id: 43, date: "2025-06-22", desc: "Freelance Work",       category: "Freelance",           type: "income",  amount: 600  },
];
