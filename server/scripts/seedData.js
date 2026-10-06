/**
 * ResQNet - Comprehensive Dummy Data Seed Script
 * ================================================
 * Creates realistic dummy data for all collections with Indian locations.
 *
 * Users:
 *   - 8 Public Users
 *   - 20 Shelters (+ ShelterApplication for each)
 *   - 14 Veterinary Staff (+ VetStaffApplication for each)
 *   - 15 Rescue Teams (+ RescueTeamApplication for each)
 *
 * Related Data:
 *   - Animals (assigned to shelters)
 *   - Cages (per shelter)
 *   - MedicineStock (per shelter)
 *   - MedicalRecords (per animal)
 *   - Vaccinations (per animal)
 *   - MedicineRecords (per animal)
 *   - MedicalReminders (per shelter)
 *   - RescueRequests (from public users)
 *   - AdoptionApplications (public users applying for animals)
 *   - Notifications (for all users)
 *   - Categories (animal categories)
 *
 * Usage:
 *   cd server
 *   node scripts/seedData.js
 *   node scripts/seedData.js --clear   (clears existing data first)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// ── Models ────────────────────────────────────────────────────────────────────
const User = require("../modules/users/userModel");
const Shelter = require("../modules/shelters/shelterModel");
const ShelterApplication = require("../modules/shelters/shelterApplicationModel");
const VetStaff = require("../modules/shelters/vetStaffModel");
const VetStaffApplication = require("../modules/shelters/vetStaffApplicationModel");
const RescueTeam = require("../modules/rescues/rescueTeamModel");
const RescueTeamApplication = require("../modules/rescues/rescueTeamApplicationModel");
const Animal = require("../modules/animals/animalModel");
const Category = require("../modules/animals/categoryModel");
const Cage = require("../modules/shelters/cageModel");
const RescueRequest = require("../modules/rescues/rescueRequestModel");
const AdoptionApplication = require("../modules/adoption/adoptionApplicationModel");
const MedicalRecord = require("../modules/medicals/medicalRecordModel");
const Vaccination = require("../modules/medicals/vaccinationModel");
const MedicineRecord = require("../modules/medicals/medicineRecordModel");
const MedicineStock = require("../modules/medicals/medicineStockModel");
const MedicalReminder = require("../modules/medicals/medicalReminderModel");
const Notification = require("../modules/notifications/notificationModel");

// ── Helpers ───────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 6) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// ── Indian Location Pool ──────────────────────────────────────────────────────
const indianLocations = [
  {
    city: "Mumbai",
    district: "Mumbai City",
    state: "Maharashtra",
    pincode: "400001",
    lat: 18.9388,
    lng: 72.8353,
  },
  {
    city: "Delhi",
    district: "Central Delhi",
    state: "Delhi",
    pincode: "110001",
    lat: 28.6448,
    lng: 77.2167,
  },
  {
    city: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    pincode: "560001",
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
    lat: 13.0827,
    lng: 80.2707,
  },
  {
    city: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    lat: 17.385,
    lng: 78.4867,
  },
  {
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    pincode: "700001",
    lat: 22.5726,
    lng: 88.3639,
  },
  {
    city: "Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    city: "Ahmedabad",
    district: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001",
    lat: 23.0225,
    lng: 72.5714,
  },
  {
    city: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    city: "Lucknow",
    district: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226001",
    lat: 26.8467,
    lng: 80.9462,
  },
  {
    city: "Bhopal",
    district: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "462001",
    lat: 23.2599,
    lng: 77.4126,
  },
  {
    city: "Kochi",
    district: "Ernakulam",
    state: "Kerala",
    pincode: "682001",
    lat: 9.9312,
    lng: 76.2673,
  },
  {
    city: "Thiruvananthapuram",
    district: "Thiruvananthapuram",
    state: "Kerala",
    pincode: "695001",
    lat: 8.5241,
    lng: 76.9366,
  },
  {
    city: "Kozhikode",
    district: "Kozhikode",
    state: "Kerala",
    pincode: "673001",
    lat: 11.2588,
    lng: 75.7804,
  },
  {
    city: "Thrissur",
    district: "Thrissur",
    state: "Kerala",
    pincode: "680001",
    lat: 10.5276,
    lng: 76.2144,
  },
  {
    city: "Coimbatore",
    district: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641001",
    lat: 11.0168,
    lng: 76.9558,
  },
  {
    city: "Madurai",
    district: "Madurai",
    state: "Tamil Nadu",
    pincode: "625001",
    lat: 9.9252,
    lng: 78.1198,
  },
  {
    city: "Nagpur",
    district: "Nagpur",
    state: "Maharashtra",
    pincode: "440001",
    lat: 21.1458,
    lng: 79.0882,
  },
  {
    city: "Indore",
    district: "Indore",
    state: "Madhya Pradesh",
    pincode: "452001",
    lat: 22.7196,
    lng: 75.8577,
  },
  {
    city: "Chandigarh",
    district: "Chandigarh",
    state: "Punjab",
    pincode: "160001",
    lat: 30.7333,
    lng: 76.7794,
  },
];

function getLocationWithJitter(base) {
  return {
    ...base,
    lat: parseFloat((base.lat + randFloat(-0.05, 0.05)).toFixed(6)),
    lng: parseFloat((base.lng + randFloat(-0.05, 0.05)).toFixed(6)),
  };
}

// ── Data Pools ────────────────────────────────────────────────────────────────
const firstNames = [
  "Arjun",
  "Priya",
  "Rohit",
  "Sunita",
  "Vikram",
  "Meena",
  "Karthik",
  "Ananya",
  "Suresh",
  "Deepa",
  "Rahul",
  "Kavitha",
  "Arun",
  "Lakshmi",
  "Manoj",
  "Radha",
  "Sanjay",
  "Geeta",
  "Ajay",
  "Pooja",
  "Ravi",
  "Nisha",
  "Vijay",
  "Smita",
  "Ganesh",
  "Rekha",
  "Dinesh",
  "Usha",
  "Rajesh",
  "Aarti",
  "Nikhil",
  "Bharti",
  "Santosh",
  "Seema",
  "Kishore",
  "Swati",
  "Anil",
  "Manju",
  "Ramesh",
  "Shobha",
  "Prakash",
  "Vandana",
  "Sunil",
  "Preeti",
  "Ashish",
  "Rani",
  "Vivek",
  "Neha",
  "Harish",
  "Poonam",
];
const lastNames = [
  "Sharma",
  "Patel",
  "Kumar",
  "Singh",
  "Reddy",
  "Nair",
  "Menon",
  "Iyer",
  "Pillai",
  "Verma",
  "Gupta",
  "Joshi",
  "Rao",
  "Mehta",
  "Chandra",
  "Das",
  "Bose",
  "Mukherjee",
  "Roy",
  "Shah",
  "Desai",
  "Kulkarni",
  "Patil",
  "Naik",
  "Shetty",
  "Hegde",
  "Rao",
  "Mishra",
  "Pandey",
  "Tiwari",
  "Dubey",
  "Shukla",
  "Srivastava",
  "Agarwal",
  "Garg",
  "Bansal",
  "Jain",
  "Saxena",
  "Malhotra",
  "Kapoor",
];

function genName() {
  return `${pick(firstNames)} ${pick(lastNames)}`;
}

function genEmail(name, idx) {
  return `${name
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z.]/g, "")}.${idx}@resqmail.in`;
}

function genPhone() {
  const prefixes = [
    "98",
    "97",
    "96",
    "95",
    "94",
    "93",
    "92",
    "91",
    "90",
    "89",
    "88",
    "87",
    "86",
    "85",
    "84",
    "83",
    "82",
    "81",
    "80",
    "79",
    "78",
    "77",
    "76",
    "75",
    "74",
    "73",
    "72",
    "71",
    "70",
  ];
  return `${pick(prefixes)}${String(randInt(10000000, 99999999))}`;
}

const shelterNames = [
  "Paws & Care Animal Shelter",
  "Happy Tails Rescue Centre",
  "Furry Friends Sanctuary",
  "Safe Haven Animal Home",
  "Rainbow Bridge Shelter",
  "Green Paw Rescue",
  "Hope Animal Welfare Trust",
  "Stray Aid Society",
  "Animal Seva Ashram",
  "Compassion Animal Care",
  "Jeevan Animal Rescue",
  "Ahimsa Pet Shelter",
  "Vande Mataram Animal Home",
  "Seva Sadan Animal Trust",
  "Prani Mitra Shelter",
  "Nityam Animal Care Centre",
  "Aashray Animal Shelter",
  "Preet Animal Home",
  "Maitri Animal Sanctuary",
  "Shakti Animal Rescue Foundation",
];

const rescueTeamNames = [
  "Rapid Paw Rescue Unit",
  "Animal SOS Squad",
  "Swift Rescue Force",
  "Guardian Animal Team",
  "Praani Bachao Dasta",
  "Quick Response Animal Unit",
  "Urban Stray Rescue",
  "Green Shield Rescue",
  "Jeevan Raksha Pathak",
  "Sahayak Animal Squad",
  "Animal Warriors India",
  "Seva Rescue Brigade",
  "Veer Animal Defenders",
  "Karuna Rescue Crew",
  "Mitra Animal Responders",
];

const vehicleNumbers = [
  "MH12AB1234",
  "KA03CD5678",
  "TN07EF9012",
  "DL01GH3456",
  "GJ15IJ7890",
  "WB20KL1234",
  "RJ14MN5678",
  "UP32OP9012",
  "MP09QR3456",
  "KL07ST7890",
  "HR26UV1234",
  "PB10WX5678",
  "TN22YZ9012",
  "MH43AB3456",
  "KA51CD7890",
];

const animalNames = [
  "Bruno",
  "Mango",
  "Coco",
  "Luna",
  "Tiger",
  "Biscuit",
  "Rocky",
  "Sona",
  "Simba",
  "Moti",
  "Max",
  "Roxy",
  "Charlie",
  "Bella",
  "Tommy",
  "Daisy",
  "Rex",
  "Lily",
  "Buddy",
  "Nala",
  "Leo",
  "Molly",
  "Oscar",
  "Zara",
  "Duke",
  "Misty",
  "Copper",
  "Ruby",
  "Jasper",
  "Pearl",
  "Oreo",
  "Honey",
  "Bear",
  "Candy",
  "Flash",
  "Rosie",
  "Shadow",
  "Pixie",
  "Zeus",
  "Stella",
];
const species = ["Dog", "Cat", "Bird", "Rabbit"];
const dogBreeds = [
  "Labrador",
  "German Shepherd",
  "Indian Pariah",
  "Spitz",
  "Beagle",
  "Pomeranian",
  "Dachshund",
  "Pug",
  "Golden Retriever",
  "Border Collie",
];
const catBreeds = [
  "Persian",
  "Indian Domestic",
  "Siamese",
  "Maine Coon",
  "Ragdoll",
  "Tabby",
];
const birdBreeds = ["Parrot", "Pigeon", "Sparrow", "Myna", "Budgerigar"];
const rabbitBreeds = ["New Zealand White", "Angora", "Dutch", "Lionhead"];
const colors = [
  "Brown",
  "Black",
  "White",
  "Golden",
  "Grey",
  "Spotted",
  "Tricolor",
  "Cream",
  "Orange",
  "Black & White",
];
const animalStatuses = [
  "Available",
  "Adoption Pending",
  "Adopted",
  "Rescued",
  "Under Treatment",
  "Critical",
];

function getBreed(sp) {
  if (sp === "Dog") return pick(dogBreeds);
  if (sp === "Cat") return pick(catBreeds);
  if (sp === "Bird") return pick(birdBreeds);
  return pick(rabbitBreeds);
}

const vaccineNames = [
  "Rabies Vaccine",
  "Distemper",
  "Parvovirus",
  "Adenovirus",
  "Bordetella",
  "Leptospirosis",
  "Feline Calicivirus",
  "Panleukopenia",
];
const medicineNames = [
  "Amoxicillin",
  "Metronidazole",
  "Doxycycline",
  "Ivermectin",
  "Meloxicam",
  "Prednisolone",
  "Fenbendazole",
  "Tramadol",
  "Furosemide",
  "Enalapril",
];
const medCategories = [
  "Antibiotic",
  "Antiparasitic",
  "Anti-inflammatory",
  "Anesthetic",
  "Vaccine",
  "Supplement",
  "Antiseptic",
  "Other",
];
const suppliers = [
  "Intas Pharma",
  "Cipla Animal Health",
  "Vetoquinol India",
  "Zoetis India",
  "Virbac India",
  "Elanco India",
];

const rescueTypes = [
  "Injured",
  "Lost",
  "Aggressive",
  "Abandoned",
  "Sick",
  "Dead",
  "Stranded",
  "Deceased",
];
const rescuePriorities = ["Low", "Medium", "High", "Emergency"];
const rescueStatuses = [
  "Pending",
  "Accepted",
  "In Transit",
  "Completed",
  "Cancelled",
];

// ── Main Seed Function ────────────────────────────────────────────────────────
async function seed() {
  const clearMode = process.argv.includes("--clear");

  console.log("\n=== ResQNet Seed Script Starting ===");
  console.log(`Mode: ${clearMode ? "CLEAR + SEED" : "SEED ONLY (append)"}\n`);

  // Connect
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resqnet",
  );
  console.log("MongoDB Connected\n");

  if (clearMode) {
    console.log("Clearing existing data (Admin users preserved)...");
    // Drop collections for a truly clean slate (avoids stale index/id state)
    const collectionsToDrop = [
      "shelters",
      "shelterapplications",
      "vetstaffs",
      "vetstaffapplications",
      "rescueteams",
      "rescueteamapplications",
      "animals",
      "categories",
      "cages",
      "rescuerequests",
      "adoptionapplications",
      "medicalrecords",
      "vaccinations",
      "medicinerecords",
      "medicinestocks",
      "medicalreminders",
      "notifications",
    ];
    await User.deleteMany({ role: { $ne: "Admin" } });
    for (const col of collectionsToDrop) {
      try {
        await mongoose.connection.db.collection(col).drop();
      } catch (e) {
        // Collection may not exist yet — that's fine
      }
    }
    console.log("Data cleared\n");
  }

  // Helper: save a Mongoose doc with retry on duplicate key (_id collision)
  async function saveDoc(doc) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await doc.save();
      } catch (err) {
        if (err.code === 11000 && attempt < 2) {
          // Regenerate _id and any auto-ID fields so the next attempt is clean
          doc._id = new mongoose.Types.ObjectId();
          doc.isNew = true;
          // Clear auto-generated string IDs so pre-save hooks regenerate them
          if (doc.medicineRecordId) doc.medicineRecordId = undefined;
          if (doc.medicineReminderId) doc.medicineReminderId = undefined;
          if (doc.vaccinationId) doc.vaccinationId = undefined;
          if (doc.medicalRecordId) doc.medicalRecordId = undefined;
        } else {
          throw err;
        }
      }
    }
  }

  // Plain text password — the User model's pre-save hook will hash it
  const plainPassword = "Password@123";

  // ── 1. CATEGORIES ──────────────────────────────────────────────────────────
  console.log("Creating Categories...");
  const categoryData = [
    { categoryName: "Dog", description: "Domestic dogs of all breeds" },
    { categoryName: "Cat", description: "Domestic cats of all breeds" },
    { categoryName: "Bird", description: "Pet and rescued birds" },
    { categoryName: "Rabbit", description: "Domesticated rabbits" },
  ];

  const categories = [];
  for (const cd of categoryData) {
    let cat = await Category.findOne({ categoryName: cd.categoryName });
    if (!cat) {
      cat = await new Category(cd).save();
    }
    categories.push(cat);
  }
  console.log(`  ${categories.length} categories ready\n`);

  // ── 2. PUBLIC USERS (8) ────────────────────────────────────────────────────
  console.log("Creating 8 Public Users...");
  const publicUsers = [];
  for (let i = 0; i < 8; i++) {
    const loc = getLocationWithJitter(
      indianLocations[i % indianLocations.length],
    );
    const name = genName();
    const email = genEmail(name, `pub${i + 1}`);
    let user = await User.findOne({ email });
    if (!user) {
      user = await new User({
        fullName: name,
        email,
        phoneNumber: genPhone(),
        password: plainPassword,
        role: "Public User",
        address: `${randInt(1, 999)}, ${pick(["MG Road", "Gandhi Nagar", "Nehru Street", "Rajiv Colony", "Ambedkar Nagar"])}`,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
        dob: new Date(
          `${randInt(1980, 2000)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
        ),
        isEmailVerified: true,
        status: "Active",
      }).save();
    }
    publicUsers.push({ user, loc });
    console.log(`  Public User ${i + 1}: ${name} | ${email}`);
  }
  console.log();

  // ── 3. SHELTER USERS + APPLICATIONS + SHELTERS (20) ───────────────────────
  console.log("Creating 20 Shelters...");
  const shelters = [];
  const shelterUsers = [];
  const registrationTypes = [
    "NGO_DARPAN",
    "MCA_CIN",
    "NGO_PAN",
    "AWBI_ID",
    "STATE_TRUST_SOCIETY",
  ];

  for (let i = 0; i < 20; i++) {
    const loc = getLocationWithJitter(
      indianLocations[i % indianLocations.length],
    );
    const name = genName();
    const email = genEmail(name, `shelter${i + 1}`);
    const shelterName = shelterNames[i];
    const shelterEmail = `info.${i + 1}@${shelterName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .substring(0, 20)}.org`;
    const totalCages = randInt(10, 40);
    const occupiedCages = randInt(0, totalCages);
    const regType = registrationTypes[i % registrationTypes.length];
    const regNumber = `IND${String(i + 1).padStart(4, "0")}REG${randInt(1000, 9999)}`;

    let shelterUser = await User.findOne({ email });
    if (!shelterUser) {
      shelterUser = await new User({
        fullName: name,
        email,
        phoneNumber: genPhone(),
        password: plainPassword,
        role: "Shelter",
        address: `${randInt(1, 99)}, ${pick(["Animal Welfare Road", "Rescue Lane", "Seva Street", "Green Park"])}`,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
        dob: new Date(
          `${randInt(1975, 1995)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
        ),
        isEmailVerified: true,
        status: "Active",
      }).save();
    }
    shelterUsers.push(shelterUser);

    let shelterApp = await ShelterApplication.findOne({
      userId: shelterUser._id,
    });
    if (!shelterApp) {
      shelterApp = await new ShelterApplication({
        applicantId: shelterUser._id,
        userId: shelterUser._id,
        registrationType: regType,
        registrationNumber: regNumber,
        shelterName,
        shelterEmail,
        shelterPhoneNumber: parseInt(genPhone()),
        latitude: loc.lat,
        longitude: loc.lng,
        totalStaffs: randInt(3, 15),
        totalCages,
        occupiedCages,
        isEmailVerified: true,
        isPhoneVerified: true,
        applicationStatus: "Approved",
        reviewNote:
          "Shelter verified on-site. Facilities meet ResQNet standards.",
        siteVisitScheduleDate: daysAgo(randInt(30, 90)),
        siteVisitReport:
          "Facility inspected. Adequate cage space, clean environment, proper medical supplies.",
        siteVisitReportDate: daysAgo(randInt(15, 29)),
        siteVisitNotes: "Recommended for approval.",
        siteVisitInspector: genName(),
      }).save();
    }

    let shelter = await Shelter.findOne({ userId: shelterUser._id });
    if (!shelter) {
      shelter = await new Shelter({
        shelterApplicationId: shelterApp.shelterApplicationId,
        userId: shelterUser._id,
        registrationType: regType,
        registrationNumber: regNumber,
        shelterName,
        shelterEmail,
        shelterPhoneNumber: parseInt(genPhone()),
        latitude: loc.lat,
        longitude: loc.lng,
        totalStaffs: randInt(3, 15),
        totalCages,
        occupiedCages,
        shelterStatus: pick(["OPEN", "FULL", "UNDER_MAINTENANCE"]),
        status: "Active",
      }).save();
    }

    shelters.push({ shelter, shelterUser, loc });
    console.log(`  Shelter ${i + 1}: ${shelterName} (${loc.city})`);
  }
  console.log();

  // ── 4. CAGES ───────────────────────────────────────────────────────────────
  console.log("Creating Cages...");
  const allCages = [];
  for (const { shelter } of shelters) {
    const cageCount = Math.min(shelter.totalCages, 8);
    for (let c = 1; c <= cageCount; c++) {
      let cage = await Cage.findOne({ shelterId: shelter._id, cageNumber: c });
      if (!cage) {
        cage = await new Cage({
          shelterId: shelter._id,
          categoryId: pick(categories)._id,
          cageNumber: c,
          type: pick(["Initial", "Normal", "Quarantine", "Recovery"]),
          status: c <= shelter.occupiedCages ? "OCCUPIED" : "AVAILABLE",
        }).save();
      }
      allCages.push(cage);
    }
  }
  console.log(`  ${allCages.length} cages created\n`);

  // ── 5. ANIMALS (2-4 per shelter) ───────────────────────────────────────────
  console.log("Creating Animals...");
  const animals = [];
  let animalNameIdx = 0;
  for (const { shelter, loc } of shelters) {
    const count = randInt(2, 4);
    for (let a = 0; a < count; a++) {
      const sp = pick(species);
      const aName = animalNames[animalNameIdx % animalNames.length];
      animalNameIdx++;
      const animal = await new Animal({
        name: aName,
        shelterId: shelter._id,
        shelterName: shelter.shelterName,
        species: sp,
        breed: getBreed(sp),
        gender: pick(["Male", "Female", "Unknown"]),
        approxAge: `${randInt(1, 8)} years`,
        color: pick(colors),
        currentSize: pick(["Small", "Medium", "Large"]),
        weight: `${randInt(2, 35)} kg`,
        neutered: Math.random() > 0.5,
        spayedNeutered: Math.random() > 0.5,
        microchipped: Math.random() > 0.6,
        microchipNumber: `IND${randInt(100000000, 999999999)}`,
        specialMedicalNeeds: pick([
          "None",
          "None",
          "None",
          "Diabetes management",
          "Heart medication",
          "Skin treatment",
        ]),
        energyLevel: pick(["Calm", "Low", "Moderate", "High", "Very High"]),
        training: pick([
          "House-trained, Basic commands",
          "Untrained",
          "House-trained",
          "Basic commands",
        ]),
        about: `${aName} is a friendly ${sp.toLowerCase()} looking for a loving home.`,
        backgroundStory: `Found near ${loc.city} and brought to ${shelter.shelterName}.`,
        shelterCity: loc.city,
        shelterState: loc.state,
        shelterRegistrationNumber: shelter.shelterNumber,
        cageNumber: String(randInt(1, 8)),
        healthCondition: pick([
          "Healthy",
          "Healthy",
          "Under Observation",
          "Recovering",
        ]),
        status: pick(animalStatuses),
        vaccinations: [
          {
            name: pick(vaccineNames),
            date: daysAgo(randInt(30, 300)).toISOString().split("T")[0],
            status: "Completed",
          },
        ],
      }).save();
      animals.push({ animal, shelter, loc });
    }
  }
  console.log(`  ${animals.length} animals created\n`);

  // ── 6. VET STAFF (14) ──────────────────────────────────────────────────────
  console.log("Creating 14 Veterinary Staff...");
  const vetStaffs = [];
  const positions = ["Veterinary Doctor", "Veterinary Nurse"];
  const qualifications = [
    "BVSc & AH",
    "MVSc",
    "PhD Veterinary Science",
    "BVSc",
  ];
  const specializations = [
    "General Practice",
    "Surgery",
    "Dermatology",
    "Orthopedics",
    "Ophthalmology",
    "General Canine & Feline Medicine",
  ];

  for (let i = 0; i < 14; i++) {
    const { shelter, loc } = shelters[i % shelters.length];
    const name = genName();
    const email = genEmail(name, `vet${i + 1}`);
    const phone = genPhone();
    const pos = pick(positions);
    const qual = pick(qualifications);
    const spec = pick(specializations);
    const expYears = randInt(1, 20);
    const councilReg = `VCI${randInt(100000, 999999)}`;

    let vetUser = await User.findOne({ email });
    if (!vetUser) {
      vetUser = await new User({
        fullName: name,
        email,
        phoneNumber: phone,
        password: plainPassword,
        role: "Veterinary Staff",
        address: `${randInt(1, 99)}, Veterinary Colony`,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
        dob: new Date(
          `${randInt(1975, 1998)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
        ),
        isEmailVerified: true,
        status: "Active",
      }).save();
    }

    let vetApp = await VetStaffApplication.findOne({ userId: vetUser._id });
    if (!vetApp) {
      vetApp = await new VetStaffApplication({
        userId: vetUser._id,
        fullName: name,
        email,
        phone,
        district: loc.district,
        city: loc.city,
        position: pos,
        councilRegistrationNumber: councilReg,
        qualification: qual,
        specialization: spec,
        experienceYears: expYears,
        targetShelterId: shelter._id,
        targetShelterName: shelter.shelterName,
        assignedShelterId: shelter._id,
        assignedShelterName: shelter.shelterName,
        status: "Approved",
        interviewReport: "Candidate demonstrated strong clinical skills.",
        interviewReportDate: daysAgo(randInt(10, 60)),
        interviewReportDecision: "Approved",
        interviewChecks: {
          licenseVerified: true,
          surgicalCompetence: true,
          animalHandlingReadiness: true,
          shelterAgreement: true,
        },
        vetStaffId: `VS-${String(i + 1).padStart(4, "0")}`,
        vetStaffNumber: `VSN${String(i + 1).padStart(3, "0")}`,
      }).save();
    }

    let vetStaff = await VetStaff.findOne({ userId: vetUser._id });
    if (!vetStaff) {
      vetStaff = await new VetStaff({
        shelterId: shelter._id,
        userId: vetUser._id,
        vetStaffApplicationId: vetApp.vetStaffApplicationId,
        fullName: name,
        email,
        phone,
        councilRegistrationNumber: councilReg,
        qualification: qual,
        specialization: spec,
        position: pos,
        joiningDate: daysAgo(randInt(30, 365)),
        experience: expYears,
        availability: pick(["Available", "On Leave"]),
        status: "Active",
        canManageMedicineStock: pos === "Veterinary Doctor",
      }).save();
    }

    vetStaffs.push({ vetStaff, vetUser, shelter, loc });
    console.log(
      `  Vet Staff ${i + 1}: ${name} (${pos}) -> ${shelter.shelterName}`,
    );
  }
  console.log();

  // ── 7. RESCUE TEAMS (15) ───────────────────────────────────────────────────
  console.log("Creating 15 Rescue Teams...");
  const rescueTeams = [];
  const equipmentSets = [
    [
      "First Aid Kit",
      "Gloves & Handling Gear",
      "Animal Carrier",
      "Tranquilizer Kit",
    ],
    ["First Aid Kit", "Gloves & Handling Gear", "Stretcher", "Flashlight"],
    ["First Aid Kit", "Animal Carrier", "Rope & Harness", "Water Supply"],
  ];

  for (let i = 0; i < 15; i++) {
    const loc = getLocationWithJitter(
      indianLocations[i % indianLocations.length],
    );
    const name = genName();
    const email = genEmail(name, `rescue${i + 1}`);
    const phone = genPhone();
    const tName = rescueTeamNames[i];
    const vehicleNum = vehicleNumbers[i];
    const vehicleType = pick(["Van", "Ambulance", "Bike", "Car"]);

    let rtUser = await User.findOne({ email });
    if (!rtUser) {
      rtUser = await new User({
        fullName: name,
        email,
        phoneNumber: phone,
        password: plainPassword,
        role: "Rescue Team",
        address: `${randInt(1, 99)}, Rescue Nagar`,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
        dob: new Date(
          `${randInt(1980, 1998)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
        ),
        isEmailVerified: true,
        status: "Active",
      }).save();
    }

    let rtApp = await RescueTeamApplication.findOne({
      applicantId: rtUser._id,
    });
    if (!rtApp) {
      rtApp = await new RescueTeamApplication({
        applicantId: rtUser._id,
        rescueTeamName: tName,
        applicantName: name,
        contactEmail: email,
        contactPhone: phone,
        operatingDistrict: loc.district,
        coverageZone: `${loc.district} and surrounding areas`,
        vehicleNumber: vehicleNum,
        vehicleType,
        totalMembers: randInt(3, 10),
        equipment: pick(equipmentSets),
        address: `${randInt(1, 99)}, ${loc.city}`,
        pincode: loc.pincode,
        state: loc.state,
        district: loc.district,
        city: loc.city,
        latitude: loc.lat,
        longitude: loc.lng,
        notes: `Experienced team in ${loc.district}.`,
        applicationStatus: "Approved",
        teamVisitReport:
          "Team vehicles and equipment verified. Members adequately trained.",
        teamVisitReportDate: daysAgo(randInt(10, 60)),
        teamVisitChecks: {
          vehicleVerified: true,
          equipmentVerified: true,
          membersVerified: true,
          safetyCompliance: true,
        },
      }).save();
    }

    let rt = await RescueTeam.findOne({ userId: rtUser._id });
    if (!rt) {
      rt = await new RescueTeam({
        userId: rtUser._id,
        teamLeadId: rtUser._id,
        rescueTeamApplicationId: rtApp.rescueTeamApplicationId,
        rescueTeamEmail: email,
        vehicleNumber: vehicleNum,
        vehicleType,
        rescueTeamName: tName,
        contactPhone: phone,
        operatingDistrict: loc.district,
        address: `${randInt(1, 99)}, ${loc.city}`,
        pincode: loc.pincode,
        state: loc.state,
        district: loc.district,
        city: loc.city,
        coverageZone: `${loc.district} and surrounding areas`,
        latitude: loc.lat,
        longitude: loc.lng,
        currentLocation: {
          latitude: loc.lat,
          longitude: loc.lng,
          updatedAt: new Date(),
        },
        availability: pick(["Available", "Available", "Busy", "Offline"]),
        status: "Active",
      }).save();
    }

    rescueTeams.push({ rt, rtUser, loc });
    console.log(
      `  Rescue Team ${i + 1}: ${tName} (${loc.district}, ${vehicleType})`,
    );
  }
  console.log();

  // ── 8. MEDICINE STOCK (3-5 per shelter) ───────────────────────────────────
  console.log("Creating Medicine Stock...");
  let stockCount = 0;
  for (const { shelter } of shelters) {
    const staffForShelter = vetStaffs.find((vs) =>
      vs.shelter._id.equals(shelter._id),
    );
    for (let m = 0; m < randInt(3, 5); m++) {
      await new MedicineStock({
        shelterId: shelter._id,
        addedByVetStaffId: staffForShelter
          ? staffForShelter.vetStaff._id
          : null,
        addedByName: staffForShelter
          ? staffForShelter.vetStaff.fullName
          : "Admin",
        medicineName: pick(medicineNames),
        category: pick(medCategories),
        unit: pick(["Tablet", "Capsule", "Vial", "Bottle", "Ampoule"]),
        quantity: randInt(0, 200),
        lowStockThreshold: randInt(10, 30),
        expiryDate: daysFromNow(randInt(30, 730)),
        batchNumber: `BATCH${randInt(10000, 99999)}`,
        supplier: pick(suppliers),
        notes: "Regular stock replenishment.",
      }).save();
      stockCount++;
    }
  }
  console.log(`  ${stockCount} medicine stock entries created\n`);

  // ── 9. MEDICAL RECORDS + VACCINATIONS + MEDICINE RECORDS ──────────────────
  console.log("Creating Medical Records, Vaccinations & Medicine Records...");
  let mrCount = 0,
    vacCount = 0,
    medRecCount = 0,
    reminderCount = 0;
  for (const { animal, shelter } of animals) {
    const vetForShelter = vetStaffs.find((vs) =>
      vs.shelter._id.equals(shelter._id),
    );
    const vetName = vetForShelter
      ? vetForShelter.vetStaff.fullName
      : "Dr. Unassigned";
    const vetUserId = vetForShelter ? vetForShelter.vetUser._id : null;

    const mrType = pick([
      "Diagnosis",
      "Treatment",
      "Surgery",
      "Routine Checkup",
    ]);
    const mr = await new MedicalRecord({
      animalId: animal.animalId,
      animalObjectId: animal._id,
      animalName: animal.name,
      species: animal.species,
      shelterId: shelter._id,
      vetUserId,
      vetName,
      type: mrType,
      report: `${mrType} performed on ${animal.name}. ${pick(["Animal in good health.", "Treatment initiated.", "Recovery progressing well.", "Follow-up required."])}`,
      reportDate: daysAgo(randInt(1, 60)),
      vitals: {
        temperature: `${(38 + Math.random() * 2).toFixed(1)}C`,
        weight: `${randInt(2, 35)} kg`,
        pulse: `${randInt(60, 120)} bpm`,
        mucosalColor: pick(["Pink", "Pale Pink", "Normal"]),
      },
      isSurgery: mrType === "Surgery",
      surgeryDetails:
        mrType === "Surgery"
          ? {
              procedureName: pick([
                "Spay",
                "Neuter",
                "Wound Closure",
                "Fracture Repair",
              ]),
              anesthesia: "General Anesthesia",
              surgeon: vetName,
              postOpCare:
                "Administer antibiotics for 7 days, restrict movement.",
            }
          : {},
      nextVisitDate: daysFromNow(randInt(7, 30)),
      status: pick(["Ongoing", "Improving", "Completed"]),
    });
    await saveDoc(mr);
    mrCount++;

    const vac = new Vaccination({
      animalId: animal.animalId,
      animalObjectId: animal._id,
      animalName: animal.name,
      species: animal.species,
      shelterId: shelter._id,
      vaccineName: pick(vaccineNames),
      dateGiven: daysAgo(randInt(10, 180)),
      nextDueDate: daysFromNow(randInt(180, 365)),
      administeredBy: vetName,
      batchNumber: `VAC${randInt(10000, 99999)}`,
      remarks: "Annual vaccination. Animal responded well.",
      reminderSent: Math.random() > 0.5,
    });
    await saveDoc(vac);
    vacCount++;

    const medRec = await new MedicineRecord({
      animalId: animal.animalId,
      medicineName: pick(medicineNames),
      route: pick(["Oral", "Injection", "Topical"]),
      dosage: `${randInt(1, 5)} ${pick(["tablet", "ml", "drops"])} per dose`,
      frequency: pick(["Once daily", "Twice daily", "Every 8 hours", "Weekly"]),
      startDate: daysAgo(randInt(1, 30)),
      endDate: daysFromNow(randInt(5, 14)),
    });
    await saveDoc(medRec);
    medRecCount++;

    const reminder = new MedicalReminder({
      medicineRecordId: medRec.medicineRecordId,
      shelterId: shelter._id,
      animalId: animal.animalId,
      animalObjectId: animal._id,
      animalName: animal.name,
      reminderType: pick([
        "Vaccination Due",
        "Post-Op Checkup",
        "Routine Examination",
        "Medication Schedule",
      ]),
      reminderTime: daysFromNow(randInt(1, 30)),
      dueDate: daysFromNow(randInt(3, 60)),
      notes: `Reminder for ${animal.name}: Next scheduled care visit.`,
      sentByVetName: vetName,
      shelterNotified: true,
      status: pick(["Pending", "Sent"]),
    });
    await saveDoc(reminder);
    reminderCount++;
  }
  console.log(
    `  ${mrCount} medical records, ${vacCount} vaccinations, ${medRecCount} medicine records, ${reminderCount} reminders\n`,
  );

  // ── 10. RESCUE REQUESTS (2-3 per public user) ─────────────────────────────
  console.log("Creating Rescue Requests...");
  const rescueRequests = [];
  for (const { user, loc } of publicUsers) {
    for (let r = 0; r < randInt(2, 3); r++) {
      const type = pick(rescueTypes);
      const status = pick(rescueStatuses);
      const assignedTeam = Math.random() > 0.3 ? pick(rescueTeams) : null;
      const nearestShelter = pick(shelters);

      let stage = "Broadcasted";
      if (status === "Accepted") stage = "Accepted";
      else if (status === "In Transit")
        stage = pick([
          "En Route",
          "Arrived on Scene",
          "Animal Rescued",
          "Transporting to Shelter",
        ]);
      else if (status === "Completed")
        stage = pick(["Delivered to Shelter", "Completed"]);
      else if (status === "Cancelled") stage = "Cancelled";

      const rr = await new RescueRequest({
        userId: user._id,
        animalType: pick(["Dog", "Cat", "Bird", "Monkey", "Cow"]),
        animalCondition: type,
        type,
        priority: pick(rescuePriorities),
        description: `${type} animal spotted near ${loc.city}. Needs immediate assistance.`,
        locationAddress: `${randInt(1, 999)}, ${pick(["MG Road", "Station Road", "Market Street"])}, ${loc.city}`,
        city: loc.city,
        district: loc.district,
        latitude: parseFloat((loc.lat + randFloat(-0.02, 0.02)).toFixed(6)),
        longitude: parseFloat((loc.lng + randFloat(-0.02, 0.02)).toFixed(6)),
        status,
        rescueStage: stage,
        assignedRescueTeamId: assignedTeam ? assignedTeam.rt._id : null,
        assignedRescueTeamNumber: assignedTeam
          ? assignedTeam.rt.rescueTeamNumber
          : "",
        assignedRescueTeamName: assignedTeam
          ? assignedTeam.rt.rescueTeamName
          : "",
        assignedRescueTeamPhone: assignedTeam
          ? assignedTeam.rt.contactPhone
          : "",
        assignedRescueTeamVehicle: assignedTeam
          ? assignedTeam.rt.vehicleNumber
          : "",
        destinationShelterId: nearestShelter.shelter._id,
        destinationShelterName: nearestShelter.shelter.shelterName,
        destinationShelterLocation: {
          latitude: nearestShelter.loc.lat,
          longitude: nearestShelter.loc.lng,
          address: `${nearestShelter.shelter.shelterName}, ${nearestShelter.loc.city}`,
        },
        shelterNotified: status !== "Pending",
        shelterIntakeStatus: status === "Completed" ? "Admitted" : "None",
        trackingTimeline: [
          {
            stage: "Broadcasted",
            timestamp: daysAgo(randInt(1, 10)),
            note: "Rescue request submitted.",
            location: { latitude: loc.lat, longitude: loc.lng },
          },
        ],
        rescuedAt: status === "Completed" ? daysAgo(randInt(0, 5)) : null,
      }).save();
      rescueRequests.push(rr);
    }
  }
  console.log(`  ${rescueRequests.length} rescue requests created\n`);

  // ── 11. ADOPTION APPLICATIONS (1-2 per public user) ───────────────────────
  console.log("Creating Adoption Applications...");
  const housingTypes = ["House", "Apartment", "Townhouse", "Mobile Home"];
  const appStatuses = [
    "Pending",
    "Under Review",
    "Shelter Visit",
    "Approved",
    "Rejected",
  ];
  let adoptionCount = 0;
  const usedPairs = new Set();

  for (const { user } of publicUsers) {
    const shuffledAnimals = [...animals].sort(() => Math.random() - 0.5);
    for (let a = 0; a < randInt(1, 2); a++) {
      if (a >= shuffledAnimals.length) break;
      const { animal, shelter } = shuffledAnimals[a];
      const pairKey = `${user._id}-${animal._id}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      const appStatus = pick(appStatuses);
      const ownership = pick(["Own", "Rent"]);

      await new AdoptionApplication({
        pet_id: animal._id,
        applicant_id: user._id,
        shelter_id: shelter._id,
        application_status: appStatus,
        housing_type: pick(housingTypes),
        ownership_status: ownership,
        landlord_details:
          ownership === "Rent"
            ? { name: genName(), phone: genPhone() }
            : { name: "", phone: "" },
        agreements: { return_policy: true },
        submitted_at: daysAgo(randInt(1, 30)),
        notes: `I would love to adopt ${animal.name}. I have suitable home and experience with ${animal.species.toLowerCase()}s.`,
        appointment:
          appStatus === "Shelter Visit"
            ? {
                date: daysFromNow(randInt(3, 14)),
                time: `${randInt(10, 16)}:00`,
                location: shelter.shelterName,
                notes: "Please bring valid ID proof.",
                status: "Scheduled",
                scheduledAt: daysAgo(randInt(0, 5)),
              }
            : { status: "None" },
        visitReport:
          appStatus === "Approved"
            ? {
                reportText:
                  "Applicant home visited. Suitable environment confirmed.",
                decision: "Approved",
                checks: {
                  visitDone: true,
                  housingVerified: true,
                  agreementConfirmed: true,
                },
                submittedAt: daysAgo(randInt(0, 5)),
              }
            : { decision: "" },
        remarks:
          appStatus === "Rejected" ? "Insufficient space for the animal." : "",
      }).save();
      adoptionCount++;
    }
  }
  console.log(`  ${adoptionCount} adoption applications created\n`);

  // ── 12. NOTIFICATIONS ─────────────────────────────────────────────────────
  console.log("Creating Notifications...");
  const allUsers = [
    ...publicUsers.map((p) => p.user),
    ...shelterUsers,
    ...vetStaffs.map((v) => v.vetUser),
    ...rescueTeams.map((r) => r.rtUser),
  ];

  const roleNotifs = {
    "Public User": [
      {
        title: "Rescue Request Update",
        message: "Your rescue request has been assigned to a nearby team.",
        type: "Rescue",
        priority: "High",
      },
      {
        title: "Adoption Application Status",
        message: "Your adoption application is under review.",
        type: "Adoption",
        priority: "Medium",
      },
    ],
    Shelter: [
      {
        title: "New Vet Staff Assigned",
        message:
          "A new veterinary staff member has been assigned to your shelter.",
        type: "Veterinary",
        priority: "Medium",
      },
      {
        title: "Animal Incoming",
        message: "A rescued animal is being transported to your shelter.",
        type: "Rescue",
        priority: "High",
      },
    ],
    "Veterinary Staff": [
      {
        title: "Vaccination Due Reminder",
        message:
          "Three animals at your shelter are due for vaccination next week.",
        type: "Vaccination",
        priority: "Medium",
      },
      {
        title: "Medicine Stock Low",
        message: "Amoxicillin stock is running low. Please reorder.",
        type: "Medicine",
        priority: "High",
      },
    ],
    "Rescue Team": [
      {
        title: "New Rescue Request",
        message: "A new rescue request has been broadcasted in your area.",
        type: "Rescue",
        priority: "Emergency",
      },
      {
        title: "Assignment Confirmed",
        message: "You have been assigned to a rescue request.",
        type: "Rescue",
        priority: "High",
      },
    ],
  };

  let notifCount = 0;
  for (const u of allUsers) {
    await new Notification({
      userId: u._id,
      title: "Welcome to ResQNet!",
      message: `Hello ${u.fullName}, welcome to ResQNet Animal Rescue Network. Together we can make a difference for animals in need.`,
      type: "Welcome",
      priority: "Low",
      status: pick(["Read", "Unread"]),
    }).save();
    notifCount++;

    const notifs = roleNotifs[u.role] || [];
    for (const n of notifs) {
      await new Notification({
        userId: u._id,
        ...n,
        status: pick(["Read", "Unread"]),
      }).save();
      notifCount++;
    }
  }
  console.log(`  ${notifCount} notifications created\n`);

  // ── SUMMARY ────────────────────────────────────────────────────────────────
  console.log("=====================================================");
  console.log("SEED COMPLETE! Summary:");
  console.log("=====================================================");
  console.log(`  Categories        : ${categories.length}`);
  console.log(`  Public Users      : ${publicUsers.length}`);
  console.log(`  Shelter Users     : ${shelterUsers.length}`);
  console.log(`  Shelters          : ${shelters.length}`);
  console.log(`  Shelter Apps      : ${shelters.length}`);
  console.log(`  Cages             : ${allCages.length}`);
  console.log(`  Animals           : ${animals.length}`);
  console.log(`  Vet Staff         : ${vetStaffs.length}`);
  console.log(`  Vet Staff Apps    : ${vetStaffs.length}`);
  console.log(`  Rescue Teams      : ${rescueTeams.length}`);
  console.log(`  Rescue Team Apps  : ${rescueTeams.length}`);
  console.log(`  Medicine Stocks   : ${stockCount}`);
  console.log(`  Medical Records   : ${mrCount}`);
  console.log(`  Vaccinations      : ${vacCount}`);
  console.log(`  Medicine Records  : ${medRecCount}`);
  console.log(`  Medical Reminders : ${reminderCount}`);
  console.log(`  Rescue Requests   : ${rescueRequests.length}`);
  console.log(`  Adoption Apps     : ${adoptionCount}`);
  console.log(`  Notifications     : ${notifCount}`);
  console.log("=====================================================");
  console.log("\nAll test users use password: Password@123\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
