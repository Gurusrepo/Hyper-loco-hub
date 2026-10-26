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
        "Plumbing",
        "Electrical",
        "Cleaning",
        "Repairs"
    ];

    for (const category of categories) {
        await db.run(insertCategory, [category]);
    }

// insert services 


    const insertService = `
        INSERT OR IGNORE INTO services
        (category_id, service_name, description, base_price)
        VALUES (?, ?, ?, ?);
    `;

    const services = [
        [1, "Pipe Leakage Repair", "Repair leaking pipes", 300],
        [1, "Tap Repair", "Repair or replace faulty taps", 150],
        [1, "Drain Blockage", "Clear blocked drains", 250],
        [2, "Fan Installation", "Install ceiling or wall fans", 250],
        [2, "Switchboard Repair", "Repair faulty switches", 200],
        [2, "Light Installation", "Install lights and fixtures", 150],
        [3, "Bathroom Cleaning", "Clean and sanitize bathrooms", 300],
        [3, "Kitchen Cleaning", "Clean kitchen surfaces", 400],
        [3, "Full Home Cleaning", "Clean the entire home", 1000],
        [4, "Door Repair", "Repair common door issues", 250],
        [4, "Furniture Repair", "Repair damaged furniture", 300],
        [4, "Wall Repair", "Repair minor wall damage", 350]
    ];

    for (const service of services) {
        await db.run(insertService, service);
    }

    
return db

}catch(err){
           console.log(err.message)
           process.exit(1)
    }
}
    
    
module.exports = initializedb ;