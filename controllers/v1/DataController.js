import { Data } from "../../models/DataModel.js";

const dataCtrl = {}

dataCtrl.addData = async (req, res) => {
    const { name, list } = req.body;

    if (!name) return res.status(400).json({ msg: "Bad Request" });

    try {
        const theDoc = await Data.findOne({ name: name })

        let result = {}

        if (theDoc) {
            const altList = list.filter(item => item?.trim())

            const updatedDoc = await Data.findByIdAndUpdate(theDoc._id, {
                $set: { list: altList }
            }, { new: true })

            console.log(updatedDoc)

            result = updatedDoc

        } else {
            const newDoc = await Data.create({
                name: name,
                list: [...list]
            })

            console.log(newDoc)

            result = newDoc
        }

        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}


dataCtrl.getData = async (req, res) => {
    const name = req.query.name;
    console.log("name", name)

    if (!name) return res.status(400).json({ msg: "Bad Request" })

    try {
        const data = await Data.findOne({ name: name })
        if (!data) return res.status(400).json({ msg: "Data Not Found" })
        console.log(data)

        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}



export {dataCtrl} ;