const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Animal = require('../modules/animals/animalModel');

const petsData = [
  {
    name: 'Rambo',
    species: 'Dog',
    breed: 'Golden Retriever',
    approxAge: '2 Years 3 Months',
    gender: 'Male',
    currentSize: 'Large',
    weight: '31 kg (68 lbs)',
    status: 'Available',
    neutered: true,
    spayedNeutered: true,
    vaccinations: [
      { name: 'Rabies Vaccine', date: '2026-01-15', status: 'Completed' },
      { name: 'DHPP (Distemper, Parvo)', date: '2025-11-20', status: 'Completed' },
      { name: 'Bordetella (Kennel Cough)', date: '2025-10-10', status: 'Completed' },
      { name: 'Deworming & Tick Care', date: '2026-02-05', status: 'Completed' },
    ],
    vaccinationDate: 'January 15, 2026',
    microchipped: true,
    microchipNumber: '985-1410-0294-8831',
    specialMedicalNeeds: 'None. Fully healthy, energetic, and up to date on all preventive treatments.',
    energyLevel: 'High',
    training: 'House-trained, Leash-trained, Knows Sit, Stay, Fetch & Paw',
    about: 'Rambo is a goofy, loving Golden Retriever who lives for squeaky balls, beach sprints, and endless belly rubs. He gently rests his head in your lap whenever you sit down and gets along wonderfully with people and friendly dogs.',
    backgroundStory: 'Found wandering safely away from floodwaters near Aluva during the monsoons. No microchip or owner claims were filed during the 45-day tracing window. Rambo completed health rejuvenation and behavioral socialization at SpotOn Animal Care.',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80',
    facePhoto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80',
    fullBodyPhoto: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1000&q=80',
    photos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=80',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    shelterName: 'SpotOn Animal Care',
    shelterCity: 'Kochi',
    shelterState: 'Kerala',
    shelterRegistrationNumber: 'AWBI/KL/2023/0491',
    healthCondition: 'Healthy',
  },
  {
    name: 'Tiger',
    species: 'Dog',
    breed: 'Indian Pariah (Indie)',
    approxAge: '1 Year 6 Months',
    gender: 'Male',
    currentSize: 'Medium',
    weight: '17 kg (37 lbs)',
    status: 'Available',
    neutered: true,
    spayedNeutered: true,
    vaccinations: [
      { name: 'Rabies Vaccine', date: '2026-02-01', status: 'Completed' },
      { name: '7-in-1 Vanguard Booster', date: '2025-12-14', status: 'Completed' },
      { name: 'Anti-Parasitic Spot-On', date: '2026-02-10', status: 'Completed' },
    ],
    vaccinationDate: 'February 01, 2026',
    microchipped: true,
    microchipNumber: '985-1410-0294-8832',
    specialMedicalNeeds: 'None. Exceptional natural immunity and peak physical condition.',
    energyLevel: 'High',
    training: 'House-trained, Alert watchdog, Quick learner, High agility',
    about: 'Tiger is an alert, remarkably clever, and resilient Indie canine. He forms a deep, loyal bond with his guardians, loves outdoor treks, and adapts seamlessly to apartment or house living.',
    backgroundStory: 'Rescued as an orphaned puppy trapped near an active storm drain during an emergency dispatch. Brought to the facility, vaccinated, nourished, and raised around caring shelter staff and volunteers.',
    photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80',
    facePhoto: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80',
    fullBodyPhoto: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=1000&q=80',
    photos: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=80',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    shelterName: 'SpotOn Animal Care',
    shelterCity: 'Kochi',
    shelterState: 'Kerala',
    shelterRegistrationNumber: 'AWBI/KL/2023/0491',
    healthCondition: 'Healthy',
  },
  {
    name: 'Diana',
    species: 'Dog',
    breed: 'Beagle',
    approxAge: '2 Years',
    gender: 'Female',
    currentSize: 'Small',
    weight: '11 kg (24 lbs)',
    status: 'Adoption Pending',
    neutered: true,
    spayedNeutered: true,
    vaccinations: [
      { name: 'Rabies Vaccine', date: '2025-11-10', status: 'Completed' },
      { name: 'DHPP Combo', date: '2025-10-05', status: 'Completed' },
      { name: 'Bordetella', date: '2025-09-18', status: 'Completed' },
    ],
    vaccinationDate: 'November 10, 2025',
    microchipped: true,
    microchipNumber: '985-1410-0294-8833',
    specialMedicalNeeds: 'Portion-controlled diet advised (she loves treats and food puzzles).',
    energyLevel: 'Moderate',
    training: 'House-trained, Crate-trained, Very gentle with small children',
    about: 'Diana is an affectionate, curious Beagle with expressive hazel eyes and a peaceful demeanor. She loves sniffing out garden trails and napping on sunlit rugs.',
    backgroundStory: 'Surrendered to the shelter when her previous elderly guardians relocated into an assisted living facility. Diana has received regular affection, grooming, and health monitoring.',
    photo: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=1000&q=80',
    facePhoto: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=1000&q=80',
    fullBodyPhoto: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1000&q=80',
    photos: [
      'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1000&q=80',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    shelterName: 'SpotOn Animal Care',
    shelterCity: 'Kochi',
    shelterState: 'Kerala',
    shelterRegistrationNumber: 'AWBI/KL/2023/0491',
    healthCondition: 'Healthy',
  },
  {
    name: 'Lucky',
    species: 'Dog',
    breed: 'Labrador Retriever Mix',
    approxAge: '3 Years',
    gender: 'Male',
    currentSize: 'Large',
    weight: '29 kg (64 lbs)',
    status: 'Available',
    neutered: true,
    spayedNeutered: true,
    vaccinations: [
      { name: 'Rabies Vaccine', date: '2026-01-20', status: 'Completed' },
      { name: 'DHPP Vanguard', date: '2025-12-10', status: 'Completed' },
      { name: 'Heartworm Preventative', date: '2026-02-01', status: 'Completed' },
    ],
    vaccinationDate: 'January 20, 2026',
    microchipped: true,
    microchipNumber: '985-1410-0294-8834',
    specialMedicalNeeds: 'None. Fully healed and clear in all physical examinations.',
    energyLevel: 'Moderate',
    training: 'House-trained, Calm on leash, Friendly with cats and other dogs',
    about: 'Lucky is a true gentleman. He walks calmly by your side on a loose leash, greets everyone with a soft tail wag, and is remarkably patient and gentle with guests.',
    backgroundStory: 'Dispatched by good Samaritans after a minor roadside incident on NH-66. ResQNet triage and our veterinary team healed his scraped paw and gave him complete preventive health care.',
    photo: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1000&q=80',
    facePhoto: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1000&q=80',
    fullBodyPhoto: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=80',
    photos: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=80',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    shelterName: 'SpotOn Animal Care',
    shelterCity: 'Kochi',
    shelterState: 'Kerala',
    shelterRegistrationNumber: 'AWBI/KL/2023/0491',
    healthCondition: 'Healthy',
  },
  {
    name: 'Bruno',
    species: 'Dog',
    breed: 'German Shepherd',
    approxAge: '4 Years',
    gender: 'Male',
    currentSize: 'Large',
    weight: '34 kg (75 lbs)',
    status: 'Available',
    neutered: true,
    spayedNeutered: true,
    vaccinations: [
      { name: 'Rabies Vaccine', date: '2026-01-08', status: 'Completed' },
      { name: 'DHPP Combo Booster', date: '2025-11-12', status: 'Completed' },
      { name: 'Deworming & Parasite Care', date: '2026-02-01', status: 'Completed' },
    ],
    vaccinationDate: 'January 08, 2026',
    microchipped: true,
    microchipNumber: '985-1410-0294-8835',
    specialMedicalNeeds: 'None. Strong, athletic build and exceptional stamina.',
    energyLevel: 'High',
    training: 'Advanced obedience trained, House-broken, Heel & Recall commands mastered',
    about: 'Bruno is a noble, highly intelligent German Shepherd with commanding presence and a heart loyal to his family. He excels in obedience exercises, loves mental games, and makes a protective, affectionate companion.',
    backgroundStory: 'Rescued from an abandoned commercial facility by our field rescue squad. Rehabilitated with professional obedience and agility training, Bruno is balanced, confident, and ready for an experienced or dedicated family.',
    photo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=1000&q=80',
    facePhoto: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=1000&q=80',
    fullBodyPhoto: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=1000&q=80',
    photos: [
      'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=1000&q=80',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    shelterName: 'SpotOn Animal Care',
    shelterCity: 'Kochi',
    shelterState: 'Kerala',
    shelterRegistrationNumber: 'AWBI/KL/2023/0491',
    healthCondition: 'Healthy',
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const pet of petsData) {
      const existing = await Animal.findOne({ name: pet.name });
      if (existing) {
        Object.assign(existing, pet);
        await existing.save();
        console.log(`Updated animal: ${pet.name} (${existing.animalId})`);
      } else {
        const created = await Animal.create(pet);
        console.log(`Created animal: ${pet.name} (${created.animalId})`);
      }
    }

    console.log('Enrichment completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error enriching animals:', err);
    process.exit(1);
  }
}

run();
