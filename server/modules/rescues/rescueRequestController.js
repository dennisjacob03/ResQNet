const mongoose = require("mongoose");
const RescueRequest = require("./rescueRequestModel");
const RescueTeam = require("./rescueTeamModel");
const Shelter = require("../shelters/shelterModel");
const Capacity = require("../shelters/capacityModel");
const User = require("../users/userModel");
const Notification = require("../notifications/notificationModel");

/**
 * Helper: Calculate Haversine distance in kilometers between two GPS coordinates
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null
  ) {
    return null;
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Helper: Helper to resolve rescue team associated with a user
 */
const resolveRescueTeam = async (userId) => {
  let team = await RescueTeam.findOne({ userId, status: "Active" });
  if (!team) {
    team = await RescueTeam.findOne({ userId });
  }
  return team;
};

/**
 * Helper: Helper to resolve shelter associated with a user
 */
const resolveShelter = async (user) => {
  if (user.shelterId) {
    const s = await Shelter.findById(user.shelterId);
    if (s) return s;
  }
  return await Shelter.findOne({ userId: user._id, isDeleted: { $ne: true } });
};

/**
 * @desc    Submit a rescue request and broadcast to nearby rescue teams
 * @route   POST /api/rescue-requests
 * @access  Private (Public User)
 */
const createRescueRequest = async (req, res) => {
  try {
    const {
      animalType = "Dog",
      animalCondition = "Injured",
      description = "",
      image = "",
      locationAddress = "",
      city = "",
      district = "Ernakulam",
      latitude,
      longitude,
      priority,
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message:
          "Incident GPS coordinates (latitude and longitude) are required.",
      });
    }

    // Auto-determine priority if not explicitly specified
    let calculatedPriority = priority || "Medium";
    if (!priority) {
      if (["Injured", "Aggressive", "Deceased"].includes(animalCondition)) {
        calculatedPriority = "Emergency";
      } else if (["Sick", "Stranded"].includes(animalCondition)) {
        calculatedPriority = "High";
      }
    }

    // Find all active and available rescue teams
    const activeTeams = await RescueTeam.find({
      status: "Active",
    }).populate("userId", "fullName email phoneNumber");

    // Calculate distance to each active team and build candidate pool
    const candidateTeams = [];
    const teamUserIdsToNotify = [];

    activeTeams.forEach((team) => {
      const teamLat = team.currentLocation?.latitude || team.latitude || 9.9312;
      const teamLon =
        team.currentLocation?.longitude || team.longitude || 76.2673;
      const distance =
        calculateDistanceKm(latitude, longitude, teamLat, teamLon) || 0;

      candidateTeams.push({
        teamId: team.teamId,
        teamObjectId: team._id,
        rescueTeamName: team.rescueTeamName || team.rescueTeamNumber,
        rescueTeamNumber: team.rescueTeamNumber,
        vehicleNumber: team.vehicleNumber,
        vehicleType: team.vehicleType,
        phone: team.contactPhone || team.userId?.phoneNumber || "",
        distanceKm: distance,
        status: "Notified",
        location: {
          latitude: teamLat,
          longitude: teamLon,
        },
      });

      if (team.userId?._id) {
        teamUserIdsToNotify.push(team.userId._id);
      }
    });

    // Sort candidate teams by proximity
    candidateTeams.sort((a, b) => a.distanceKm - b.distanceKm);

    // Create the RescueRequest document
    const newRequest = await RescueRequest.create({
      userId: req.user._id,
      animalType,
      animalCondition,
      type: animalCondition,
      priority: calculatedPriority,
      description: description.trim(),
      image: req.file ? `/uploads/${req.file.filename}` : image,
      locationAddress:
        locationAddress.trim() ||
        `${city || "Nearby"}, ${district || "Kerala"}`,
      city: city.trim(),
      district: district.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status: "Pending",
      rescueStage: "Broadcasted",
      candidateTeams,
      trackingTimeline: [
        {
          stage: "Broadcasted",
          timestamp: new Date(),
          note: `Rescue request registered. Dispatched to ${candidateTeams.length} active rescue teams.`,
          location: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
        },
      ],
    });

    // Broadcast in-app notifications to candidate rescue teams
    const notifPromises = teamUserIdsToNotify.map((uId) =>
      Notification.create({
        userId: uId,
        title: `🚨 Emergency Rescue Alert: ${animalCondition} ${animalType}`,
        message: `New rescue report at ${newRequest.locationAddress}. Priority: ${calculatedPriority}. Please accept or decline immediately.`,
        type: "Rescue",
        priority: calculatedPriority === "Emergency" ? "Emergency" : "High",
        metadata: {
          rescueRequestId: newRequest.rescueRequestId,
          requestId: newRequest._id,
          animalType,
          animalCondition,
          distanceKm: candidateTeams.find(
            (c) => String(c.teamObjectId) === String(uId),
          )?.distanceKm,
        },
      }).catch((e) =>
        console.warn("Failed to send notification to team user:", e.message),
      ),
    );
    await Promise.all(notifPromises);

    res.status(201).json({
      success: true,
      message: `Rescue request broadcasted successfully to ${candidateTeams.length} nearby rescue teams.`,
      request: newRequest,
      candidateCount: candidateTeams.length,
    });
  } catch (error) {
    console.error("Create Rescue Request Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all rescue requests submitted by the authenticated user
 * @route   GET /api/rescue-requests/my-requests
 * @access  Private (User)
 */
const getUserRescueRequests = async (req, res) => {
  try {
    const requests = await RescueRequest.find({
      userId: req.user._id,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .populate("assignedRescueTeamId")
      .populate("destinationShelterId");

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get User Rescue Requests Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all rescue requests and dispatch state for the admin operations board
 * @route   GET /api/rescue-requests/admin/all
 * @access  Private (Admin)
 */
const getAllRescueRequestsForAdmin = async (req, res) => {
  try {
    const requests = await RescueRequest.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email phoneNumber")
      .populate("assignedRescueTeamId");

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Get Admin Rescue Requests Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get detailed rescue request by ID with live tracking
 * @route   GET /api/rescue-requests/:id
 * @access  Private (User, Rescue Team, Shelter, Admin)
 */
const getRescueRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { rescueRequestId: id }] }
      : { rescueRequestId: id };

    const request = await RescueRequest.findOne(query)
      .populate("userId", "fullName email phoneNumber")
      .populate("assignedRescueTeamId")
      .populate("destinationShelterId");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Rescue request not found." });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get Rescue Request By ID Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get incoming broadcast requests for the authenticated rescue team
 * @route   GET /api/rescue-requests/broadcasts
 * @access  Private (Rescue Team)
 */
const getRescueTeamBroadcasts = async (req, res) => {
  try {
    const team = await resolveRescueTeam(req.user._id);
    if (!team) {
      return res.status(403).json({
        success: false,
        message: "No active rescue team profile found for this account.",
      });
    }

    // Find requests that are either broadcasted/pending or assigned to this team
    const requests = await RescueRequest.find({
      isDeleted: { $ne: true },
      $or: [
        { "candidateTeams.teamObjectId": team._id },
        { "candidateTeams.teamId": team.teamId },
        { assignedRescueTeamId: team._id },
        { status: { $in: ["Pending", "Accepted", "In Transit"] } },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email phoneNumber")
      .populate("assignedRescueTeamId")
      .populate("destinationShelterId");

    // Map requests with team-specific distance and acceptance status
    const teamLat = team.currentLocation?.latitude || team.latitude || 9.9312;
    const teamLon =
      team.currentLocation?.longitude || team.longitude || 76.2673;

    const mappedRequests = requests.map((reqDoc) => {
      const doc = reqDoc.toObject();
      const myCandidateEntry = (doc.candidateTeams || []).find(
        (c) =>
          String(c.teamObjectId) === String(team._id) ||
          c.teamId === team.teamId,
      );

      const computedDistance = calculateDistanceKm(
        doc.latitude,
        doc.longitude,
        teamLat,
        teamLon,
      );

      const isAssigned =
        String(doc.assignedRescueTeamId?._id || doc.assignedRescueTeamId) ===
        String(team._id);

      let teamStatus = "Notified";
      if (isAssigned) {
        teamStatus = "Assigned";
      } else if (myCandidateEntry?.status) {
        teamStatus = myCandidateEntry.status;
      }

      const dist = myCandidateEntry?.distanceKm ?? computedDistance ?? 0;

      return {
        ...doc,
        myDistanceKm: dist,
        distanceKm: dist,
        myStatus: teamStatus,
        candidateStatus: myCandidateEntry?.status || (isAssigned ? "Assigned" : "Notified"),
        isAssignedToMe: isAssigned,
        isAssignedToThisTeam: isAssigned,
        reportedByName: doc.userId?.fullName || "Citizen Reporter",
        reportedByPhone: doc.userId?.phoneNumber || "",
      };
    });

    res.status(200).json({
      success: true,
      team: {
        _id: team._id,
        teamId: team.teamId,
        rescueTeamName: team.rescueTeamName || team.rescueTeamNumber,
        rescueTeamNumber: team.rescueTeamNumber,
        operatingDistrict: team.operatingDistrict,
        currentLocation: team.currentLocation,
        latitude: team.currentLocation?.latitude || team.latitude || 9.9312,
        longitude: team.currentLocation?.longitude || team.longitude || 76.2673,
        vehicleNumber: team.vehicleNumber || "",
        vehicleType: team.vehicleType || "Ambulance",
        contactPhone: team.contactPhone || team.userId?.phoneNumber || "",
        availability: team.availability || "Available",
      },
      requests: mappedRequests,
      broadcasts: mappedRequests,
    });
  } catch (error) {
    console.error("Get Rescue Team Broadcasts Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Rescue team accepts a rescue request.
 *          If multiple teams accept, the nearest team is automatically selected and assigned!
 * @route   POST /api/rescue-requests/:id/accept
 * @access  Private (Rescue Team)
 */
const acceptRescueRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await resolveRescueTeam(req.user._id);

    if (!team) {
      return res.status(403).json({
        success: false,
        message: "No active rescue team profile found for this account.",
      });
    }

    const request = mongoose.Types.ObjectId.isValid(id)
      ? await RescueRequest.findById(id)
      : await RescueRequest.findOne({ rescueRequestId: id });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Rescue request not found." });
    }

    if (request.status === "Completed" || request.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: `This rescue operation is already ${request.status.toLowerCase()}.`,
      });
    }

    const teamLat = team.currentLocation?.latitude || team.latitude || 9.9312;
    const teamLon =
      team.currentLocation?.longitude || team.longitude || 76.2673;
    const distanceKm =
      calculateDistanceKm(
        request.latitude,
        request.longitude,
        teamLat,
        teamLon,
      ) || 0;

    // Find or add this team in candidateTeams
    let candidate = request.candidateTeams.find(
      (c) =>
        String(c.teamObjectId) === String(team._id) || c.teamId === team.teamId,
    );

    if (!candidate) {
      request.candidateTeams.push({
        teamId: team.teamId,
        teamObjectId: team._id,
        rescueTeamName: team.rescueTeamName || team.rescueTeamNumber,
        rescueTeamNumber: team.rescueTeamNumber,
        vehicleNumber: team.vehicleNumber,
        vehicleType: team.vehicleType,
        phone: team.contactPhone || req.user.phoneNumber || "",
        distanceKm,
        status: "Accepted",
        responseTime: new Date(),
        location: { latitude: teamLat, longitude: teamLon },
      });
    } else {
      candidate.status = "Accepted";
      candidate.responseTime = new Date();
      candidate.distanceKm = distanceKm;
      candidate.location = { latitude: teamLat, longitude: teamLon };
    }

    // MULTI-ACCEPTANCE NEAREST SELECTION LOGIC:
    // Gather all teams that have accepted so far
    const acceptedCandidates = request.candidateTeams.filter(
      (c) => c.status === "Accepted" || c.status === "Assigned",
    );

    // Find the closest accepted team by distanceKm
    let closestCandidate = acceptedCandidates[0];
    acceptedCandidates.forEach((c) => {
      if (c.distanceKm < closestCandidate.distanceKm) {
        closestCandidate = c;
      }
    });

    const isThisTeamNearest =
      String(closestCandidate.teamObjectId) === String(team._id);

    if (isThisTeamNearest) {
      // This team is the nearest! Assign this team
      request.assignedRescueTeamId = team._id;
      request.assignedRescueTeamNumber = team.rescueTeamNumber;
      request.assignedRescueTeamName =
        team.rescueTeamName || team.rescueTeamNumber;
      request.assignedRescueTeamPhone =
        team.contactPhone || req.user.phoneNumber || "";
      request.assignedRescueTeamVehicle = `${team.vehicleType} (${team.vehicleNumber})`;
      request.assignedRescueTeamLocation = {
        latitude: teamLat,
        longitude: teamLon,
        updatedAt: new Date(),
      };
      request.status = "Accepted";
      request.rescueStage = "Accepted";

      // Update candidate statuses
      request.candidateTeams.forEach((c) => {
        if (String(c.teamObjectId) === String(team._id)) {
          c.status = "Assigned";
        } else if (c.status === "Accepted") {
          c.status = "Backup";
        }
      });

      request.trackingTimeline.push({
        stage: "Accepted",
        timestamp: new Date(),
        note: `Assigned to nearest rescue team: ${team.rescueTeamName || team.rescueTeamNumber} (${distanceKm} km away). Responders dispatched.`,
        location: { latitude: teamLat, longitude: teamLon },
      });

      // Notify the requesting user
      Notification.create({
        userId: request.userId,
        title: "Rescue Team Dispatched! 🚑",
        message: `${team.rescueTeamName || team.rescueTeamNumber} has been assigned to your rescue request. They are ${distanceKm} km away and preparing to respond.`,
        type: "Rescue",
        priority: "Emergency",
        metadata: {
          requestId: request._id,
          rescueRequestId: request.rescueRequestId,
          rescueTeamName: team.rescueTeamName || team.rescueTeamNumber,
          phone: team.contactPhone || req.user.phoneNumber,
          distanceKm,
        },
      }).catch((e) => console.warn("Notification error:", e.message));

      await request.save();

      return res.status(200).json({
        success: true,
        assigned: true,
        message: `Accepted! Your team is closest (${distanceKm} km away) and has been assigned to this rescue operation.`,
        request,
      });
    } else {
      // Another team is closer
      candidate.status = "Backup";
      await request.save();

      return res.status(200).json({
        success: true,
        assigned: false,
        message: `Accepted! Team ${closestCandidate.rescueTeamName} is currently closer (${closestCandidate.distanceKm} km vs ${distanceKm} km) and is primary. You are registered as backup unit.`,
        request,
      });
    }
  } catch (error) {
    console.error("Accept Rescue Request Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Rescue team declines a rescue request
 * @route   POST /api/rescue-requests/:id/decline
 * @access  Private (Rescue Team)
 */
const declineRescueRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "Currently engaged in another rescue operation" } =
      req.body;
    const team = await resolveRescueTeam(req.user._id);

    if (!team) {
      return res.status(403).json({
        success: false,
        message: "No active rescue team profile found for this account.",
      });
    }

    const request = mongoose.Types.ObjectId.isValid(id)
      ? await RescueRequest.findById(id)
      : await RescueRequest.findOne({ rescueRequestId: id });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Rescue request not found." });
    }

    let candidate = request.candidateTeams.find(
      (c) =>
        String(c.teamObjectId) === String(team._id) || c.teamId === team.teamId,
    );

    if (candidate) {
      candidate.status = "Declined";
      candidate.declineReason = reason;
      candidate.responseTime = new Date();
    } else {
      request.candidateTeams.push({
        teamId: team.teamId,
        teamObjectId: team._id,
        rescueTeamName: team.rescueTeamName || team.rescueTeamNumber,
        rescueTeamNumber: team.rescueTeamNumber,
        status: "Declined",
        declineReason: reason,
        responseTime: new Date(),
      });
    }

    // If this team was the assigned team, check if another accepted team can be assigned
    if (String(request.assignedRescueTeamId) === String(team._id)) {
      const otherAccepted = request.candidateTeams
        .filter((c) => c.status === "Backup" || c.status === "Accepted")
        .sort((a, b) => a.distanceKm - b.distanceKm);

      if (otherAccepted.length > 0) {
        const nextTeam = otherAccepted[0];
        request.assignedRescueTeamId = nextTeam.teamObjectId;
        request.assignedRescueTeamNumber = nextTeam.rescueTeamNumber;
        request.assignedRescueTeamName = nextTeam.rescueTeamName;
        request.assignedRescueTeamPhone = nextTeam.phone;
        nextTeam.status = "Assigned";

        request.trackingTimeline.push({
          stage: "Accepted",
          timestamp: new Date(),
          note: `Reassigned to backup team: ${nextTeam.rescueTeamName} (${nextTeam.distanceKm} km away).`,
        });
      } else {
        request.assignedRescueTeamId = null;
        request.status = "Pending";
        request.rescueStage = "Broadcasted";
      }
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: "Rescue request declined.",
      request,
    });
  } catch (error) {
    console.error("Decline Rescue Request Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update rescue operation stage & real-time vehicle GPS coordinates
 * @route   PUT /api/rescue-requests/:id/stage
 * @access  Private (Assigned Rescue Team)
 */
const updateRescueStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, rescueStage, note = "", latitude, longitude } = req.body;
    const targetStage = stage || rescueStage;

    const request = mongoose.Types.ObjectId.isValid(id)
      ? await RescueRequest.findById(id)
      : await RescueRequest.findOne({ rescueRequestId: id });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Rescue request not found." });
    }

    const team = await resolveRescueTeam(req.user._id);
    if (
      !team ||
      (String(request.assignedRescueTeamId) !== String(team._id) &&
        req.user.role !== "Admin")
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the assigned rescue team can update the rescue operation stage.",
      });
    }

    request.rescueStage = targetStage;
    if (targetStage === "En Route") {
      request.status = "In Transit";
    } else if (targetStage === "Completed" || targetStage === "Delivered to Shelter") {
      request.status = "Completed";
      request.rescuedAt = new Date();
    }

    // Update GPS coordinates if provided
    let loc = null;
    if (latitude && longitude) {
      loc = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      request.assignedRescueTeamLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updatedAt: new Date(),
      };
      team.currentLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updatedAt: new Date(),
      };
      await team.save();
    }

    // Ensure all items in trackingTimeline have a valid stage to prevent validation errors
    if (Array.isArray(request.trackingTimeline)) {
      request.trackingTimeline.forEach((t) => {
        if (!t.stage) {
          t.stage = targetStage;
        }
      });
    }

    request.trackingTimeline.push({
      stage: targetStage,
      timestamp: new Date(),
      note: note || `Operation updated to stage: ${targetStage}`,
      location: loc,
    });

    await request.save();

    // Notify the user in real time
    Notification.create({
      userId: request.userId,
      title: `Rescue Update: ${targetStage} 🚑`,
      message: `${request.assignedRescueTeamName || "Rescue team"}: ${note || `Status is now "${targetStage}".`}`,
      type: "Rescue",
      priority: targetStage === "Completed" ? "Normal" : "High",
      metadata: {
        requestId: request._id,
        rescueRequestId: request.rescueRequestId,
        stage: targetStage,
      },
    }).catch((e) => console.warn("Notify error:", e.message));

    res.status(200).json({
      success: true,
      message: `Rescue stage updated to ${targetStage}.`,
      request,
    });
  } catch (error) {
    console.error("Update Rescue Stage Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get nearby shelters for animal intake sorted by distance and available capacity
 * @route   GET /api/rescue-requests/:id/nearby-shelters
 * @access  Private (Rescue Team)
 */
const getNearbySheltersForIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RescueRequest.findById(id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Rescue request not found." });
    }

    // Target coordinates (incident or current team location)
    const refLat =
      request.assignedRescueTeamLocation?.latitude || request.latitude;
    const refLon =
      request.assignedRescueTeamLocation?.longitude || request.longitude;

    // Fetch all active shelters
    const shelters = await Shelter.find({
      status: "Active",
      isDeleted: { $ne: true },
    }).lean();

    // For each shelter, retrieve capacity details and compute distance
    const shelterListWithCapacity = await Promise.all(
      shelters.map(async (s) => {
        const capacities = await Capacity.find({ shelterId: s._id }).lean();
        const totalCapacity = capacities.reduce(
          (acc, c) => acc + (c.totalCapacity || 0),
          0,
        );
        const occupiedCapacity = capacities.reduce(
          (acc, c) => acc + (c.occupiedCapacity || 0),
          0,
        );
        const availableSpots = Math.max(0, totalCapacity - occupiedCapacity);

        const distance =
          calculateDistanceKm(refLat, refLon, s.latitude, s.longitude) || 0;

        // Check if shelter is open and has room
        const isOpen = s.shelterStatus === "OPEN" || s.currentStatus === "OPEN";
        const hasCapacity = availableSpots > 0;
        const intakeReady = isOpen && hasCapacity;

        return {
          _id: s._id,
          shelterNumber: s.shelterNumber,
          shelterName: s.shelterName,
          shelterEmail: s.shelterEmail,
          shelterPhoneNumber: s.shelterPhoneNumber,
          latitude: s.latitude,
          longitude: s.longitude,
          shelterStatus: s.shelterStatus || s.currentStatus || "OPEN",
          distanceKm: distance,
          totalCapacity,
          occupiedCapacity,
          availableSpots,
          intakeReady,
        };
      }),
    );

    // Sort by proximity
    shelterListWithCapacity.sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      shelters: shelterListWithCapacity,
    });
  } catch (error) {
    console.error("Get Nearby Shelters For Intake Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Rescue team selects a destination shelter and informs them of incoming intake
 * @route   POST /api/rescue-requests/:id/route-shelter
 * @access  Private (Rescue Team)
 */
const routeToShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      shelterId,
      destinationShelterId,
      etaMinutes = 20,
      notes = "",
    } = req.body;
    const targetShelterId = destinationShelterId || shelterId;

    const request = await RescueRequest.findById(id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Rescue request not found." });
    }

    const shelter = await Shelter.findById(targetShelterId);
    if (!shelter) {
      return res
        .status(404)
        .json({ success: false, message: "Selected shelter not found." });
    }

    const team = await resolveRescueTeam(req.user._id);

    // Update request with destination shelter and notification status
    request.destinationShelterId = shelter._id;
    request.destinationShelterName = shelter.shelterName;
    request.destinationShelterLocation = {
      latitude: shelter.latitude,
      longitude: shelter.longitude,
      address: `${shelter.shelterName}, GPS: ${shelter.latitude}, ${shelter.longitude}`,
    };
    request.shelterNotified = true;
    request.shelterNotifiedAt = new Date();
    request.shelterIntakeStatus = "Notified";
    request.rescueStage = "Transporting to Shelter";
    request.status = "In Transit";

    request.trackingTimeline.push({
      stage: "Transporting to Shelter",
      timestamp: new Date(),
      note: `Informed ${shelter.shelterName} of incoming intake. En route with rescued animal. Estimated ETA: ~${etaMinutes} mins. ${notes}`.trim(),
      location: request.assignedRescueTeamLocation,
    });

    await request.save();

    // Inform the shelter manager via high-priority notification
    const shelterTargetUserId = shelter.userId;
    if (shelterTargetUserId) {
      await Notification.create({
        userId: shelterTargetUserId,
        title: `🚨 Incoming Rescue Intake: ${request.animalType}`,
        message: `Rescue team "${team?.rescueTeamName || request.assignedRescueTeamName}" is en route with an injured ${request.animalType} (${request.animalCondition}). ETA: ~${etaMinutes} mins. Please prepare intake/pen.`,
        type: "Rescue",
        priority: "Emergency",
        metadata: {
          requestId: request._id,
          rescueRequestId: request.rescueRequestId,
          rescueTeamName:
            team?.rescueTeamName || request.assignedRescueTeamName,
          vehicleNumber: team?.vehicleNumber,
          animalType: request.animalType,
          animalCondition: request.animalCondition,
          etaMinutes,
        },
      });
    }

    // Also notify reporting user that animal is on the way to shelter
    Notification.create({
      userId: request.userId,
      title: "Animal Being Transported to Shelter 🏥",
      message: `The rescue team has secured the ${request.animalType} and is transporting it safely to ${shelter.shelterName}.`,
      type: "Rescue",
      priority: "Normal",
      metadata: {
        requestId: request._id,
        rescueRequestId: request.rescueRequestId,
        shelterName: shelter.shelterName,
      },
    }).catch((e) => console.warn("User notification error:", e.message));

    res.status(200).json({
      success: true,
      message: `Shelter ${shelter.shelterName} informed. Intake route active.`,
      request,
    });
  } catch (error) {
    console.error("Route To Shelter Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Shelter confirms admission of the rescued animal
 * @route   POST /api/rescue-requests/:id/confirm-admission
 * @access  Private (Shelter Manager or Admin)
 */
const confirmShelterAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { cageNumber = "", healthNotes = "" } = req.body;

    const request = await RescueRequest.findById(id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Rescue request not found." });
    }

    request.shelterIntakeStatus = "Admitted";
    request.rescueStage = "Delivered to Shelter";
    request.status = "Completed";
    request.rescuedAt = new Date();

    request.trackingTimeline.push({
      stage: "Delivered to Shelter",
      timestamp: new Date(),
      note: `Animal safely admitted to ${request.destinationShelterName || "Shelter"}. ${cageNumber ? `Allocated to Pen: ${cageNumber}.` : ""} ${healthNotes}`.trim(),
    });

    await request.save();

    // Notify user of successful rescue & safe admission
    Notification.create({
      userId: request.userId,
      title: "🎉 Rescue Completed & Animal Admitted!",
      message: `The ${request.animalType} you reported has been safely delivered and admitted to ${request.destinationShelterName}. Thank you for helping save a life!`,
      type: "Rescue",
      priority: "Normal",
      metadata: {
        requestId: request._id,
        rescueRequestId: request.rescueRequestId,
      },
    }).catch((e) => console.warn("User notify error:", e.message));

    res.status(200).json({
      success: true,
      message:
        "Animal admission confirmed. Rescue operation successfully completed.",
      request,
    });
  } catch (error) {
    console.error("Confirm Shelter Admission Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all incoming rescue team intakes routed to this shelter
 * @route   GET /api/rescue-requests/shelter-incoming
 * @access  Private (Shelter Manager or Admin)
 */
const getShelterIncomingIntakes = async (req, res) => {
  try {
    const shelter = await resolveShelter(req.user);
    if (!shelter) {
      return res.status(200).json({ success: true, intakes: [] });
    }

    const intakes = await RescueRequest.find({
      destinationShelterId: shelter._id,
      status: { $ne: "Cancelled" },
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      intakes,
    });
  } catch (error) {
    console.error("Get Shelter Incoming Intakes Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get map data of all active rescue teams and shelters for interactive user map
 * @route   GET /api/rescue-requests/map-data
 * @access  Private / Public (User, Rescue Team, Shelter)
 */
const getAllRescueTeamsAndSheltersMap = async (req, res) => {
  try {
    const [teams, shelters] = await Promise.all([
      RescueTeam.find({ status: "Active" })
        .populate("userId", "fullName email phoneNumber city state")
        .lean(),
      Shelter.find({ status: "Active", isDeleted: { $ne: true } })
        .populate("userId", "fullName email phoneNumber")
        .lean(),
    ]);

    const mappedTeams = teams.map((t) => ({
      _id: t._id,
      teamId: t.teamId,
      rescueTeamName: t.rescueTeamName || t.rescueTeamNumber,
      rescueTeamNumber: t.rescueTeamNumber,
      vehicleNumber: t.vehicleNumber,
      vehicleType: t.vehicleType,
      operatingDistrict: t.operatingDistrict,
      availability: t.availability,
      latitude: t.currentLocation?.latitude || t.latitude || 9.9312,
      longitude: t.currentLocation?.longitude || t.longitude || 76.2673,
      contactPhone: t.contactPhone || t.userId?.phoneNumber || "",
      teamLead: t.userId?.fullName || "Rescue Lead",
    }));

    const mappedShelters = await Promise.all(
      shelters.map(async (s) => {
        const capacities = await Capacity.find({ shelterId: s._id }).lean();
        const total = capacities.reduce(
          (acc, c) => acc + (c.totalCapacity || 0),
          0,
        );
        const occupied = capacities.reduce(
          (acc, c) => acc + (c.occupiedCapacity || 0),
          0,
        );
        const available = Math.max(0, total - occupied);

        return {
          _id: s._id,
          shelterNumber: s.shelterNumber,
          shelterName: s.shelterName,
          shelterEmail: s.shelterEmail,
          shelterPhoneNumber: s.shelterPhoneNumber,
          shelterStatus: s.shelterStatus || s.currentStatus || "OPEN",
          latitude: s.latitude,
          longitude: s.longitude,
          district: s.district || "Ernakulam",
          totalCapacity: total,
          occupiedCapacity: occupied,
          availableSpots: available,
        };
      }),
    );

    const markers = [
      ...mappedTeams.map((t) => ({
        id: `team-${t._id}`,
        name: t.rescueTeamName,
        type: "RESCUE_TEAM",
        latitude: t.latitude,
        longitude: t.longitude,
        district: t.operatingDistrict || "Kerala",
        phone: t.contactPhone,
        teamNumber: t.rescueTeamNumber,
        vehicleType: t.vehicleType,
        address: `${t.rescueTeamName} Base - ${t.operatingDistrict || "District Hub"}`,
      })),
      ...mappedShelters.map((s) => ({
        id: `shelter-${s._id}`,
        name: s.shelterName,
        type: "SHELTER",
        latitude: s.latitude,
        longitude: s.longitude,
        district: s.district || "Kerala",
        phone: s.shelterPhoneNumber,
        totalCages: s.totalCapacity,
        availableCages: s.availableSpots,
        address: `${s.shelterName} Facility`,
      })),
    ];

    res.status(200).json({
      success: true,
      rescueTeams: mappedTeams,
      shelters: mappedShelters,
      markers,
    });
  } catch (error) {
    console.error("Get Map Data Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRescueRequest,
  getUserRescueRequests,
  getAllRescueRequestsForAdmin,
  getRescueRequestById,
  getRescueTeamBroadcasts,
  acceptRescueRequest,
  declineRescueRequest,
  updateRescueStage,
  getNearbySheltersForIntake,
  routeToShelter,
  confirmShelterAdmission,
  getShelterIncomingIntakes,
  getAllRescueTeamsAndSheltersMap,
};
