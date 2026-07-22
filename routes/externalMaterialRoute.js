const express = require('express');
const router = express.Router();

const {createExternalMaterial, getExternalMaterials} = require('../controllers/externalMaterialController');

router.post('/create', createExternalMaterial);
router.get('/all', getExternalMaterials);

module.exports = router;