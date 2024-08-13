const Item=require('../models/item')

exports.getItems=async(req, res)=>{
    try{
        const items=await Item.find()
        res.json(items)
    }catch(error){
        console.log(error);
        res.status(400).send('Error fetching items')  
    }
}

exports.createItem = async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).send('Name and description are required');
    }

    const item = new Item({
        name,
        description
    });

    try {
        const savedItem = await item.save();
        res.status(201).json(savedItem);  
    } catch (err) {
        console.log(err);
        res.status(400).send('Error saving item')
    }
};

exports.updateItem=async(req, res)=>{
    try{
        const updateItem=await Item.findByIdAndUpdate(req.params.id, req.body, {new:true})
        res.json(updateItem)
    }catch(error){
        console.log(error);
        res.status(400).send('Error updating item')
    }
}

exports.deleteItem=async(req, res)=>{
    try{
        const removedItem=await Item.findByIdAndDelete(req.params.id)
        res.json({"message":"Item deleted successfully."})
    }catch(error){
        console.log(error);
        res.status(400).send('Error deleting item')
    }
}