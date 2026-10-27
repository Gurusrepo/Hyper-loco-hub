const initializedb = require("../database/database");


const getCategories = async (request, response) => {
    try {
        const db = await initializedb();

        const categoryquery = `
            SELECT category_id, category_name
            FROM service_categories
            WHERE is_active = 1
            ORDER BY category_id;
        `;

        const categories = await db.all(categoryquery);

        return response.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error.message);
        return response.status(500).json({
            error: "Internal server error"
        });
    }
};


const getServiceOfCategory =  async(request, response) => {
    try {
        const db = await initializedb();
        const category_id = Number(request.params.categoryId); 
        //cuz of below check we assign the request.params to Number

        if (!Number.isInteger(category_id) || category_id <= 0) {
            return response.status(400).json({error: "Invalid category ID"});
        }

        const serviceQuery = `
                              SELECT  service_name, base_price , description
                              FROM services 
                              WHERE category_id = ? and is_active = 1 
                              ORDER BY  service_name `
        
        const services = await db.all(serviceQuery, [category_id]) 

        return response.status(200).json(services) 
    }
    catch(err){
        console.error(err.message)

        return response.status(500).json({
            error: "Internal server error"
        });
    }
}


module.exports = { getCategories , getServiceOfCategory};
