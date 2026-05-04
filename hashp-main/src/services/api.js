// ============================================
// FARMER WEBAPP MOBILE - API CONTRACTS
// Backend dev: fill these with real API calls
// ============================================

import {
  farmerProfile,
  farmerNotifications,
  farmerFarms,
  recentActivities,
  faqs,
  supportContact,
} from "../data/farmerMock";

// ---- AUTH --------------------------------

// getFarmerByPhone(phone)
// EXPECTS: phone number string
// RETURNS: { farmerID, name, status }
export const getFarmerByPhone = async (phone) => {
  // TODO: Replace with real API call
  // e.g. POST /api/auth/request-otp { phone }
  await simulateDelay();
  if (phone === farmerProfile.phone) {
    return {
      farmerID: farmerProfile.id,
      name: farmerProfile.name,
      status: farmerProfile.status,
    };
  }
  throw new Error("Farmer not found");
};

// verifyOTP(phone, otp)
// EXPECTS: phone string, 4-digit otp string
// RETURNS: { success: true/false, token }
export const verifyOTP = async (phone, otp) => {
  // TODO: Replace with real API call
  // e.g. POST /api/auth/verify-otp { phone, otp }
  await simulateDelay();
  if (otp === "1234") {
    return { success: true, token: "mock-jwt-token-abc123" };
  }
  return { success: false, token: null };
};

// ---- FARMER DATA -------------------------

// getFarmerProfile(farmerID)
// EXPECTS: farmerID string e.g "HSH-IB-2026-000123"
// RETURNS: { name, phone, dob, gender, state, lga,
//            address, primaryCrop, yearsOfExperience,
//            cooperative, role, status, photo }
export const getFarmerProfile = async (farmerID) => {
  // TODO: Replace with real API call
  // e.g. GET /api/farmers/:farmerID/profile
  await simulateDelay();
  if (farmerID === farmerProfile.id) {
    return {
      id: farmerProfile.id,
      farmerID: farmerProfile.id,
      name: farmerProfile.name,
      fullName: farmerProfile.fullName,
      phone: farmerProfile.phone,
      dob: farmerProfile.dob,
      gender: farmerProfile.gender,
      state: farmerProfile.state,
      lga: farmerProfile.lga,
      address: farmerProfile.address,
      primaryCrop: farmerProfile.primaryCrop,
      secondaryCrops: farmerProfile.secondaryCrops,
      yearsOfExperience: farmerProfile.yearsOfExperience,
      cooperative: farmerProfile.cooperative,
      cooperativeRegNo: farmerProfile.cooperativeRegNo,
      role: farmerProfile.cooperativeRole,
      status: farmerProfile.status,
      photo: farmerProfile.photo,
      farmSize: farmerProfile.farmSize,
      landOwnershipType: farmerProfile.landOwnershipType,
      enrolledDate: farmerProfile.enrolledDate,
      maritalStatus: farmerProfile.maritalStatus,
      education: farmerProfile.education,
      nextOfKin: farmerProfile.nextOfKin,
    };
  }
  throw new Error("Farmer profile not found");
};

// getFarmerID(farmerID)
// EXPECTS: farmerID string
// RETURNS: { farmerID, name, photo, qrCodeURL,
//            cooperative, primaryCrop, expiryDate }
export const getFarmerID = async (farmerID) => {
  // TODO: Replace with real API call
  // e.g. GET /api/farmers/:farmerID/id-card
  await simulateDelay();
  if (farmerID === farmerProfile.id) {
    return {
      farmerID: farmerProfile.id,
      name: farmerProfile.fullName,
      photo: farmerProfile.photo,
      qrCodeURL: farmerProfile.qrCodeURL,
      cooperative: farmerProfile.cooperative,
      primaryCrop: farmerProfile.primaryCrop,
      expiryDate: farmerProfile.expiryDate,
      status: farmerProfile.status,
    };
  }
  throw new Error("Farmer ID not found");
};

// getNotifications(farmerID)
// EXPECTS: farmerID string
// RETURNS: [{ id, title, body, date, read, type }]
export const getNotifications = async (farmerID) => {
  // TODO: Replace with real API call
  // e.g. GET /api/farmers/:farmerID/notifications
  await simulateDelay();
  if (farmerID === farmerProfile.id) {
    return farmerNotifications;
  }
  return [];
};

// shareIDViaWhatsApp(farmerID)
// EXPECTS: farmerID string
// RETURNS: whatsapp share URL string
export const shareIDViaWhatsApp = async (farmerID) => {
  // TODO: Replace with real API call or dynamic profile URL
  // e.g. GET /api/farmers/:farmerID/share-link
  const profileURL = `https://cropex.hashmarcropex.com/verify/${farmerID}`;
  const message = `My Hashmar CropEx Farmer ID is *${farmerID}*. Verify my profile here: ${profileURL}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

// shareIDViaSMS(farmerID)
// EXPECTS: farmerID string
// RETURNS: sms share URL string
export const shareIDViaSMS = async (farmerID) => {
  // TODO: Replace with real API call or dynamic profile URL
  const profileURL = `https://cropex.hashmarcropex.com/verify/${farmerID}`;
  const message = `My Hashmar CropEx Farmer ID: ${farmerID}. Verify: ${profileURL}`;
  return `sms:?body=${encodeURIComponent(message)}`;
};

// getFarmerFarms(farmerID)
// EXPECTS: farmerID string
// RETURNS: [{ id, name, location, crop, size, soilType, conditionType }]
export const getFarmerFarms = async (farmerID) => {
  // TODO: Replace with real API call
  // e.g. GET /api/farmers/:farmerID/farms
  await simulateDelay();
  if (farmerID === farmerProfile.id) {
    return farmerFarms;
  }
  return [];
};

// getRecentActivities(farmerID)
// EXPECTS: farmerID string
// RETURNS: [{ id, title, type, acres, date }]
export const getRecentActivities = async (farmerID) => {
  // TODO: Replace with real API call
  // e.g. GET /api/farmers/:farmerID/activities?limit=10
  await simulateDelay();
  if (farmerID === farmerProfile.id) return recentActivities;
  return [];
};

// getHelpContent()
// EXPECTS: nothing
// RETURNS: { faqs: [{ id, question, answer }], supportContact: { phone, whatsapp, email, fieldAgent } }
export const getHelpContent = async () => {
  // TODO: Replace with real API call
  // e.g. GET /api/help
  await simulateDelay(300);
  return { faqs, supportContact };
};

// ---- UTILITIES ---------------------------

const simulateDelay = (ms = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms));
