const {open} = require("sqlite")
const sqlite3 = require("sqlite3") 
const path = require("path")

const dbpath = path.join(__dirname,"database.db")
let db 


const initializedb = async() =>{

    try{
        db = await open({
    filename : dbpath,
    driver : sqlite3.Database
})

//create table 

const createTable = `CREATE TABLE IF NOT EXISTS users(
    user_id INTEGER PRIMARY KEY AUTOINCREMENT ,
    name VARCHAR ,
    user_name VARCHAR UNIQUE,
    password VARCHAR ,
    email VARCHAR UNIQUE ,
    phone VARCHAR )` 


await db.run(createTable)

// create Address table

await db.run("PRAGMA foreign_keys = ON")

const addressTable = `CREATE TABLE IF NOT EXISTS addresses (
    address_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    address_label VARCHAR NOT NULL,
    street VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    pincode VARCHAR NOT NULL,
    landmark VARCHAR,
    FOREIGN KEY (user_id) REFERENCES users(user_id) );`

await db.run(addressTable) 


// Create service categories table

    const createServiceCategoriesTable = `
        CREATE TABLE IF NOT EXISTS service_categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL UNIQUE,
            is_active INTEGER NOT NULL DEFAULT 1
                CHECK (is_active IN (0, 1))
        );
    `;

    await db.run(createServiceCategoriesTable);

// Create services table

    const createServicesTable = `
        CREATE TABLE IF NOT EXISTS services (
            service_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            service_name TEXT NOT NULL,
            description TEXT,
            base_price REAL NOT NULL DEFAULT 0
                CHECK (base_price >= 0),
            is_active INTEGER NOT NULL DEFAULT 1
                CHECK (is_active IN (0, 1)),
            FOREIGN KEY (category_id)
                REFERENCES service_categories(category_id),
            UNIQUE (category_id, service_name)
        );
    `;

    await db.run(createServicesTable);


// insert service-categories

    const insertCategory = `
        INSERT OR IGNORE INTO service_categories (category_name)
        VALUES (?);
    `;

    const categories = [
        "Plumber",
        "Electrician",
        "Cleaner",
        "Mobile-Technician",
        "Mechanic-car",
        "Mechanic-bike",
        "cook",
        "Barber"
    ];

    for (const category of categories) {
        await db.run(insertCategory, [category]);
    }


// insert services 

    const services = [

    // plumbers
    ["Plumber", "Pipe Leakage Repair", "Repair leaking pipes", 300],
    ["Plumber", "Tap Repair", "Repair or replace faulty taps", 150],
    ["Plumber", "Drain Blockage", "Clear blocked drains", 250],

    // Electricians
    ["Electrician", "Fan Installation", "Install ceiling or wall fans", 250],
    ["Electrician", "Switchboard Repair", "Repair faulty switches", 200],
    ["Electrician", "Light Installation", "Install lights and fixtures", 150],

    //cleaners
    ["Cleaner", "Bathroom Cleaning", "Clean and sanitize bathrooms", 300],
    ["Cleaner", "Kitchen Cleaning", "Clean kitchen surfaces", 400],
    ["Cleaner", "Full Home Cleaning", "Clean the entire home", 1000],

    // mobile tecnician 
    ["Mobile-Technician","Display Change", "High Quality Display Changed onSpot with Warrenty", 1500],
    ["Mobile-Technician","Battery", "High Quality Battery Changed OnSpot with Warrenty", 800],
    ["Mobile-Technician","other" , "charging-port,mic,speaker" , 500], 

    // Car Mechanic
    ["Mechanic-car", "Car Not Starting", "Diagnose why the car will not start", 500],
    ["Mechanic-car", "Car Puncture Repair", "Repair a car tyre puncture", 300],
    ["Mechanic-car", "Car AC Inspection", "Inspect car air conditioning problems", 500],
    ["Mechanic-car", "Brake Inspection and Repair", "Inspect and repair brake issues", 500],
    ["Mechanic-car", "Battery Jump-Start", "Help start a car with a discharged battery", 300],
    ["Mechanic-car", "Engine Oil Change Labour", "Labour for changing engine oil", 400],

    // Bike Mechanic
    ["Mechanic-bike", "Bike Not Starting", "Diagnose why the bike will not start", 200],
    ["Mechanic-bike", "Bike Puncture Repair", "Repair a bike tyre puncture", 100],
    ["Mechanic-bike", "Battery Replacement Labour", "Labour for replacing a bike battery", 150],
    ["Mechanic-bike", "Brake Adjustment", "Adjust bike brakes", 150],
    ["Mechanic-bike", "Chain Cleaning", "Clean and lubricate the bike chain", 150],
    ["Mechanic-bike", "Engine Oil Change Labour", "Labour for changing engine oil", 150],

    // Cook
    ["cook", "Daily Meal Preparation", "Prepare daily meals at home", 300],
    ["cook", "Breakfast Preparation", "Prepare breakfast at home", 200],
    ["cook", "Lunch Preparation", "Prepare lunch at home", 300],
    ["cook", "Dinner Preparation", "Prepare dinner at home", 300],
    ["cook", "Family Meal Preparation", "Prepare meals for a family", 500],
    ["cook", "Small Gathering Cooking", "Cook for a small gathering", 800],

    // Barber
    ["Barber", "Haircut", "Provide a haircut at home", 150],
    ["Barber", "Beard Trimming", "Trim and shape the beard", 100],
    ["Barber", "Haircut and Beard Combo", "Haircut with beard trimming", 250],
    ["Barber", "Head Shave", "Provide a head shave", 100],
    ["Barber", "Hair Styling", "Style hair as requested", 200],
    ["Barber", "Grooming Package", "Combined grooming services", 350],

];

const insertService = `
    INSERT OR IGNORE INTO services
    (category_id, service_name, description, base_price)
    VALUES (?, ?, ?, ?);
`;

for (const [category_name, service_name, description, base_price] of services) {

    const category = await db.get(
        `SELECT category_id
         FROM service_categories
         WHERE category_name = ? AND is_active = 1`,
        [category_name]
    );

    if (!category) {
        throw new Error(`Category not found: ${category_name}`);
    }

    await db.run(insertService, [
        category.category_id,
        service_name,
        description,
        base_price
    ]);
}

return db

}catch (err) {
    console.error("Database initialization failed:");
    console.error(err.stack || err);
    throw err;
}
}

    
    
module.exports = initializedb ;