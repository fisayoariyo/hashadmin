/** Farmer Management mock — replace with API when wired. */

export type AdminFarmerListRow = {
  id: string;
  farmerId: string;
  name: string;
  regDate: string;
  state: string;
  lga: string;
  crop: string;
};

export const adminFarmerCropOptions = ["All crops", "Maize", "Cassava", "Soybean"] as const;

export const adminFarmersList: AdminFarmerListRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  farmerId: `HSH-IB-2026-${String(123 + i).padStart(6, "0")}`,
  name: "Adebayo Oluwaseun",
  regDate: "12/04/2026",
  state: i % 3 === 0 ? "Anambra" : i % 3 === 1 ? "Ekiti" : "Oyo",
  lga: i % 3 === 0 ? "Awka North" : i % 3 === 1 ? "Igbara-odo" : "Ibadan North",
  crop: i % 2 === 0 ? "Maize" : "Cassava",
}));

export type AdminFarmerDetail = {
  farmerId: string;
  enrollingAgent: {
    fullName: string;
    state: string;
    lga: string;
  };
  biometric: { fingerprint: string; face: string };
  personal: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    address: string;
    nin: string;
    bvn: string;
  };
  farm: {
    farmSize: string;
    farmLocation: string;
    cropType: string;
    soilType: string;
    landOwnership: string;
  };
  cooperative: {
    cooperativeName: string;
    registrationNumber: string;
    membershipRole: string;
    lga: string;
    commodityFocus: string[];
    cooperativeSize: string;
    landOwnershipType: string;
    farmSizeHectares: string;
    inputSupplier: string;
  };
  idCard: {
    fullName: string;
    farmerId: string;
    cooperativeName: string;
    agentName: string;
    issueDate: string;
    expiryDate: string;
    photoUrl: string | null;
  };
};

export const adminFarmerDetailById: Record<string, AdminFarmerDetail> = {
  "HSH-IB-2026-000123": {
    farmerId: "HSH-IB-2026-000123",
    enrollingAgent: {
      fullName: "Adesipe Tomide",
      state: "Ondo state",
      lga: "Akure south-east",
    },
    biometric: { fingerprint: "Captured", face: "Captured" },
    personal: {
      fullName: "Adebayo Oluwaseun",
      dateOfBirth: "12 March 1985",
      gender: "Male",
      phone: "0803 000 0000",
      address: "12 Farm road, Ibadan",
      nin: "12345678901",
      bvn: "22334455667",
    },
    farm: {
      farmSize: "2 hectares",
      farmLocation: "Ibadan North, Oyo",
      cropType: "Maize",
      soilType: "Loamy soil",
      landOwnership: "Owned",
    },
    cooperative: {
      cooperativeName: "Oyo Farmers Cooperative Union",
      registrationNumber: "OYO-FCU-2019-004",
      membershipRole: "Member",
      lga: "Ibadan North",
      commodityFocus: ["Maize", "Cassava"],
      cooperativeSize: "120 members",
      landOwnershipType: "Family",
      farmSizeHectares: "2",
      inputSupplier: "AgroPlus Nigeria",
    },
    idCard: {
      fullName: "Adebayo Oluwaseun",
      farmerId: "HSH-IB-2026-000123",
      cooperativeName: "Oyo Farmers Cooperative Union",
      agentName: "Adesipe Tomide",
      issueDate: "20/04/2026",
      expiryDate: "20/04/2027",
      photoUrl: null,
    },
  },
};

export function getAdminFarmerDetail(farmerId: string): AdminFarmerDetail | null {
  const base = adminFarmerDetailById["HSH-IB-2026-000123"];
  if (!base) return null;
  const exact = adminFarmerDetailById[farmerId];
  if (exact) return exact;
  return {
    ...base,
    farmerId,
    idCard: {
      ...base.idCard,
      farmerId,
    },
  };
}

export type AdminEnrollingAgentProfile = {
  fullName: string;
  phone: string;
  email: string;
  registrationDate: string;
  gender: string;
  status: string;
  state: string;
  lga: string;
  totalFarmersRegistered: string;
  lastSync: string;
  lastActive: string;
  photoUrl: string | null;
};

export const adminEnrollingAgentByFarmerId: Record<string, AdminEnrollingAgentProfile> = {
  "HSH-IB-2026-000123": {
    fullName: "Adesipe Tomide",
    phone: "08133905285",
    email: "olatomdo@gmail.com",
    registrationDate: "20/03/2026",
    gender: "Male",
    status: "Verified",
    state: "Ekiti state",
    lga: "Igbara-odo",
    totalFarmersRegistered: "100",
    lastSync: "12/09/2026 • 08:30 am",
    lastActive: "12/09/2026",
    photoUrl: null,
  },
};

export function getAdminEnrollingAgent(farmerId: string): AdminEnrollingAgentProfile | null {
  return (
    adminEnrollingAgentByFarmerId[farmerId] ?? adminEnrollingAgentByFarmerId["HSH-IB-2026-000123"] ?? null
  );
}
