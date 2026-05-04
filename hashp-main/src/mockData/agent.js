// ============================================================
// HASHMAR CROPEX — AGENT MOCK DATA
// TODO: Replace with API calls from src/services/agentApi.js
// ============================================================
const agentSplashImage = "/onboarding/agent-splash.png";

// Onboarding photos served from /public/agent-onboarding/
const agentOnboard1Image = "/onboarding/agent-onboard1.png";
const agentOnboard2Image = "/onboarding/agent-onboard2.png";
const agentOnboard3Image = "/onboarding/agent-onboard3.png";

/** AWM-CA-01 */
export const agentBrandSplash = {
  image: agentSplashImage,
};

/** AWM-CA-02–04 */
export const agentOnboardingSlides = [
  {
    image: agentOnboard1Image,
    title: "Digitally Onboard Farmers",
    sub: "Capture farmer information and biometrics to create verified digital identities that can be trusted across the platform.",
  },
  {
    image: agentOnboard2Image,
    title: "Turn Farmer Data Into Opportunity",
    sub: "Each registered farmer gains access to loans, financing, insurance, training, and structured market opportunities.",
  },
  {
    image: agentOnboard3Image,
    title: "Work Anywhere, Sync Anytime",
    sub: "Complete farmer registrations offline and automatically sync data when internet connection is available.",
  },
];

export const agentSupportContact = {
  phoneDisplay: "+234 XXX XXX XXXX",
  phoneHref: "tel:+2348000000000",
  email: "support@hashmar.com",
};

export const agentData = {
  id: "AGT-001",
  name: "Tomide",
  fullName: "Tomide Adelopo",
  phone: "08012345678",
  email: "tomide@hashmar.com",
  state: "Oyo",
  lga: "Ibadan North",
  status: "Online",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop",
  totalFarmersRegistered: 543,
  syncedFarmers: 1100,
  previousPeriodFarmersRegistered: 485,
  previousPeriodDigitalIdsIssued: 982,
  pendingSync: 8,
  completedSync: 42,
  syncProgress: 8,
};

export const agentRegisteredFarmers = [
  {
    id: "HSH-IB-2026-000123",
    name: "Adebayo Oluwaseun",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&q=80&fit=crop",
    regDate: "20/09/2025",
    status: "synced",
    primaryCrop: "Maize",
    state: "Oyo",
    lga: "Ibadan North",
    phone: "08034291930",
    cooperative: "Oyo Farmers Cooperative Union",
    farmSize: "2 hectares",
    landOwnership: "Owned",
    gender: "Male",
    dob: "20/09/1985",
    nin: "12345678901",
    address: "Elere Area, Ibadan, Oyo State",
    biometric: { face: true, fingerprint: true },
  },
  {
    id: "HSH-IB-2026-000133",
    name: "Adebayo Oluwaseun",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&q=80&fit=crop",
    regDate: "20/09/2025",
    status: "pending",
    primaryCrop: "Maize",
    state: "Oyo",
    lga: "Ibadan North",
    phone: "08034291930",
    cooperative: "Oyo Farmers Cooperative Union",
    farmSize: "2 hectares",
    landOwnership: "Owned",
    gender: "Male",
    dob: "20/09/1985",
    nin: "12345678901",
    address: "Elere Area, Ibadan, Oyo State",
    biometric: { face: true, fingerprint: true },
  },
  {
    id: "HSH-IB-2026-000123",
    name: "Adebayo Oluwaseun",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&q=80&fit=crop",
    regDate: "20/09/2025",
    status: "synced",
    primaryCrop: "Maize",
    state: "Oyo",
    lga: "Ibadan North",
    phone: "08034291930",
    cooperative: "Oyo Farmers Cooperative Union",
    farmSize: "2 hectares",
    landOwnership: "Owned",
    gender: "Male",
    dob: "20/09/1985",
    nin: "12345678901",
    address: "Elere Area, Ibadan, Oyo State",
    biometric: { face: true, fingerprint: true },
  },
  {
    id: "HSH-IB-2026-000124",
    name: "Folake Adesanya",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&q=80&fit=crop",
    regDate: "22/09/2025",
    status: "pending",
    primaryCrop: "Rice",
    state: "Oyo",
    lga: "Ibadan South",
    phone: "08023456789",
    cooperative: "Oyo Farmers Cooperative Union",
    farmSize: "1.5 hectares",
    landOwnership: "Leased",
    gender: "Female",
    dob: "15/05/1990",
    nin: "98765432109",
    address: "Apata Road, Ibadan, Oyo State",
    biometric: { face: true, fingerprint: true },
  },
  {
    id: "HSH-IB-2026-000125",
    name: "Biodun Okafor",
    photo: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=320&q=80&fit=crop",
    regDate: "25/09/2025",
    status: "pending",
    primaryCrop: "Cassava",
    state: "Oyo",
    lga: "Egbeda",
    phone: "08034567890",
    cooperative: "Egbeda Farmers Union",
    farmSize: "3 hectares",
    landOwnership: "Communal",
    gender: "Male",
    dob: "10/11/1978",
    nin: "11223344556",
    address: "Odo-Ona, Ibadan, Oyo State",
    biometric: { face: true, fingerprint: false },
  },
  {
    id: "HSH-IB-2026-000126",
    name: "Yetunde Balogun",
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=320&q=80&fit=crop",
    regDate: "28/09/2025",
    status: "synced",
    primaryCrop: "Yam",
    state: "Oyo",
    lga: "Ona-Ara",
    phone: "08045678901",
    cooperative: "Ona-Ara Cooperative",
    farmSize: "1 hectare",
    landOwnership: "Family",
    gender: "Female",
    dob: "30/01/1995",
    nin: "66778899001",
    address: "Iwo Road, Ibadan, Oyo State",
    biometric: { face: true, fingerprint: true },
  },
];

export const agentFAQs = [
  {
    id: "1",
    question: "How do I register a new farmer?",
    answer: "Tap 'Register New Farmer' on the dashboard. Follow the 4-step process: Biometric → Personal Info → Farm Info → Cooperative. Review and submit.",
  },
  {
    id: "2",
    question: "What if there is no internet connection?",
    answer: "The app works fully offline. All data is saved locally and syncs automatically when you have internet.",
  },
  {
    id: "3",
    question: "How do I sync farmer data?",
    answer: "Tap 'Sync Now' on the dashboard or farmers list to upload all pending records.",
  },
  {
    id: "4",
    question: "Can I edit a farmer's profile after registration?",
    answer: "Yes. Open the farmer's detail screen, tap Edit, and update permitted fields.",
  },
  {
    id: "5",
    question: "What biometrics are required?",
    answer: "Face photo and fingerprint scan. Both must be captured before proceeding to personal info.",
  },
];

export const nigerianStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

export const nigerianLGAs = {
  Abia: ["Aba North","Aba South","Arochukwu","Bende","Ikwuano","Isiala Ngwa North","Isiala Ngwa South","Obingwa","Ohafia","Umuahia North","Umuahia South"],
  Adamawa: ["Demsa","Fufore","Ganye","Girei","Gombi","Guyuk","Hong","Lamurde","Madagali","Maiha","Mayo-Belwa","Michika","Mubi North","Mubi South","Numan","Shelleng","Song","Toungo","Yola North","Yola South"],
  "Akwa Ibom": ["Abak","Eket","Essien Udim","Etinan","Ibeno","Ikot Ekpene","Itu","Mbo","Oron","Uyo"],
  Anambra: ["Aguata","Awka North","Awka South","Dunukofia","Idemili North","Idemili South","Nnewi North","Nnewi South","Onitsha North","Onitsha South"],
  Bauchi: ["Alkaleri","Bauchi","Bogoro","Darazo","Dass","Gamawa","Ganjuwa","Katagum","Misau","Ningi","Toro"],
  Bayelsa: ["Brass","Ekeremor","Kolokuma/Opokuma","Nembe","Ogbia","Sagbama","Southern Ijaw","Yenagoa"],
  Benue: ["Ado","Agatu","Apa","Buruku","Gboko","Guma","Katsina-Ala","Kwande","Makurdi","Otukpo","Ukum"],
  Borno: ["Askira/Uba","Bama","Bayo","Biu","Chibok","Damboa","Dikwa","Gwoza","Jere","Kukawa","Maiduguri","Monguno"],
  "Cross River": ["Abi","Akamkpa","Akpabuyo","Bakassi","Bekwarra","Biase","Calabar Municipal","Calabar South","Ikom","Obudu","Ogoja","Yala"],
  Delta: ["Aniocha North","Aniocha South","Bomadi","Burutu","Ethiope East","Ethiope West","Isoko North","Isoko South","Sapele","Ughelli North","Warri North","Warri South"],
  Ebonyi: ["Abakaliki","Afikpo North","Afikpo South","Ebonyi","Ezza North","Ezza South","Ikwo","Ishielu","Ivo","Ohaozara","Ohaukwu","Onicha"],
  Edo: ["Akoko-Edo","Egor","Esan Central","Esan West","Etsako East","Etsako West","Ikpoba-Okha","Oredo","Orhionmwon","Ovia North-East","Uhunmwonde"],
  Ekiti: ["Ado Ekiti","Efon","Ekiti East","Ekiti West","Emure","Gbonyin","Ijero","Ikere","Ikole","Irepodun/Ifelodun","Oye"],
  Enugu: ["Aninri","Awgu","Enugu East","Enugu North","Enugu South","Ezeagu","Igbo Etiti","Nsukka","Oji River","Udenu","Udi"],
  FCT: ["Abaji","Bwari","Gwagwalada","Kuje","Kwali","Municipal Area Council"],
  Gombe: ["Akko","Balanga","Billiri","Dukku","Funakaye","Gombe","Kaltungo","Kwami","Nafada","Yamaltu/Deba"],
  Imo: ["Aboh Mbaise","Ahiazu Mbaise","Ehime Mbano","Ideato North","Ideato South","Mbaitoli","Ngor Okpala","Oguta","Orlu","Owerri Municipal","Owerri North","Owerri West"],
  Jigawa: ["Auyo","Babura","Birnin Kudu","Dutse","Gagarawa","Gumel","Hadejia","Jahun","Kazaure","Kiyawa","Ringim"],
  Kaduna: ["Birnin Gwari","Chikun","Giwa","Igabi","Ikara","Jaba","Jema'a","Kachia","Kaduna North","Kaduna South","Kagarko","Kajuru","Kaura","Kauru","Kubau","Kudan","Lere","Makarfi","Sabon Gari","Soba","Zangon Kataf","Zaria"],
  Kano: ["Ajingi","Albasu","Bagwai","Bebeji","Bichi","Bunkure","Dala","Dambatta","Dawakin Kudu","Dawakin Tofa","Doguwa","Fagge","Gabasawa","Garko","Gaya","Gezawa","Gwale","Gwarzo","Kano Municipal","Kumbotso","Nasarawa","Rano","Tarauni","Tofa","Ungogo","Wudil"],
  Katsina: ["Bakori","Batagarawa","Batsari","Baure","Daura","Dutsi","Faskari","Funtua","Jibia","Kaita","Kankara","Katsina","Malumfashi","Mani"],
  Kebbi: ["Aleiro","Argungu","Augie","Bagudo","Birnin Kebbi","Bunza","Dandi","Jega","Kalgo","Yauri","Zuru"],
  Kogi: ["Adavi","Ajaokuta","Ankpa","Bassa","Dekina","Ibaji","Idah","Igalamela Odolu","Kabba/Bunu","Lokoja","Okene","Yagba East","Yagba West"],
  Kwara: ["Asa","Baruten","Edu","Ifelodun","Ilorin East","Ilorin South","Ilorin West","Kaiama","Moro","Offa","Oyun","Pategi"],
  Lagos: ["Agege","Ajeromi-Ifelodun","Alimosho","Amuwo-Odofin","Apapa","Badagry","Epe","Eti-Osa","Ibeju-Lekki","Ifako-Ijaiye","Ikeja","Ikorodu","Kosofe","Lagos Island","Lagos Mainland","Mushin","Ojo","Oshodi-Isolo","Shomolu","Surulere"],
  Nasarawa: ["Akwanga","Awe","Doma","Karu","Keana","Keffi","Kokona","Lafia","Nasarawa","Nasarawa Egon","Wamba"],
  Niger: ["Agaie","Agwara","Bida","Borgu","Bosso","Chanchaga","Kontagora","Lapai","Lavun","Mokwa","Paikoro","Rafi","Rijau","Shiroro","Suleja"],
  Ogun: ["Abeokuta North","Abeokuta South","Ado-Odo/Ota","Egbado North","Egbado South","Ewekoro","Ifo","Ijebu East","Ijebu North","Ijebu Ode","Ikenne","Ipokia","Obafemi Owode","Odeda","Odogbolu","Ogun Waterside","Remo North","Shagamu"],
  Ondo: ["Akoko North-East","Akoko North-West","Akoko South-East","Akoko South-West","Akure North","Akure South","Ese Odo","Idanre","Ilaje","Odigbo","Okitipupa","Ondo East","Ondo West","Ose","Owo"],
  Osun: ["Aiyedaade","Atakunmosa East","Atakunmosa West","Ede North","Ede South","Egbedore","Ejigbo","Ife Central","Ife East","Ilesa East","Ilesa West","Iwo","Obokun","Odo Otin","Osogbo"],
  Oyo: ["Afijio","Akinyele","Atiba","Atisbo","Egbeda","Ibadan North","Ibadan North-East","Ibadan North-West","Ibadan South-East","Ibadan South-West","Ibarapa Central","Ibarapa East","Ibarapa North","Ido","Irepo","Iseyin","Itesiwaju","Iwajowa","Kajola","Lagelu","Ogbomoso North","Ogbomoso South","Oluyole","Ona Ara","Orelope","Oyo East","Oyo West","Saki East","Saki West","Surulere"],
  Plateau: ["Barkin Ladi","Bassa","Bokkos","Jos East","Jos North","Jos South","Kanam","Langtang North","Langtang South","Mangu","Pankshin","Riyom","Shendam","Wase"],
  Rivers: ["Abua/Odual","Ahoada East","Ahoada West","Akuku-Toru","Andoni","Asari-Toru","Bonny","Degema","Eleme","Emohua","Etche","Gokana","Ikwerre","Khana","Obio/Akpor","Ogba/Egbema/Ndoni","Okrika","Omuma","Oyigbo","Port Harcourt","Tai"],
  Sokoto: ["Binji","Bodinga","Dange Shuni","Gada","Goronyo","Gwadabawa","Illela","Isa","Kware","Rabah","Shagari","Silame","Sokoto North","Sokoto South","Tambuwal","Wamako","Wurno","Yabo"],
  Taraba: ["Ardo Kola","Bali","Donga","Gashaka","Gassol","Ibi","Jalingo","Karim Lamido","Lau","Sardauna","Takum","Ussa","Wukari","Yorro","Zing"],
  Yobe: ["Bade","Bursari","Damaturu","Fika","Fune","Geidam","Gujba","Gulani","Jakusko","Nguru","Potiskum","Tarmuwa","Yunusari","Yusufari"],
  Zamfara: ["Anka","Bakura","Birnin Magaji/Kiyaw","Bukkuyum","Bungudu","Gummi","Gusau","Kaura Namoda","Maradun","Maru","Shinkafi","Talata Mafara","Tsafe","Zurmi"],
};
