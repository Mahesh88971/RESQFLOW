/**
 * In-memory data store standing in for MongoDB.
 *
 * To move to a real database: keep these exact shapes as your Mongoose
 * schemas / collections, and replace the arrays below with model calls
 * inside routes/*.js. Nothing else in the app needs to change.
 */

const ambulances = [
  { id: "AMB-101", driver: "R. Sharma",     status: "Available",   location: "Sector 2",   speed: 0,  eta: null, hospital: null },
  { id: "AMB-102", driver: "K. Verma",      status: "Active",      location: "MG Road",    speed: 58, eta: "06:12", hospital: "City Care Hospital" },
  { id: "AMB-103", driver: "S. Iyer",       status: "Hospital",    location: "Apollo Bay", speed: 0,  eta: null, hospital: "Apollo Emergency Center" },
  { id: "AMB-104", driver: "P. Nair",       status: "Available",   location: "Sector 7",   speed: 0,  eta: null, hospital: null },
  { id: "AMB-204", driver: "A. Fernandes",  status: "Active",      location: "Sector 4",   speed: 62, eta: "06:42", hospital: "Apollo Emergency Center" },
  { id: "AMB-118", driver: "D. Rao",        status: "Maintenance", location: "Depot 1",    speed: 0,  eta: null, hospital: null },
  { id: "AMB-119", driver: "M. Singh",      status: "Available",   location: "Riverside",  speed: 0,  eta: null, hospital: null },
  { id: "AMB-120", driver: "T. Bose",       status: "Active",      location: "North Ring", speed: 47, eta: "09:05", hospital: "Metro Hospital" },
];

const hospitals = [
  { name: "City Care Hospital",      distance: "5.2 km", eta: "7 min",  icu: "Available", emergency: "Available", trauma: "Available", cardiac: "Available", load: 42 },
  { name: "Apollo Emergency Center", distance: "4.1 km", eta: "6 min",  icu: "Available", emergency: "Available", trauma: "Limited",   cardiac: "Available", load: 58 },
  { name: "Metro Hospital",          distance: "3.8 km", eta: "10 min", icu: "Limited",   emergency: "Busy",      trauma: "Available",  cardiac: "Limited",   load: 81 },
  { name: "Sunrise Multispecialty",  distance: "6.9 km", eta: "12 min", icu: "Available", emergency: "Available", trauma: "Available",  cardiac: "Available", load: 35 },
];

const emergencies = []; // populated at runtime via POST /api/emergencies

const history = [
  { id: "EMG-3391", date: "2026-09-14", type: "Cardiac Emergency", severity: "Critical", ambulance: "AMB-204", hospital: "Apollo Emergency Center", initialEta: "09:10", finalEta: "06:42", saved: "02:28", status: "Completed" },
  { id: "EMG-3388", date: "2026-09-14", type: "Accident",          severity: "High",     ambulance: "AMB-102", hospital: "City Care Hospital",       initialEta: "07:55", finalEta: "06:12", saved: "01:43", status: "Completed" },
  { id: "EMG-3382", date: "2026-09-13", type: "Trauma",            severity: "Critical", ambulance: "AMB-120", hospital: "Metro Hospital",            initialEta: "11:20", finalEta: "09:05", saved: "02:15", status: "Completed" },
];

const analytics = {
  responseTrend:   { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], values: [10.2, 9.8, 9.1, 8.9, 8.4, 8.7, 8.1] },
  trafficForecast: { labels: ["Now","+5m","+15m","+30m","+45m","+60m"], values: [45, 62, 78, 55, 40, 35] },
  byType:          { labels: ["Cardiac","Accident","Trauma","Fire","Medical","Other"], values: [28, 34, 18, 9, 21, 6] },
  hospitalLoad:    { labels: ["City Care","Apollo","Metro","Sunrise"], values: [42, 58, 81, 35] },
};

module.exports = { ambulances, hospitals, emergencies, history, analytics };
