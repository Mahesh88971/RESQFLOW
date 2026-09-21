/**
 * RESQFLOW — mock data layer
 * In production this data would come from the backend (see /backend),
 * which itself can be pointed at MongoDB + real traffic/maps APIs.
 * Every object here mirrors the shape the backend API returns.
 */

const RESQ_DATA = {

  ambulances: [
    { id: "AMB-101", driver: "R. Sharma",  status: "Available",    location: "Sector 2",  speed: 0,  eta: "-",     hospital: "-" },
    { id: "AMB-102", driver: "K. Verma",   status: "Active",       location: "MG Road",   speed: 58, eta: "06:12", hospital: "City Care Hospital" },
    { id: "AMB-103", driver: "S. Iyer",    status: "Hospital",     location: "Apollo Bay", speed: 0,  eta: "-",     hospital: "Apollo Emergency Center" },
    { id: "AMB-104", driver: "P. Nair",    status: "Available",    location: "Sector 7",  speed: 0,  eta: "-",     hospital: "-" },
    { id: "AMB-204", driver: "A. Fernandes", status: "Active",     location: "Sector 4",  speed: 62, eta: "06:42", hospital: "Apollo Emergency Center" },
    { id: "AMB-118", driver: "D. Rao",     status: "Maintenance",  location: "Depot 1",   speed: 0,  eta: "-",     hospital: "-" },
    { id: "AMB-119", driver: "M. Singh",   status: "Available",    location: "Riverside", speed: 0,  eta: "-",     hospital: "-" },
    { id: "AMB-120", driver: "T. Bose",    status: "Active",       location: "North Ring", speed: 47, eta: "09:05", hospital: "Metro Hospital" },
  ],

  hospitals: [
    { name: "City Care Hospital",     distance: "5.2 km", eta: "7 min",  icu: "Available", emergency: "Available", trauma: "Available", cardiac: "Available", load: 42, score: 94 },
    { name: "Apollo Emergency Center", distance: "4.1 km", eta: "6 min",  icu: "Available", emergency: "Available", trauma: "Limited",   cardiac: "Available", load: 58, score: 89 },
    { name: "Metro Hospital",          distance: "3.8 km", eta: "10 min", icu: "Limited",   emergency: "Busy",      trauma: "Available",  cardiac: "Limited",   load: 81, score: 78 },
    { name: "Sunrise Multispecialty",  distance: "6.9 km", eta: "12 min", icu: "Available", emergency: "Available", trauma: "Available",  cardiac: "Available", load: 35, score: 91 },
  ],

  routes: [
    { id: "A", distance: "7.2 km", eta: "11 min", traffic: "Heavy",      risk: "Medium" },
    { id: "B", distance: "8.1 km", eta: "8 min",  traffic: "Low",        risk: "Low" },
    { id: "C", distance: "6.5 km", eta: "13 min", traffic: "Very Heavy", risk: "High" },
  ],
  bestRouteId: "B",
  bestRouteReason: "Although Route B is longer, predicted traffic conditions reduce emergency travel time by 27%.",

  signals: [
    { id: "01", state: "green" }, { id: "02", state: "green" }, { id: "03", state: "green" },
    { id: "04", state: "green" }, { id: "05", state: "prep" },  { id: "06", state: "red" },
    { id: "07", state: "red" },   { id: "08", state: "red" },   { id: "09", state: "red" },
    { id: "10", state: "red" },   { id: "11", state: "red" },   { id: "12", state: "red" },
  ],

  history: [
    { id: "EMG-3391", date: "2026-09-14", type: "Cardiac Emergency", severity: "Critical", ambulance: "AMB-204", hospital: "Apollo Emergency Center", initialEta: "09:10", finalEta: "06:42", saved: "02:28", status: "Completed" },
    { id: "EMG-3388", date: "2026-09-14", type: "Accident",          severity: "High",     ambulance: "AMB-102", hospital: "City Care Hospital",       initialEta: "07:55", finalEta: "06:12", saved: "01:43", status: "Completed" },
    { id: "EMG-3382", date: "2026-09-13", type: "Trauma",            severity: "Critical", ambulance: "AMB-120", hospital: "Metro Hospital",            initialEta: "11:20", finalEta: "09:05", saved: "02:15", status: "Completed" },
    { id: "EMG-3376", date: "2026-09-13", type: "Fire",              severity: "High",     ambulance: "AMB-103", hospital: "Apollo Emergency Center",   initialEta: "08:40", finalEta: "07:58", saved: "00:42", status: "Completed" },
    { id: "EMG-3370", date: "2026-09-12", type: "Medical Emergency", severity: "Medium",   ambulance: "AMB-101", hospital: "Sunrise Multispecialty",    initialEta: "10:05", finalEta: "08:30", saved: "01:35", status: "Completed" },
    { id: "EMG-3364", date: "2026-09-12", type: "Accident",          severity: "Low",      ambulance: "AMB-104", hospital: "City Care Hospital",        initialEta: "06:50", finalEta: "05:59", saved: "00:51", status: "Completed" },
    { id: "EMG-3357", date: "2026-09-11", type: "Cardiac Emergency", severity: "Critical", ambulance: "AMB-119", hospital: "Apollo Emergency Center",   initialEta: "09:44", finalEta: "07:12", saved: "02:32", status: "Completed" },
  ],

  analytics: {
    responseTrend:  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], values: [10.2, 9.8, 9.1, 8.9, 8.4, 8.7, 8.1] },
    trafficForecast:{ labels: ["Now","+5m","+15m","+30m","+45m","+60m"], values: [45, 62, 78, 55, 40, 35] },
    byType: { labels: ["Cardiac","Accident","Trauma","Fire","Medical","Other"], values: [28, 34, 18, 9, 21, 6] },
    hospitalLoad: { labels: ["City Care","Apollo","Metro","Sunrise"], values: [42, 58, 81, 35] },
  },

  priorityWeights: { Critical: 100, High: 75, Medium: 50, Low: 25 },
};

// simple incrementing id for new emergencies created in the demo/session
let RESQ_EMG_COUNTER = 3395;
