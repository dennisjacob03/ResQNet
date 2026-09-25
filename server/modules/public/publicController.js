const Animal = require('../animals/animalModel');
const Shelter = require('../shelters/shelterModel');
const User = require('../users/userModel');
const RescueRequest = require('../rescues/rescueRequestModel');
const AdoptionApplication = require('../adoption/adoptionApplicationModel');
const VolunteerApplication = require('../volunteers/volunteerApplicationModel');

// @desc    Get aggregate platform public statistics & real rescue stories
// @route   GET /api/public/stats
// @access  Public
exports.getPublicStats = async (req, res) => {
  try {
    // 1. Animals Rescued (Total animals in database + completed/in-progress rescue requests)
    const totalAnimals = await Animal.countDocuments();
    const rescueRequestsCount = await RescueRequest.countDocuments();
    const animalsRescued = totalAnimals + rescueRequestsCount;

    // 2. Active Rescuers (Rescue Team users + approved volunteers)
    const rescueTeamUsers = await User.countDocuments({
      role: 'Rescue Team',
      isDeleted: { $ne: true },
    });
    const approvedVolunteers = await VolunteerApplication.countDocuments({
      applicationStatus: 'Approved',
    });
    const activeRescuers = rescueTeamUsers + approvedVolunteers;

    // 3. Partner Shelters (Active / Registered shelters)
    const partnerShelters = await Shelter.countDocuments({
      $or: [
        { shelterStatus: { $ne: 'CLOSED' } },
        { currentStatus: { $ne: 'CLOSED' } },
      ],
    });

    // 4. Pets Adopted
    const adoptedAnimalsCount = await Animal.countDocuments({
      status: 'Adopted',
    });
    const approvedAdoptionsCount = await AdoptionApplication.countDocuments({
      application_status: 'Approved',
    });
    const petsAdopted = Math.max(adoptedAnimalsCount, approvedAdoptionsCount);

    // 5. Live Rescues (currently active requests)
    const liveRescues = await RescueRequest.countDocuments({
      status: { $in: ['Pending', 'Accepted', 'In Transit'] },
    });

    // 6. Latest Rescue / Animal
    let latestRescue = null;
    const latestRescueReq = await RescueRequest.findOne()
      .sort({ createdAt: -1 })
      .select('animalType animalCondition locationAddress createdAt')
      .lean();

    if (latestRescueReq) {
      latestRescue = {
        animalType: latestRescueReq.animalType || 'Dog',
        breed: latestRescueReq.animalCondition ? `${latestRescueReq.animalCondition} ${latestRescueReq.animalType}` : 'Rescued Pet',
        location: latestRescueReq.locationAddress || 'Field Dispatch',
        createdAt: latestRescueReq.createdAt,
      };
    } else {
      const latestAnimal = await Animal.findOne()
        .sort({ createdAt: -1 })
        .select('name species breed shelterName createdAt photo')
        .lean();
      if (latestAnimal) {
        latestRescue = {
          animalType: latestAnimal.species || 'Dog',
          breed: latestAnimal.breed || latestAnimal.species || 'Rescued Pet',
          location: latestAnimal.shelterName || 'Partner Shelter',
          createdAt: latestAnimal.createdAt,
        };
      }
    }

    // 7. Real Rescue Stories (Real animals with backgroundStory or about)
    const animalsWithStories = await Animal.find({
      $or: [
        { backgroundStory: { $exists: true, $ne: '' } },
        { about: { $exists: true, $ne: '' } },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('name species breed status about backgroundStory photo photos shelterCity shelterName createdAt')
      .lean();

    const stories = animalsWithStories.map((animal) => ({
      id: animal._id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      status: animal.status,
      tag: animal.status === 'Adopted' ? 'Adopted Life' : animal.status === 'Available' ? 'Ready for Adoption' : 'Rescued & Safe',
      description: animal.backgroundStory || animal.about,
      location: animal.shelterCity || animal.shelterName || 'Kerala Sanctuaries',
      photo: animal.photo || (animal.photos && animal.photos[0]) || '',
    }));

    return res.status(200).json({
      success: true,
      stats: {
        animalsRescued,
        activeRescuers,
        partnerShelters,
        petsAdopted,
        liveRescues,
        latestRescue: latestRescue || {
          animalType: 'Dog',
          breed: 'Golden Retriever',
          location: 'Kochi Network',
          createdAt: new Date(),
        },
      },
      stories,
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public statistics',
      error: error.message,
    });
  }
};
