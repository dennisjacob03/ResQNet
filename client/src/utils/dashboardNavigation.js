import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Mapping of dashboard tabs to URL slugs and aliases for each user role.
 */
export const ROLE_TABS = {
  'Public User': {
    defaultTab: 'Dashboard',
    tabs: {
      'Dashboard': '',
      'Report Animal': 'report-animal',
      'Rescue & Shelter Map': 'rescue-map',
      'Adopt a Pet': 'adopt-pet',
      'Register Shelter': 'register-shelter',
      'Register Rescue Team': 'register-rescue-team',
      'Volunteer': 'volunteer',
      'Join Vet Staff': 'join-vet-staff',
      'Notifications': 'notifications',
      'My Profile': 'profile',
    },
    aliases: {
      'report': 'Report Animal',
      'reportanimal': 'Report Animal',
      'map': 'Rescue & Shelter Map',
      'rescuemap': 'Rescue & Shelter Map',
      'adopt': 'Adopt a Pet',
      'adoption': 'Adopt a Pet',
      'adoptpet': 'Adopt a Pet',
      'shelter': 'Register Shelter',
      'registershelter': 'Register Shelter',
      'rescue': 'Register Rescue Team',
      'registerrescue': 'Register Rescue Team',
      'register-rescue': 'Register Rescue Team',
      'volunteer': 'Volunteer',
      'vet': 'Join Vet Staff',
      'joinvet': 'Join Vet Staff',
      'join-vet': 'Join Vet Staff',
      'notifications': 'Notifications',
      'notif': 'Notifications',
      'profile': 'My Profile',
      'my-profile': 'My Profile',
    },
  },
  'Shelter': {
    defaultTab: 'Shelter Dashboard',
    tabs: {
      'Shelter Dashboard': '',
      'Manage Animals': 'manage-animals',
      'Manage Cages': 'manage-cages',
      'Manage Adoptions': 'manage-adoptions',
      'Veterinary Staff': 'veterinary-staff',
      'My Profile': 'profile',
    },
    aliases: {
      'overview': 'Shelter Dashboard',
      'home': 'Shelter Dashboard',
      'animals': 'Manage Animals',
      'manageanimals': 'Manage Animals',
      'cages': 'Manage Cages',
      'managecages': 'Manage Cages',
      'adoptions': 'Manage Adoptions',
      'manageadoptions': 'Manage Adoptions',
      'vet': 'Veterinary Staff',
      'vets': 'Veterinary Staff',
      'vet-staff': 'Veterinary Staff',
      'veterinary': 'Veterinary Staff',
      'profile': 'My Profile',
      'my-profile': 'My Profile',
    },
  },
  'Veterinary Staff': {
    defaultTab: 'Vet Dashboard',
    tabs: {
      'Vet Dashboard': '',
      'Medical Records': 'medical-records',
      'Vaccinations': 'vaccinations',
      'Medicines Stock': 'medicines-stock',
      'My Profile': 'profile',
    },
    aliases: {
      'overview': 'Vet Dashboard',
      'home': 'Vet Dashboard',
      'records': 'Medical Records',
      'medical': 'Medical Records',
      'medicalrecords': 'Medical Records',
      'vaccination': 'Vaccinations',
      'vaccines': 'Vaccinations',
      'medicine': 'Medicines Stock',
      'medicines': 'Medicines Stock',
      'stock': 'Medicines Stock',
      'medicinestock': 'Medicines Stock',
      'medicine-stock': 'Medicines Stock',
      'profile': 'My Profile',
      'my-profile': 'My Profile',
    },
  },
  'Rescue Team': {
    defaultTab: 'Rescue Dashboard',
    tabs: {
      'Rescue Dashboard': '',
      'Rescue Operations': 'rescue-operations',
      'Assigned Requests': 'rescue-operations',
      'Manage Volunteers': 'manage-volunteers',
      'Notifications': 'notifications',
      'My Profile': 'profile',
    },
    aliases: {
      'overview': 'Rescue Dashboard',
      'home': 'Rescue Dashboard',
      'operations': 'Rescue Operations',
      'rescue-operations': 'Rescue Operations',
      'rescueoperations': 'Rescue Operations',
      'requests': 'Rescue Operations',
      'assigned': 'Rescue Operations',
      'assignedrequests': 'Rescue Operations',
      'assigned-requests': 'Rescue Operations',
      'volunteers': 'Manage Volunteers',
      'managevolunteers': 'Manage Volunteers',
      'notifications': 'Notifications',
      'profile': 'My Profile',
      'my-profile': 'My Profile',
    },
  },
  'Admin': {
    defaultTab: 'Admin Dashboard',
    tabs: {
      'Admin Dashboard': '',
      'Manage Users': 'manage-users',
      'Manage Shelters': 'manage-shelters',
      'Manage Applications': 'manage-applications',
      'Manage Animals': 'manage-animals',
      'Manage Vet': 'manage-vet',
      'Manage Rescue Teams': 'manage-rescue-teams',
      'Manage Volunteers': 'manage-volunteers',
      'Rescue & Shelter Map': 'rescue-map',
      'AI Module': 'ai-module',
      'Smart Collar': 'smart-collar',
      'My Profile': 'profile',
    },
    aliases: {
      'overview': 'Admin Dashboard',
      'home': 'Admin Dashboard',
      'users': 'Manage Users',
      'manageusers': 'Manage Users',
      'shelters': 'Manage Shelters',
      'manageshelters': 'Manage Shelters',
      'applications': 'Manage Applications',
      'manageapplications': 'Manage Applications',
      'animals': 'Manage Animals',
      'manageanimals': 'Manage Animals',
      'vet': 'Manage Vet',
      'managevet': 'Manage Vet',
      'rescue-teams': 'Manage Rescue Teams',
      'rescueteams': 'Manage Rescue Teams',
      'managerescueteams': 'Manage Rescue Teams',
      'volunteers': 'Manage Volunteers',
      'managevolunteers': 'Manage Volunteers',
      'map': 'Rescue & Shelter Map',
      'ai': 'AI Module',
      'aimodule': 'AI Module',
      'collar': 'Smart Collar',
      'smartcollar': 'Smart Collar',
      'profile': 'My Profile',
      'my-profile': 'My Profile',
    },
  },
};

/**
 * Resolves the configuration table for a given user role.
 */
export const resolveRoleConfig = (role) => {
  if (role === 'Admin') return ROLE_TABS['Admin'];
  if (role === 'Shelter' || role === 'Shelter Manager') return ROLE_TABS['Shelter'];
  if (role === 'Veterinary Staff') return ROLE_TABS['Veterinary Staff'];
  if (role === 'Rescue Team') return ROLE_TABS['Rescue Team'];
  return ROLE_TABS['Public User'];
};

/**
 * Extracts and maps the current URL location (pathname or ?tab= query param) to an active tab name.
 */
export const getTabFromLocation = (role, pathname = '', search = '') => {
  const config = resolveRoleConfig(role);

  // 1. Check path slug e.g. /dashboard/manage-animals
  const match = pathname.match(/^\/dashboard\/?([^/?#]*)/i);
  let slug = match && match[1] ? match[1].toLowerCase().trim() : '';

  // 2. If no path slug, fallback to ?tab= query parameter
  if (!slug && search) {
    const params = new URLSearchParams(search);
    const tabParam = params.get('tab');
    if (tabParam) slug = tabParam.toLowerCase().trim();
  }

  if (!slug) return config.defaultTab;

  // Direct tab match where slug matches defined tabs
  for (const [tabName, tabSlug] of Object.entries(config.tabs)) {
    if (tabSlug && tabSlug.toLowerCase() === slug) {
      return tabName;
    }
  }

  // Check aliases
  if (config.aliases && config.aliases[slug]) {
    return config.aliases[slug];
  }

  return config.defaultTab;
};

/**
 * Generates the clean URL endpoint for a given tab name and role.
 */
export const getUrlForTab = (role, tabName) => {
  const config = resolveRoleConfig(role);
  const slug = config.tabs[tabName];
  if (!slug) return '/dashboard';
  return `/dashboard/${slug}`;
};

/**
 * Custom React Hook to connect dashboard active tab state directly to URL endpoints and browser history.
 * Pushes new history states on tab changes, enabling full Back/Forward browser navigation.
 *
 * Uses a ref flag to prevent the double-render "shiver" that occurred when both
 * handleTabChange (click) and the URL-sync useEffect updated activeTab simultaneously.
 */
export const useDashboardTabNavigation = (role, onTabChangeCallback) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tracks whether the current URL change was initiated by us (click) vs. external (browser back/forward)
  const skipNextSyncRef = useRef(false);

  // Stable ref for the callback so we don't need it in dependency arrays
  const callbackRef = useRef(onTabChangeCallback);
  useEffect(() => {
    callbackRef.current = onTabChangeCallback;
  });

  const [activeTab, setActiveTabState] = useState(() =>
    getTabFromLocation(role, location.pathname, location.search)
  );

  // Sync state ONLY for genuine browser navigation (back/forward).
  // When the user clicks a sidebar item, skipNextSyncRef is set so we skip the redundant update.
  useEffect(() => {
    if (skipNextSyncRef.current) {
      // This URL change was triggered by our own navigate() call — skip to avoid double-render
      skipNextSyncRef.current = false;
      return;
    }
    const tabFromUrl = getTabFromLocation(role, location.pathname, location.search);
    if (tabFromUrl) {
      setActiveTabState(tabFromUrl);
      if (callbackRef.current) {
        callbackRef.current(tabFromUrl);
      }
    }
    // Only re-run when the actual URL segments change (not on every render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Tab change handler called when user clicks on sidebar, header, or dashboard buttons
  const handleTabChange = useCallback(
    (target, sourceAction = null) => {
      const tabName = typeof target === 'object' && target !== null ? target.name : target;
      if (!tabName) return;

      const targetUrl = getUrlForTab(role, tabName);

      // Set the tab state immediately for instant UI response (no waiting for URL effect)
      setActiveTabState(tabName);

      if (location.pathname !== targetUrl) {
        // Flag the upcoming URL change so the sync effect doesn't re-set state redundantly
        skipNextSyncRef.current = true;
        navigate(targetUrl);
      }

      if (callbackRef.current) {
        callbackRef.current(tabName, sourceAction);
      }
    },
    // role and navigate are stable; location.pathname needed to compare current vs target
    [location.pathname, navigate, role]
  );

  return [activeTab, handleTabChange];
};
