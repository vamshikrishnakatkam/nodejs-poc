const router=require('express').Router()
const itemConroller=require('../controllers/itemController')
const authMiddleware=require('../middleware/authMiddleware')

router.get('/',authMiddleware,itemConroller.getItems)
router.post('/', authMiddleware, itemConroller.createItem)
router.put('/:id',authMiddleware, itemConroller.updateItem)
router.delete('/:id',authMiddleware, itemConroller.deleteItem)

module.exports=router