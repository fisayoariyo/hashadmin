// ============================================
// HASHMAR CROPEX FARMER APP — MOCK DATA
// TODO: Replace with API call from src/services/api.js
// ============================================

export const farmerProfile = {
  id: "HSH-IB-2026-000123",
  name: "Tomide",
  fullName: "Tomide Adeyemi",
  phone: "08012345678",
  dob: "1988-04-15",
  gender: "Male",
  state: "Oyo",
  lga: "Ibadan North",
  address: "12 Kajola Street, Ibadan, Oyo State",
  primaryCrop: "Maize",
  secondaryCrops: ["Soya bean", "Green Beans"],
  yearsOfExperience: 8,
  cooperative: "Oyo Farmers Cooperative Union",
  cooperativeRole: "Member",
  cooperativeRegNo: "OY-COOP-2019-00441",
  farmSize: "2 hectares",
  landOwnershipType: "Owned",
  status: "Verified",
  photo: "https://randomuser.me/api/portraits/men/45.jpg",
  qrCodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HSH-IB-2026-000123",
  expiryDate: "2028-04-01",
  enrolledDate: "2026-04-01",
  nextOfKin: {
    name: "Funke Adeyemi",
    phone: "08098765432",
    relationship: "Spouse",
  },
  education: "Primary School",
  maritalStatus: "Married",
  nin: "XXXXXXXX123",
  bvn: "XXXXXXXX456",
};

export const farmerNotifications = [
  {
    id: "notif-001",
    title: "Your ID has been created",
    body: "Your Farmer ID HSH-IB-2026-000123 is now active. You can share it with partners and financial institutions.",
    date: "2026-04-01",
    read: false,
    type: "identity",
  },
  {
    id: "notif-002",
    title: "Profile Verified ✅",
    body: "Your farmer profile has been verified by a Hashmar CropEx field agent. You are now eligible for partner services.",
    date: "2026-04-02",
    read: false,
    type: "verification",
  },
  {
    id: "notif-003",
    title: "Loan Access — Coming Soon",
    body: "Loan services will be available to verified farmers soon. We will notify you when you are eligible.",
    date: "2026-04-05",
    read: true,
    type: "info",
  },
  {
    id: "notif-004",
    title: "Farm Support Program",
    body: "A new agricultural training program is launching in Oyo State. Field agents will reach out to registered farmers.",
    date: "2026-04-10",
    read: true,
    type: "update",
  },
  {
    id: "notif-005",
    title: "New Services Coming",
    body: "Market linkage and insurance features are being developed for Hashmar CropEx verified farmers.",
    date: "2026-04-12",
    read: true,
    type: "info",
  },
];

export const faqs = [
  {
    id: "faq-001",
    question: "What is my Farmer ID?",
    answer:
      "Your Farmer ID is a unique code (e.g. HSH-IB-2026-000123) that identifies you as a verified farmer on the Hashmar CropEx platform. You can use it to access loans, insurance, and market services.",
  },
  {
    id: "faq-002",
    question: "How do I use my QR code?",
    answer:
      "Show your QR code to a partner, bank, or field agent. They will scan it to verify your identity instantly — no paperwork needed.",
  },
  {
    id: "faq-003",
    question: "Who can update my profile?",
    answer:
      "Only a Hashmar CropEx field agent can update your profile. Contact your local agent or call our support line to request changes.",
  },
  {
    id: "faq-004",
    question: "Is my information safe?",
    answer:
      "Yes. Your data is encrypted and stored securely. We never share your NIN, BVN, or biometric data with third parties.",
  },
  {
    id: "faq-005",
    question: "How do I share my Farmer ID?",
    answer:
      "Open the 'View My ID' screen and tap 'Share via WhatsApp' or 'Share via SMS'. Your ID and verification link will be sent.",
  },
];

export const supportContact = {
  phone: "0800-HASHMAR",
  whatsapp: "https://wa.me/2348000000000",
  email: "support@hashmarcropex.com",
  fieldAgent: "Bello Musa — 07012345678",
};

export const farmWeather = {
  farmName: "Farm 1",
  location: "Kajola Street, Ibadan, Oyo State",
  farmSize: "Small",
  cropType: "Maize",
  expectedYield: "60 Kg",
  temperature: "28°C",
  condition: "Sunny Day",
  conditionType: "sunny",
  expectedRainfall: "May 10, 2026",
};

export const farmerFarms = [
  {
    id: "farm-001",
    name: "Farm 1",
    location: "Kajola Street, Ibadan, Oyo State",
    crop: "Maize",
    size: "2 hectares",
    soilType: "Loamy Soil",
    conditionType: "sunny",
  },
  {
    id: "farm-002",
    name: "Farm 2",
    location: "Apata Road, Ibadan, Oyo State",
    crop: "Soya bean",
    size: "1.5 hectares",
    soilType: "Clay Soil",
    conditionType: "cloudy",
  },
];

export const recentActivities = [
  {
    id: "act-001",
    title: "Planted Maize",
    type: "plant",
    acres: "2 acres",
    date: "21st June, 2026",
  },
  {
    id: "act-002",
    title: "Watering",
    type: "watering",
    acres: "2 acres",
    date: "21st June, 2026",
  },
  {
    id: "act-003",
    title: "Harvesting",
    type: "harvesting",
    acres: "2 acres",
    date: "21st June, 2026",
  },
  {
    id: "act-004",
    title: "Mapping",
    type: "mapping",
    acres: "2 acres",
    date: "21st June, 2026",
  },
];
