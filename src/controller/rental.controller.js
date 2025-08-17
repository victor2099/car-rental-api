const Car = require("../models/car.schema");
const { flw } = require('../utils/flutterwave');
const User = require("../models/user.schema")

const rentCar = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, totalPrice } = req.body;
  const userId = req.user.id;
  const rentingUser = await User.findById(userId);
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

    // Initializing Payment
    const tx_ref = `rent_${carId}_${Date.now()}`;
    const payload = {
      tx_ref,
      amount: totalPrice,
      currency: "NGN",
      redirect_url: `http://localhost:${PORT}`,
      rentingUser,
      startDate: startDate,
      endDate:endDate,
      payment_options: "card, banktransfer, ussd",
      meta:{
        carId
      }
    }

    try {
      const response = await flw.Payment.create(payload);
      car.isRented = true;
      car.rentedBy = userId;
      car.startDate = startDate;
      car.endDate = endDate;
      car.totalPrice = totalPrice;
      car.status = "pending"; // Set initial status to pending
      await car.save();
      if (response) {
        const{ transaction_id} = req.query;
        try{
        const response = await flw.Transaction.verify({id: transaction_id});
        if(response.data.status === "successful") {
          car.isRented = true;
          car.rentedBy = userId;
          car.startDate = startDate;
          car.endDate = endDate;
          car.totalPrice = totalPrice;
          car.status = "approved"; // Set final status to approved
          await car.save();      
          return res.status(200).json({ message: "Car rented successfully", car });
        }
        return res.send("Payment failed");
      } catch (e) {
        console.log(e);
        car.isRented = true;
        car.rentedBy = userId;
        car.startDate = startDate;
        car.endDate = endDate;
        car.totalPrice = totalPrice;
        car.status = "rejected"; // Set final status to rejected
        res.send("Error verifying payment");
      }}
      return res.json({ checkoutUrl: response.data.link, tx_ref});
    } catch(error) {
      console.log(error);
      return res.status(500).json({error: "Unable to initialize payment"});
    }
  } catch (error) {
    console.error("Error renting car:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  rentCar
};
