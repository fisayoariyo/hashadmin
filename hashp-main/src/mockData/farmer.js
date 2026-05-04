// ============================================================
// HASHMAR CROPEX — FARMER MOCK DATA
// TODO: Replace with API calls from src/services/api.js
// ============================================================
import farmerSplashImage from "../assets/farmer-onboarding/FWM-CA-01-splash.png";
import farmerOnboard1Image from "../assets/farmer-onboarding/FWM-CA-02-onboard1.jpg";
import farmerOnboard2Image from "../assets/farmer-onboarding/FWM-CA-03-onboard2.jpg";
import farmerOnboard3Image from "../assets/farmer-onboarding/FWM-CA-04-onboard3.jpg";

/** FWM-CA-01 — full-bleed brand moment after role = Farmer (mobile + desktop). */
export const farmerBrandSplash = {
  image: farmerSplashImage,
};

/** FWM-CA-02–04 — three onboarding slides before phone login. */
export const farmerOnboardingSlides = [
  {
    image: farmerOnboard1Image,
    title: "Welcome to your Farmer Profile",
    sub: "You now have a digital identity that helps you access support, loans, and better opportunities.",
  },
  {
    image: farmerOnboard2Image,
    title: "Your Identity Matters",
    sub: "Your Farmer ID makes you visible and verified. It helps you access financial services, insurance, and government support.",
  },
  {
    image: farmerOnboard3Image,
    title: "Access More with Ease",
    sub: "View your profile, get farming support, access markets, and explore opportunities all in one place.",
  },
];

export const farmerData = {
  id: "HSH-IB-2026-000123",
  name: "Adebayo Oluwaseun",
  firstName: "Adebayo",
  phone: "08034291930",
  dob: "20/09/1985",
  gender: "Male",
  state: "Oyo",
  lga: "Ibadan North",
  address: "Elere Area, Ibadan, Oyo State",
  primaryCrop: "Maize",
  secondaryCrops: ["Soybean", "Green Beans"],
  yearsOfExperience: 10,
  cooperative: "Oyo Farmers Cooperative Union",
  cooperativeRole: "Member",
  cooperativeRegNo: "OY-COOP-2019-00441",
  farmSize: "2 hectares",
  landOwnershipType: "Owned",
  status: "Verified",
  photo: "https://via.placeholder.com/150",
  qrCodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HSH-IB-2026-000123",
  expiryDate: "2028-04-01",
  enrolledDate: "2026-04-01",
  maritalStatus: "Married",
  education: "Secondary School",
  nin: "XXXXXXXX123",
  bvn: "XXXXXXXX456",
  nextOfKin: {
    name: "Funke Oluwaseun",
    phone: "08098765432",
    relationship: "Spouse",
  },
};

export const farmerNotifications = [
  {
    id: "notif-001",
    title: "Your ID has been created",
    body: "Your Farmer ID HSH-IB-2026-000123 is now active.",
    date: "2026-04-01",
    read: false,
    type: "identity",
  },
  {
    id: "notif-002",
    title: "Profile Verified ✅",
    body: "Your farmer profile has been verified by a Hashmar CropEx field agent.",
    date: "2026-04-02",
    read: false,
    type: "verification",
  },
  {
    id: "notif-003",
    title: "Loan Access — Coming Soon",
    body: "Loan services will be available to verified farmers soon.",
    date: "2026-04-05",
    read: true,
    type: "info",
  },
];

export const farmerFAQs = [
  {
    id: "faq-001",
    question: "What is my Farmer ID?",
    answer:
      "Your Farmer ID is a unique code that identifies you as a verified farmer on the Hashmar CropEx platform.",
  },
  {
    id: "faq-002",
    question: "How do I use my QR code?",
    answer:
      "Show your QR code to a partner, bank, or field agent. They will scan it to verify your identity instantly.",
  },
  {
    id: "faq-003",
    question: "Who can update my profile?",
    answer:
      "Only a Hashmar CropEx field agent can update your profile.",
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
      "Open 'View My ID' and tap 'Share via WhatsApp' or 'Share via SMS'.",
  },
];

export const farmerSupportContact = {
  phone: "0800-HASHMAR",
  whatsapp: "https://wa.me/2348000000000",
  email: "support@hashmarcropex.com",
  fieldAgent: "Tomide Adelopo — 08012345678",
};

export const farmerFarms = [
  {
    id: "farm-001",
    name: "Farm 1",
    location: "Elere Area, Ibadan, Oyo State",
    crop: "Maize",
    size: "2 hectares",
    soilType: "Loamy Soil",
    conditionType: "sunny",
  },
  {
    id: "farm-002",
    name: "Farm 2",
    location: "Apata Road, Ibadan, Oyo State",
    crop: "Soybean",
    size: "1.5 hectares",
    soilType: "Clay Soil",
    conditionType: "cloudy",
  },
];

export const recentActivities = [
  { id: "act-001", title: "Planted Maize", type: "plant",     acres: "2 acres", date: "21st June, 2026" },
  { id: "act-002", title: "Watering",      type: "watering",  acres: "2 acres", date: "21st June, 2026" },
  { id: "act-003", title: "Harvesting",    type: "harvesting",acres: "2 acres", date: "21st June, 2026" },
  { id: "act-004", title: "Mapping",       type: "mapping",   acres: "2 acres", date: "21st June, 2026" },
];

export const farmWeather = {
  farmName: "Farm 1",
  location: "Elere Area, Ibadan, Oyo State",
  farmSize: "Small",
  cropType: "Maize",
  expectedYield: "60 Kg",
  temperature: "28°C",
  condition: "Sunny Day",
  conditionType: "sunny",
  expectedRainfall: "May 10, 2026",
};
