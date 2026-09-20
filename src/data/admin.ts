export const adminStats = [
  { label: 'Total users', value: '12,480', delta: 8.2 },
  { label: 'Active cards', value: '9,317', delta: 6.4 },
  { label: 'MRR', value: '₹4.82L', delta: 11.9 },
  { label: 'Orders (30d)', value: '1,204', delta: 14.3 },
]

export const adminRevenue = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({ month: m, subscriptions: [212, 264, 318, 366, 421, 482][i], orders: [140, 188, 205, 262, 301, 356][i] }))

export const adminUsers = [
  { id: 'U-1001', name: 'Rahul Verma', email: 'rahul@royalspice.in', plan: 'PRO', status: 'Active', joined: '12 Jan 2026', role: 'USER' },
  { id: 'U-1002', name: 'Neha Kulkarni', email: 'neha@glowstudio.in', plan: 'BUSINESS', status: 'Active', joined: '03 Feb 2026', role: 'USER' },
  { id: 'U-1003', name: 'Arjun Singh', email: 'arjun@ironforge.fit', plan: 'FREE', status: 'Active', joined: '21 Mar 2026', role: 'USER' },
  { id: 'U-1004', name: 'Dr. Anita Mehta', email: 'anita@mehtaskin.in', plan: 'PRO', status: 'Active', joined: '04 Apr 2026', role: 'USER' },
  { id: 'U-1005', name: 'Sameer Khan', email: 'sameer@example.com', plan: 'FREE', status: 'Suspended', joined: '30 May 2026', role: 'USER' },
  { id: 'U-1006', name: 'Vinod Kumar', email: 'admin@tapcard.in', plan: 'BUSINESS', status: 'Active', joined: '01 Jan 2026', role: 'ADMIN' },
]

export const adminBusinesses = [
  { id: 'B-201', name: 'Royal Spice', slug: 'royal-spice', category: 'Restaurant', owner: 'Rahul Verma', scans: 1248, status: 'Published' },
  { id: 'B-202', name: 'Glow Studio', slug: 'glow-studio', category: 'Salon', owner: 'Neha Kulkarni', scans: 902, status: 'Published' },
  { id: 'B-203', name: 'IronForge Fitness', slug: 'ironforge-fitness', category: 'Gym', owner: 'Arjun Singh', scans: 611, status: 'Published' },
  { id: 'B-204', name: 'Dr. Anita Mehta', slug: 'dr-anita-mehta', category: 'Doctor', owner: 'Dr. Anita Mehta', scans: 388, status: 'Draft' },
  { id: 'B-205', name: 'Kesar Fashions', slug: 'kesar-fashions', category: 'Retail', owner: 'Manish Gupta', scans: 254, status: 'Suspended' },
]

export const adminOrders = [
  { id: 'TC-20488', customer: 'Rahul Verma', items: 'QR Card 5-Pack × 1', total: 1249, status: 'Design Review', date: '19 Sep' },
  { id: 'TC-20487', customer: 'Neha Kulkarni', items: 'NFC Table Stand × 4', total: 5196, status: 'Production', date: '19 Sep' },
  { id: 'TC-20486', customer: 'Arjun Singh', items: 'NFC Business Card × 10', total: 8990, status: 'Paid', date: '18 Sep' },
  { id: 'TC-20418', customer: 'Rahul Verma', items: 'NFC Business Card × 25', total: 22475, status: 'Shipped', date: '17 Sep' },
  { id: 'TC-20402', customer: 'Manish Gupta', items: 'QR Table Stand × 2', total: 998, status: 'Pending', date: '16 Sep' },
  { id: 'TC-20377', customer: 'Neha Kulkarni', items: 'QR Table Stand × 8', total: 3992, status: 'Delivered', date: '2 Sep' },
]

export const adminTemplates = [
  { id: 'restaurant', name: 'Royal Table', category: 'Restaurant', uses: 2140, status: 'Published' },
  { id: 'salon', name: 'Glow', category: 'Salon', uses: 1688, status: 'Published' },
  { id: 'freelancer', name: 'Solo', category: 'Freelancer', uses: 1402, status: 'Published' },
  { id: 'gym', name: 'Iron', category: 'Gym', uses: 977, status: 'Published' },
  { id: 'consultant', name: 'Advisor', category: 'Consultant', uses: 640, status: 'Draft' },
]

export const adminCoupons = [
  { code: 'TAP10', type: '10% off', used: 312, limit: 1000, expires: '31 Dec 2026', status: 'Active' },
  { code: 'WELCOME100', type: '₹100 off · min ₹499', used: 874, limit: 5000, expires: '31 Dec 2026', status: 'Active' },
  { code: 'DIWALI25', type: '25% off', used: 0, limit: 500, expires: '05 Nov 2026', status: 'Draft' },
  { code: 'LAUNCH50', type: '₹50 off', used: 500, limit: 500, expires: '30 Jun 2026', status: 'Expired' },
]

export const adminPayments = [
  { id: 'pay_QX91a2', customer: 'Rahul Verma', for: 'Order TC-20488', amount: 1249, method: 'UPI', status: 'Paid', date: '19 Sep' },
  { id: 'pay_QX90f7', customer: 'Neha Kulkarni', for: 'Order TC-20487', amount: 5196, method: 'Card', status: 'Paid', date: '19 Sep' },
  { id: 'pay_QX8b31', customer: 'Sameer Khan', for: 'Pro plan', amount: 299, method: 'UPI', status: 'Failed', date: '18 Sep' },
  { id: 'pay_QX8a02', customer: 'Arjun Singh', for: 'Order TC-20486', amount: 8990, method: 'Netbanking', status: 'Paid', date: '18 Sep' },
  { id: 'pay_QX7c44', customer: 'Manish Gupta', for: 'Order TC-20402', amount: 998, method: 'Card', status: 'Refunded', date: '16 Sep' },
]

export const adminTickets = [
  { id: 'T-311', subject: 'QR not printing in correct colour', from: 'Neha Kulkarni', priority: 'High', status: 'Open', updated: '1 hr ago' },
  { id: 'T-310', subject: 'How do I change my card URL?', from: 'Arjun Singh', priority: 'Low', status: 'In Progress', updated: '5 hr ago' },
  { id: 'T-309', subject: 'Invoice with GST number', from: 'Rahul Verma', priority: 'Medium', status: 'Resolved', updated: 'Yesterday' },
]
