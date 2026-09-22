// backend/seed.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const bcrypt = require('bcryptjs');

const dbPromise = require('./config/db');
const User = require('./models/User');
const WasteItem = require('./models/WasteItem');
const RequestModel = require('./models/Request');

const cities = [
  { city: "Chennai", pincodes: ["600032", "600096", "600028", "600040", "600100"] },
  { city: "Coimbatore", pincodes: ["641004", "641012", "641006", "641037"] },
  { city: "Salem", pincodes: ["636001", "636004", "636008", "636012"] },
  { city: "Trichy", pincodes: ["620001", "620015", "620020"] },
  { city: "Erode", pincodes: ["638001", "638011", "638009"] },
  { city: "Madurai", pincodes: ["625001", "625020", "625012"] },
  { city: "Bengaluru", pincodes: ["560001", "560066", "560100"] },
  { city: "Hyderabad", pincodes: ["500081", "500032", "500003"] },
  { city: "Mumbai", pincodes: ["400001", "400078", "400093"] },
  { city: "Pune", pincodes: ["411001", "411057", "411014"] }
];

const ewasteTitles = [
  "Scrap Server Motherboards & High-Grade PCBs",
  "Used Commercial CRT & LCD Computer Monitors",
  "Lithium-Ion EV & Solar Storage Battery Packs",
  "Industrial E-Waste Copper Transformer Coils",
  "Obsolete Telecom Network Routers & Switches",
  "Bulk Mixed Smartphone & Tablet Scrap Boards",
  "Scrap UPS Inverters & Sealed Lead Acid Batteries",
  "High-Density RAM Modules & Processor Chips",
  "Scrap Hard Drives & Enterprise SAS Storage",
  "Commercial Photocopier & Laser Printer Scrap",
  "Telecom Antenna Tower Cables & RF Modules",
  "Used Industrial Power Supply SMPS Units",
  "Industrial Control Panel & PLC Circuit Scrap",
  "E-waste Electric Motor Armatures & Stators",
  "Scrap ATM Machine Electronics & Keypads",
  "Commercial Microwave & Medical PCB Boards",
  "Mixed Computer Desktop Cabinets & Power Cables",
  "Used Solar Inverters & Charge Controllers"
];

const plasticTitles = [
  "Clean Industrial HDPE Drums & Crates Scrap",
  "Baled PET Clear Plastic Bottles & Preforms",
  "Scrap LDPE Packaging Film & Stretch Wrap",
  "Polypropylene (PP) Industrial Granules Scrap",
  "PVC Rigid Pipe & Electrical Conduit Scrap",
  "ABS Electronic Enclosures & Appliance Shells",
  "Mixed Post-Consumer Rigid Plastics Bales"
];

const metalTitles = [
  "Heavy Copper Wire & Cable Scrap (Millberry)",
  "Scrap Aluminum Sheet & Extrusion Trimmings",
  "Brass Valves, Fittings & Plumbing Scrap",
  "Industrial Stainless Steel 304/316 Scrap",
  "Cast Iron Machinery Engine Blocks & Parts",
  "Scrap Galvanized Iron Sheet & Mesh"
];

const paperTitles = [
  "Heavy Corrugated Cardboard Bales (OCC Scrap)",
  "Shredded White Office & Bank Document Paper",
  "Bulk Newspaper & Periodical Paper Bundles",
  "Kraft Paper Rolls & Packaging Scrap"
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDatabase() {
  try {
    console.log("⏳ Initializing SQLite Database...");
    const db = await dbPromise;

    console.log("🧹 Clearing existing table data...");
    await db.exec(`
      DELETE FROM requests;
      DELETE FROM waste_items;
      DELETE FROM users;
      DELETE FROM sqlite_sequence;
    `);

    // Create Sample Users
    console.log("👤 Creating Demo User Accounts...");
    const hashedPassword = await bcrypt.hash("Password@123", 10);

    const seller1 = await User.create({ name: "John Seller", email: "john@seller.com", password: hashedPassword, role: "seller", phone: "+91 9876543210", city: "Chennai", address: "Guindy Industrial Estate", pincode: "600032" });
    const seller2 = await User.create({ name: "Kani Scrap Traders", email: "kani@scrap.com", password: hashedPassword, role: "seller", phone: "+91 9812345678", city: "Coimbatore", address: "Peelamedu", pincode: "641004" });
    const seller3 = await User.create({ name: "Green Recyclers Pvt Ltd", email: "green@recyclers.com", password: hashedPassword, role: "seller", phone: "+91 9765432109", city: "Salem", address: "Five Roads Area", pincode: "636004" });
    const collector1 = await User.create({ name: "Alex Collector", email: "alex@collector.com", password: hashedPassword, role: "collector", phone: "+91 9123456789", city: "Chennai", address: "Velachery Main Rd", pincode: "600042" });
    const buyer1 = await User.create({ name: "Eco Recycling Hub", email: "eco@collector.com", password: hashedPassword, role: "buyer", phone: "+91 9444455555", city: "Bengaluru", address: "Peenya Industrial Area", pincode: "560058" });

    const sellerUsers = [seller1, seller2, seller3];

    console.log("📦 Generating 1,000 realistic e-waste and recycling listings...");

    await db.exec('BEGIN TRANSACTION;');

    for (let i = 1; i <= 1000; i++) {
      let category = "E-waste";
      let titlePool = ewasteTitles;
      let rand = Math.random();

      if (rand < 0.55) {
        category = "E-waste";
        titlePool = ewasteTitles;
      } else if (rand < 0.75) {
        category = "Metal";
        titlePool = metalTitles;
      } else if (rand < 0.90) {
        category = "Plastic";
        titlePool = plasticTitles;
      } else {
        category = "Paper";
        titlePool = paperTitles;
      }

      const seller = getRandomElement(sellerUsers);
      const cityObj = getRandomElement(cities);
      const pincode = getRandomElement(cityObj.pincodes);
      const baseTitle = getRandomElement(titlePool);
      const title = `${baseTitle} #${i}`;

      let approx_weight = category === "E-waste" ? getRandomInt(15, 850) : category === "Metal" ? getRandomInt(50, 3500) : getRandomInt(40, 1500);
      let base_price = category === "E-waste" ? getRandomInt(1500, 75000) : category === "Metal" ? getRandomInt(5000, 120000) : getRandomInt(800, 18000);

      await db.run(
        `INSERT INTO waste_items (seller_id, title, category, approx_weight, base_price, address, city, pincode, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
        [seller.id, title, category, approx_weight, base_price, `${getRandomInt(1, 150)} Industrial Sector ${getRandomElement(["A", "B", "C"])}`, cityObj.city, pincode]
      );
    }

    await db.exec('COMMIT;');

    console.log("✅ Successfully seeded 1,000 waste listings into SQLite (database.sqlite).");

    // Seed Sample Pick-Up Requests
    console.log("🚚 Seeding sample pick-up requests...");
    const sampleItem1 = await db.get('SELECT id FROM waste_items LIMIT 1');
    const sampleItem2 = await db.get('SELECT id FROM waste_items LIMIT 1 OFFSET 1');

    if (sampleItem1) {
      await RequestModel.create(collector1.id, sampleItem1.id);
    }
    if (sampleItem2) {
      const req2 = await RequestModel.create(buyer1.id, sampleItem2.id);
      await RequestModel.updateStatus(req2.id, "ACCEPTED");
      await WasteItem.updateStatus(sampleItem2.id, "ACCEPTED");
    }

    console.log("\n🎉 SEED COMPLETE! SQLite database populated with 1,000+ realistic waste listings.");
    console.log("-------------------------------------------------------");
    console.log("Seller Login:   john@seller.com / Password@123");
    console.log("Buyer Login:    alex@collector.com / Password@123");
    console.log("-------------------------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
}

seedDatabase();
