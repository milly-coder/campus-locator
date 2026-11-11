/* =====================================================================
   OFFICIAL BUILDING INFORMATION  (load BEFORE script.js in index2.html)

   Source: "Directional Map of GIMPA", Estates and Municipal Services
   Directorate (EMSD), GIMPA. Descriptions are kept word for word.

   Key   = the building's name exactly as it appears in rawBuildings
           (script.js).
   code  = the EMSD letter or code, as on campus signage and the map.
   official = the building's official name on the EMSD map.
   inside   = what the EMSD map says the building accommodates
              ("" when the map gives only a name).

   Only confident matches are listed. Uncertain ones are kept in
   UNMATCHED below so they can be confirmed later, without guessing.
   ===================================================================== */
const EMSD_SOURCE = 'Estates and Municipal Services Directorate, GIMPA';

const buildingInfo = {
  "GOVERNANCE BLOCK (ACADEMIC AFFAIRS DIRECTORATE)": { code: "A", official: "Block A / Governors Block",
    inside: "Accommodates the Deputy Rector’s Office and Academic Affairs Directorate as well as the main Reception/Telephone Exchange" },
  "MAIN RECEPTION": { code: "A", official: "Block A / Governors Block",
    inside: "Accommodates the Deputy Rector’s Office and Academic Affairs Directorate as well as the main Reception/Telephone Exchange" },
  "DAVID ANDOH BLOCK": { code: "D", official: "Block D / David Andoh Block",
    inside: "Accommodates Offices for Faculty as well as IMS Directorate" },
  "SCHOOL OF PUBLIC SERVICE AND GOVERNANCE": { code: "E", official: "Block E / AL Adu Complex",
    inside: "Accommodates Offices and Lecture Halls for the School of Public Services and Governance" },
  "GIMPA SCHOOL OF TECHNOLOGY (SOTSS)": { code: "F", official: "Block F / DLC Block",
    inside: "Accommodates Offices and Lecture Halls for School of Technology" },
  "UN BLOCK": { code: "G", official: "Block G / UN Block",
    inside: "Accommodates Faculty Offices, Salon and Photocopy Centre" },
  "MAMPHEY CONFERENCE HALL": { code: "H", official: "Block H / Mamphey Hall Complex",
    inside: "Accommodating Mamphey Auditorium, Lecture Halls, Offices and Old Printing Press" },
  "GB BLOCK": { code: "I", official: "GB Lecture Halls",
    inside: "Also accommodates a Photo Studio and Faculty Offices" },
  "GB AUDITORIUM": { code: "J", official: "GB Auditorium", inside: "" },
  "LIBRARY BLOCK": { code: "K", official: "Library / Old Hospitality Block",
    inside: "Accommodates the Main Library" },
  "SYNDICATE BLOCK": { code: "L", official: "Syndicate Block",
    inside: "Accommodates Offices and Lecture Halls" },
  "MAINTENANCE YARD": { code: "M", official: "Maintenance Yard / Hweremoase Complex",
    inside: "Accommodates Offices for Transport, Grounds and Facilities Unit as well as the main Security Post" },
  "RECTORATE RECTORAT( RECTOR'S OFFICE)": { code: "N", official: "Rectorate",
    inside: "Accommodates Offices for the Rector and the Corporate Affairs Directorate" },
  "CENTRE FOR REGIONAL INTERGRATION IN AFRICA": { code: "Q", official: "Oval Bungalow 2",
    inside: "Accommodates the Students Services Centre and CRIA" },
  "PROCUREMENT UNIT": { code: "S", official: "Oval Bungalow 4",
    inside: "Accommodates the Procurement Department and Offices for Stores Unit" },
  "SCHOOL OF RESEARCH AND GRADUATE STUDIES": { code: "T", official: "Infilling Block Lot 2",
    inside: "Accommodates School of Research and Graduate Studies, Business School Secretariat, Graduate Lecture Halls, Graduate Lounge and Reading Room" },
  "LOT 1": { code: "U", official: "Infilling Block Lot 1",
    inside: "Accommodates Graduate Lecture Halls and PHD Lecture Halls" },
  "YALI REGIONAL LEADERSHIP CENTER": { code: "V", official: "Oval Bungalow 5 / YALI Block", inside: "" },
  "CENTRE FOR INFORMATION TECHNOLOGY DEVELOPMENT": { code: "W", official: "CITD Lecture Halls / Laboratory", inside: "" },
  "PSMPT AUDITORIUM": { code: "Y", official: "PSMTP Auditorium", inside: "" },
  "ROBERT GARDNER BLOCK": { code: "P1 / P2", official: "Phase 1 and Phase 2 Blocks / Robert Gardner Hostel Block", inside: "" },
  "TACHIE MANSON": { code: "P3", official: "Phase 3 Block / Tachie Menson Hostel Block", inside: "" },
  "POTTERS LODGE": { code: "PL", official: "Porters Lodge", inside: "" },
  "CIDA BLOCK": { code: "CIDA", official: "CIDA Hostel Block", inside: "" },
  "GIMPA EXECUTIVE CONFERENCE CENTER": { code: "GECC", official: "GIMPA Executive Conference Centre", inside: "" },
  "GIMPA TRAINING AND CONSULTING": { code: "GTC", official: "Prempeh II Bungalow 1",
    inside: "Accommodates the GIMPA Training and Consulting Directorate" },
  "GIMPA LAW SCHOOL": { code: "FLAW", official: "Faculty of Law Building",
    inside: "Accommodates Faculty of Law Secretariat, Offices, Lecture Halls, Moot Court" },
  "GIMPA CLINIC": { code: "CLINIC", official: "Prempeh II Bungalow 4",
    inside: "Accommodates the GIMPA Clinic and Laboratories" },
  "GIMPA COUNCIL CHAMBER": { code: "CS", official: "Prempeh II Bungalow 5",
    inside: "Accommodates the Council Chamber and Secretariat as well as Offices for the Legal and Compliance Unit" },
  "GIMPA COUNCIL SECRETARIAT": { code: "CS", official: "Prempeh II Bungalow 5",
    inside: "Accommodates the Council Chamber and Secretariat as well as Offices for the Legal and Compliance Unit" },
  "GIMPA TECHNOLOGY LAB (MTN LAB)": { code: "MTN LAB", official: "IT Laboratory sponsored by MTN", inside: "" }
};

/* Set aside: possible matches that need confirming before they go in.
   Move an entry into buildingInfo above once you've checked it on campus. */
const UNMATCHED = {
  "LAW SCHOOL CAFETERIA":       "Maybe B3, Prempeh II Bungalow 3 (has a Snack Spot/Outlet for the Law School)",
  "STUDENTS AFFAIRS OFFICE":    "Maybe Q, Oval Bungalow 2 (Students Services Centre)",
  "LAW SCHOOL STUDENT AFFAIRS": "Not on the EMSD map",
  "SRC SHED":                   "Maybe near R, Oval Bungalow 3 (SRC Offices)",
  "LOT 1 (GIMPA BUSINESS SCHOOL)": "Unclear: Lot 1 is U, but the Business School Secretariat is in Lot 2 (T)",
  "SECURITY POST":              "Maybe M (main Security Post), or a different post",
  "BANKING HALL":               "Maybe B (has the CBG Bank)",
  "GIMPA CAFETERIA":            "Maybe the building labelled DINING (no description on the map)",
  "GIMPA SERVICES DEPARTMENT":  "Maybe EMSD (General Services Block)",
  "GIMPA CONSULTANCY SERVICES": "Maybe O, Oval Bungalow 1 (Old Consultancy Services Complex)"
};
