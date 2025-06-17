const express = require('express');
const router = express.Router();
const { addCar, editCar, deleteCar, getAllCars, searchCars } = require('../controller/admin.controller');
const {isAuthenticated} = require('../middlewares/isAuth');

router.get('/get-cars', getAllCars);
router.get('/search-cars', searchCars);
router.post('/add-car',isAuthenticated, addCar);
router.put('/edit-car/:carId', editCar);
router.delete('/delete-car/:carId', deleteCar);





module.exports = router;