const Car = require("../models/car.schema");



exports.rentCar = async (req, res) => {
    const { carId } = req.params;
    const userId = req.user.id;
    
    try {
        // Find the car by ID
        const car = await Car.findById(carId);
        if (!car) {
        return res.status(404).json({ message: "Car not found" });
        }
    
        // Check if the car is already rented
        if (car.isRented) {
        return res.status(400).json({ message: "Car is already rented" });
        }
    
        // Update the car's rental status
        car.isRented = true;
        car.rentedBy = userId;
        await car.save();
    
        return res.status(200).json({ message: "Car rented successfully", car });
    } catch (error) {
        console.error("Error renting car:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
    }